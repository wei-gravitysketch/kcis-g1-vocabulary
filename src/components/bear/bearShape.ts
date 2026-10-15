// Blankie Bear's shapes, traced from the owner's original drawing (924x700 image; the
// coordinates below are in that image's pixel space, viewBox "20 70 860 610").
// Every blanket path is deformed per frame by `deform` to make the cloth ripple; at rest
// (no deformation) it is exactly the original drawing.

export const VIEWBOX = { x: 20, y: 70, w: 860, h: 610 }

/** Neck point the blanket hangs from and the head tilts around. */
export const NECK: [number, number] = [420, 330]

type Cmd = { op: 'M' | 'L' | 'C' | 'Q' | 'Z'; pts: number[] }

/** Parse an absolute-coordinate path (M, L, C, Q, Z only). */
function parse(d: string): Cmd[] {
  const cmds: Cmd[] = []
  for (const m of d.matchAll(/([MLCQZ])([^MLCQZ]*)/g)) {
    const pts = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : []
    cmds.push({ op: m[1] as Cmd['op'], pts })
  }
  return cmds
}

export type Deform = (x: number, y: number) => [number, number]

/** Serialize a parsed path, moving every point through `deform`. */
export function toPath(cmds: Cmd[], deform: Deform): string {
  let out = ''
  for (const { op, pts } of cmds) {
    out += op
    for (let i = 0; i < pts.length; i += 2) {
      const [x, y] = deform(pts[i], pts[i + 1])
      out += `${i ? ' ' : ''}${x.toFixed(1)},${y.toFixed(1)}`
    }
  }
  return out
}

// ---------- Blanket ----------

const EDGE_D =
  'M257,319 C218,382 116,456 58,535 Q44,541 62,560 C116,583 221,612 318,626 C380,636 418,646 448,662 ' +
  'C520,612 630,560 729,528 C793,511 844,488 839,470 C812,403 721,364 642,333 C609,313 590,300 572,290'

/** Visible outer edge of the blanket (starts and ends under the head). */
export const EDGE = parse(EDGE_D)
/** Closed blanket outline (for the white fill and for clipping the blue bands). */
export const OUTLINE = parse(`${EDGE_D} L420,330 Z`)

/** Blue bands, drawn larger than needed and clipped by OUTLINE (left to right). */
export const BANDS = [
  'M150,433 C134,470 124,520 130,566 L138,615 L200,630 L190,570 C176,500 192,420 214,376 L170,360 Z',
  'M237,300 L237,349 C238,430 245,540 276,603 L292,650 L450,700 L448,661 L452,598 C380,520 320,420 296,342 L296,300 Z',
  'M372,330 L383,372 C440,450 520,540 625,577 L650,600 L760,540 L726,517 C618,496 543,426 484,360 L476,330 Z',
  'M560,295 L568,318 C617,372 708,422 830,458 L880,480 L880,380 L620,250 Z',
].map(parse)

/** The black stripe lines, as drawn (they stop short of the edges, like the original). */
export const STRIPE_LINES = [
  'M150,433 C134,470 124,520 130,566',
  'M214,376 C192,420 176,500 190,570',
  'M237,349 C238,430 245,540 276,603',
  'M296,342 C320,420 380,520 452,598',
  'M383,372 C440,450 520,540 625,577',
  'M484,360 C543,426 618,496 726,517',
  'M568,318 C617,372 708,422 830,458',
].map(parse)

// ---------- Head (static; only rotated as a whole) ----------

export const HEAD = {
  leftEarFill: 'M266,226 C255,222 248,219 244,214 C230,195 230,160 252,142 C275,124 320,124 346,140 L300,190 Z',
  leftEarLine: 'M266,226 C255,222 248,219 244,214 C230,195 230,160 252,142 C275,124 320,124 346,140',
  rightEarFill: 'M469,122 C478,102 503,89 534,89 C562,89 586,103 592,125 C597,146 589,163 576,174 L520,135 Z',
  rightEarLine: 'M469,122 C478,102 503,89 534,89 C562,89 586,103 592,125 C597,146 589,163 576,174',
  /** White face, including the part hidden under the right ear. */
  fill:
    'M575,172 C592,186 603,212 602,245 C596,270 583,290 561,307 C529,329 480,346 430,349 ' +
    'C400,350 360,348 305,344 C282,341 265,333 256,318 C246,290 252,252 265,228 C272,210 285,193 300,175 ' +
    'C331,143 371,123 400,120 C425,118 450,120 470,122 C510,129 550,146 575,172 Z',
  /** Head outline; like the drawing, it is not drawn across the right ear. */
  line:
    'M575,172 C592,186 603,212 602,245 C596,270 583,290 561,307 C529,329 480,346 430,349 ' +
    'C400,350 360,348 305,344 C282,341 265,333 256,318 C246,290 252,252 265,228 C272,210 285,193 300,175 ' +
    'C331,143 371,123 400,120 C425,118 450,120 470,122',
  nose: 'M403,226 C410,221 418,218 426,218 C426,226 421,233 417,238 C412,234 406,230 403,226 Z',
  noseLine: 'M417,238 C416,245 415,251 414,257',
  mouthLeft: 'M414,257 C400,262 386,278 379,297',
  mouthRight: 'M414,257 C428,257 443,260 456,266',
}
