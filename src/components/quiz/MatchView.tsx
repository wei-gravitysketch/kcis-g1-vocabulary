import { useState } from 'react'
import { playPairSound } from '../../lib/celebrations'
import { BLANK, shuffle, type MatchQuestion } from '../../lib/session'
import type { OnAnswer } from './types'

/** Match each word to the sentence it completes: tap a word, then tap its sentence. */
export default function MatchView({ q, onAnswer }: { q: MatchQuestion; onAnswer: OnAnswer }) {
  const [wordOrder] = useState(() => shuffle(q.pairs.map((p) => p.word)))
  const [sentenceOrder] = useState(() => shuffle(q.pairs))
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [missed, setMissed] = useState<string[]>([])
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)

  const tapSentence = (pairWord: string) => {
    if (!selected || matched.includes(pairWord)) return
    if (selected === pairWord) {
      playPairSound(true)
      const nextMatched = [...matched, pairWord]
      setMatched(nextMatched)
      setSelected(null)
      if (nextMatched.length === q.pairs.length) {
        const results = q.pairs.filter((p) => p.scored).map((p) => ({ word: p.word, correct: !missed.includes(p.word) }))
        const wrong = results.filter((r) => !r.correct).map((r) => r.word)
        onAnswer({ results, correct: wrong.length === 0, message: `Practice: ${wrong.join(', ')}` })
      }
    } else {
      playPairSound(false)
      if (!missed.includes(selected)) setMissed([...missed, selected])
      setWrongFlash(pairWord)
      setTimeout(() => setWrongFlash(null), 500)
    }
  }

  return (
    <>
      <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-lg text-slate-500">Tap a word, then tap its sentence.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {wordOrder.map((w) => {
            const done = matched.includes(w)
            return (
              <button
                key={w}
                type="button"
                disabled={done}
                onClick={() => setSelected(selected === w ? null : w)}
                className={`min-h-14 rounded-2xl px-4 text-xl font-bold ring-2 transition ${
                  done
                    ? 'bg-emerald-50 text-emerald-300 ring-emerald-200'
                    : selected === w
                      ? 'bg-sky-600 text-white ring-sky-600'
                      : 'bg-white text-slate-800 ring-slate-200 active:bg-sky-50'
                }`}
              >
                {w}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sentenceOrder.map((p) => {
          const done = matched.includes(p.word)
          const [before, ...rest] = p.prompt.split(BLANK)
          const after = rest.join(BLANK)
          return (
            <button
              key={p.word}
              type="button"
              disabled={done}
              onClick={() => tapSentence(p.word)}
              className={`min-h-16 rounded-2xl px-4 py-3 text-left text-xl ring-2 transition ${
                done
                  ? 'bg-emerald-50 text-emerald-900 ring-emerald-400'
                  : wrongFlash === p.word
                    ? 'anim-shake bg-rose-50 text-rose-900 ring-rose-400'
                    : selected
                      ? 'bg-white text-slate-800 ring-sky-300 active:bg-sky-50'
                      : 'bg-white text-slate-800 ring-slate-200'
              }`}
            >
              {before}
              <span className={`font-bold ${done ? 'text-emerald-700' : 'text-slate-400'}`}>
                {done ? p.word : BLANK}
              </span>
              {after}
            </button>
          )
        })}
      </div>
    </>
  )
}
