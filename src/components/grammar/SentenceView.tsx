import { useState } from 'react'
import { answerWords, isCorrect, KIND_LABELS, type GrammarQuestion } from '../../lib/grammar'
import type { OnAnswer } from '../quiz/types'
import { BigButton } from '../Shell'
import SpeakButton from '../SpeakButton'

type ChipState = 'idle' | 'picked' | 'hit' | 'missed' | 'wrong' | 'rest'

export const CHIP: Record<ChipState, string> = {
  idle: 'border-slate-200 bg-white text-slate-800 active:bg-sky-50',
  picked: 'border-sky-600 bg-sky-600 text-white',
  hit: 'border-emerald-500 bg-emerald-500 text-white',
  missed: 'border-dashed border-emerald-500 bg-emerald-50 text-emerald-800',
  wrong: 'border-rose-400 bg-rose-100 text-rose-800 line-through decoration-2',
  rest: 'border-slate-200 bg-white text-slate-400',
}

/** Tap every word of the asked kind in the sentence, then Check. One or more words may be right. */
export default function SentenceView({ q, onAnswer }: { q: GrammarQuestion; onAnswer: OnAnswer }) {
  const [picked, setPicked] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const { tokens, end, text } = q.sentence

  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))

  const check = () => {
    setChecked(true)
    const correct = isCorrect(q, picked)
    onAnswer({ results: [{ word: text, correct }], correct, message: `Answer: ${answerWords(q).join(', ')}` })
  }

  const state = (i: number): ChipState => {
    const on = picked.includes(i)
    if (!checked) return on ? 'picked' : 'idle'
    if (q.answer.includes(i)) return on ? 'hit' : 'missed'
    return on ? 'wrong' : 'rest'
  }

  return (
    <>
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-2xl font-bold text-slate-800">
            Tap all the <span className="text-sky-700">{KIND_LABELS[q.kind].many}</span>.
          </p>
          <SpeakButton text={text} label="Listen to the sentence" />
        </div>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-3">
          {tokens.map((t, i) => (
            <span key={i} className="flex items-end">
              <button
                type="button"
                disabled={checked}
                aria-pressed={picked.includes(i)}
                onClick={() => toggle(i)}
                className={`min-h-14 rounded-2xl border-2 px-3 text-2xl font-bold transition sm:text-3xl ${CHIP[state(i)]}`}
              >
                {t.text}
              </button>
              {i === tokens.length - 1 && <span className="pb-2 pl-0.5 text-3xl font-bold text-slate-800">{end}</span>}
            </span>
          ))}
        </div>
      </div>

      {!checked && (
        <div className="flex min-h-16 items-center justify-end">
          <div className="flex w-44">
            <BigButton disabled={picked.length === 0} onClick={check}>
              Check
            </BigButton>
          </div>
        </div>
      )}
    </>
  )
}

/** The sentence with the answer words marked, for the result screen. */
export function MarkedSentence({ q }: { q: GrammarQuestion }) {
  const { tokens, end } = q.sentence
  return (
    <p className="text-xl leading-relaxed text-slate-700">
      {tokens.map((t, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {q.answer.includes(i) ? (
            <mark className="rounded-md bg-emerald-100 px-1 font-bold text-emerald-800">{t.text}</mark>
          ) : (
            t.text
          )}
        </span>
      ))}
      {end}
    </p>
  )
}
