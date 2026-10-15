import { useEffect, useRef, type PointerEvent } from 'react'
import { bearAppear, bearSqueak, bearWheee, bearWhoosh } from './bearSounds'
import { BANDS, EDGE, HEAD, NECK, OUTLINE, STRIPE_LINES, VIEWBOX, toPath, type Deform } from './bearShape'

// 被被熊 Blankie Bear: the owner's drawing of a bear head on a blue-and-white striped blanket,
// traced as clean SVG (bearShape.ts). Shown on the result screen after a perfect quiz. It
// flies around until the screen is left, its blanket ripples as it flies, and it can be
// dragged (squeaking all the while). Loaded lazily (React.lazy) so it never slows down the
// first page load. The animation writes SVG attributes directly: no React re-render per frame.

const INK = '#1f2433'
const WHITE = '#fffefb'
const SPEED = 150 // px per second when cruising
const MAX_FLING = 900
const ASPECT = VIEWBOX.h / VIEWBOX.w

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const widthFor = (screenW: number) => clamp(screenW * 0.32, 190, 300)

/**
 * Cloth ripple: points move more the farther they are from the neck (the blanket hangs from
 * there), trail behind horizontal motion (`sway`), hang lower when flying up (`stretch`),
 * and follow a travelling wave (`phase`, `amp`). All in viewBox units.
 */
function makeDeform(phase: number, amp: number, sway: number, stretch: number): Deform {
  return (x, y) => {
    if (y < 300) return [x, y]
    const k = Math.min(1, Math.hypot(x - NECK[0], (y - NECK[1]) * 1.2) / 450) ** 1.5
    return [
      x + k * (sway + amp * Math.sin(phase + x * 0.012 + y * 0.008)),
      y + k * (stretch + amp * 0.7 * Math.cos(phase * 1.1 + x * 0.01 - y * 0.006)),
    ]
  }
}

const REST = makeDeform(0, 0, 0, 0)

