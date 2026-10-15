// Blankie Bear's sounds (synthesized; see lib/audio.ts).
import { audio, noise, tone } from '../../lib/audio'

/** A happy little chime when the bear arrives. */
export function bearAppear(): void {
  const c = audio()
  if (!c) return
  ;[784, 988, 1175, 1568].forEach((f, i) => tone(c, { from: f, start: i * 0.09, dur: 0.35, gain: 0.07, type: 'triangle' }))
}

/** Soft flutter of the blanket in the wind; `intensity` 0..1 follows the flying speed. */
export function bearWhoosh(intensity: number): void {
  const c = audio()
  if (!c) return
  noise(c, { start: 0, dur: 0.6, gain: 0.02 + 0.05 * intensity, filter: 'bandpass', freqFrom: 350, freqTo: 1100, attack: 0.25 })
}

/** An occasional "wheee!" while flying. */
export function bearWheee(): void {
  const c = audio()
  if (!c) return
  tone(c, { from: 520, to: 1050, start: 0, dur: 0.4, gain: 0.05, vib: [9, 25] })
  tone(c, { from: 1050, to: 760, start: 0.38, dur: 0.25, gain: 0.04, vib: [9, 25] })
}

/** Cute noises made while being dragged: squeak, boop or giggle, at a random pitch. */
export function bearSqueak(): void {
  const c = audio()
  if (!c) return
  const p = 650 + Math.random() * 500
  const kind = Math.random()
  if (kind < 0.5) {
    tone(c, { from: p, to: p * 1.7, start: 0, dur: 0.07, gain: 0.07, type: 'triangle' })
    tone(c, { from: p * 1.7, to: p * 1.2, start: 0.07, dur: 0.09, gain: 0.06, type: 'triangle' })
  } else if (kind < 0.8) {
    tone(c, { from: p * 0.6, to: p * 0.38, start: 0, dur: 0.13, gain: 0.08 })
  } else {
    ;[0, 0.07, 0.14].forEach((t, i) => tone(c, { from: p * (i === 1 ? 1.15 : 1), start: t, dur: 0.05, gain: 0.05, vib: [30, 20] }))
  }
}
