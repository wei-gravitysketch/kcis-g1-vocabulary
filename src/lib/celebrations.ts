// Scenes shown after an answer (celebrations for correct, "oops" for wrong), their sound
// effects, and the praise phrases shown (not spoken) on a correct answer.
// Sounds are synthesized with the Web Audio API (no audio files, works offline).

import { audio, noise, tone } from './audio'

export const CELEBRATIONS = [
  'fireworks',
  'rocket',
  'whale',
  'balloons',
  'rainbow',
  'ufo',
  'unicorn',
  'butterflies',
  'fish',
  'party',
  'shootingStars',
  'trophy',
  'dinosaur',
  'bunny',
  'flowers',
] as const
export const OOPS = ['monkey', 'puppy', 'rainCloud'] as const

export type CelebrationKind = (typeof CELEBRATIONS)[number]
export type OopsKind = (typeof OOPS)[number]
export type SceneKind = CelebrationKind | OopsKind

export const PRAISES = [
  'Amazing!',
  'Excellent!',
  'Terrific!',
  'Great job!',
  'Awesome!',
  'Fantastic!',
  'Super!',
  'Well done!',
  'You got it!',
  'Wonderful!',
  'Brilliant!',
  'Way to go!',
  'Nice work!',
  'Perfect!',
  "You're a star!",
] as const

/**
 * "Shuffle bag": hands out every item once, in random order, before any item repeats.
 * A new round never starts with the item that ended the previous one.
 */
function shuffleBag<T>(items: readonly T[]): () => T {
  let bag: T[] = []
  let last: T | undefined
  return () => {
    if (bag.length === 0) {
      bag = [...items]
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[bag[i], bag[j]] = [bag[j], bag[i]]
      }
      // bag.pop() takes from the end: keep the previous round's last item off it.
      if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]]
    }
    last = bag.pop()!
    return last
  }
}

export const pickCelebration: () => SceneKind = shuffleBag(CELEBRATIONS)
export const pickOops: () => SceneKind = shuffleBag(OOPS)
export const pickPraise: () => string = shuffleBag(PRAISES)

/** Play a short melody: [frequency, startTime] pairs. */
const melody = (c: AudioContext, notes: [number, number][], dur: number, gain: number, type: OscillatorType = 'triangle') =>
  notes.forEach(([from, start]) => tone(c, { from, start, dur, gain, type }))

const C5 = 523
const D5 = 587
const E5 = 659
const G5 = 784
const A5 = 880
const C6 = 1047

