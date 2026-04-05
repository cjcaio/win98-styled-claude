import { useDesktopStore, AppId } from '@/stores/desktop'
import ChatIcon from '@/components/icons/ChatIcon'
import FolderIcon from '@/components/icons/FolderIcon'
import RecycleBinIcon from '@/components/icons/RecycleBinIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import BrowserIcon from '@/components/icons/BrowserIcon'
import ShutdownIcon from '@/components/icons/ShutdownIcon'
import styles from './StartMenu.module.css'

export default function StartMenu() {
  const { openApp, closeStartMenu } = useDesktopStore()

  const open = (appId: AppId) => {
    openApp(appId)
    closeStartMenu()
  }

  return (
    <div className={`${styles.menu} start-menu-enter`} onClick={(e) => e.stopPropagation()}>
      <div className={styles.sidebar}>
        <span className={styles.sidebarText}>Claude<b>98</b></span>
      </div>

      <div className={styles.items}>
        <button className={styles.item} onClick={() => open('browser')}>
          <span className={styles.itemIcon}><BrowserIcon size={20} /></span>
          <span className={styles.itemLabel}>Internet Explorer</span>
        </button>

        <button className={styles.item} onClick={() => open('chat')}>
          <span className={styles.itemIcon}><ChatIcon size={20} /></span>
          <span className={styles.itemLabel}>Claude Chat</span>
        </button>

        <button className={styles.item} onClick={() => open('explorer')}>
          <span className={styles.itemIcon}><FolderIcon size={20} /></span>
          <span className={styles.itemLabel}>My Documents</span>
        </button>

        <button className={styles.item} onClick={() => open('recycle-bin')}>
          <span className={styles.itemIcon}><RecycleBinIcon size={20} /></span>
          <span className={styles.itemLabel}>Recycle Bin</span>
        </button>

        <div className="win98-divider-h" style={{ margin: '2px 4px' }} />

        <button className={styles.item} onClick={() => open('settings')}>
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
