import { useEffect, useState } from 'react'

export type PageId = 'vocabulary' | 'grammar'

/** The tests of the site, one page each (see vite.config.ts). */
const PAGES: { id: PageId; title: string; hint: string; icon: string; href: string }[] = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    hint: 'Flashcards and word quiz',
    icon: '📚',
    href: import.meta.env.BASE_URL,
  },
  {
    id: 'grammar',
    title: 'Parts of Speech',
    hint: 'Noun, verb, adjective, article',
    icon: '🔍',
    href: `${import.meta.env.BASE_URL}parts-of-speech/`,
  },
]

/** Menu button (top right of the home screens) that switches between the tests. */
export default function AppMenu({ current }: { current: PageId }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`grid size-14 place-items-center rounded-full shadow-sm ring-1 transition ${
          open ? 'bg-sky-600 text-white ring-sky-600' : 'bg-white text-sky-700 ring-slate-200 active:bg-slate-100'
        }`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={() => setOpen(false)} />
          <nav
            aria-label="Tests"
            className="absolute top-16 right-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-1 rounded-3xl bg-white p-2 shadow-xl ring-1 ring-slate-200"
          >
            {PAGES.map((p) => {
              const here = p.id === current
              return (
                <a
                  key={p.id}
                  href={p.href}
                  aria-current={here ? 'page' : undefined}
                  onClick={(e) => {
                    if (!here) return
                    e.preventDefault()
                    setOpen(false)
                  }}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                    here ? 'bg-sky-50 ring-2 ring-sky-500' : 'active:bg-slate-100'
                  }`}
                >
                  <span className="text-3xl" aria-hidden>
                    {p.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold text-slate-800">{p.title}</span>
                    <span className="block text-sm text-slate-500">{p.hint}</span>
                  </span>
                  {here && <span className="text-xl font-bold text-sky-600">✓</span>}
                </a>
              )
            })}
          </nav>
        </>
      )}
    </div>
  )
}
