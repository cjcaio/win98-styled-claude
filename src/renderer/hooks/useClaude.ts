import { useCallback } from 'react'
import { useChatStore } from '@/stores/chat'

/**
 * Hook that wraps chat store actions for component use.
 * Provides a simpler interface for sending messages and managing chat state.
 */
export function useClaude() {
  const {
    messages,
    streamingContent,
    isStreaming,
    activeChatId,
    sendMessage,
    createChat,
    selectChat
  } = useChatStore()

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return
    await sendMessage(content)
  }, [isStreaming, sendMessage])

  return {
    messages,
    streamingContent,
    isStreaming,
    activeChatId,
    send,
    createChat,
    selectChat
  }
}
