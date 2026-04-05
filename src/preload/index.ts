import { contextBridge, ipcRenderer } from 'electron'

export type StreamCallback = (data: { type: 'delta' | 'done'; text: string }) => void

const api = {
  // Settings
  getApiKey: (): Promise<string | null> => ipcRenderer.invoke('settings:get-api-key'),
  setApiKey: (key: string): Promise<boolean> => ipcRenderer.invoke('settings:set-api-key', key),
  clearApiKey: (): Promise<boolean> => ipcRenderer.invoke('settings:clear-api-key'),
  getGroqKey: (): Promise<string | null> => ipcRenderer.invoke('settings:get-groq-key'),
  setGroqKey: (key: string): Promise<boolean> => ipcRenderer.invoke('settings:set-groq-key', key),
  clearGroqKey: (): Promise<boolean> => ipcRenderer.invoke('settings:clear-groq-key'),
  getSetting: (key: string): Promise<string | null> => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string): Promise<boolean> => ipcRenderer.invoke('settings:set', key, value),

  // Claude
  isClaudeReady: (): Promise<boolean> => ipcRenderer.invoke('claude:is-ready'),
  sendMessage: (
    chatId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    model?: string
  ): Promise<{ success: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke('claude:send', chatId, messages, model),

  onStream: (chatId: string, callback: StreamCallback): (() => void) => {
    const channel = `claude:stream:${chatId}`
    const handler = (_event: any, data: { type: 'delta' | 'done'; text: string }) => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },

  // Chats
  createChat: (name: string, parentId?: string) => ipcRenderer.invoke('chats:create', name, parentId),
  listChats: (parentId?: string) => ipcRenderer.invoke('chats:list', parentId),
  getMessages: (chatId: string) => ipcRenderer.invoke('chats:messages', chatId),
  addMessage: (chatId: string, role: 'user' | 'assistant', content: string) =>
    ipcRenderer.invoke('chats:add-message', chatId, role, content),
  deleteChat: (chatId: string) => ipcRenderer.invoke('chats:delete', chatId),
  restoreChat: (chatId: string) => ipcRenderer.invoke('chats:restore', chatId),
  permanentDeleteChat: (chatId: string) => ipcRenderer.invoke('chats:permanent-delete', chatId),
  getDeletedChats: () => ipcRenderer.invoke('chats:deleted'),
  renameChat: (chatId: string, name: string) => ipcRenderer.invoke('chats:rename', chatId, name),

  // Filesystem
  listFiles: (parentId: string) => ipcRenderer.invoke('fs:list', parentId),
  createFolder: (name: string, parentId: string) => ipcRenderer.invoke('fs:create-folder', name, parentId),
  moveFile: (fileId: string, newParentId: string) => ipcRenderer.invoke('fs:move', fileId, newParentId),
  getFile: (fileId: string) => ipcRenderer.invoke('fs:get', fileId),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),

  // System
  getSystemInfo: (): Promise<{ cpu: string; cores: number; ramMb: number; hostname: string }> =>
    ipcRenderer.invoke('system:get-info'),

  // Assets
  getPfp: (): Promise<string | null> => ipcRenderer.invoke('assets:get-pfp'),
  getWallpaper: (): Promise<string | null> => ipcRenderer.invoke('assets:get-wallpaper'),

  // Spotify
  spotifyGetSetup: (): Promise<{ clientId: string | null; isAuthenticated: boolean }> =>
    ipcRenderer.invoke('spotify:get-setup'),
  spotifySaveClientId: (id: string): Promise<boolean> => ipcRenderer.invoke('spotify:save-client-id', id),
  spotifyStartAuth: (): Promise<boolean> => ipcRenderer.invoke('spotify:start-auth'),
  spotifyGetPlayerState: (): Promise<any> => ipcRenderer.invoke('spotify:get-player-state'),
  spotifyPlay: (): Promise<void> => ipcRenderer.invoke('spotify:play'),
  spotifyPause: (): Promise<void> => ipcRenderer.invoke('spotify:pause'),
  spotifyNext: (): Promise<void> => ipcRenderer.invoke('spotify:next'),
  spotifyPrevious: (): Promise<void> => ipcRenderer.invoke('spotify:previous'),
  spotifySetVolume: (vol: number): Promise<void> => ipcRenderer.invoke('spotify:set-volume', vol),
  spotifyLogout: (): Promise<boolean> => ipcRenderer.invoke('spotify:logout')
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
