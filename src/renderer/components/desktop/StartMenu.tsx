import { useDesktopStore } from '@/stores/desktop'
import styles from './StartMenu.module.css'

export default function StartMenu() {
  const { openApp, closeStartMenu } = useDesktopStore()

  const handleClick = (appId: 'chat' | 'explorer' | 'recycle-bin' | 'settings') => {
    openApp(appId)
    closeStartMenu()
  }

  return (
    <div className={`${styles.menu} start-menu-enter`} onClick={(e) => e.stopPropagation()}>
      {/* Blue sidebar */}
      <div className={styles.sidebar}>
        <span className={styles.sidebarText}>Claude<b>98</b></span>
      </div>

      {/* Menu items */}
      <div className={styles.items}>
        <button className={styles.item} onClick={() => handleClick('chat')}>
          <span className={styles.itemIcon}>💬</span>
          <span className={styles.itemLabel}>Claude Chat</span>
        </button>

        <button className={styles.item} onClick={() => handleClick('explorer')}>
          <span className={styles.itemIcon}>📁</span>
          <span className={styles.itemLabel}>My Documents</span>
        </button>

        <button className={styles.item} onClick={() => handleClick('recycle-bin')}>
          <span className={styles.itemIcon}>🗑️</span>
          <span className={styles.itemLabel}>Recycle Bin</span>
        </button>

        <div className="win98-divider-h" style={{ margin: '2px 4px' }} />

        <button className={styles.item} onClick={() => handleClick('settings')}>
          <span className={styles.itemIcon}>⚙️</span>
          <span className={styles.itemLabel}>Control Panel</span>
        </button>

        <div className="win98-divider-h" style={{ margin: '2px 4px' }} />

        <button className={styles.item} onClick={() => window.api.closeWindow()}>
          <span className={styles.itemIcon}>🔌</span>
          <span className={styles.itemLabel}>Shut Down...</span>
        </button>
      </div>
    </div>
  )
}
