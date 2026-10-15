// Geometry of Blankie Bear's striped blanket (SVG viewBox 0 0 240 240).
// The blanket is a fan of stripes from the neck down to a wavy hem. Every frame it is
// recomputed from a wave phase, a sideways sway (trails behind horizontal motion) and a
// stretch (hangs longer when flying up), which is what makes the cloth ripple.

export const STRIPES = 7

const NECK_Y = 112
const NECK_LEFT = 74
const NECK_RIGHT = 168
const HEM_Y = 212
const HEM_LEFT = 10
const HEM_RIGHT = 230

export interface BlanketShape {
  /** One closed path per stripe, left to right (even = blue, odd = white). */
  stripes: string[]
  /** The stripe edge lines, left to right (STRIPES + 1 of them). */
  lines: string[]
  /** The hem along the bottom. */
  hem: string
}

const f = (n: number) => n.toFixed(1)

/**
 * @param phase  wave phase (radians), advanced every frame
 * @param amp    wave amplitude in viewBox units (bigger when moving fast)
 * @param sway   horizontal offset of the hem (opposite to the direction of motion)
 * @param stretch extra hem drop (positive when flying up)
 */
export function blanket(phase: number, amp: number, sway: number, stretch: number): BlanketShape {
  const top: [number, number][] = []
  const bottom: [number, number][] = []
  const c1: [number, number][] = []
  const c2: [number, number][] = []

  for (let i = 0; i <= STRIPES; i++) {
    const u = i / STRIPES
    const arch = Math.sin(Math.PI * u)
    const w = Math.sin(phase + i * 0.85)
    const tx = NECK_LEFT + (NECK_RIGHT - NECK_LEFT) * u
    const ty = NECK_Y + 4 * arch
    const bx = HEM_LEFT + (HEM_RIGHT - HEM_LEFT) * u + sway + 0.4 * amp * Math.cos(phase + i * 0.85)
    const by = HEM_Y + 8 * arch + amp * w + stretch
    const ripple = 0.6 * amp * Math.sin(phase * 0.8 + i * 1.3)
    top.push([tx, ty])
    bottom.push([bx, by])
    c1.push([tx + (bx - tx) * 0.15 + sway * 0.15, ty + (by - ty) * 0.4])
    c2.push([tx + (bx - tx) * 0.7 + sway * 0.6 + ripple, ty + (by - ty) * 0.75])
  }

  // Small scallop between neighbouring hem points.
  const hemCtrl = (i: number): [number, number] => [
    (bottom[i][0] + bottom[i + 1][0]) / 2,
    (bottom[i][1] + bottom[i + 1][1]) / 2 + 3 + 0.5 * amp * Math.sin(phase * 1.3 + i),
  ]

  const down = (i: number) =>
    `C${f(c1[i][0])},${f(c1[i][1])} ${f(c2[i][0])},${f(c2[i][1])} ${f(bottom[i][0])},${f(bottom[i][1])}`
  const up = (i: number) =>
    `C${f(c2[i][0])},${f(c2[i][1])} ${f(c1[i][0])},${f(c1[i][1])} ${f(top[i][0])},${f(top[i][1])}`
  const hemTo = (i: number) => {
    const [qx, qy] = hemCtrl(i)
    return `Q${f(qx)},${f(qy)} ${f(bottom[i + 1][0])},${f(bottom[i + 1][1])}`
  }

  const stripes: string[] = []
  for (let i = 0; i < STRIPES; i++) {
    stripes.push(`M${f(top[i][0])},${f(top[i][1])} ${down(i)} ${hemTo(i)} ${up(i + 1)}Z`)
  }
  const lines = top.map(([x, y], i) => `M${f(x)},${f(y)} ${down(i)}`)
  let hem = `M${f(bottom[0][0])},${f(bottom[0][1])}`
  for (let i = 0; i < STRIPES; i++) hem += ` ${hemTo(i)}`

  return { stripes, lines, hem }
}
