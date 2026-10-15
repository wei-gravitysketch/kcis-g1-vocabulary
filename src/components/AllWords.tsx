import { POS_LABELS, partsOfSpeech } from '../data/partsOfSpeech'
import { vocabulary } from '../data/vocabulary'
import SpeakButton from './SpeakButton'

/** Standalone page (words.html): every word of every term in one table. */
export default function AllWords() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="mb-6 text-center">
        <p className="text-sm font-bold tracking-widest text-sky-500 uppercase">KCIS Grade 1</p>
        <h1 className="text-3xl font-extrabold text-sky-700">All Words</h1>
      </header>

      <div className="flex flex-col gap-6">
        {vocabulary.map((term) => (
          <section key={term.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <h2 className="bg-sky-600 px-5 py-3 text-xl font-bold text-white">{term.name}</h2>
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
          </section>
        ))}
      </div>
    </div>
  )
}
