import { useState, useEffect, useCallback } from 'react'
import styles from './RecycleBin.module.css'

interface DeletedChat {
  id: string
  name: string
  deleted_at: string
}

export default function RecycleBin() {
  const [items, setItems] = useState<DeletedChat[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    const deleted = await window.api.getDeletedChats()
    setItems(deleted)
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleRestore = useCallback(async () => {
    if (!selectedId) return
    await window.api.restoreChat(selectedId)
    setSelectedId(null)
    loadItems()
  }, [selectedId, loadItems])

  const handleDelete = useCallback(async () => {
    if (!selectedId) return
    if (!confirm('Permanently delete this item? This cannot be undone.')) return
    await window.api.permanentDeleteChat(selectedId)
    setSelectedId(null)
    loadItems()
  }, [selectedId, loadItems])

  const handleEmpty = useCallback(async () => {
    if (items.length === 0) return
    if (!confirm('Are you sure you want to permanently delete all items?')) return
    for (const item of items) {
      await window.api.permanentDeleteChat(item.id)
    }
    setSelectedId(null)
    loadItems()
  }, [items, loadItems])

  return (
    <div className={styles.recycleBin}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className="win98-button" onClick={handleRestore} disabled={!selectedId}>
          ↩ Restore
        </button>
        <button className="win98-button" onClick={handleDelete} disabled={!selectedId}>
          ❌ Delete
        </button>
        <button className="win98-button" onClick={handleEmpty} disabled={items.length === 0}>
          🗑️ Empty Recycle Bin
        </button>
      </div>

      {/* Items */}
      <div className={styles.itemArea}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${selectedId === item.id ? styles.itemSelected : ''}`}
            onClick={() => setSelectedId(item.id)}
          >
            <span className={styles.itemIcon}>💬</span>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemDate}>
                Deleted: {new Date(item.deleted_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🗑️</span>
            <span>Recycle Bin is empty.</span>
          </div>
        )}
      </div>
    </div>
  )
}
