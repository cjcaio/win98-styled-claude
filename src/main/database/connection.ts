import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

let db: SqlJsDatabase
let dbPath: string

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/** Save the in-memory database to disk */
export function saveDb(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(dbPath, buffer)
}

export async function initDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  dbPath = join(dbDir, 'claude98.db')

  const SQL = await initSqlJs()

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')

  runMigrations()
  saveDb()

  // Auto-save periodically
  setInterval(saveDb, 30_000)
}

/** Helper: run a SELECT and return rows as objects */
export function queryAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const results: T[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return results
}

/** Helper: run a SELECT and return first row as object or undefined */
export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const results = queryAll<T>(sql, params)
  return results[0]
}

/** Helper: run INSERT/UPDATE/DELETE */
export function execute(sql: string, params: unknown[] = []): void {
  db.run(sql, params)
}

function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const applied = new Set<string>()
  const rows = queryAll<{ name: string }>('SELECT name FROM _migrations')
  for (const row of rows) {
    applied.add(row.name)
  }

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      db.exec(migration.sql)
      execute('INSERT INTO _migrations (name) VALUES (?)', [migration.name])
      console.log(`[db] Applied migration: ${migration.name}`)
    }
  }
}

const migrations = [
  {
    name: '001_initial_schema',
    sql: `
      CREATE TABLE files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT REFERENCES files(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK(type IN ('folder', 'chat', 'note', 'file')),
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );

      CREATE INDEX idx_files_parent ON files(parent_id);
      CREATE INDEX idx_files_deleted ON files(deleted_at);

      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_messages_chat ON messages(chat_id);

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT INTO files (id, name, parent_id, type) VALUES
        ('root', 'C:\\', NULL, 'folder');
      INSERT INTO files (id, name, parent_id, type) VALUES
        ('my-documents', 'My Documents', 'root', 'folder');
      INSERT INTO files (id, name, parent_id, type) VALUES
        ('chats', 'Chats', 'my-documents', 'folder');
      INSERT INTO files (id, name, parent_id, type) VALUES
        ('recycle-bin', 'Recycle Bin', 'root', 'folder');
    `
  }
]
