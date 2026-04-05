import { useRef, useCallback, useEffect, ReactNode } from 'react'
import { Rnd } from 'react-rnd'
import { useDesktopStore, WindowState } from '@/stores/desktop'
import { playSound } from '@/lib/sounds'
import styles from './Window.module.css'

interface WindowProps {
  windowState: WindowState
  icon?: ReactNode
  children: ReactNode
  menuBar?: ReactNode
  statusBar?: ReactNode
}

export default function Window({ windowState, icon, children, menuBar, statusBar }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, updateWindowPosition, updateWindowSize } = useDesktopStore()
  const rndRef = useRef<Rnd>(null)

  useEffect(() => {
    playSound('windowOpen')
  }, [])

  const handleFocus = useCallback(() => {
    focusWindow(windowState.id)
  }, [focusWindow, windowState.id])

  const handleClose = useCallback(() => {
    playSound('windowClose')
    closeWindow(windowState.id)
  }, [closeWindow, windowState.id])

  const handleMinimize = useCallback(() => {
    minimizeWindow(windowState.id)
  }, [minimizeWindow, windowState.id])

  const handleMaximize = useCallback(() => {
    if (windowState.isMaximized) {
      restoreWindow(windowState.id)
    } else {
      maximizeWindow(windowState.id)
    }
  }, [windowState.id, windowState.isMaximized, maximizeWindow, restoreWindow])

  if (windowState.isMinimized) return null

  const position = windowState.isMaximized ? { x: 0, y: 0 } : { x: windowState.x, y: windowState.y }
  const size = windowState.isMaximized
    ? { width: '100%', height: 'calc(100vh - 32px)' }
    : { width: windowState.width, height: windowState.height }

  return (
    <Rnd
      ref={rndRef}
      position={position}
      size={size}
      minWidth={300}
      minHeight={200}
      dragHandleClassName={styles.titleBar}
      disableDragging={windowState.isMaximized}
      enableResizing={!windowState.isMaximized}
      style={{ zIndex: windowState.zIndex }}
      onMouseDown={handleFocus}
      onDragStop={(_e, d) => updateWindowPosition(windowState.id, d.x, d.y)}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(windowState.id, parseInt(ref.style.width), parseInt(ref.style.height))
        updateWindowPosition(windowState.id, pos.x, pos.y)
      }}
      className="window-enter"
    >
      <div className={styles.window}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <div className={styles.titleLeft}>
            {icon && <span className={styles.titleIcon}>{icon}</span>}
            <span className={styles.titleText}>{windowState.title}</span>
          </div>
          <div className={styles.titleButtons}>
            <button className={styles.titleBtn} onClick={handleMinimize} aria-label="Minimize">
              <svg width="8" height="7" viewBox="0 0 8 7"><rect y="5" width="6" height="2" fill="currentColor"/></svg>
            </button>
            <button className={styles.titleBtn} onClick={handleMaximize} aria-label="Maximize">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <rect x="0" y="0" width="8" height="8" fill="currentColor"/>
                <rect x="1" y="2" width="6" height="5" fill="var(--c98-surface)"/>
              </svg>
            </button>
            <button className={`${styles.titleBtn} ${styles.titleBtnClose}`} onClick={handleClose} aria-label="Close">
              <svg width="8" height="7" viewBox="0 0 8 7">
                <path d="M0 0L3 3.5L0 7H2L4 4.5L6 7H8L5 3.5L8 0H6L4 2.5L2 0H0Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu bar */}
        {menuBar && <div className="win98-menubar">{menuBar}</div>}

        {/* Content area */}
        <div className={styles.content}>{children}</div>

        {/* Status bar */}
        {statusBar && <div className="win98-statusbar">{statusBar}</div>}
      </div>
    </Rnd>
  )
}
