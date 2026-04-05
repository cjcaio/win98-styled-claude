import { BrowserWindow } from 'electron'

let groqApiKey: string | null = null

export function initGroq(apiKey: string): void {
  groqApiKey = apiKey || null
}

export function resetGroq(): void {
  groqApiKey = null
}

export function isGroqReady(): boolean {
  return groqApiKey !== null
}

export interface SendMessageOptions {
  chatId: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  model?: string
  window: BrowserWindow
}

export async function sendMessage(options: SendMessageOptions): Promise<string> {
  if (!groqApiKey) throw new Error('Groq API not initialized.')

  const { chatId, messages, model = 'llama-3.3-70b-versatile', window } = options

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant running inside Claude98 — a Windows 98-inspired desktop environment. Be helpful and concise. You can use markdown in your responses.' },
        ...messages
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullResponse = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          fullResponse += delta
          window.webContents.send(`claude:stream:${chatId}`, { type: 'delta', text: delta })
        }
      } catch {}
    }
  }

  window.webContents.send(`claude:stream:${chatId}`, { type: 'done', text: fullResponse })
  return fullResponse
}
