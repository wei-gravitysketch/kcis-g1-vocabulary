import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { pickCelebration, pickOops, pickPraise, playSceneSound, type SceneKind } from '../lib/celebrations'
import type { AnswerResult } from '../lib/session'
import Celebration from './Celebration'
import type { OnAnswer, Outcome } from './quiz/types'
import Shell from './Shell'

const AUTO_NEXT_KEY = 'quiz-auto-next'
/** Seconds before moving on by itself after a correct answer. */
const AUTO_NEXT_SECONDS = 3

function loadAutoNext(): boolean {
  try {
    return localStorage.getItem(AUTO_NEXT_KEY) !== 'off'
  } catch {
    return true
  }
}

/**
 * Runs a list of questions (of any test): progress, answer scenes, feedback and Next.
 * `renderQuestion` draws one question and reports its Outcome through `onAnswer`.
 */
export default function Quiz<Q>({
  questions,
  renderQuestion,
  onHome,
  onFinish,
}: {
  questions: readonly Q[]
  renderQuestion: (q: Q, onAnswer: OnAnswer) => ReactNode
  onHome: () => void
  onFinish: (results: AnswerResult[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [outcome, setOutcome] = useState<(Outcome & { praise: string }) | null>(null)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scene, setScene] = useState<{ kind: SceneKind; id: number } | null>(null)

  const [autoNext, setAutoNext] = useState(loadAutoNext)
  /** Seconds left before auto-advancing, or null when not counting down. */
  const [left, setLeft] = useState<number | null>(null)

  const q = questions[index]
  const isLast = index === questions.length - 1

  const onAnswer = (o: Outcome) => {
    setOutcome({ ...o, praise: o.correct ? pickPraise() : '' })
    setResults((r) => [...r, ...o.results])
    const kind = o.correct ? pickCelebration() : pickOops()
    setScene({ kind, id: Date.now() })
    playSceneSound(kind)
  }

  const next = () => {
    if (isLast) {
      onFinish(results)
      return
    }
    setIndex(index + 1)
    setOutcome(null)
  }

  // After a correct answer, count down and move on by itself (wrong answers wait for Next,
  // so the child can read the correct answer).
  useEffect(() => {
    if (!outcome?.correct || !autoNext) {
      setLeft(null)
      return
    }
    setLeft(AUTO_NEXT_SECONDS)
    const id = setInterval(() => setLeft((l) => (l === null ? null : l - 1)), 1000)
    return () => clearInterval(id)
  }, [outcome, autoNext])

  useEffect(() => {
    if (left === 0) next()
  }, [left])

  const toggleAutoNext = () => {
    const on = !autoNext
    setAutoNext(on)
    try {
      localStorage.setItem(AUTO_NEXT_KEY, on ? 'on' : 'off')
    } catch {
      // ignore
    }
  }

  return (
    <Shell onHome={onHome} progress={index / questions.length} label={`${index + 1}/${questions.length}`}>
      <Fragment key={index}>{renderQuestion(q, onAnswer)}</Fragment>

      <div className="flex min-h-16 items-center justify-between gap-4">
        <p className={`text-xl font-bold ${outcome?.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
          {outcome && (outcome.correct ? `🎉 ${outcome.praise}` : outcome.message)}
        </p>
        {outcome && (
          <button
            type="button"
            onClick={next}
            className="relative flex min-h-16 w-44 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-sky-600 px-4 text-xl font-bold text-white transition active:bg-sky-700"
          >
            {left !== null && (
              <span key={index} aria-hidden className="anim-countdown absolute inset-0 origin-left bg-sky-500" />
            )}
            <span className="relative">{isLast ? 'Results' : 'Next →'}</span>
            {left !== null && (
              <span className="relative grid size-7 place-items-center rounded-full bg-white/25 text-base tabular-nums">
                {left}
              </span>
            )}
          </button>
        )}
      </div>

      {outcome && (
        <div className="-mt-3 flex justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={autoNext}
            onClick={toggleAutoNext}
            className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-500"
          >
            Auto next
            <span className={`relative h-6 w-10 rounded-full transition ${autoNext ? 'bg-sky-500' : 'bg-slate-300'}`}>
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${autoNext ? 'left-[1.125rem]' : 'left-0.5'}`}
              />
            </span>
          </button>
        </div>
      )}

      {scene && <Celebration key={scene.id} kind={scene.kind} onDone={() => setScene(null)} />}
    </Shell>
  )
}
