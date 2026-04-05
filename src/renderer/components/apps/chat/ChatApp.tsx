import { useState, useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import ReactMarkdown from 'react-markdown'
import ChatIcon from '@/components/icons/ChatIcon'
import ComputerIcon from '@/components/icons/ComputerIcon'
import { playSound } from '@/lib/sounds'
import styles from './ChatApp.module.css'

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="1" width="6" height="5" fill="#808080" />
      <rect x="3" y="2" width="8" height="4" fill="#C0C0C0" />
      <rect x="4" y="1" width="6" height="1" fill="#C0C0C0" />
      <rect x="3" y="5" width="8" height="1" fill="#808080" />
      <rect x="1" y="7" width="12" height="6" fill="#808080" />
      <rect x="2" y="7" width="10" height="6" fill="#C0C0C0" />
      <rect x="2" y="7" width="10" height="1" fill="#808080" />
    </svg>
  )
}

export default function ChatApp() {
  const {
    chats, activeChatId, messages, streamingContent, isStreaming, isLoading,
    loadChats, selectChat, createChat, sendMessage, deleteChat
  } = useChatStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevStreamingRef = useRef(false)

  useEffect(() => {
    loadChats()
  }, [loadChats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Play notify sound when Claude finishes responding
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      playSound('notify')
    }
    prevStreamingRef.current = isStreaming
  }, [isStreaming])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    await sendMessage(trimmed)
    inputRef.current?.focus()
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className={styles.chatApp}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <button className={`win98-button ${styles.newChatBtn}`} onClick={() => createChat()}>
          <ChatIcon size={14} /> New Chat
        </button>
        <div className={styles.chatList}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${chat.id === activeChatId ? styles.chatItemActive : ''}`}
              onClick={() => selectChat(chat.id)}
              onContextMenu={(e) => {
                e.preventDefault()
                if (confirm(`Delete "${chat.name}"?`)) deleteChat(chat.id)
              }}
            >
              <span className={styles.chatItemIcon}><ChatIcon size={14} /></span>
              <span className={styles.chatItemName}>{chat.name}</span>
            </div>
          ))}
          {chats.length === 0 && (
            <div className={styles.emptyList}>No conversations yet</div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className={styles.main}>
        {/* Messages */}
        <div className={styles.messages}>
          {isLoading ? (
            <div className={styles.loading}>Loading messages...</div>
          ) : messages.length === 0 && !activeChatId ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}><ComputerIcon size={48} /></div>
              <h2 className={styles.welcomeTitle}>Welcome to Claude98</h2>
              <p className={styles.welcomeText}>
                Start a new conversation or select one from the sidebar.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageRole}>
                      {msg.role === 'user'
                        ? <><UserIcon /> You</>
                        : <><ComputerIcon size={14} /> Claude</>
                      }
                    </span>
                    <span className={styles.messageTime}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={styles.messageContent}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {/* Streaming message */}
              {isStreaming && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageRole}><ComputerIcon size={14} /> Claude</span>
                    <span className={styles.messageTime}>typing...</span>
                  </div>
                  <div className={styles.messageContent}>
                    {streamingContent ? (
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    ) : (
                      <div className={styles.typing}>
                        <span className="typing-dot">●</span>
                        <span className="typing-dot">●</span>
                        <span className="typing-dot">●</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className={styles.inputBar}>
          <textarea
            ref={inputRef}
            className={`win98-textarea ${styles.inputField}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={2}
            disabled={isStreaming}
          />
          <button
            className="win98-button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
