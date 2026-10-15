// Celebration kinds shown on a correct answer, plus their sound effects.
// Sounds are synthesized with the Web Audio API (no audio files, works offline).

export const CELEBRATIONS = ['fireworks', 'rocket', 'whale', 'balloons', 'rainbow'] as const
export type CelebrationKind = (typeof CELEBRATIONS)[number]

/** Random celebration, avoiding an immediate repeat. */
export function pickCelebration(previous?: CelebrationKind): CelebrationKind {
  const choices = CELEBRATIONS.filter((k) => k !== previous)
  return choices[Math.floor(Math.random() * choices.length)]
}

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  try {
    ctx ??= new AudioContext()
    // iOS starts the context suspended; resuming inside the tap handler unlocks it.
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface ToneOpts {
  type?: OscillatorType
  from: number
  to?: number
  start: number
  dur: number
  gain: number
}

function tone(c: AudioContext, { type = 'sine', from, to = from, start, dur, gain }: ToneOpts) {
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

interface NoiseOpts {
  start: number
  dur: number
  gain: number
  filter?: BiquadFilterType
  freqFrom: number
  freqTo?: number
  attack?: number
}

let noiseBuffer: AudioBuffer | null = null

function noise(c: AudioContext, { start, dur, gain, filter = 'lowpass', freqFrom, freqTo = freqFrom, attack = 0.01 }: NoiseOpts) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const t0 = c.currentTime + start
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  const f = c.createBiquadFilter()
  f.type = filter
  f.frequency.setValueAtTime(freqFrom, t0)
  f.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f).connect(g).connect(c.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.05)
}

const SOUNDS: Record<CelebrationKind, (c: AudioContext) => void> = {
  fireworks(c) {
    ;[0, 0.45, 0.9, 1.2, 1.35].forEach((t) => {
      tone(c, { from: 500, to: 1600, start: t, dur: 0.3, gain: 0.05 })
      noise(c, { start: t + 0.3, dur: 0.7, gain: 0.35, freqFrom: 3000, freqTo: 300 })
      for (let i = 0; i < 5; i++) {
        noise(c, { start: t + 0.45 + i * 0.07, dur: 0.04, gain: 0.12, filter: 'highpass', freqFrom: 4000 })
      }
    })
  },
  rocket(c) {
    noise(c, { start: 0, dur: 1.6, gain: 0.25, filter: 'bandpass', freqFrom: 300, freqTo: 3000, attack: 0.3 })
    tone(c, { from: 120, to: 900, start: 0, dur: 1.5, gain: 0.06, type: 'triangle' })
    tone(c, { from: 1047, start: 1.5, dur: 0.4, gain: 0.08, type: 'triangle' })
    tone(c, { from: 1568, start: 1.6, dur: 0.5, gain: 0.08, type: 'triangle' })
  },
  whale(c) {
    tone(c, { from: 200, to: 500, start: 0, dur: 0.45, gain: 0.12 })
    noise(c, { start: 1.5, dur: 0.8, gain: 0.4, freqFrom: 1500, freqTo: 250 })
    ;[1.65, 1.77, 1.9, 2.05].forEach((t, i) => tone(c, { from: 500 + i * 120, to: 1100 + i * 150, start: t, dur: 0.08, gain: 0.08 }))
  },
  balloons(c) {
    ;[523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(c, { from: f, start: i * 0.13, dur: 0.3, gain: 0.1, type: 'triangle' }),
    )
    ;[1.3, 1.6, 1.85].forEach((t) => noise(c, { start: t, dur: 0.05, gain: 0.3, filter: 'highpass', freqFrom: 1500 }))
  },
  rainbow(c) {
    const notes = [1047, 1175, 1319, 1568, 1760, 2093]
    for (let i = 0; i < 10; i++) {
      tone(c, { from: notes[(i * 3) % notes.length], start: i * 0.1, dur: 0.5, gain: 0.05 })
    }
  },
}

export function playCelebrationSound(kind: CelebrationKind): void {
  const c = audio()
  if (c) SOUNDS[kind](c)
}
