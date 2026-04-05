import { create } from 'zustand'

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Chat {
  id: string
  name: string
  parent_id: string
  type: 'chat'
  created_at: string
  updated_at: string
}

interface ChatState {
  chats: Chat[]
  activeChatId: string | null
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
  isLoading: boolean

  // Actions
  loadChats: () => Promise<void>
  selectChat: (chatId: string) => Promise<void>
  createChat: () => Promise<Chat>
  sendMessage: (content: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  renameChat: (chatId: string, name: string) => Promise<void>
  setStreamingContent: (content: string) => void
  appendStreamingContent: (delta: string) => void
  finishStreaming: (fullContent: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  streamingContent: '',
  isStreaming: false,
  isLoading: false,

  loadChats: async () => {
    const chats = await window.api.listChats()
    set({ chats })
  },

  selectChat: async (chatId) => {
    set({ activeChatId: chatId, isLoading: true })
    const messages = await window.api.getMessages(chatId)
    set({ messages, isLoading: false })
  },

  createChat: async () => {
    const now = new Date()
    const name = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    const chat = await window.api.createChat(name)
    set((s) => ({
      chats: [chat, ...s.chats],
      activeChatId: chat.id,
      messages: []
    }))
    return chat
  },

  sendMessage: async (content) => {
    const state = get()
    let chatId = state.activeChatId

    // Auto-create chat if none selected
    if (!chatId) {
      const chat = await get().createChat()
      chatId = chat.id
    }

    // Add user message to DB and state
    const userMsg = await window.api.addMessage(chatId, 'user', content)
    set((s) => ({
      messages: [...s.messages, userMsg],
      isStreaming: true,
      streamingContent: ''
    }))

    // Build message history for API call
    const allMessages = [...get().messages].map((m) => ({
      role: m.role,
      content: m.content
    }))

    // Set up stream listener
    const cleanup = window.api.onStream(chatId, (data) => {
      if (data.type === 'delta') {
        get().appendStreamingContent(data.text)
      } else if (data.type === 'done') {
        get().finishStreaming(data.text)
        cleanup()
      }
    })

    // Send to Claude
    const result = await window.api.sendMessage(chatId, allMessages)

    if (!result.success) {
      // On error, clean up and show error message
      cleanup()
      const errorMsg = await window.api.addMessage(
        chatId,
        'assistant',
        `⚠️ Error: ${result.error}`
      )
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isStreaming: false,
        streamingContent: ''
      }))
    }

    // Auto-rename chat from first message
    const currentMessages = get().messages
    if (currentMessages.filter((m) => m.role === 'user').length === 1) {
      const shortName = content.length > 40 ? content.slice(0, 40) + '...' : content
      await window.api.renameChat(chatId, shortName)
      set((s) => ({
        chats: s.chats.map((c) => (c.id === chatId ? { ...c, name: shortName } : c))
      }))
    }
  },

  deleteChat: async (chatId) => {
    await window.api.deleteChat(chatId)
    set((s) => ({
      chats: s.chats.filter((c) => c.id !== chatId),
      activeChatId: s.activeChatId === chatId ? null : s.activeChatId,
      messages: s.activeChatId === chatId ? [] : s.messages
    }))
  },

  renameChat: async (chatId, name) => {
    await window.api.renameChat(chatId, name)
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, name } : c))
    }))
  },

  setStreamingContent: (content) => {
    set({ streamingContent: content })
  },

  appendStreamingContent: (delta) => {
    set((s) => ({ streamingContent: s.streamingContent + delta }))
  },

  finishStreaming: async (fullContent) => {
    const chatId = get().activeChatId
    if (!chatId) return

    const assistantMsg = await window.api.addMessage(chatId, 'assistant', fullContent)
    set((s) => ({
      messages: [...s.messages, assistantMsg],
      isStreaming: false,
      streamingContent: ''
    }))
  }
}))
