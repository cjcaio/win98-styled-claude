import { randomUUID } from 'crypto'
import { queryAll, queryOne, execute, saveDb } from '../connection'

export interface FileEntry {
  id: string
  name: string
  parent_id: string | null
  type: 'folder' | 'chat' | 'note' | 'file'
  content: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function createFolder(name: string, parentId: string): FileEntry {
  const id = randomUUID()
  const now = new Date().toISOString()

  execute(
    `INSERT INTO files (id, name, parent_id, type, created_at, updated_at)
     VALUES (?, ?, ?, 'folder', ?, ?)`,
    [id, name, parentId, now, now]
  )
  saveDb()

  return { id, name, parent_id: parentId, type: 'folder', content: null, created_at: now, updated_at: now, deleted_at: null }
}

export function listFiles(parentId: string): FileEntry[] {
  return queryAll<FileEntry>(
    `SELECT * FROM files
     WHERE parent_id = ? AND deleted_at IS NULL
     ORDER BY type ASC, name ASC`,
    [parentId]
  )
}

export function moveFile(fileId: string, newParentId: string): void {
  execute(
    `UPDATE files SET parent_id = ?, updated_at = ? WHERE id = ?`,
    [newParentId, new Date().toISOString(), fileId]
  )
  saveDb()
}

export function getFile(fileId: string): FileEntry | undefined {
  return queryOne<FileEntry>(`SELECT * FROM files WHERE id = ?`, [fileId])
}
