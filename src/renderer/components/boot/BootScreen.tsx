import { useState, useEffect } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import styles from './BootScreen.module.css'

const BOOT_MESSAGES = [
  'Initializing Claude98 kernel...',
  'Loading AI drivers...',
  'Mounting virtual filesystem...',
  'Detecting neural pathways...',
  'Calibrating response matrix...',
  'Starting desktop environment...'
]

const BOOT_DURATION = 4000

export default function BootScreen() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [exiting, setExiting] = useState(false)
  const setBoot = useDesktopStore((s) => s.setBoot)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => {
        if (i < BOOT_MESSAGES.length - 1) return i + 1
        return i
      })
    }, BOOT_DURATION / BOOT_MESSAGES.length)

    const exitTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => setBoot(true), 500)
    }, BOOT_DURATION)

    return () => {
      clearInterval(interval)
      clearTimeout(exitTimer)
    }
  }, [setBoot])

  return (
    <div className={`${styles.boot} ${exiting ? 'boot-exit' : ''}`}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <span className={styles.logoCloud}>☁</span>
          </div>
          <h1 className={styles.logoText}>Claude<span className={styles.logo98}>98</span></h1>
        </div>

        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
        </div>

        {/* Status message */}
        <div className={styles.message}>
          {BOOT_MESSAGES[messageIndex]}
          <span className="boot-cursor">_</span>
        </div>
      </div>

      {/* Bottom text */}
      <div className={styles.footer}>
        <span>© 2026 Claude98 • Anthropic Inside™</span>
      </div>
    </div>
  )
}
