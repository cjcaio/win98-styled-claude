import { useCallback, useEffect, useState, ReactNode, ComponentType } from 'react'
import { useDesktopStore, AppId } from '@/stores/desktop'
import DesktopIcon from './DesktopIcon'
import Taskbar from './Taskbar'
import Window from '@/components/window/Window'
import ChatApp from '@/components/apps/chat/ChatApp'
import Explorer from '@/components/apps/explorer/Explorer'
import RecycleBin from '@/components/apps/recycle-bin/RecycleBin'
import SettingsApp from '@/components/apps/settings/SettingsApp'
import ChatIcon from '@/components/icons/ChatIcon'
import FolderIcon from '@/components/icons/FolderIcon'
import RecycleBinIcon from '@/components/icons/RecycleBinIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import styles from './Desktop.module.css'

const ICONS: Array<{ id: AppId; label: string; icon: ReactNode; row: number }> = [
  { id: 'chat',        label: 'Claude Chat',   icon: <ChatIcon size={32} />,       row: 0 },
  { id: 'explorer',    label: 'My Documents',  icon: <FolderIcon size={32} />,     row: 1 },
  { id: 'recycle-bin', label: 'Recycle Bin',   icon: <RecycleBinIcon size={32} />, row: 2 },
  { id: 'settings',    label: 'Control Panel', icon: <SettingsIcon size={32} />,   row: 3 }
]

const APP_COMPONENTS: Record<AppId, ComponentType> = {
  chat: ChatApp,
  explorer: Explorer,
  'recycle-bin': RecycleBin,
  settings: SettingsApp
}

const APP_ICONS: Record<AppId, ReactNode> = {
  chat:          <ChatIcon size={16} />,
  explorer:      <FolderIcon size={16} />,
  'recycle-bin': <RecycleBinIcon size={16} />,
  settings:      <SettingsIcon size={16} />
}

export default function Desktop() {
  const { windows, openApp, closeStartMenu } = useDesktopStore()
  const [wallpaper, setWallpaper] = useState<string | null>(null)

  useEffect(() => {
    window.api.getWallpaper().then((data) => setWallpaper(data))
  }, [])

  const handleDesktopClick = useCallback(() => {
    closeStartMenu()
  }, [closeStartMenu])

  const desktopStyle = wallpaper
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : undefined

  return (
    <div className={styles.desktop} style={desktopStyle} onClick={handleDesktopClick}>
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
