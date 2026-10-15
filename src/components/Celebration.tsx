import { useEffect, useRef, type CSSProperties, type JSX, type ReactNode } from 'react'
import type { SceneKind } from '../lib/celebrations'

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
      <span className="cel-pop absolute top-1/2 left-1/2 text-[10rem]">🌈</span>
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

/**
 * Moves its child across the screen horizontally (`from` -> `to`, e.g. '110vw' -> '-30vw'),
 * while the child runs its own inner animation (hop, bob, ...).
 */
function Across({
  top,
  from,
  to,
  dur = '2.4s',
  delay = '0s',
  inner = 'cel-bob',
  flip = false,
  className = 'text-8xl',
  children,
}: {
  top: string
  from: string
  to: string
  dur?: string
  delay?: string
  inner?: string
  flip?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className="cel-across absolute left-0"
      style={vars({ top, '--from': from, '--to': to, '--dur': dur, animationDelay: delay })}
    >
      <span className={`block ${inner} ${className}`} style={{ animationDelay: delay }}>
        <span className="block" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
          {children}
        </span>
      </span>
    </span>
  )
}

function Ufo() {
  const planets = [
    { e: '🪐', x: 10, y: 10, size: 'text-7xl' },
    { e: '🌍', x: 82, y: 50, size: 'text-6xl' },
    { e: '🌕', x: 85, y: 8, size: 'text-5xl' },
    { e: '⭐', x: 30, y: 6, size: 'text-4xl' },
    { e: '✨', x: 12, y: 55, size: 'text-4xl' },
    { e: '⭐', x: 65, y: 30, size: 'text-3xl' },
  ]
  return (
    <>
      {planets.map((p, i) => (
        <span
          key={i}
          className={`cel-star absolute ${p.size}`}
          style={vars({ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 0.1}s`, '--dur': '2.4s' })}
        >
          {p.e}
        </span>
      ))}
      <div className="cel-beam absolute top-[calc(18%+70px)] left-1/2 h-[50vh] w-56" />
      <span className="cel-abduct absolute bottom-[14%] left-1/2 text-7xl">👽</span>
      <span className="cel-ufo absolute top-[18%] left-1/2 text-9xl">🛸</span>
    </>
  )
}

function Unicorn() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="cel-star absolute text-4xl"
          style={vars({ left: `${90 - i * 12}%`, top: `${48 + (i % 2) * 8}%`, animationDelay: `${0.2 + i * 0.22}s` })}
        >
          {i % 2 ? '✨' : '💖'}
        </span>
      ))}
      <Across top="38%" from="105vw" to="-35vw" inner="cel-gallop" className="text-9xl">
        🦄
      </Across>
    </>
  )
}

function Butterflies() {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className="cel-flutter absolute -bottom-20 text-7xl"
          style={vars({ left: `${6 + i * 14}%`, animationDelay: `${(i % 3) * 0.25}s`, '--dur': `${2 + (i % 2) * 0.4}s` })}
        >
          🦋
        </span>
      ))}
    </>
  )
}

function Fish() {
  const rows = [
    { e: '🐠', top: '25%', delay: '0s', dur: '2.2s' },
    { e: '🐟', top: '45%', delay: '0.3s', dur: '2s' },
    { e: '🐡', top: '62%', delay: '0.15s', dur: '2.3s' },
    { e: '🐠', top: '78%', delay: '0.5s', dur: '1.9s' },
  ]
  return (
    <>
      <div className="cel-fade absolute inset-0 bg-sky-300/25" />
      {rows.map((r, i) => (
        <Across key={i} top={r.top} from="105vw" to="-30vw" dur={r.dur} delay={r.delay} className="text-8xl">
          {r.e}
        </Across>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="cel-rise absolute bottom-0 text-4xl"
          style={vars({ left: `${5 + i * 10}%`, animationDelay: `${(i % 4) * 0.3}s`, '--rise': '-80vh' })}
        >
          🫧
        </span>
      ))}
    </>
  )
}

function Party() {
  const pieces = (side: 'left' | 'right') =>
    Array.from({ length: 22 }, (_, i) => {
      const dir = side === 'left' ? 1 : -1
      const dx = dir * (80 + ((i * 37) % 260))
      const dy = -(260 + ((i * 53) % 340))
      return (
        <span
          key={`${side}${i}`}
          className="cel-confetti absolute bottom-24 h-4 w-2.5 rounded-sm"
          style={vars({
            [side]: '12%',
            background: COLORS[i % COLORS.length],
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--rot': `${dir * (180 + i * 20)}deg`,
            animationDelay: `${side === 'left' ? 0 : 0.15}s`,
          })}
        />
      )
    })
  return (
    <>
      {pieces('left')}
      {pieces('right')}
      <span className="cel-pop-in absolute bottom-6 left-[6%] text-8xl">🎉</span>
      <span className="cel-pop-in absolute right-[6%] bottom-6 text-8xl" style={{ animationDelay: '0.15s' }}>
        <span className="block" style={{ transform: 'scaleX(-1)' }}>
          🎉
        </span>
      </span>
    </>
  )
}

function ShootingStars() {
  const stars = [
    { x: 70, y: -5, delay: 0 },
    { x: 95, y: 10, delay: 0.3 },
    { x: 55, y: -10, delay: 0.6 },
    { x: 85, y: 30, delay: 0.9 },
    { x: 100, y: -5, delay: 1.2 },
  ]
  return (
    <>
      <div className="cel-fade absolute inset-0 bg-indigo-950/30" />
      {stars.map((s, i) => (
        <span
          key={i}
          className="cel-shoot absolute text-8xl"
          style={vars({ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` })}
        >
          🌠
        </span>
      ))}
    </>
  )
}

