import { ipcMain, BrowserWindow, safeStorage, app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { initClaude, isClaudeReady, sendMessage } from '../services/claude'
import * as chatsRepo from '../database/repositories/chats'
import * as filesRepo from '../database/repositories/files'
import { queryOne, execute, saveDb } from '../database/connection'

function getResourcesDir(): string {
  return app.isPackaged ? process.resourcesPath : join(app.getAppPath(), 'resources')
}

function findAsset(baseName: string, exts: string[]): string | null {
  const dir = getResourcesDir()
  for (const ext of exts) {
    const p = join(dir, `${baseName}${ext}`)
    if (existsSync(p)) return p
  }
  return null
}

function fileToDataUrl(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const mime =
    ext === 'png' ? 'image/png' :
    ext === 'gif' ? 'image/gif' :
    ext === 'webp' ? 'image/webp' :
    'image/jpeg'
  const data = readFileSync(filePath).toString('base64')
  return `data:${mime};base64,${data}`
}

export function registerIpcHandlers(): void {
  // ─── Settings ───────────────────────────────────────────
  ipcMain.handle('settings:get-api-key', () => {
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['api_key_encrypted'])
    if (!row) return null
    try {
      const decrypted = safeStorage.decryptString(Buffer.from(row.value, 'base64'))
      return decrypted
    } catch {
      return null
    }
  })

  ipcMain.handle('settings:set-api-key', (_event, apiKey: string) => {
    const encrypted = safeStorage.encryptString(apiKey).toString('base64')
    // sql.js doesn't support ON CONFLICT with UPDATE SET using positional params the same way,
    // so we do a delete + insert (settings table is tiny)
    execute('DELETE FROM settings WHERE key = ?', ['api_key_encrypted'])
    execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['api_key_encrypted', encrypted])
    saveDb()
    initClaude(apiKey)
    return true
  })

  ipcMain.handle('settings:get', (_event, key: string) => {
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])
    return row?.value ?? null
  })

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    execute('DELETE FROM settings WHERE key = ?', [key])
    execute('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value])
    saveDb()
    return true
  })

  // ─── Claude ─────────────────────────────────────────────
  ipcMain.handle('claude:is-ready', () => isClaudeReady())

  ipcMain.handle('claude:send', async (event, chatId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) throw new Error('No window found')

    try {
      const response = await sendMessage({ chatId, messages, model, window })
      return { success: true, content: response }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ─── Chats ──────────────────────────────────────────────
  ipcMain.handle('chats:create', (_event, name: string, parentId?: string) => {
    return chatsRepo.createChat(name, parentId)
  })

  ipcMain.handle('chats:list', (_event, parentId?: string) => {
    return chatsRepo.listChats(parentId)
  })

  ipcMain.handle('chats:messages', (_event, chatId: string) => {
    return chatsRepo.getMessages(chatId)
  })

  ipcMain.handle('chats:add-message', (_event, chatId: string, role: 'user' | 'assistant', content: string) => {
    return chatsRepo.addMessage(chatId, role, content)
  })

  ipcMain.handle('chats:delete', (_event, chatId: string) => {
    chatsRepo.softDeleteChat(chatId)
    return true
  })

  ipcMain.handle('chats:restore', (_event, chatId: string) => {
    chatsRepo.restoreChat(chatId)
    return true
  })

  ipcMain.handle('chats:permanent-delete', (_event, chatId: string) => {
    chatsRepo.permanentlyDeleteChat(chatId)
    return true
  })

  ipcMain.handle('chats:deleted', () => {
    return chatsRepo.getDeletedChats()
  })

  ipcMain.handle('chats:rename', (_event, chatId: string, name: string) => {
    chatsRepo.renameChat(chatId, name)
    return true
  })

  // ─── Filesystem ─────────────────────────────────────────
  ipcMain.handle('fs:list', (_event, parentId: string) => {
    return filesRepo.listFiles(parentId)
  })

  ipcMain.handle('fs:create-folder', (_event, name: string, parentId: string) => {
    return filesRepo.createFolder(name, parentId)
  })

  ipcMain.handle('fs:move', (_event, fileId: string, newParentId: string) => {
    filesRepo.moveFile(fileId, newParentId)
    return true
  })

  ipcMain.handle('fs:get', (_event, fileId: string) => {
    return filesRepo.getFile(fileId)
  })

  // ─── Window Controls (frameless window) ─────────────────
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window:is-maximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  // ─── Assets (pfp / wallpaper) ───────────────────────────
  ipcMain.handle('assets:get-pfp', () => {
    const path = findAsset('pfp', ['.png', '.jpg', '.jpeg', '.gif', '.webp'])
    return path ? fileToDataUrl(path) : null
  })

  ipcMain.handle('assets:get-wallpaper', () => {
    const path = findAsset('wallpaper', ['.jpg', '.jpeg', '.png', '.webp', '.bmp'])
    return path ? fileToDataUrl(path) : null
  })

  // Try to load API key on startup
  try {
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['api_key_encrypted'])
    if (row) {
      const decrypted = safeStorage.decryptString(Buffer.from(row.value, 'base64'))
      initClaude(decrypted)
    }
  } catch {
    // No API key set yet — that's fine
  }
}
