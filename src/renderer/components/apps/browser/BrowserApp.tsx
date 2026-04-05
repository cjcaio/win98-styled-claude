import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDesktopStore } from '@/stores/desktop'
import styles from './BrowserApp.module.css'

const HOME_URL = 'https://www.google.com'

const FAVORITES = [
  { label: 'Claude.ai',   url: 'https://claude.ai' },
  { label: 'Google',      url: 'https://www.google.com' },
  { label: 'Wikipedia',   url: 'https://en.wikipedia.org' },
  { label: 'YouTube',     url: 'https://www.youtube.com' },
]

// Minimal interface for the webview DOM element
interface WebviewEl extends HTMLElement {
  loadURL(url: string): void
  getURL(): string
  goBack(): void
  goForward(): void
  canGoBack(): boolean
  canGoForward(): boolean
  reload(): void
  stop(): void
}

// ── Toolbar button SVG icons ────────────────────────────
function BackIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ForwardIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function StopIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 2L10 2L10 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <path d="M1 7L7 2L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="4" y="7" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="5.5" y="9" width="3" height="3" fill="currentColor"/>
    </svg>
  )
}

export default function BrowserApp() {
  const webviewRef = useRef<WebviewEl | null>(null)
  const [addressInput, setAddressInput] = useState(HOME_URL)
  const [isLoading, setIsLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [statusText, setStatusText] = useState('Connecting...')

  const { pendingBrowserUrl, clearPendingBrowserUrl } = useDesktopStore()

  // Capture the initial URL exactly once at mount — avoids src flickering on re-renders
  const initialSrcRef = useRef(pendingBrowserUrl ?? HOME_URL)

  // Clear the pending URL from the store on mount
  useEffect(() => {
    if (pendingBrowserUrl) {
      setAddressInput(pendingBrowserUrl)
      clearPendingBrowserUrl()
    }
  }, [])

  // React to pendingBrowserUrl changes while window is already open
  useEffect(() => {
    if (pendingBrowserUrl && webviewRef.current) {
      webviewRef.current.loadURL(pendingBrowserUrl)
      setAddressInput(pendingBrowserUrl)
      clearPendingBrowserUrl()
    }
  }, [pendingBrowserUrl])

  // Wire up webview events after mount
  const webviewCallbackRef = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const wv = el as WebviewEl
    webviewRef.current = wv

    const onStartLoad = () => {
      setIsLoading(true)
      setStatusText('Loading...')
    }

    const onStopLoad = () => {
      setIsLoading(false)
      setStatusText('Done')
      setAddressInput(wv.getURL())
      setCanGoBack(wv.canGoBack())
      setCanGoForward(wv.canGoForward())
    }

    const onNavigate = (e: Event & { url?: string }) => {
      const url = (e as any).url ?? wv.getURL()
      setAddressInput(url)
      setStatusText(url)
      setCanGoBack(wv.canGoBack())
      setCanGoForward(wv.canGoForward())
    }

    const onNewWindow = (e: Event) => {
      const url = (e as any).url
      if (url) wv.loadURL(url)
    }

    wv.addEventListener('did-start-loading', onStartLoad)
    wv.addEventListener('did-stop-loading', onStopLoad)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('new-window', onNewWindow)
  }, [])

  const navigate = useCallback((input: string) => {
    let url = input.trim()
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
      if (url.includes('.') && !url.includes(' ') && !url.startsWith('about:')) {
        url = 'https://' + url
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }
    setAddressInput(url)
    webviewRef.current?.loadURL(url)
  }, [])

  const handleAddressKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigate(addressInput)
  }, [addressInput, navigate])


  return (
    <div className={styles.browser}>
      {/* ── Menu bar ── */}
      <div className={styles.menuBar}>
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((item) => (
          <button key={item} className={styles.menuItem}>{item}</button>
        ))}
      </div>

      {/* ── Navigation toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.navBtns}>
          <button
            className={styles.navBtn}
            disabled={!canGoBack}
            onClick={() => webviewRef.current?.goBack()}
            title="Back"
          >
            <BackIcon />
            <span>Back</span>
          </button>
          <button
            className={styles.navBtn}
            disabled={!canGoForward}
            onClick={() => webviewRef.current?.goForward()}
            title="Forward"
          >
            <ForwardIcon />
            <span>Forward</span>
          </button>
          <div className={styles.toolbarSep} />
          <button
            className={styles.navBtn}
            onClick={() => isLoading ? webviewRef.current?.stop() : webviewRef.current?.reload()}
            title={isLoading ? 'Stop' : 'Refresh'}
          >
            {isLoading ? <StopIcon /> : <RefreshIcon />}
          </button>
          <button
            className={styles.navBtn}
            onClick={() => navigate(HOME_URL)}
            title="Home"
          >
            <HomeIcon />
          </button>
        </div>

        {/* Address bar */}
        <div className={styles.addressWrap}>
          <span className={styles.addrLabel}>Address</span>
          <div className={styles.addrField}>
            <input
              className={styles.addrInput}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={handleAddressKey}
              spellCheck={false}
            />
          </div>
          <button className={styles.goBtn} onClick={() => navigate(addressInput)}>
            Go
          </button>
        </div>
      </div>

      {/* ── Favorites / Links bar ── */}
      <div className={styles.linksBar}>
        <span className={styles.linksLabel}>Links</span>
        <div className={styles.linksSep} />
        {FAVORITES.map((f) => (
          <button key={f.url} className={styles.linkBtn} onClick={() => navigate(f.url)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Webview ── */}
      <div className={styles.webviewWrap}>
        {React.createElement('webview', {
          ref: webviewCallbackRef,
          src: initialSrcRef.current,
          className: styles.webview,
          partition: 'persist:browser',
          allowpopups: 'true',
          useragent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          style: { width: '100%', height: '100%', display: 'flex' }
        })}
      </div>

      {/* ── Status bar ── */}
      <div className={styles.statusBar}>
        <span className={styles.statusText}>{statusText}</span>
        <div className={styles.statusZone}>
          <span>Internet</span>
        </div>
      </div>
    </div>
  )
}
