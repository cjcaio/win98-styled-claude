import Anthropic from '@anthropic-ai/sdk'
import { BrowserWindow } from 'electron'

let client: Anthropic | null = null

export function initClaude(apiKey: string): void {
  client = apiKey ? new Anthropic({ apiKey }) : null
}

export function resetClaude(): void {
  client = null
}

export function isClaudeReady(): boolean {
  return client !== null
}

export interface SendMessageOptions {
  chatId: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  model?: string
  window: BrowserWindow
}

export async function sendMessage(options: SendMessageOptions): Promise<string> {
  if (!client) {
    throw new Error('Claude API not initialized. Set your API key in Settings.')
  }

  const { chatId, messages, model = 'claude-sonnet-4-20250514', window } = options

  let fullResponse = ''

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: 'You are Claude, running inside Claude98 — a Windows 98-inspired desktop environment. Be helpful, concise, and occasionally reference the retro aesthetic when it fits naturally. You can use markdown in your responses.',
    messages
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullResponse += event.delta.text
      // Stream each chunk to the renderer
      window.webContents.send(`claude:stream:${chatId}`, {
        type: 'delta',
        text: event.delta.text
      })
    }
  }

  // Signal stream complete
  window.webContents.send(`claude:stream:${chatId}`, {
    type: 'done',
    text: fullResponse
  })

  return fullResponse
}
