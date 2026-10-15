import { useState } from 'react'
import { POS_LABELS, partsOfSpeech } from '../data/partsOfSpeech'
import { vocabulary, type Term } from '../data/vocabulary'
import SpeakButton from './SpeakButton'

function TermTable({ term }: { term: Term }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-200 text-sm text-slate-500">
          <th className="px-4 py-2 font-semibold">Word list</th>
          <th className="px-4 py-2 font-semibold">Word</th>
          <th className="px-4 py-2 font-semibold">Part of speech</th>
          <th className="w-14 px-2 py-2" aria-label="Listen" />
        </tr>
      </thead>
      {term.groups.map((group) => (
        <tbody key={group.id} className="border-b-2 border-slate-200 last:border-0">
          {group.words.map((word, i) => {
            const pos = partsOfSpeech[word]
            return (
              <tr key={word} className="border-t border-slate-100">
                {i === 0 && (
                  <th
                    scope="rowgroup"
                    rowSpan={group.words.length}
                    className="w-1/3 bg-slate-50 px-4 py-2 align-top font-semibold text-slate-700"
                  >
                    {group.name}
                  </th>
                )}
                <td className="px-4 py-2 text-lg font-semibold text-slate-800">{word}</td>
                <td className="px-4 py-2 text-slate-500">{pos ? POS_LABELS[pos] : '—'}</td>
                <td className="px-2 py-1">
                  <SpeakButton text={word} label={`Listen to ${word}`} size="sm" />
                </td>
              </tr>
            )
          })}
        </tbody>
      ))}
    </table>
  )
}

/** Standalone page (words.html): every word of every term, one collapsible table per term. */
export default function AllWords() {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(vocabulary.map((t) => [t.id, true])),
  )
  const allOpen = vocabulary.every((t) => open[t.id])
  const setAll = (value: boolean) => setOpen(Object.fromEntries(vocabulary.map((t) => [t.id, value])))

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="mb-4 text-center">
        <p className="text-sm font-bold tracking-widest text-sky-500 uppercase">KCIS Grade 1</p>
        <h1 className="text-3xl font-extrabold text-sky-700">All Words</h1>
      </header>

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAll(!allOpen)}
          className="min-h-11 rounded-xl px-3 text-base font-semibold text-sky-700 active:bg-sky-50"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {vocabulary.map((term) => {
          const isOpen = open[term.id]
          const count = new Set(term.groups.flatMap((g) => g.words)).size
          return (
            <section key={term.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => ({ ...o, [term.id]: !o[term.id] }))}
                className="flex min-h-14 w-full items-center justify-between gap-3 bg-sky-600 px-5 py-3 text-left text-white active:bg-sky-700"
              >
                <span className="text-xl font-bold">{term.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-sky-100">{count} words</span>
                  <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden>
                    ▾
                  </span>
                </span>
              </button>
              {isOpen && <TermTable term={term} />}
            </section>
          )
        })}
      </div>
    </div>
  )
}
