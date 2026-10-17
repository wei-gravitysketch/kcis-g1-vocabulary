import { useEffect, useState, type ReactNode } from 'react'
import { POS_LABELS, partsOfSpeech, type PartOfSpeech } from '../../data/partsOfSpeech'
import type { ChoiceQuestion } from '../../lib/session'
import { speak } from '../../lib/speak'
import Picture from '../Picture'
import SpeakButton from '../SpeakButton'
import type { OnAnswer } from './types'

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
      {children}
    </div>
  )
}

const Ask = ({ children }: { children: ReactNode }) => <p className="text-lg text-slate-500">{children}</p>

function Prompt({ q, answered }: { q: ChoiceQuestion; answered: boolean }) {
  switch (q.type) {
    case 'listen':
      return (
        <Card>
          <Ask>Listen and tap the word you hear.</Ask>
          <SpeakButton text={q.audio!} label="Listen again" size="lg" />
        </Card>
      )
    case 'picture':
      return (
        <Card>
          <Ask>What is this?</Ask>
          <Picture src={q.picture!} />
        </Card>
      )
    case 'trueFalse':
      return (
        <Card>
          {q.picture ? (
            <>
              <Picture src={q.picture} />
              <p className="text-2xl font-bold text-slate-800">
                Is this <span className="text-sky-700">“{q.shown}”</span>?
              </p>
            </>
          ) : (
            <>
              <Ask>Did you hear this word?</Ask>
              <SpeakButton text={q.audio!} label="Listen again" size="lg" />
              <p className="text-4xl font-extrabold text-sky-700">{q.shown}</p>
            </>
          )}
        </Card>
      )
    case 'blank':
      return (
        <Card>
          <div className="flex items-center gap-4">
            <p className="text-2xl leading-snug font-bold text-slate-800 sm:text-3xl">
              {answered ? q.sentence : q.prompt}
            </p>
            {answered && <SpeakButton text={q.sentence!} label="Listen to the sentence" />}
          </div>
        </Card>
      )
    case 'pos':
      return (
        <Card>
          <Ask>What kind of word is this?</Ask>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-extrabold break-words text-sky-700">{q.word}</span>
            <SpeakButton text={q.word} label={`Listen to ${q.word}`} />
          </div>
        </Card>
      )
    case 'oddOneOut':
      return (
        <Card>
          <p className="text-2xl font-bold text-slate-800">Which word is different?</p>
          <Ask>Three words are the same kind of word (noun, verb, adjective or adverb). One is not.</Ask>
        </Card>
      )
  }
}

function optionLabel(q: ChoiceQuestion, option: string): string {
  if (q.type === 'pos') return POS_LABELS[option as PartOfSpeech]
  if (q.type === 'trueFalse') return option === 'yes' ? '👍 Yes' : '👎 No'
  return option
}

function wrongMessage(q: ChoiceQuestion): string {
  if (q.type === 'trueFalse') return q.answer === 'yes' ? `Yes, it is “${q.word}”.` : `No, it is “${q.word}”.`
  return `Answer: ${optionLabel(q, q.answer)}`
}

export default function ChoiceView({ q, onAnswer }: { q: ChoiceQuestion; onAnswer: OnAnswer }) {
  const [picked, setPicked] = useState<string | null>(null)
  const answered = picked !== null

  // Read the word aloud when a listening question appears.
  useEffect(() => {
    if (!q.audio) return
    const id = setTimeout(() => speak(q.audio!), 350)
    return () => clearTimeout(id)
  }, [q])

  const choose = (option: string) => {
    if (answered) return
    setPicked(option)
    const correct = option === q.answer
    onAnswer({ results: [{ word: q.word, correct }], correct, message: wrongMessage(q) })
  }

  const optionClass = (option: string) => {
    if (!answered) return 'bg-white text-slate-800 ring-slate-200 active:bg-sky-50'
    if (option === q.answer) return 'bg-emerald-100 text-emerald-900 ring-emerald-500'
    if (option === picked) return 'bg-rose-100 text-rose-900 ring-rose-500'
    return 'bg-white text-slate-400 ring-slate-200'
  }

  return (
    <>
      <Prompt q={q} answered={answered} />
      <div className={`grid gap-3 ${q.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {q.options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={answered}
            onClick={() => choose(option)}
            className={`flex min-h-20 flex-col items-center justify-center rounded-2xl px-4 py-2 text-2xl font-bold ring-2 transition ${optionClass(option)}`}
          >
            {optionLabel(q, option)}
            {q.type === 'oddOneOut' && answered && (
              <span className="text-sm font-semibold opacity-70">{POS_LABELS[partsOfSpeech[option]]}</span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
