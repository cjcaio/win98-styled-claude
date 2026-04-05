import { useState, useEffect, useRef } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import { playSound } from '@/lib/sounds'
import styles from './BootScreen.module.css'

const LINE_DELAY = 120 // ms per bios line

function buildBiosLines(cpu: string, cores: number, ramMb: number, hostname: string): string[] {
  const ramDisplay = ramMb >= 1024 ? `${(ramMb / 1024).toFixed(0)}GB` : `${ramMb}MB`
  return [
    'Claude98 BIOS v1.0  Copyright (C) 2026',
    '',
    `CPU : ${cpu}`,
    `      ${cores} Cores Detected`,
    `Memory Test : ${ramMb}MB OK`,
    '',
    `System : ${hostname}`,
    '',
    'Detecting Primary Master ... ST2000DM008  (2TB)',
    'Detecting Primary Slave  ... None',
    '',
    'Plug and Play BIOS Extension v1.0A',
    'PnP Init Completed',
    '',
    'Verifying DMI Pool Data ...',
    '',
    'Starting Claude98...',
  ]
}

type Phase = 'bios' | 'loading' | 'exiting'

export default function BootScreen() {
  const [phase, setPhase] = useState<Phase>('bios')
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [biosLines, setBiosLines] = useState<string[]>([])
  const [exiting, setExiting] = useState(false)
  const setBoot = useDesktopStore((s) => s.setBoot)
  const lineRef = useRef(0)

  useEffect(() => {
    window.api.getSystemInfo().then(({ cpu, cores, ramMb, hostname }) => {
      setBiosLines(buildBiosLines(cpu, cores, ramMb, hostname))
    }).catch(() => {
      setBiosLines(buildBiosLines('Unknown CPU', 4, 8192, 'CLAUDE98-PC'))
    })
  }, [])

  // BIOS scroll phase
  useEffect(() => {
    if (biosLines.length === 0) return

    const interval = setInterval(() => {
      const idx = lineRef.current
      if (idx < biosLines.length) {
        setVisibleLines((prev) => [...prev, biosLines[idx]])
        lineRef.current++
      } else {
        clearInterval(interval)
        setTimeout(() => setPhase('loading'), 400)
      }
    }, LINE_DELAY)

    return () => clearInterval(interval)
  }, [biosLines])

  // Loading phase → exit
  useEffect(() => {
    if (phase !== 'loading') return
    const t = setTimeout(() => {
      playSound('startup')
      setExiting(true)
      setTimeout(() => setBoot(true), 500)
    }, 3800)
    return () => clearTimeout(t)
  }, [phase, setBoot])

  if (phase === 'bios') {
    return (
      <div className={styles.bios}>
        <div className={styles.biosText}>
          {visibleLines.map((line, i) => (
            <div key={i} className={styles.biosLine}>
              {line || '\u00A0'}
            </div>
          ))}
          <span className="boot-cursor">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.boot} ${exiting ? 'boot-exit' : ''}`}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>Claude<span className={styles.logo98}>98</span></h1>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
        </div>

        <div className={styles.message}>
          Starting Windows...
          <span className="boot-cursor">_</span>
        </div>
      </div>

      <div className={styles.footer}>
        <span>© 2026 Claude98 • Anthropic Inside™</span>
      </div>
    </div>
  )
}
