import { useEffect } from 'react'
import type { WordGroup } from '../data/vocabulary'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import SpeakButton from './SpeakButton'

export default function WordListDialog({ group, onClose }: { group: WordGroup; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useBodyScrollLock()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-slate-900/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={group.name}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full max-w-md flex-col rounded-3xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-lg active:bg-slate-200"
          >
            ✕
          </button>
        </div>
        <ul className="overflow-y-auto overscroll-contain px-5 py-3">
          {group.words.map((w) => (
            <li key={w} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
              <span className="text-xl font-semibold text-slate-800">{w}</span>
              <SpeakButton text={w} label={`Listen to ${w}`} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
