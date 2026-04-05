import { useState, useEffect, useRef } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import { playSound } from '@/lib/sounds'
import styles from './LoginScreen.module.css'

const USERNAME = 'spidermanSSJ'

function DefaultAvatar() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="#2A5FA8" />
      {/* Head */}
      <circle cx="40" cy="30" r="14" fill="#D4A870" />
      {/* Body */}
      <path d="M14 76 Q14 52 40 52 Q66 52 66 76" fill="#4870B0" />
    </svg>
  )
}

export default function LoginScreen() {
  const [pfp, setPfp] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [welcoming, setWelcoming] = useState(false)
  const setLoggedIn = useDesktopStore((s) => s.setLoggedIn)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.api.getPfp().then((data) => setPfp(data))
  }, [])

  useEffect(() => {
    // Focus password input when screen appears
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleLogin = () => {
    playSound('login')
    setWelcoming(true)
    setTimeout(() => setLoggedIn(true), 1800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className={`${styles.screen} ${welcoming ? styles.fading : ''}`}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          Claude<span className={styles.brand98}>98</span>
          <span className={styles.xpBadge}>XP</span>
        </div>
        <div className={styles.topRight}>
          <span className={styles.tagline}>Professional AI Edition</span>
        </div>
      </div>

      <div className={styles.topDivider} />

      {/* Main content */}
      <div className={styles.content}>
        {welcoming ? (
          <div className={styles.welcomeWrap}>
            <div className={styles.welcomeText}>Welcome</div>
            <div className={styles.welcomeSub}>{USERNAME}</div>
          </div>
        ) : (
          <>
            <p className={styles.prompt}>To begin, type your password</p>

            <div className={styles.userTile}>
              {/* Avatar */}
              <div className={styles.avatar}>
                {pfp
                  ? <img src={pfp} className={styles.avatarImg} alt="profile" />
                  : <DefaultAvatar />
                }
              </div>

              <div className={styles.username}>{USERNAME}</div>

              {/* Password row */}
              <div className={styles.passwordRow}>
                <input
                  ref={inputRef}
                  type="password"
                  className={styles.passwordInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Password"
                />
                <button className={styles.loginBtn} onClick={handleLogin} title="Log On">
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path
                      d="M2 6 L9 6 M6 3 L9 6 L6 9"
                      stroke="white"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.hint}>Press Enter or click → to log in</div>
            </div>
          </>
        )}
      </div>

      <div className={styles.bottomDivider} />

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <button className={styles.powerBtn} onClick={() => window.api.closeWindow()}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7" y="3" width="2" height="5" rx="1" fill="currentColor" />
          </svg>
          <span>Turn off computer</span>
        </button>
      </div>
    </div>
  )
}
