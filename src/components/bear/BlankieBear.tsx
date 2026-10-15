import { useEffect, useRef, type PointerEvent } from 'react'
import { bearAppear, bearSqueak, bearWheee, bearWhoosh } from './bearSounds'
import { blanket, STRIPES } from './blanket'

// 被被熊 Blankie Bear: a bear head on a blue-and-white striped blanket.
// Shown on the result screen after a perfect quiz. It flies around until the screen is
// left, its blanket ripples as it flies, and it can be dragged (squeaking all the while).
// Loaded lazily (React.lazy) so it never slows down the first page load.

const BLUE = '#95b2f2'
const BLUE_LINE = '#7d9de9'
const INK = '#22262f'
const SPEED = 150 // px per second when cruising
const MAX_FLING = 900

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export default function BlankieBear() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stripeRefs = useRef<(SVGPathElement | null)[]>([])
  const lineRefs = useRef<(SVGPathElement | null)[]>([])
  const hemRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const blushRef = useRef<SVGGElement>(null)

  // Mutable simulation state, read and written by the animation loop and pointer handlers.
  const sim = useRef({
    size: 180,
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

  const initial = blanket(0, 4, 0, 0)

  useEffect(() => {
    const s = sim.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    s.size = clamp(window.innerWidth * 0.24, 140, 210)
    // Enter from below the screen, heading for the middle.
    s.x = window.innerWidth / 2
    s.y = reduced ? window.innerHeight * 0.6 : window.innerHeight + s.size
    const newTarget = () => {
      const m = s.size * 0.6
      s.tx = m + Math.random() * Math.max(1, window.innerWidth - 2 * m)
      s.ty = m + Math.random() * Math.max(1, window.innerHeight - 2 * m)
    }
    s.tx = window.innerWidth / 2
    s.ty = window.innerHeight / 2
    s.vy = reduced ? 0 : -700 // shoot up into view, then ease into cruising speed
    if (reduced) {
      s.tx = s.x
      s.ty = s.y
    }

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
      const w = window.innerWidth
      const h = window.innerHeight

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
          // Stay on screen (after a fling or a resize).
          const m = s.size * 0.4
          if (s.x < m || s.x > w - m || s.y < m || s.y > h - m) {
            if (s.y < h + s.size * 0.5) {
              s.x = clamp(s.x, m, w - m)
              s.y = clamp(s.y, m, h - m + s.size)
            }
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
      const amp = 4 + Math.min(8, speed / 60)
      const sway = clamp(-mvx * 0.05, -28, 28)
      const stretch = clamp(-mvy * 0.03, -8, 14)
      const shape = blanket(phase, amp, sway, stretch)
      shape.stripes.forEach((d, i) => stripeRefs.current[i]?.setAttribute('d', d))
      shape.lines.forEach((d, i) => lineRefs.current[i]?.setAttribute('d', d))
      hemRef.current?.setAttribute('d', shape.hem)
      headRef.current?.setAttribute('transform', `rotate(${(Math.sin(phase * 0.5) * 4 - sway * 0.15).toFixed(2)} 121 118)`)

      const bob = s.dragging || reduced ? 0 : Math.sin(time * 2.2) * 6
      const tilt = clamp(mvx / 25, -14, 14)
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2 + bob).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      s.size = clamp(window.innerWidth * 0.24, 140, 210)
      if (wrapRef.current) wrapRef.current.style.width = `${s.size}px`
      newTarget()
    }
    window.addEventListener('resize', onResize)
    if (wrapRef.current) wrapRef.current.style.width = `${s.size}px`

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
    const m = s.size * 0.6
    s.tx = m + Math.random() * Math.max(1, window.innerWidth - 2 * m)
    s.ty = m + Math.random() * Math.max(1, window.innerHeight - 2 * m)
    blushRef.current?.setAttribute('opacity', '0')
  }

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
      style={{ width: 180, transform: 'translate3d(-400px, -400px, 0)', willChange: 'transform' }}
    >
      <svg viewBox="0 0 240 240" className="block h-auto w-full overflow-visible drop-shadow-md">
        <defs>
          {/* Colored-pencil look: light blue with darker diagonal hatching. */}
          <pattern id="bb-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
            <rect width="5" height="5" fill={BLUE} />
            <line x1="0" y1="0" x2="0" y2="5" stroke={BLUE_LINE} strokeWidth="1.3" />
          </pattern>
        </defs>

        {/* Blanket */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {initial.stripes.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                stripeRefs.current[i] = el
              }}
              d={d}
              fill={i % 2 === 0 ? 'url(#bb-hatch)' : '#fdfdff'}
            />
          ))}
          {initial.lines.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el
              }}
              d={d}
              fill="none"
              stroke={INK}
              strokeWidth={i === 0 || i === STRIPES ? 4 : 3}
            />
          ))}
          <path ref={hemRef} d={initial.hem} fill="none" stroke={INK} strokeWidth="4" />
        </g>

        {/* Head */}
        <g ref={headRef} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="76" cy="42" r="19" fill="url(#bb-hatch)" strokeWidth="3.5" />
          <circle cx="166" cy="42" r="19" fill="url(#bb-hatch)" strokeWidth="3.5" />
          <path
            d="M68,78 C68,46 92,30 121,30 C152,30 174,47 174,77 C174,106 152,124 121,124 C90,124 68,108 68,78 Z"
            fill="#ffffff"
            strokeWidth="3.5"
          />
          <g ref={blushRef} opacity="0" stroke="none" fill="#f9a8c0" style={{ transition: 'opacity 0.2s' }}>
            <ellipse cx="93" cy="92" rx="9" ry="5" />
            <ellipse cx="150" cy="90" rx="9" ry="5" />
          </g>
          <ellipse cx="103" cy="70" rx="4.2" ry="3.6" fill={INK} stroke="none" />
          <ellipse cx="140" cy="68" rx="5.4" ry="2.8" fill={INK} stroke="none" transform="rotate(-6 140 68)" />
          <path d="M115,84 L128,82 L122,91 Z" fill="#ffffff" strokeWidth="2.6" />
          <path d="M122,91 L121,99" fill="none" strokeWidth="2.6" />
          <path d="M106,110 C109,101 115,98 121,99 C127,99 132,101 136,106" fill="none" strokeWidth="3" />
        </g>
      </svg>
    </div>
  )
}
