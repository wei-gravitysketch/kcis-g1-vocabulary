import { lazy, Suspense, type ReactNode } from 'react'
import Shell, { BigButton } from './Shell'

// Loaded only when needed (a perfect score), in its own small chunk.
const BlankieBear = lazy(() => import('./bear/BlankieBear'))

/** Final screen of a quiz: score and accuracy, what to practice (children), Retry missed / Home. */
export default function Result({
  correct,
  total,
  onHome,
  onRetryMissed,
  children,
}: {
  correct: number
  total: number
  onHome: () => void
  /** Shown as "Retry missed" when something was missed. */
  onRetryMissed?: () => void
  /** What to practice, e.g. a <PracticeCard>. */
  children?: ReactNode
}) {
  const percent = total ? Math.round((correct / total) * 100) : 0
  const emoji = percent === 100 ? '🏆' : percent >= 70 ? '🌟' : '💪'

  return (
    <Shell
      onHome={onHome}
      progress={1}
      label={`${total}/${total}`}
      footer={
        <div className="flex gap-3 pt-2">
          <BigButton tone="light" onClick={onHome}>
            Home
          </BigButton>
          {onRetryMissed && <BigButton onClick={onRetryMissed}>Retry missed</BigButton>}
        </div>
      }
    >
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-6xl">{emoji}</div>
        <p className="mt-3 text-6xl font-extrabold text-sky-700">{percent}%</p>
        <p className="mt-2 text-xl text-slate-600">
          {correct} of {total} correct
        </p>
      </div>

      {children}

      {percent === 100 && (
        <Suspense fallback={null}>
          <BlankieBear />
        </Suspense>
      )}
    </Shell>
  )
}

export function PracticeCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-3 text-lg font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  )
}
