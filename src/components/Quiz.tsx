import { Fragment, useState, type ReactNode } from 'react'
import { pickCelebration, pickOops, pickPraise, playSceneSound, type SceneKind } from '../lib/celebrations'
import type { AnswerResult } from '../lib/session'
import Celebration from './Celebration'
import type { OnAnswer, Outcome } from './quiz/types'
import Shell, { BigButton } from './Shell'

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

  return (
    <Shell onHome={onHome} progress={index / questions.length} label={`${index + 1}/${questions.length}`}>
      <Fragment key={index}>{renderQuestion(q, onAnswer)}</Fragment>

      <div className="flex min-h-16 items-center justify-between gap-4">
        <p className={`text-xl font-bold ${outcome?.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
          {outcome && (outcome.correct ? `🎉 ${outcome.praise}` : outcome.message)}
        </p>
        {outcome && (
          <div className="flex w-44 shrink-0">
            <BigButton onClick={next}>{isLast ? 'Results' : 'Next →'}</BigButton>
          </div>
        )}
      </div>

      {scene && <Celebration key={scene.id} kind={scene.kind} onDone={() => setScene(null)} />}
    </Shell>
  )
}
