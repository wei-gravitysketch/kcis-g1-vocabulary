import { useEffect, useRef, type CSSProperties, type JSX } from 'react'
import type { CelebrationKind } from '../lib/celebrations'

const DURATION_MS = 2600
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#0ea5e9', '#a855f7', '#facc15']

// CSS custom properties consumed by the keyframes in index.css.
const vars = (v: Record<string, string | number>) => v as CSSProperties

function Fireworks() {
  const bursts = [
    { x: 25, y: 28, delay: 0 },
    { x: 75, y: 20, delay: 0.45 },
    { x: 50, y: 45, delay: 0.9 },
    { x: 20, y: 62, delay: 1.2 },
    { x: 80, y: 58, delay: 1.35 },
  ]
  return (
    <>
      {bursts.map((b, bi) => (
        <div key={bi} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {Array.from({ length: 20 }, (_, i) => {
            const angle = (i / 20) * Math.PI * 2
            const r = 130 + (i % 2) * 50
            const color = COLORS[(i + bi) % COLORS.length]
            return (
              <span
                key={i}
                className="cel-spark absolute -mt-2 -ml-2 size-4 rounded-full"
                style={vars({
                  background: color,
                  boxShadow: `0 0 10px 3px ${color}`,
                  '--dx': `${Math.cos(angle) * r}px`,
                  '--dy': `${Math.sin(angle) * r}px`,
                  animationDelay: `${b.delay}s`,
                })}
              />
            )
          })}
        </div>
      ))}
    </>
  )
}

function Rocket() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className="cel-smoke absolute bottom-0 size-20 rounded-full bg-slate-200"
          style={vars({ left: `calc(50% - 40px + ${(i - 2.5) * 28}px)`, animationDelay: `${0.05 * i}s` })}
        />
      ))}
      <span className="cel-rocket absolute bottom-0 left-1/2 text-8xl">🚀</span>
    </>
  )
}

function Whale() {
  return (
    <>
      <span className="cel-whale absolute bottom-16 left-1/2 text-9xl">🐋</span>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className="cel-drop absolute bottom-24 text-4xl"
          style={vars({
            left: `calc(25% + ${i * 14}px)`,
            '--dx': `${(i - 2.5) * 30}px`,
            animationDelay: '1.5s',
          })}
        >
          💧
        </span>
      ))}
      <div className="cel-wave absolute inset-x-0 bottom-0 h-28 rounded-t-[50%] bg-sky-400/80" />
    </>
  )
}

function Balloons() {
  const balloons = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈']
  return (
    <>
      {balloons.map((b, i) => (
        <span
          key={i}
          className="cel-balloon absolute -bottom-28 text-8xl"
          style={vars({
            left: `${8 + i * 13}%`,
            animationDelay: `${(i % 3) * 0.2 + (i % 2) * 0.1}s`,
            filter: `hue-rotate(${i * 50}deg)`,
          })}
        >
          {b}
        </span>
      ))}
    </>
  )
}

function Rainbow() {
  const stars = [
    { x: 15, y: 25 },
    { x: 80, y: 20 },
    { x: 25, y: 60 },
    { x: 75, y: 58 },
    { x: 50, y: 15 },
    { x: 10, y: 45 },
    { x: 88, y: 42 },
  ]
  return (
    <>
      <span className="cel-rainbow absolute top-1/2 left-1/2 text-[10rem]">🌈</span>
      {stars.map((s, i) => (
        <span
          key={i}
          className="cel-star absolute text-6xl"
          style={vars({ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${0.15 * i}s` })}
        >
          {i % 2 ? '✨' : '⭐'}
        </span>
      ))}
    </>
  )
}

const SCENES: Record<CelebrationKind, () => JSX.Element> = {
  fireworks: Fireworks,
  rocket: Rocket,
  whale: Whale,
  balloons: Balloons,
  rainbow: Rainbow,
}

/** A short, non-blocking full-screen animation; taps pass through to the page. */
export default function Celebration({ kind, onDone }: { kind: CelebrationKind; onDone: () => void }) {
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const id = setTimeout(() => done.current(), DURATION_MS)
    return () => clearTimeout(id)
  }, [])

  const Scene = SCENES[kind]
  return (
    <div aria-hidden className="cel-root pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <Scene />
    </div>
  )
}
