import { useEffect, useState } from 'react'
import type { SpellQuestion } from '../../lib/session'
import { speak } from '../../lib/speak'
import SpeakButton from '../SpeakButton'
import type { OnAnswer } from './types'

/** Unscramble / Listen and spell: tap letter tiles to build the word. */
export default function SpellView({ q, onAnswer }: { q: SpellQuestion; onAnswer: OnAnswer }) {
  const target = q.word.toLowerCase()
  // Indexes into q.tiles, in the order tapped.
  const [chosen, setChosen] = useState<number[]>([])
  const [result, setResult] = useState<boolean | null>(null)
  const answered = result !== null

  useEffect(() => {
    if (q.type !== 'spell') return
    const id = setTimeout(() => speak(q.word), 350)
    return () => clearTimeout(id)
  }, [q])

  const tap = (i: number) => {
    if (answered || chosen.includes(i)) return
    const next = [...chosen, i]
    setChosen(next)
    if (next.length === target.length) {
      const correct = next.map((n) => q.tiles[n]).join('') === target
      setResult(correct)
      onAnswer({ results: [{ word: q.word, correct }], correct, message: `Answer: ${q.word}` })
    }
  }

  const slotClass =
    result === null
      ? 'border-sky-300 bg-white text-slate-800'
      : result
        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
        : 'border-rose-400 bg-rose-50 text-rose-800'

  return (
    <>
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        {q.type === 'spell' ? (
          <>
            <p className="text-lg text-slate-500">Listen and spell the word.</p>
            <SpeakButton text={q.word} label="Listen again" size="lg" />
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-lg text-slate-500">Put the letters in order.</p>
            <SpeakButton text={q.word} label="Hear the word" size="sm" />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-1.5">
          {target.split('').map((_, i) => (
            <span
              key={i}
              className={`grid h-14 w-11 place-items-center rounded-xl border-2 text-3xl font-bold sm:w-12 ${slotClass}`}
            >
              {chosen[i] !== undefined ? q.tiles[chosen[i]] : ''}
            </span>
          ))}
        </div>
        {answered && !result && <p className="text-2xl font-bold text-emerald-700">{q.word}</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {q.tiles.map((ch, i) => (
          <button
            key={i}
            type="button"
            disabled={answered || chosen.includes(i)}
            onClick={() => tap(i)}
            className="grid size-16 place-items-center rounded-2xl bg-white text-3xl font-bold text-slate-800 shadow-sm ring-2 ring-slate-200 transition active:bg-sky-50 disabled:opacity-30"
          >
            {ch}
          </button>
        ))}
        <button
          type="button"
          aria-label="Undo"
          disabled={answered || chosen.length === 0}
          onClick={() => setChosen(chosen.slice(0, -1))}
          className="grid h-16 min-w-16 place-items-center rounded-2xl bg-slate-100 px-3 text-2xl text-slate-600 ring-2 ring-slate-200 active:bg-slate-200 disabled:opacity-30"
        >
          ⌫
        </button>
      </div>
    </>
  )
}
