import { useState, useEffect, useCallback } from 'react'
import styles from './SettingsApp.module.css'

export default function SettingsApp() {
  // Claude
  const [apiKey, setApiKey] = useState('')
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [claudeStatus, setClaudeStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Groq
  const [groqKey, setGroqKey] = useState('')
  const [savedGroqKey, setSavedGroqKey] = useState<string | null>(null)
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile')
  const [groqStatus, setGroqStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function load() {
      const key = await window.api.getApiKey()
      if (key) { setSavedKey(key); setApiKey(key) }
      const savedModel = await window.api.getSetting('model')
      if (savedModel) setModel(savedModel)

      const gkey = await window.api.getGroqKey()
      if (gkey) { setSavedGroqKey(gkey); setGroqKey(gkey) }
      const savedGroqModel = await window.api.getSetting('groq_model')
      if (savedGroqModel) setGroqModel(savedGroqModel)

      setIsReady(await window.api.isClaudeReady())
    }
    load()
  }, [])

  const handleSaveClaude = useCallback(async () => {
    if (!apiKey.trim()) return
    setClaudeStatus('saving')
    try {
      await window.api.setApiKey(apiKey.trim())
      await window.api.setSetting('model', model)
      setSavedKey(apiKey.trim())
      setIsReady(true)
      setClaudeStatus('saved')
      setTimeout(() => setClaudeStatus('idle'), 2000)
    } catch { setClaudeStatus('error') }
  }, [apiKey, model])

  const handleClearClaude = useCallback(async () => {
    await window.api.clearApiKey()
    setSavedKey(null); setApiKey(''); setClaudeStatus('idle')
    setIsReady(await window.api.isClaudeReady())
  }, [])

  const handleSaveGroq = useCallback(async () => {
    if (!groqKey.trim()) return
    setGroqStatus('saving')
    try {
      await window.api.setGroqKey(groqKey.trim())
      await window.api.setSetting('groq_model', groqModel)
      setSavedGroqKey(groqKey.trim())
      setIsReady(true)
      setGroqStatus('saved')
      setTimeout(() => setGroqStatus('idle'), 2000)
    } catch { setGroqStatus('error') }
  }, [groqKey, groqModel])

  const handleClearGroq = useCallback(async () => {
    await window.api.clearGroqKey()
    setSavedGroqKey(null); setGroqKey(''); setGroqStatus('idle')
    setIsReady(await window.api.isClaudeReady())
  }, [])

  return (
    <div className={styles.settings}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>⚙️</span>
          <h2 className={styles.headerTitle}>Control Panel</h2>
        </div>

        <div className={styles.field} style={{ padding: '0 4px 4px' }}>
          <label className={styles.label}>AI Status:</label>
          <span className={`${styles.status} ${isReady ? styles.statusOk : styles.statusErr}`}>
            {isReady ? '🟢 Connected' : '🔴 Not configured'}
          </span>
        </div>

        {/* Groq section */}
        <fieldset className={styles.fieldset}>
          <legend>Groq (Free) — console.groq.com</legend>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="groq-key">API Key:</label>
            <input
              id="groq-key"
              type="password"
              className={`win98-input ${styles.input}`}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="groq-model">Model:</label>
            <select
              id="groq-model"
              className={`win98-input ${styles.select}`}
              value={groqModel}
              onChange={(e) => setGroqModel(e.target.value)}
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button className="win98-button" onClick={handleSaveGroq} disabled={!groqKey.trim()}>
              {groqStatus === 'saving' ? 'Saving...' : groqStatus === 'saved' ? '✓ Saved!' : 'Apply'}
            </button>
            {savedGroqKey && (
              <button className="win98-button" onClick={handleClearGroq}>Clear Key</button>
            )}
          </div>
        </fieldset>

        {/* Claude section */}
        <fieldset className={styles.fieldset}>
          <legend>Anthropic Claude — console.anthropic.com</legend>

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
            Keys are stored securely on your device. If both are set, Claude takes priority.
          </div>

          <div className={styles.actions}>
            <button className="win98-button" onClick={handleSaveClaude} disabled={!apiKey.trim()}>
              {claudeStatus === 'saving' ? 'Saving...' : claudeStatus === 'saved' ? '✓ Saved!' : 'Apply'}
            </button>
            {savedKey && (
              <button className="win98-button" onClick={handleClearClaude}>Clear Key</button>
            )}
          </div>
        </fieldset>

        {/* About */}
        <fieldset className={styles.fieldset}>
          <legend>About</legend>
          <div className={styles.about}>
            <div className={styles.aboutLogo}>☁</div>
            <div>
              <strong>Claude98</strong> v0.1.0
              <br />
              Windows 98-inspired AI Desktop
              <br />
              <span className={styles.aboutCopy}>© 2026</span>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  )
}
