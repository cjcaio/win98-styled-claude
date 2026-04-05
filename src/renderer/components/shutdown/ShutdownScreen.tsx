import { useEffect, useState } from 'react'
import { playSound } from '@/lib/sounds'
import styles from './ShutdownScreen.module.css'

type Phase = 'saving' | 'safe'

export default function ShutdownScreen() {
  const [phase, setPhase] = useState<Phase>('saving')

  useEffect(() => {
    playSound('shutdown')

    const t1 = setTimeout(() => setPhase('safe'), 2200)
    const t2 = setTimeout(() => window.api.closeWindow(), 5000)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'saving') {
    return (
      <div className={styles.screen}>
        <div className={styles.savingWrap}>
          <div className={styles.logo}>
            <span className={styles.logoWin}>Claude</span>
            <span className={styles.logo98}>98</span>
          </div>
          <p className={styles.savingText}>Windows is shutting down...</p>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.screen} ${styles.safeScreen}`}>
      <div className={styles.safeBox}>
        <p className={styles.safeText}>
          It is now safe to turn off<br />your computer.
        </p>
      </div>
    </div>
  )
}
