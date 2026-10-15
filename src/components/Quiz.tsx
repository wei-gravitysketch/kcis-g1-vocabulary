import { useState } from 'react'
import { POS_LABELS, type PartOfSpeech } from '../data/partsOfSpeech'
import type { AnswerResult, Question } from '../lib/session'
import Shell, { BigButton } from './Shell'
import SpeakButton from './SpeakButton'
import Celebration from './Celebration'
import { pickCelebration, playCelebrationSound, type CelebrationKind } from '../lib/celebrations'

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
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [celebration, setCelebration] = useState<{ kind: CelebrationKind; id: number } | null>(null)

  const q = questions[index]
  const answered = picked !== null
  const isLast = index === questions.length - 1

  const choose = (option: string) => {
    if (answered) return
    setPicked(option)
    setResults((r) => [...r, { word: q.word, correct: option === q.answer }])
    if (option === q.answer) {
      const kind = pickCelebration(celebration?.kind)
      setCelebration({ kind, id: Date.now() })
      playCelebrationSound(kind)
    }
  }

  const next = () => {
    if (isLast) {
      onFinish(results)
      return
    }
    setIndex(index + 1)
    setPicked(null)
  }

  const optionClass = (option: string) => {
    if (!answered) return 'bg-white text-slate-800 ring-slate-200 active:bg-sky-50'
    if (option === q.answer) return 'bg-emerald-100 text-emerald-900 ring-emerald-500'
    if (option === picked) return 'bg-rose-100 text-rose-900 ring-rose-500'
    return 'bg-white text-slate-400 ring-slate-200'
  }

  const label = (option: string) => (q.kind === 'pos' ? POS_LABELS[option as PartOfSpeech] : option)
  const correct = picked === q.answer

  return (
    <Shell
      onHome={onHome}
      progress={index / questions.length}
      label={`${index + 1}/${questions.length}`}
    >
      <div className="flex items-center justify-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        {q.kind === 'blank' ? (
          <p className="text-2xl leading-snug font-bold text-slate-800 sm:text-3xl">
            {answered ? q.sentence : q.prompt}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-slate-500">What kind of word is this?</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-extrabold break-words text-sky-700">{q.word}</span>
              <SpeakButton text={q.word} label={`Listen to ${q.word}`} />
            </div>
          </div>
        )}
        {q.kind === 'blank' && answered && <SpeakButton text={q.sentence} label="Listen to the sentence" />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={answered}
            onClick={() => choose(option)}
            className={`min-h-20 rounded-2xl px-4 text-2xl font-bold ring-2 transition ${optionClass(option)}`}
          >
            {label(option)}
          </button>
        ))}
      </div>

      <div className="flex min-h-16 items-center justify-between gap-4">
        <p className={`text-xl font-bold ${correct ? 'text-emerald-600' : 'text-rose-600'}`}>
          {answered && (correct ? '🎉 Great job!' : `Answer: ${label(q.answer)}`)}
        </p>
        {answered && (
          <div className="flex w-44 shrink-0">
            <BigButton onClick={next}>{isLast ? 'Results' : 'Next →'}</BigButton>
          </div>
        )}
      </div>

      {celebration && (
        <Celebration key={celebration.id} kind={celebration.kind} onDone={() => setCelebration(null)} />
      )}
    </Shell>
  )
}