const SOUNDS: Record<SceneKind, (c: AudioContext) => void> = {
  // ----- celebrations -----
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
    tone(c, { from: C6, start: 1.5, dur: 0.4, gain: 0.08, type: 'triangle' })
    tone(c, { from: 1568, start: 1.6, dur: 0.5, gain: 0.08, type: 'triangle' })
  },
  whale(c) {
    tone(c, { from: 200, to: 500, start: 0, dur: 0.45, gain: 0.12 })
    noise(c, { start: 1.5, dur: 0.8, gain: 0.4, freqFrom: 1500, freqTo: 250 })
    ;[1.65, 1.77, 1.9, 2.05].forEach((t, i) =>
      tone(c, { from: 500 + i * 120, to: 1100 + i * 150, start: t, dur: 0.08, gain: 0.08 }),
    )
  },
  balloons(c) {
    melody(c, [[C5, 0], [E5, 0.13], [G5, 0.26], [C6, 0.39], [G5, 0.52], [C6, 0.65]], 0.3, 0.1)
    ;[1.3, 1.6, 1.85].forEach((t) => noise(c, { start: t, dur: 0.05, gain: 0.3, filter: 'highpass', freqFrom: 1500 }))
  },
  rainbow(c) {
    const notes = [C6, 1175, 1319, 1568, 1760, 2093]
    for (let i = 0; i < 10; i++) tone(c, { from: notes[(i * 3) % notes.length], start: i * 0.1, dur: 0.5, gain: 0.05 })
  },
  ufo(c) {
    // Wobbly "theremin" hum, then a rising tractor-beam whoosh.
    tone(c, { from: 700, to: 900, start: 0, dur: 0.9, gain: 0.06, vib: [7, 60] })
    tone(c, { from: 300, to: 1200, start: 0.8, dur: 1.0, gain: 0.07, vib: [12, 40] })
    noise(c, { start: 0.8, dur: 1.0, gain: 0.08, filter: 'bandpass', freqFrom: 400, freqTo: 2500, attack: 0.3 })
    tone(c, { from: 900, to: 600, start: 1.9, dur: 0.5, gain: 0.05, vib: [7, 60] })
  },
  unicorn(c) {
    // Magical harp glissando up two octaves.
    const scale = [C5, D5, E5, G5, A5, C6, 1175, 1319, 1568, 1760, 2093]
    scale.forEach((f, i) => tone(c, { from: f, start: i * 0.07, dur: 0.6, gain: 0.05 }))
    scale.slice(-4).forEach((f, i) => tone(c, { from: f, start: 1.2 + i * 0.12, dur: 0.6, gain: 0.04 }))
  },
  butterflies(c) {
    for (let i = 0; i < 8; i++) {
      const f = [1319, 1568, 1760, 2093][i % 4]
      tone(c, { from: f, start: i * 0.2, dur: 0.12, gain: 0.05 })
      tone(c, { from: f * 1.26, start: i * 0.2 + 0.06, dur: 0.15, gain: 0.04 })
    }
  },
  fish(c) {
    for (let i = 0; i < 12; i++) {
      const f = 400 + Math.random() * 500
      tone(c, { from: f, to: f * 2.2, start: i * 0.16 + Math.random() * 0.05, dur: 0.07, gain: 0.08 })
    }
  },
  party(c) {
    noise(c, { start: 0, dur: 0.15, gain: 0.45, filter: 'highpass', freqFrom: 800 })
    noise(c, { start: 0.15, dur: 0.15, gain: 0.45, filter: 'highpass', freqFrom: 800 })
    // Party horn.
    tone(c, { from: 300, to: 320, start: 0.4, dur: 0.35, gain: 0.07, type: 'sawtooth', vib: [25, 15] })
    tone(c, { from: 400, to: 420, start: 0.8, dur: 0.6, gain: 0.07, type: 'sawtooth', vib: [25, 15] })
  },
  shootingStars(c) {
    ;[0, 0.3, 0.6, 0.9, 1.2].forEach((t, i) => {
      tone(c, { from: 2400 - i * 150, to: 900, start: t, dur: 0.45, gain: 0.05 })
      tone(c, { from: 1568, start: t + 0.4, dur: 0.3, gain: 0.03 })
    })
  },
  trophy(c) {
    // Fanfare: G4 C5 E5 G5 ... C6
    melody(c, [[392, 0], [C5, 0.15], [E5, 0.3], [G5, 0.45]], 0.2, 0.09)
    tone(c, { from: E5, start: 0.65, dur: 0.15, gain: 0.09, type: 'triangle' })
    tone(c, { from: C6, start: 0.8, dur: 0.9, gain: 0.1, type: 'triangle' })
    tone(c, { from: G5, start: 0.8, dur: 0.9, gain: 0.06, type: 'triangle' })
  },
  dinosaur(c) {
    ;[0.1, 0.55, 1.0, 1.45].forEach((t) => {
      tone(c, { from: 90, to: 40, start: t, dur: 0.25, gain: 0.35 })
      noise(c, { start: t, dur: 0.2, gain: 0.15, freqFrom: 300 })
    })
    // A small, cute roar.
    tone(c, { from: 260, to: 160, start: 1.7, dur: 0.6, gain: 0.08, type: 'sawtooth', vib: [30, 20] })
  },
  bunny(c) {
    ;[0, 0.45, 0.9, 1.35, 1.8].forEach((t) => tone(c, { from: 250, to: 700, start: t, dur: 0.18, gain: 0.1 }))
  },
  flowers(c) {
    // Gentle marimba-like pentatonic run.
    const notes = [C5, D5, E5, G5, A5, C6, A5, C6]
    notes.forEach((f, i) => tone(c, { from: f, start: i * 0.18, dur: 0.35, gain: 0.08 }))
  },

  // ----- oops (wrong answer) -----
  monkey(c) {
    // Silly "boing-oing" going down.
    tone(c, { from: 500, to: 180, start: 0.3, dur: 0.35, gain: 0.1, vib: [18, 40] })
    tone(c, { from: 400, to: 150, start: 0.75, dur: 0.4, gain: 0.08, vib: [18, 40] })
  },
  puppy(c) {
    // Two-note "huh?" that rises like a question.
    tone(c, { from: 380, start: 0.25, dur: 0.18, gain: 0.08, type: 'triangle' })
    tone(c, { from: 380, to: 620, start: 0.5, dur: 0.35, gain: 0.08, type: 'triangle' })
  },
  rainCloud(c) {
    // Soft "wah-wah-wah-waaah".
    ;[
      [392, 0.2],
      [370, 0.55],
      [349, 0.9],
    ].forEach(([f, t]) => tone(c, { from: f, to: f * 0.97, start: t, dur: 0.3, gain: 0.07, type: 'triangle' }))
    tone(c, { from: 330, to: 300, start: 1.25, dur: 0.8, gain: 0.07, type: 'triangle', vib: [6, 8] })
  },
}

export function playSceneSound(kind: SceneKind): void {
  const c = audio()
  if (c) SOUNDS[kind](c)
}

/** Unlock Web Audio on iOS; call inside a tap handler (e.g. Start). */
export function primeAudio(): void {
  audio()
}

/** Short feedback for each pair in a matching question. */
export function playPairSound(correct: boolean): void {
  const c = audio()
  if (!c) return
  if (correct) {
    tone(c, { from: E5, start: 0, dur: 0.15, gain: 0.1, type: 'triangle' })
    tone(c, { from: C6, start: 0.1, dur: 0.25, gain: 0.1, type: 'triangle' })
  } else {
    tone(c, { from: 220, to: 160, start: 0, dur: 0.25, gain: 0.1, type: 'triangle', vib: [20, 15] })
  }
}
