import { useState, useEffect } from 'react'
import { useChatStore } from '@/stores/chat'
import styles from './Explorer.module.css'

export default function Explorer() {
  const { chats, loadChats, selectChat } = useChatStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadChats()
  }, [loadChats])

  return (
    <div className={styles.explorer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.addressBar}>
          <span className={styles.addressLabel}>Address</span>
          <div className={`win98-input ${styles.addressInput}`}>
            C:\My Documents\Chats
          </div>
        </div>
      </div>

      {/* File list */}
      <div className={styles.fileArea}>
        <div className={styles.fileList}>
          {/* Column headers */}
          <div className={styles.header}>
            <span className={styles.headerName}>Name</span>
            <span className={styles.headerDate}>Date Modified</span>
            <span className={styles.headerType}>Type</span>
          </div>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.fileRow} ${selectedId === chat.id ? styles.fileRowSelected : ''}`}
              onClick={() => setSelectedId(chat.id)}
              onDoubleClick={() => selectChat(chat.id)}
            >
              <span className={styles.fileName}>
                <span className={styles.fileIcon}>💬</span>
                {chat.name}
              </span>
              <span className={styles.fileDate}>
                {new Date(chat.updated_at).toLocaleDateString()}
              </span>
              <span className={styles.fileType}>Chat File</span>
            </div>
          ))}

          {chats.length === 0 && (
            <div className={styles.empty}>This folder is empty.</div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className={styles.status}>
        <span>{chats.length} object(s)</span>
        {selectedId && <span>1 object(s) selected</span>}
      </div>
    </div>
  )
}
