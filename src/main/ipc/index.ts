import { ipcMain, BrowserWindow, safeStorage, app } from 'electron'
import * as os from 'os'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { initClaude, resetClaude, isClaudeReady, sendMessage as claudeSend } from '../services/claude'
import { initGroq, resetGroq, isGroqReady, sendMessage as groqSend } from '../services/groq'
import * as spotifyService from '../services/spotify'
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

  ipcMain.handle('settings:clear-api-key', () => {
    execute('DELETE FROM settings WHERE key = ?', ['api_key_encrypted'])
    saveDb()
    resetClaude()
    return true
  })

  ipcMain.handle('settings:get-groq-key', () => {
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['groq_api_key'])
    return row?.value ?? null
  })

  ipcMain.handle('settings:set-groq-key', (_event, apiKey: string) => {
    execute('DELETE FROM settings WHERE key = ?', ['groq_api_key'])
    if (apiKey) execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['groq_api_key', apiKey])
    saveDb()
    initGroq(apiKey)
    return true
  })

  ipcMain.handle('settings:clear-groq-key', () => {
    execute('DELETE FROM settings WHERE key = ?', ['groq_api_key'])
    saveDb()
    resetGroq()
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

  // ─── Claude / Groq ──────────────────────────────────────
  ipcMain.handle('claude:is-ready', () => isClaudeReady() || isGroqReady())

  ipcMain.handle('claude:send', async (event, chatId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) throw new Error('No window found')

    try {
      let response: string
      if (isClaudeReady()) {
        response = await claudeSend({ chatId, messages, model, window })
      } else if (isGroqReady()) {
        response = await groqSend({ chatId, messages, model, window })
      } else {
        throw new Error('No AI provider configured. Set an API key in Settings.')
      }
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

  // ─── System Info ────────────────────────────────────────
  ipcMain.handle('system:get-info', () => {
    const cpus = os.cpus()
    const cpu = cpus[0]?.model?.trim() ?? 'Unknown CPU'
    const cores = cpus.length
    const ramMb = Math.round(os.totalmem() / 1024 / 1024)
    const hostname = os.hostname()
    return { cpu, cores, ramMb, hostname }
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

  // ─── Spotify ────────────────────────────────────────────
  function spotifyGet(key: string): string | null {
    return queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])?.value ?? null
  }
  function spotifySet(key: string, value: string) {
    execute('DELETE FROM settings WHERE key = ?', [key])
    execute('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value])
  }

  async function getValidSpotifyToken(): Promise<string | null> {
    const clientId = spotifyGet('spotify_client_id')
    const accessToken = spotifyGet('spotify_access_token')
    const refreshToken = spotifyGet('spotify_refresh_token')
    const expiresAt = parseInt(spotifyGet('spotify_expires_at') ?? '0')
    if (!clientId || !accessToken) return null
    if (Date.now() < expiresAt - 60_000) return accessToken
    if (!refreshToken) return null
    try {
      const result = await spotifyService.refreshAccessToken(clientId, refreshToken)
      spotifySet('spotify_access_token', result.access_token)
      if (result.refresh_token) spotifySet('spotify_refresh_token', result.refresh_token)
      spotifySet('spotify_expires_at', String(Date.now() + result.expires_in * 1000))
      saveDb()
      return result.access_token
    } catch {
      return null
    }
  }

  ipcMain.handle('spotify:get-setup', () => {
    const clientId = spotifyGet('spotify_client_id')
    const isAuthenticated = !!(spotifyGet('spotify_access_token') && spotifyGet('spotify_refresh_token'))
    return { clientId, isAuthenticated }
  })

  ipcMain.handle('spotify:save-client-id', (_event, clientId: string) => {
    spotifySet('spotify_client_id', clientId)
    saveDb()
    return true
  })

  ipcMain.handle('spotify:start-auth', async () => {
    const clientId = spotifyGet('spotify_client_id')
    if (!clientId) throw new Error('No client ID configured')
    const { code, verifier } = await spotifyService.startAuthFlow(clientId)
    const tokens = await spotifyService.exchangeCode(clientId, code, verifier)
    spotifySet('spotify_access_token', tokens.access_token)
    spotifySet('spotify_refresh_token', tokens.refresh_token)
    spotifySet('spotify_expires_at', String(Date.now() + tokens.expires_in * 1000))
    saveDb()
    return true
  })

  ipcMain.handle('spotify:get-player-state', async () => {
    const token = await getValidSpotifyToken()
    if (!token) return null
    try {
      return await spotifyService.getPlayerState(token)
    } catch { return null }
  })

  ipcMain.handle('spotify:play', async () => {
    const token = await getValidSpotifyToken()
    if (token) await spotifyService.play(token).catch(() => {})
  })

  ipcMain.handle('spotify:pause', async () => {
    const token = await getValidSpotifyToken()
    if (token) await spotifyService.pause(token).catch(() => {})
  })

  ipcMain.handle('spotify:next', async () => {
    const token = await getValidSpotifyToken()
    if (token) await spotifyService.next(token).catch(() => {})
  })

  ipcMain.handle('spotify:previous', async () => {
    const token = await getValidSpotifyToken()
    if (token) await spotifyService.previous(token).catch(() => {})
  })

  ipcMain.handle('spotify:set-volume', async (_event, vol: number) => {
    const token = await getValidSpotifyToken()
    if (token) await spotifyService.setVolume(token, vol).catch(() => {})
  })

  ipcMain.handle('spotify:logout', () => {
    execute('DELETE FROM settings WHERE key IN (?, ?, ?)',
      ['spotify_access_token', 'spotify_refresh_token', 'spotify_expires_at'])
    saveDb()
    return true
  })

  // Try to load API keys on startup
  try {
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['api_key_encrypted'])
    if (row) {
      const decrypted = safeStorage.decryptString(Buffer.from(row.value, 'base64'))
      initClaude(decrypted)
    }
  } catch {
    // No Claude key set yet — that's fine
  }
  try {
    const groqRow = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['groq_api_key'])
    if (groqRow) initGroq(groqRow.value)
  } catch {
    // No Groq key set yet — that's fine
  }
}
