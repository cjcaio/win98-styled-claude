type SoundName = 'startup' | 'windowOpen' | 'windowClose' | 'click' | 'error' | 'notify' | 'login'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function tone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.25
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)

  const attack = 0.008
  const release = Math.min(0.04, duration * 0.25)

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + attack)
  gain.gain.setValueAtTime(gainPeak, startTime + duration - release)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

export function playSound(name: SoundName): void {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime

    switch (name) {
      case 'startup':
        // 4-note ascending chord — approximates Win98 startup warmth
        tone(ctx, 330, t + 0.00, 0.18, 'sine', 0.18)  // E4
        tone(ctx, 392, t + 0.12, 0.22, 'sine', 0.20)  // G4
        tone(ctx, 523, t + 0.28, 0.30, 'sine', 0.22)  // C5
        tone(ctx, 659, t + 0.48, 0.65, 'sine', 0.25)  // E5
        tone(ctx, 523, t + 0.48, 0.65, 'sine', 0.12)  // C5 harmony
        tone(ctx, 784, t + 0.65, 0.50, 'sine', 0.15)  // G5 tail
        break

      case 'windowOpen':
        tone(ctx, 523, t + 0.00, 0.07, 'sine', 0.12)  // C5
        tone(ctx, 784, t + 0.06, 0.10, 'sine', 0.12)  // G5
        break

      case 'windowClose':
        tone(ctx, 784, t + 0.00, 0.07, 'sine', 0.12)  // G5
        tone(ctx, 523, t + 0.06, 0.10, 'sine', 0.12)  // C5
        break

      case 'click':
        tone(ctx, 1400, t, 0.012, 'square', 0.06)
        break

      case 'error':
        // Classic Win98 "critical stop" buzz
        tone(ctx, 440, t + 0.00, 0.14, 'square', 0.10)
        tone(ctx, 330, t + 0.12, 0.18, 'square', 0.10)
        break

      case 'notify':
        // Soft double-bell ding
        tone(ctx, 880,  t + 0.00, 0.12, 'sine', 0.18)
        tone(ctx, 1108, t + 0.10, 0.22, 'sine', 0.14)
        break

      case 'login':
        // Welcoming 3-note ascending fanfare (XP login feel)
        tone(ctx, 523, t + 0.00, 0.15, 'sine', 0.20)  // C5
        tone(ctx, 659, t + 0.14, 0.15, 'sine', 0.22)  // E5
        tone(ctx, 784, t + 0.28, 0.40, 'sine', 0.25)  // G5
        tone(ctx, 523, t + 0.28, 0.40, 'sine', 0.10)  // C5 harmony
        break
    }
  } catch {
    // AudioContext unavailable (headless/test environment)
  }
}
