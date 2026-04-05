import { useState, useEffect, useCallback } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import StartMenu from './StartMenu'
import styles from './Taskbar.module.css'

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
          <span className={styles.startLogo}>☁</span>
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
              <span className={styles.windowBtnIcon}>
                {w.appId === 'chat' ? '💬' : w.appId === 'explorer' ? '📁' : w.appId === 'recycle-bin' ? '🗑️' : '⚙️'}
              </span>
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
