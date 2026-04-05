import { randomUUID } from 'crypto'
import { queryAll, queryOne, execute, saveDb } from '../connection'

export interface ChatFile {
  id: string
  name: string
  parent_id: string
  type: 'chat'
  content: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export function createChat(name: string, parentId = 'chats'): ChatFile {
  const id = randomUUID()
  const now = new Date().toISOString()

  execute(
    `INSERT INTO files (id, name, parent_id, type, created_at, updated_at)
     VALUES (?, ?, ?, 'chat', ?, ?)`,
    [id, name, parentId, now, now]
  )
  saveDb()

  return { id, name, parent_id: parentId, type: 'chat', content: null, created_at: now, updated_at: now, deleted_at: null }
}

export function listChats(parentId = 'chats'): ChatFile[] {
  return queryAll<ChatFile>(
    `SELECT * FROM files
     WHERE parent_id = ? AND type = 'chat' AND deleted_at IS NULL
     ORDER BY updated_at DESC`,
    [parentId]
  )
}

export function addMessage(chatId: string, role: 'user' | 'assistant', content: string): Message {
  const id = randomUUID()
  const now = new Date().toISOString()

  execute(
    `INSERT INTO messages (id, chat_id, role, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, chatId, role, content, now]
  )
  execute(`UPDATE files SET updated_at = ? WHERE id = ?`, [now, chatId])
  saveDb()

  return { id, chat_id: chatId, role, content, created_at: now }
}

export function getMessages(chatId: string): Message[] {
  return queryAll<Message>(
    `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC`,
    [chatId]
  )
}

export function softDeleteChat(chatId: string): void {
  const now = new Date().toISOString()
  execute(`UPDATE files SET deleted_at = ?, parent_id = 'recycle-bin' WHERE id = ?`, [now, chatId])
  saveDb()
}

export function restoreChat(chatId: string): void {
  execute(`UPDATE files SET deleted_at = NULL, parent_id = 'chats' WHERE id = ?`, [chatId])
  saveDb()
}

export function permanentlyDeleteChat(chatId: string): void {
  execute(`DELETE FROM messages WHERE chat_id = ?`, [chatId])
  execute(`DELETE FROM files WHERE id = ?`, [chatId])
  saveDb()
}

export function getDeletedChats(): ChatFile[] {
  return queryAll<ChatFile>(
    `SELECT * FROM files WHERE deleted_at IS NOT NULL AND type = 'chat'
     ORDER BY deleted_at DESC`
  )
}

export function renameChat(chatId: string, name: string): void {
  execute(`UPDATE files SET name = ?, updated_at = ? WHERE id = ?`, [name, new Date().toISOString(), chatId])
  saveDb()
}
