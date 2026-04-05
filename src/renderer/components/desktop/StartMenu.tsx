import { useDesktopStore } from '@/stores/desktop'
import ChatIcon from '@/components/icons/ChatIcon'
import FolderIcon from '@/components/icons/FolderIcon'
import RecycleBinIcon from '@/components/icons/RecycleBinIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import ShutdownIcon from '@/components/icons/ShutdownIcon'
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
          <span className={styles.itemIcon}><ChatIcon size={20} /></span>
          <span className={styles.itemLabel}>Claude Chat</span>
        </button>

        <button className={styles.item} onClick={() => handleClick('explorer')}>
          <span className={styles.itemIcon}><FolderIcon size={20} /></span>
          <span className={styles.itemLabel}>My Documents</span>
        </button>

        <button className={styles.item} onClick={() => handleClick('recycle-bin')}>
          <span className={styles.itemIcon}><RecycleBinIcon size={20} /></span>
          <span className={styles.itemLabel}>Recycle Bin</span>
        </button>

        <div className="win98-divider-h" style={{ margin: '2px 4px' }} />

        <button className={styles.item} onClick={() => handleClick('settings')}>
          <span className={styles.itemIcon}><SettingsIcon size={20} /></span>
          <span className={styles.itemLabel}>Control Panel</span>
        </button>

        <div className="win98-divider-h" style={{ margin: '2px 4px' }} />

        <button className={styles.item} onClick={() => window.api.closeWindow()}>
          <span className={styles.itemIcon}><ShutdownIcon size={20} /></span>
          <span className={styles.itemLabel}>Shut Down...</span>
        </button>
      </div>
    </div>
  )
}
