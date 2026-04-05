import { useCallback } from 'react'
import { useDesktopStore, AppId } from '@/stores/desktop'
import DesktopIcon from './DesktopIcon'
import Taskbar from './Taskbar'
import Window from '@/components/window/Window'
import ChatApp from '@/components/apps/chat/ChatApp'
import Explorer from '@/components/apps/explorer/Explorer'
import RecycleBin from '@/components/apps/recycle-bin/RecycleBin'
import SettingsApp from '@/components/apps/settings/SettingsApp'
import styles from './Desktop.module.css'

const ICONS: Array<{ id: AppId; label: string; icon: string; row: number }> = [
  { id: 'chat', label: 'Claude Chat', icon: '💬', row: 0 },
  { id: 'explorer', label: 'My Documents', icon: '📁', row: 1 },
  { id: 'recycle-bin', label: 'Recycle Bin', icon: '🗑️', row: 2 },
  { id: 'settings', label: 'Control Panel', icon: '⚙️', row: 3 }
]

const APP_COMPONENTS: Record<AppId, React.ComponentType> = {
  chat: ChatApp,
  explorer: Explorer,
  'recycle-bin': RecycleBin,
  settings: SettingsApp
}

const APP_ICONS: Record<AppId, string> = {
  chat: '💬',
  explorer: '📁',
  'recycle-bin': '🗑️',
  settings: '⚙️'
}

export default function Desktop() {
  const { windows, openApp, closeStartMenu } = useDesktopStore()

  const handleDesktopClick = useCallback(() => {
    closeStartMenu()
  }, [closeStartMenu])

  return (
    <div className={styles.desktop} onClick={handleDesktopClick}>
      {/* Desktop icons */}
      <div className={styles.icons}>
        {ICONS.map((item) => (
          <DesktopIcon
            key={item.id}
            label={item.label}
            icon={item.icon}
            style={{ gridRow: item.row + 1 }}
            onDoubleClick={() => openApp(item.id)}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => {
        const AppComponent = APP_COMPONENTS[w.appId]
        return (
          <Window key={w.id} windowState={w} icon={APP_ICONS[w.appId]}>
            <AppComponent />
          </Window>
        )
      })}

      {/* Taskbar */}
      <Taskbar />
    </div>
  )
}
