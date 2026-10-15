// Shared full-screen layout for the flashcard / quiz screens.
export default function Shell({ onHome, progress, label, children, footer }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={onHome}
          aria-label="Home"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm ring-1 ring-slate-200 active:bg-slate-100"
        >
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="w-16 shrink-0 text-right font-semibold text-slate-600">{label}</span>
      </div>
      <main className="flex flex-1 flex-col justify-center gap-5 py-4">{children}</main>
      {footer}
    </div>
  )
}

export function BigButton({ children, tone = 'primary', ...props }) {
  const tones = {
    primary: 'bg-sky-600 text-white active:bg-sky-700 disabled:bg-slate-300',
    light: 'bg-white text-sky-700 ring-1 ring-slate-200 active:bg-slate-100 disabled:text-slate-300',
  }
  return (
    <button
      type="button"
      className={`min-h-16 flex-1 rounded-2xl px-4 text-xl font-bold transition ${tones[tone]}`}
      {...props}
    >
      {children}
    </button>
  )
}
