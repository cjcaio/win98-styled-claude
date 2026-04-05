import { useState, useEffect, useCallback } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import StartMenu from './StartMenu'
import ComputerIcon from '@/components/icons/ComputerIcon'
import ChatIcon from '@/components/icons/ChatIcon'
import FolderIcon from '@/components/icons/FolderIcon'
import RecycleBinIcon from '@/components/icons/RecycleBinIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import styles from './Taskbar.module.css'

function appIcon(appId: string) {
  switch (appId) {
    case 'chat':        return <ChatIcon size={14} />
    case 'explorer':    return <FolderIcon size={14} />
    case 'recycle-bin': return <RecycleBinIcon size={14} />
    default:            return <SettingsIcon size={14} />
  }
}

export default function Taskbar() {
  const { windows, startMenuOpen, toggleStartMenu, focusWindow, restoreWindow } = useDesktopStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStartMenu()
  }, [toggleStartMenu])

  const handleTaskClick = useCallback((windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId)
    } else {
      focusWindow(windowId)
    }
  }, [focusWindow, restoreWindow])

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {startMenuOpen && <StartMenu />}
      <div className={styles.taskbar} onClick={(e) => e.stopPropagation()}>
        {/* Start button */}
        <button
          className={`${styles.startBtn} ${startMenuOpen ? styles.startBtnActive : ''}`}
          onClick={handleStartClick}
        >
          <span className={styles.startLogo}><ComputerIcon size={18} /></span>
          <span className={styles.startText}>Start</span>
        </button>

        {/* Divider */}
        <div className="win98-divider-v" />

        {/* Window list */}
        <div className={styles.windowList}>
          {windows.map((w) => (
            <button
              key={w.id}
              className={`${styles.windowBtn} ${!w.isMinimized ? styles.windowBtnActive : ''}`}
              onClick={() => handleTaskClick(w.id, w.isMinimized)}
            >
              <span className={styles.windowBtnIcon}>{appIcon(w.appId)}</span>
              <span className={styles.windowBtnText}>{w.title}</span>
            </button>
          ))}
        </div>

        {/* System tray */}
        <div className={styles.tray}>
          <span className={styles.clock}>{timeStr}</span>
        </div>
      </div>
    </>
  )
}
