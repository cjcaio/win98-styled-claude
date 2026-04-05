import { useState, useCallback, CSSProperties, ReactNode } from 'react'
import { playSound } from '@/lib/sounds'
import styles from './DesktopIcon.module.css'

interface DesktopIconProps {
  label: string
  icon: ReactNode
  style?: CSSProperties
  onDoubleClick: () => void
}

export default function DesktopIcon({ label, icon, style, onDoubleClick }: DesktopIconProps) {
  const [selected, setSelected] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(true)
    playSound('click')
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('windowOpen')
    onDoubleClick()
  }, [onDoubleClick])

  const handleBlur = useCallback(() => {
    setSelected(false)
  }, [])

  return (
    <button
      className={`${styles.icon} ${selected ? styles.selected : ''}`}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
    >
      <span className={styles.iconImage}>{icon}</span>
      <span className={`${styles.label} ${selected ? styles.labelSelected : ''}`}>
        {label}
      </span>
    </button>
  )
}
