import { useState } from 'react'
import { pickCelebration, pickOops, pickPraise, playSceneSound, type SceneKind } from '../lib/celebrations'
import type { AnswerResult, Question } from '../lib/session'
import Celebration from './Celebration'
import ChoiceView from './quiz/ChoiceView'
import MatchView from './quiz/MatchView'
import SpellView from './quiz/SpellView'
import type { Outcome } from './quiz/types'
import Shell, { BigButton } from './Shell'

export default function Quiz({
  questions,
  onHome,
  onFinish,
}: {
  questions: Question[]
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
      {q.kind === 'choice' && <ChoiceView key={index} q={q} onAnswer={onAnswer} />}
      {q.kind === 'spell' && <SpellView key={index} q={q} onAnswer={onAnswer} />}
      {q.kind === 'match' && <MatchView key={index} q={q} onAnswer={onAnswer} />}

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
