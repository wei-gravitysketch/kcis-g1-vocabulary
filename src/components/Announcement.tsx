import { useEffect, useState } from 'react'
import { announcement, type Announcement } from '../data/announcement'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'

const STORAGE_KEY = 'announcement-seen'

function alreadySeen(id: string): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === id
  } catch {
    return false
  }
}

/** The current announcement (src/data/announcement.ts), once per device, on every page. */
export default function AnnouncementGate() {
  const a = announcement
  const [open, setOpen] = useState(() => a !== null && !alreadySeen(a.id))
  if (!open || !a) return null
  return (
    <AnnouncementDialog
      announcement={a}
      onClose={() => {
        try {
          localStorage.setItem(STORAGE_KEY, a.id)
        } catch {
          // ignore: it will just show again next time
        }
        setOpen(false)
      }}
    />
  )
}

function AnnouncementDialog({ announcement: a, onClose }: { announcement: Announcement; onClose: () => void }) {
  useBodyScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overscroll-contain bg-slate-900/40 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        lang="zh-Hant"
        className="anim-pop-in flex max-h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id="announcement-title" className="text-2xl font-extrabold text-sky-700">
          {a.title}
        </h2>
        {a.paragraphs.map((p) => (
          <p key={p} className="text-lg leading-relaxed text-pretty text-slate-700">
            {p}
          </p>
        ))}
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-2 min-h-14 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white active:bg-sky-700"
        >
          {a.button}
        </button>
      </div>
    </div>
  )
}
