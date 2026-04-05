import { useState, useEffect, useCallback } from 'react'
import styles from './SettingsApp.module.css'

export default function SettingsApp() {
  const [apiKey, setApiKey] = useState('')
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function load() {
      const key = await window.api.getApiKey()
      if (key) {
        setSavedKey(key)
        setApiKey(key)
      }
      const savedModel = await window.api.getSetting('model')
      if (savedModel) setModel(savedModel)
      setIsReady(await window.api.isClaudeReady())
    }
    load()
  }, [])

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) return
    setStatus('saving')
    try {
      await window.api.setApiKey(apiKey.trim())
      await window.api.setSetting('model', model)
      setSavedKey(apiKey.trim())
      setIsReady(true)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }, [apiKey, model])

  const maskedKey = savedKey
    ? `sk-ant-...${savedKey.slice(-8)}`
    : 'Not set'

  return (
    <div className={styles.settings}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>⚙️</span>
          <h2 className={styles.headerTitle}>Control Panel</h2>
        </div>

        {/* API Key section */}
        <fieldset className={styles.fieldset}>
          <legend>API Configuration</legend>

          <div className={styles.field}>
            <label className={styles.label}>Status:</label>
            <span className={`${styles.status} ${isReady ? styles.statusOk : styles.statusErr}`}>
              {isReady ? '🟢 Connected' : '🔴 Not configured'}
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Current Key:</label>
            <span className={styles.mono}>{maskedKey}</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="api-key">API Key:</label>
            <input
              id="api-key"
              type="password"
              className={`win98-input ${styles.input}`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="model">Model:</label>
            <select
              id="model"
              className={`win98-input ${styles.select}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
              <option value="claude-opus-4-6">Claude Opus 4.6</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            </select>
          </div>

          <div className={styles.hint}>
            Your API key is encrypted and stored securely on your device.
            <br />
            Get one at{' '}
            <span className={styles.link}>console.anthropic.com</span>
          </div>
        </fieldset>

        {/* About section */}
        <fieldset className={styles.fieldset}>
          <legend>About</legend>
          <div className={styles.about}>
            <div className={styles.aboutLogo}>☁</div>
            <div>
              <strong>Claude98</strong> v0.1.0
              <br />
              Windows 98-inspired AI Desktop
              <br />
              <span className={styles.aboutCopy}>© 2026 • Powered by Anthropic</span>
            </div>
          </div>
        </fieldset>

        {/* Actions */}
        <div className={styles.actions}>
          <button className="win98-button" onClick={handleSave} disabled={!apiKey.trim()}>
            {status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved!' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