export default function BlankieBear() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<SVGPathElement>(null)
  const baseRef = useRef<SVGPathElement>(null)
  const bandRefs = useRef<(SVGPathElement | null)[]>([])
  const lineRefs = useRef<(SVGPathElement | null)[]>([])
  const edgeRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const blushRef = useRef<SVGGElement>(null)

  // Mutable simulation state, read and written by the animation loop and pointer handlers.
  const sim = useRef({
    w: 240,
    h: 240 * ASPECT,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tx: 0,
    ty: 0,
    dragging: false,
    grabDX: 0,
    grabDY: 0,
    dragVX: 0,
    dragVY: 0,
    lastMoveT: 0,
    nextSqueak: 0,
  })

  useEffect(() => {
    const s = sim.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const resize = () => {
      s.w = widthFor(window.innerWidth)
      s.h = s.w * ASPECT
      if (wrapRef.current) wrapRef.current.style.width = `${s.w}px`
    }
    resize()
    const newTarget = () => {
      const mx = s.w * 0.55
      const my = s.h * 0.6
      s.tx = mx + Math.random() * Math.max(1, window.innerWidth - 2 * mx)
      s.ty = my + Math.random() * Math.max(1, window.innerHeight - 2 * my)
    }
    // Enter from below the screen, shooting up toward the middle, then cruise.
    s.x = window.innerWidth / 2
    s.y = reduced ? window.innerHeight * 0.6 : window.innerHeight + s.h
    s.tx = reduced ? s.x : window.innerWidth / 2
    s.ty = reduced ? s.y : window.innerHeight / 2
    s.vy = reduced ? 0 : -700

    const appearTimer = setTimeout(bearAppear, 250)
    let phase = 0
    let time = 0
    let nextWhoosh = 1
    let nextWheee = 3 + Math.random() * 3
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt

      let mvx: number
      let mvy: number
      if (s.dragging) {
        // Drag velocity fades when the finger stops moving.
        s.dragVX *= 0.9
        s.dragVY *= 0.9
        mvx = s.dragVX
        mvy = s.dragVY
        if (time >= s.nextSqueak) {
          bearSqueak()
          s.nextSqueak = time + 0.16 + Math.random() * 0.1
        }
      } else {
        if (!reduced) {
          const dx = s.tx - s.x
          const dy = s.ty - s.y
          const dist = Math.hypot(dx, dy)
          if (dist < 60) newTarget()
          const k = Math.min(1, dt * 1.6)
          s.vx += ((dx / (dist || 1)) * SPEED - s.vx) * k
          s.vy += ((dy / (dist || 1)) * SPEED - s.vy) * k
          s.x += s.vx * dt
          s.y += s.vy * dt
          // Stay on screen after a fling (but let the entrance come in from below).
          const mx = s.w * 0.35
          const my = s.h * 0.35
          if (s.y < window.innerHeight + s.h * 0.5) {
            s.x = clamp(s.x, mx, window.innerWidth - mx)
            s.y = clamp(s.y, my, window.innerHeight - my + s.h)
          }
        }
        mvx = s.vx
        mvy = s.vy
        const speed = Math.hypot(mvx, mvy)
        if (!reduced && time >= nextWhoosh) {
          bearWhoosh(Math.min(1, speed / 300))
          nextWhoosh = time + 1.1 + Math.random() * 0.5
        }
        if (!reduced && time >= nextWheee) {
          bearWheee()
          nextWheee = time + 5 + Math.random() * 4
        }
      }

      const speed = Math.hypot(mvx, mvy)
      phase += dt * (reduced ? 1.5 : 3 + speed / 80)
      const deform = makeDeform(
        phase,
        8 + Math.min(22, speed / 25),
        clamp(-mvx * 0.12, -70, 70),
        clamp(-mvy * 0.08, -25, 40),
      )
      const outline = toPath(OUTLINE, deform)
      clipRef.current?.setAttribute('d', outline)
      baseRef.current?.setAttribute('d', outline)
      BANDS.forEach((b, i) => bandRefs.current[i]?.setAttribute('d', toPath(b, deform)))
      STRIPE_LINES.forEach((l, i) => lineRefs.current[i]?.setAttribute('d', toPath(l, deform)))
      edgeRef.current?.setAttribute('d', toPath(EDGE, deform))
      const headTilt = Math.sin(phase * 0.5) * 3 - clamp(mvx * 0.01, -6, 6)
      headRef.current?.setAttribute('transform', `rotate(${headTilt.toFixed(2)} ${NECK[0]} ${NECK[1]})`)

      const bob = s.dragging || reduced ? 0 : Math.sin(time * 2.2) * 6
      const tilt = clamp(mvx / 25, -12, 12)
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${(s.x - s.w / 2).toFixed(1)}px, ${(s.y - s.h / 2 + bob).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      resize()
      newTarget()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(appearTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore: capture is a nicety (keeps the drag going if the finger leaves the bear)
    }
    s.dragging = true
    s.grabDX = e.clientX - s.x
    s.grabDY = e.clientY - s.y
    s.dragVX = 0
    s.dragVY = 0
    s.lastMoveT = performance.now()
    s.nextSqueak = 0
    blushRef.current?.setAttribute('opacity', '1')
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = sim.current
    if (!s.dragging) return
    const now = performance.now()
    const dt = Math.max(0.008, (now - s.lastMoveT) / 1000)
    s.lastMoveT = now
    const nx = e.clientX - s.grabDX
    const ny = e.clientY - s.grabDY
    s.dragVX = s.dragVX * 0.5 + ((nx - s.x) / dt) * 0.5
    s.dragVY = s.dragVY * 0.5 + ((ny - s.y) / dt) * 0.5
    s.x = nx
    s.y = ny
  }

  const onPointerUp = () => {
    const s = sim.current
    if (!s.dragging) return
    s.dragging = false
    // Fling: keep the throw's momentum, then fly on to a new spot.
    s.vx = clamp(s.dragVX, -MAX_FLING, MAX_FLING)
    s.vy = clamp(s.dragVY, -MAX_FLING, MAX_FLING)
    const mx = s.w * 0.55
    const my = s.h * 0.6
    s.tx = mx + Math.random() * Math.max(1, window.innerWidth - 2 * mx)
    s.ty = my + Math.random() * Math.max(1, window.innerHeight - 2 * my)
    blushRef.current?.setAttribute('opacity', '0')
  }

  const outline = toPath(OUTLINE, REST)
  const { x, y, w, h } = VIEWBOX

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Blankie Bear"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed top-0 left-0 z-40 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ width: 240, transform: 'translate3d(-600px, -600px, 0)', willChange: 'transform' }}
    >
      <svg viewBox={`${x} ${y} ${w} ${h}`} className="block h-auto w-full overflow-visible drop-shadow-md">
        <defs>
          {/* Colored-pencil blue like the drawing: soft base, uneven strokes leaning right. */}
          <pattern id="bb-pencil" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <rect width="30" height="30" fill="#aac1f6" />
            <g strokeLinecap="round">
              <path d="M3,-2 V32" stroke="#95b0f1" strokeWidth="2.4" opacity="0.8" />
              <path d="M9,4 V26" stroke="#c3d3fa" strokeWidth="2" />
              <path d="M14,-2 V17 M14,22 V32" stroke="#8ea9ef" strokeWidth="2.2" opacity="0.75" />
              <path d="M20,-2 V32" stroke="#b6c9f8" strokeWidth="2.6" />
              <path d="M25,6 V30" stroke="#93aef0" strokeWidth="2" opacity="0.8" />
            </g>
          </pattern>
          <pattern id="bb-pencil-ear" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <rect width="30" height="30" fill="#97b2f2" />
            <g strokeLinecap="round">
              <path d="M3,-2 V32" stroke="#829fec" strokeWidth="2.4" opacity="0.85" />
              <path d="M9,4 V26" stroke="#b0c4f7" strokeWidth="2" />
              <path d="M14,-2 V17 M14,22 V32" stroke="#7c9ae9" strokeWidth="2.2" opacity="0.8" />
              <path d="M20,-2 V32" stroke="#a6bdf5" strokeWidth="2.6" />
              <path d="M25,6 V30" stroke="#859fec" strokeWidth="2" opacity="0.85" />
            </g>
          </pattern>
          <clipPath id="bb-clip">
            <path ref={clipRef} d={outline} />
          </clipPath>
        </defs>

        {/* Blanket */}
        <path ref={baseRef} d={outline} fill={WHITE} />
        <g clipPath="url(#bb-clip)">
          {BANDS.map((b, i) => (
            <path
              key={i}
              ref={(el) => {
                bandRefs.current[i] = el
              }}
              d={toPath(b, REST)}
              fill="url(#bb-pencil)"
            />
          ))}
        </g>
        <g fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          {STRIPE_LINES.map((l, i) => (
            <path
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el
              }}
              d={toPath(l, REST)}
              strokeWidth="8"
            />
          ))}
          <path ref={edgeRef} d={toPath(EDGE, REST)} strokeWidth="6" />
        </g>

        {/* Head */}
        <g ref={headRef} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          <path d={HEAD.leftEarFill} fill="url(#bb-pencil-ear)" stroke="none" />
          <path d={HEAD.rightEarFill} fill="url(#bb-pencil-ear)" stroke="none" />
          <path d={HEAD.leftEarLine} fill="none" strokeWidth="7" />
          <path d={HEAD.rightEarLine} fill="none" strokeWidth="7" />
          <path d={HEAD.fill} fill={WHITE} stroke="none" />
          <path d={HEAD.line} fill="none" strokeWidth="7" />
          <g ref={blushRef} opacity="0" stroke="none" fill="#f7a8c0" style={{ transition: 'opacity 0.2s' }}>
            <ellipse cx="328" cy="252" rx="24" ry="13" />
            <ellipse cx="530" cy="238" rx="24" ry="13" />
          </g>
          <ellipse cx="370" cy="203" rx="13" ry="6.5" transform="rotate(-24 370 203)" fill={INK} stroke="none" />
          <ellipse cx="465" cy="190" rx="14" ry="5.5" transform="rotate(5 465 190)" fill={INK} stroke="none" />
          <path d={HEAD.nose} fill={WHITE} strokeWidth="5" />
          <path d={HEAD.noseLine} fill="none" strokeWidth="5" />
          <path d={HEAD.mouthLeft} fill="none" strokeWidth="6.5" />
          <path d={HEAD.mouthRight} fill="none" strokeWidth="4" />
        </g>
      </svg>
    </div>
  )
}