function Trophy() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2
          return (
            <span
              key={i}
              className="cel-spark absolute -mt-6 -ml-6 text-5xl"
              style={vars({
                '--dx': `${Math.cos(angle) * 220}px`,
                '--dy': `${Math.sin(angle) * 220}px`,
                animationDelay: '0.6s',
              })}
            >
              {i % 2 ? '⭐' : '🌟'}
            </span>
          )
        })}
      </div>
      <span className="cel-pop absolute top-1/2 left-1/2 text-[10rem]">🏆</span>
    </>
  )
}

function Dinosaur() {
  return (
    <>
      {[0.1, 0.55, 1.0, 1.45].map((t, i) => (
        <span
          key={i}
          className="cel-puff absolute bottom-4 text-5xl"
          style={vars({ left: `${78 - i * 20}%`, animationDelay: `${t + 0.1}s` })}
        >
          💨
        </span>
      ))}
      <Across top="calc(100% - 13rem)" from="105vw" to="-35vw" inner="cel-stomp" className="text-[9rem]">
        🦖
      </Across>
    </>
  )
}

function Bunny() {
  return (
    <>
      <span className="cel-pop-in absolute bottom-6 left-[12%] text-6xl" style={{ animationDelay: '1.6s' }}>
        🥕
      </span>
      <Across top="calc(100% - 12rem)" from="105vw" to="-30vw" dur="2.4s" inner="cel-hop" className="text-9xl">
        🐇
      </Across>
    </>
  )
}

function Flowers() {
  const flowers = ['🌷', '🌻', '🌸', '🌼', '🌹', '🌺', '🌷']
  return (
    <>
      {flowers.map((f, i) => (
        <span
          key={i}
          className="cel-grow absolute bottom-2 text-8xl"
          style={vars({ left: `${2 + i * 14}%`, animationDelay: `${i * 0.12}s` })}
        >
          {f}
        </span>
      ))}
      <Across top="35%" from="105vw" to="-20vw" dur="2.4s" className="text-7xl">
        🐝
      </Across>
    </>
  )
}

// ---------- Oops (wrong answer): gentle and cute, never scary ----------

function Monkey() {
  return <span className="cel-peek absolute bottom-0 left-1/2 text-[9rem]">🙈</span>
}

function Puppy() {
  return (
    <>
      <span className="cel-rise absolute bottom-[38%] left-[58%] text-6xl" style={vars({ animationDelay: '0.4s', '--rise': '-12vh' })}>
        ❓
      </span>
      <span className="cel-peek absolute bottom-0 left-1/2 text-[9rem]">
        <span className="cel-tilt block">🐶</span>
      </span>
    </>
  )
}

function RainCloud() {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className="cel-fall absolute top-[24%] text-3xl"
          style={vars({ left: `calc(50% - 90px + ${i * 28}px)`, animationDelay: `${0.4 + (i % 3) * 0.25}s`, '--fall': '45vh' })}
        >
          💧
        </span>
      ))}
      <span className="cel-drift absolute top-[10%] left-1/2 text-[9rem]">🌧️</span>
    </>
  )
}

const SCENES: Record<SceneKind, () => JSX.Element> = {
  fireworks: Fireworks,
  rocket: Rocket,
  whale: Whale,
  balloons: Balloons,
  rainbow: Rainbow,
  ufo: Ufo,
  unicorn: Unicorn,
  butterflies: Butterflies,
  fish: Fish,
  party: Party,
  shootingStars: ShootingStars,
  trophy: Trophy,
  dinosaur: Dinosaur,
  bunny: Bunny,
  flowers: Flowers,
  monkey: Monkey,
  puppy: Puppy,
  rainCloud: RainCloud,
}

/** A short, non-blocking full-screen animation; taps pass through to the page. */
export default function Celebration({ kind, onDone }: { kind: SceneKind; onDone: () => void }) {
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
