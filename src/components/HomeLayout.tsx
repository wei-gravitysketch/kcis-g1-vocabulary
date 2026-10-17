import type { ReactNode } from 'react'
import { primeAudio } from '../lib/celebrations'
import { primeSpeech } from '../lib/speak'
import AppMenu, { type PageId } from './AppMenu'

/** Settings screen of a test: header with the menu, numbered sections, Start bar at the bottom. */
export default function HomeLayout({
  page,
  title,
  startLabel,
  canStart,
  onStart,
  children,
}: {
  page: PageId
  title: string
  /** Shown on the Start button (or why it is disabled). */
  startLabel: string
  canStart: boolean
  onStart: () => void
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(8rem,calc(env(safe-area-inset-bottom)+7rem))]">
      <header className="flex flex-col items-center pb-2">
        <div className="flex w-full items-center justify-between">
          <span className="size-14" aria-hidden />
          <p className="text-sm font-bold tracking-widest text-sky-500 uppercase">KCIS Grade 1</p>
          <AppMenu current={page} />
        </div>
        <h1 className="text-center text-3xl font-extrabold text-sky-700 sm:text-4xl">{title}</h1>
      </header>

      {children}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            disabled={!canStart}
            onClick={() => {
              // Unlock audio and speech on iOS while we are inside a tap.
              primeAudio()
              primeSpeech()
              onStart()
            }}
            className="min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg transition active:bg-sky-700 disabled:bg-slate-300 disabled:shadow-none"
          >
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Section({
  step,
  title,
  children,
  action,
}: {
  step: string
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
          <span className="grid size-8 place-items-center rounded-full bg-sky-600 text-sm text-white">{step}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div
      className="grid gap-2 rounded-2xl bg-slate-100 p-1.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-14 rounded-xl px-3 text-lg font-semibold transition ${
            value === o.value ? 'bg-white text-sky-700 shadow' : 'text-slate-500'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
