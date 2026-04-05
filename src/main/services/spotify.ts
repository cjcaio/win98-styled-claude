import { shell } from 'electron'
import { createServer } from 'http'
import { randomBytes, createHash } from 'crypto'

const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ')

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateVerifier(): string {
  return b64url(randomBytes(32))
}

function generateChallenge(verifier: string): string {
  return b64url(createHash('sha256').update(verifier).digest())
}

export async function startAuthFlow(clientId: string): Promise<{ code: string; verifier: string }> {
  const verifier = generateVerifier()
  const challenge = generateChallenge(verifier)
  const state = randomBytes(8).toString('hex')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })

  const authUrl = `https://accounts.spotify.com/authorize?${params}`

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url!, 'http://localhost:8888')
      if (url.pathname !== '/callback') return

      const code = url.searchParams.get('code')
      const returnedState = url.searchParams.get('state')

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>✓ Logged in! You can close this tab.</h2><script>window.close()</script></body></html>')
      server.close()

      if (code && returnedState === state) {
        resolve({ code, verifier })
      } else {
        reject(new Error(url.searchParams.get('error') ?? 'Auth failed'))
      }
    })

    server.on('error', reject)

    server.listen(8888, '127.0.0.1', () => {
      shell.openExternal(authUrl)
    })

    setTimeout(() => {
      server.close()
      reject(new Error('Login timed out (5 min)'))
    }, 5 * 60 * 1000)
  })
}

export async function exchangeCode(clientId: string, code: string, verifier: string) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>
}

export async function refreshAccessToken(clientId: string, refreshToken: string) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json() as Promise<{ access_token: string; expires_in: number; refresh_token?: string }>
}

async function api(method: string, path: string, accessToken: string, body?: object) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const getPlayerState = (token: string) => api('GET', '/me/player', token)
export const play = (token: string) => api('PUT', '/me/player/play', token)
export const pause = (token: string) => api('PUT', '/me/player/pause', token)
export const next = (token: string) => api('POST', '/me/player/next', token)
export const previous = (token: string) => api('POST', '/me/player/previous', token)
export const setVolume = (token: string, vol: number) =>
  api('PUT', `/me/player/volume?volume_percent=${Math.round(vol)}`, token)
