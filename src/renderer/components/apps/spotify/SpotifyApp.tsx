import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './SpotifyApp.module.css'

interface Track {
  name: string
  artists: string
  album: string
  albumArt: string | null
  durationMs: number
  progressMs: number
  isPlaying: boolean
  volumePercent: number
  deviceName: string
}

function parsePlayerState(state: any): Track | null {
  if (!state || !state.item) return null
  return {
    name: state.item.name,
    artists: state.item.artists.map((a: any) => a.name).join(', '),
    album: state.item.album.name,
    albumArt: state.item.album.images?.[0]?.url ?? null,
    durationMs: state.item.duration_ms,
    progressMs: state.progress_ms ?? 0,
    isPlaying: state.is_playing,
    volumePercent: state.device?.volume_percent ?? 50,
    deviceName: state.device?.name ?? '',
  }
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── Setup Screen ──────────────────────────────────────────
function SetupScreen({ onDone }: { onDone: () => void }) {
  const [clientId, setClientId] = useState('')
  const [step, setStep] = useState<'input' | 'waiting' | 'error'>('input')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.api.spotifyGetSetup().then(({ clientId: saved }) => {
      if (saved) setClientId(saved)
    })
  }, [])

  const handleConnect = async () => {
    if (!clientId.trim()) return
    await window.api.spotifySaveClientId(clientId.trim())
    setStep('waiting')
    setErrorMsg('')
    try {
      await window.api.spotifyStartAuth()
      onDone()
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Login failed')
      setStep('error')
    }
  }

  return (
    <div className={styles.setup}>
      <div className={styles.setupLogo}>
        <svg width="48" height="48" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="#1DB954" />
          <path d="M8 12 Q16 7 25 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M9 17 Q16 13 24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M10 22 Q16 19 23 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <span className={styles.setupTitle}>Spotify</span>
      </div>

      {step === 'waiting' ? (
        <div className={styles.waiting}>
          <p>Opening Spotify login in your browser...</p>
          <p className={styles.waitingHint}>Complete the login then come back here.</p>
        </div>
      ) : (
        <>
          <div className={styles.setupInstructions}>
            <p className={styles.setupStep}><b>1.</b> Go to <b>developer.spotify.com</b> → Create an app</p>
            <p className={styles.setupStep}><b>2.</b> Add Redirect URI: <code>http://127.0.0.1:8888/callback</code></p>
            <p className={styles.setupStep}><b>3.</b> Copy your <b>Client ID</b> below</p>
          </div>

          <div className={styles.setupField}>
            <label className={styles.setupLabel}>Client ID</label>
            <input
              className={`win98-input ${styles.setupInput}`}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Paste your Spotify Client ID..."
              spellCheck={false}
            />
          </div>

          {step === 'error' && (
            <div className={styles.setupError}>{errorMsg}</div>
          )}

          <button
            className={`win98-button ${styles.connectBtn}`}
            onClick={handleConnect}
            disabled={!clientId.trim()}
          >
            Connect to Spotify
          </button>
        </>
      )}
    </div>
  )
}

// ── Player Screen ─────────────────────────────────────────
function PlayerScreen({ onLogout }: { onLogout: () => void }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [polling, setPolling] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchState = useCallback(async () => {
    const state = await window.api.spotifyGetPlayerState()
    setTrack(parsePlayerState(state))
  }, [])

  useEffect(() => {
    fetchState()
    intervalRef.current = setInterval(fetchState, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchState])

  const handlePlay = async () => {
    await window.api.spotifyPlay()
    setTimeout(fetchState, 500)
  }
  const handlePause = async () => {
    await window.api.spotifyPause()
    setTimeout(fetchState, 500)
  }
  const handleNext = async () => {
    await window.api.spotifyNext()
    setTimeout(fetchState, 800)
  }
  const handlePrev = async () => {
    await window.api.spotifyPrevious()
    setTimeout(fetchState, 800)
  }
  const handleVolume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value)
    setTrack((t) => t ? { ...t, volumePercent: vol } : t)
    await window.api.spotifySetVolume(vol)
  }
  const handleLogout = async () => {
    await window.api.spotifyLogout()
    onLogout()
  }

  const progressPct = track ? (track.progressMs / track.durationMs) * 100 : 0

  return (
    <div className={styles.player}>
      {/* Album Art */}
      <div className={styles.artWrap}>
        {track?.albumArt ? (
          <img src={track.albumArt} className={styles.art} alt="Album art" />
        ) : (
          <div className={styles.artPlaceholder}>
            <svg width="64" height="64" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="15" fill="#1DB954" opacity="0.3"/>
              <path d="M8 12 Q16 7 25 11" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M9 17 Q16 13 24 16" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M10 22 Q16 19 23 21" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className={styles.trackInfo}>
        {track ? (
          <>
            <div className={styles.trackName}>{track.name}</div>
            <div className={styles.trackArtist}>{track.artists}</div>
            <div className={styles.trackAlbum}>{track.album}</div>
          </>
        ) : (
          <div className={styles.notPlaying}>Nothing playing</div>
        )}
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <span className={styles.progressTime}>{track ? formatTime(track.progressMs) : '0:00'}</span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <span className={styles.progressTime}>{track ? formatTime(track.durationMs) : '0:00'}</span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={handlePrev} title="Previous">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <rect x="1" y="2" width="3" height="12"/>
            <path d="M14 2L5 8L14 14Z"/>
          </svg>
        </button>
        <button className={`${styles.ctrlBtn} ${styles.playBtn}`} onClick={track?.isPlaying ? handlePause : handlePlay} title={track?.isPlaying ? 'Pause' : 'Play'}>
          {track?.isPlaying ? (
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <rect x="3" y="2" width="4" height="12"/>
              <rect x="9" y="2" width="4" height="12"/>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M3 2L13 8L3 14Z"/>
            </svg>
          )}
        </button>
        <button className={styles.ctrlBtn} onClick={handleNext} title="Next">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <rect x="12" y="2" width="3" height="12"/>
            <path d="M2 2L11 8L2 14Z"/>
          </svg>
        </button>
      </div>

      {/* Volume + device */}
      <div className={styles.bottomBar}>
        <div className={styles.volumeWrap}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="#1DB954">
            <path d="M1 4H4L7 1V11L4 8H1Z"/>
            <path d="M8 3Q11 6 8 9" stroke="#1DB954" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={track?.volumePercent ?? 50}
            onChange={handleVolume}
            className={styles.volumeSlider}
          />
        </div>
        {track?.deviceName && (
          <span className={styles.deviceName}>{track.deviceName}</span>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function SpotifyApp() {
  const [screen, setScreen] = useState<'loading' | 'setup' | 'player'>('loading')

  useEffect(() => {
    window.api.spotifyGetSetup().then(({ isAuthenticated }) => {
      setScreen(isAuthenticated ? 'player' : 'setup')
    })
  }, [])

  if (screen === 'loading') return <div className={styles.loading}>Loading...</div>
  if (screen === 'setup') return <SetupScreen onDone={() => setScreen('player')} />
  return <PlayerScreen onLogout={() => setScreen('setup')} />
}
