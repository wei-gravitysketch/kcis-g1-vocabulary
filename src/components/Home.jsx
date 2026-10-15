import { useEffect, useMemo, useState } from 'react'
import { vocabulary } from '../data/vocabulary.js'
import { collectWords, countQuestions } from '../lib/session.js'

const STORAGE_KEY = 'vocab-settings-v1'

const defaults = {
  termId: vocabulary[0].id,
  groupIds: [],
  mode: 'flashcards', // 'flashcards' | 'quiz'
  types: ['blank', 'pos'],
  order: 'sequential', // 'sequential' | 'shuffle'
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && vocabulary.some((t) => t.id === saved.termId)) return { ...defaults, ...saved }
  } catch {
    // ignore: storage unavailable or corrupt
  }
  return defaults
}

function Section({ step, title, children, action }) {
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

function Segmented({ value, onChange, options }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
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

function Check({ checked, onChange, title, hint }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition ${
        checked ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'
      }`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 text-white ${
          checked ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
        }`}
      >
        {checked && '✓'}
      </span>
      <span>
        <span className="block text-lg font-semibold text-slate-800">{title}</span>
        <span className="block text-sm text-slate-500">{hint}</span>
      </span>
    </button>
  )
}

export default function Home({ onStart }) {
  const [settings, setSettings] = useState(loadSettings)
  const { termId, groupIds, mode, types, order } = settings
  const term = vocabulary.find((t) => t.id === termId)
  const set = (patch) => setSettings((s) => ({ ...s, ...patch }))

  // Drop selected groups that do not belong to the current term (e.g. library changed).
  const validGroupIds = useMemo(
    () => groupIds.filter((id) => term.groups.some((g) => g.id === id)),
    [groupIds, term],
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const words = useMemo(() => collectWords(termId, validGroupIds), [termId, validGroupIds])
  const total = mode === 'flashcards' ? words.length : countQuestions(words, types)

  const toggleGroup = (id) =>
    set({ groupIds: validGroupIds.includes(id) ? validGroupIds.filter((g) => g !== id) : [...validGroupIds, id] })
  const toggleType = (t) => set({ types: types.includes(t) ? types.filter((x) => x !== t) : [...types, t] })

  let problem = ''
  if (validGroupIds.length === 0) problem = 'Pick at least one list.'
  else if (mode === 'quiz' && types.length === 0) problem = 'Pick at least one question type.'
  else if (total === 0) problem = 'No words match this question type.'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(8rem,calc(env(safe-area-inset-bottom)+7rem))]">
      <header className="py-2 text-center">
        <h1 className="text-3xl font-extrabold text-sky-700">Word Cards</h1>
        <p className="mt-1 text-slate-500">Pick your words and start!</p>
      </header>

      <Section step="1" title="Term">
        <select
          value={termId}
          onChange={(e) => set({ termId: e.target.value, groupIds: [] })}
          className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-lg font-semibold text-slate-800"
        >
          {vocabulary.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Section>

      <Section
        step="2"
        title="Lists"
        action={
          <button
            type="button"
            className="min-h-11 rounded-xl px-3 text-base font-semibold text-sky-700 active:bg-sky-50"
            onClick={() =>
              set({ groupIds: validGroupIds.length === term.groups.length ? [] : term.groups.map((g) => g.id) })
            }
          >
            {validGroupIds.length === term.groups.length ? 'Clear' : 'Select all'}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {term.groups.map((g) => {
            const on = validGroupIds.includes(g.id)
            return (
              <button
                key={g.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggleGroup(g.id)}
                className={`flex min-h-16 flex-col justify-center rounded-2xl border-2 px-4 py-2 text-left transition ${
                  on ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="font-semibold text-slate-800">{g.name}</span>
                <span className="text-sm text-slate-500">{g.words.length} words</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section step="3" title="Activity">
        <Segmented
          value={mode}
          onChange={(v) => set({ mode: v })}
          options={[
            { value: 'flashcards', label: 'Flashcards' },
            { value: 'quiz', label: 'Quiz' },
          ]}
        />
        {mode === 'quiz' && (
          <div className="mt-3 flex flex-col gap-2">
            <Check
              checked={types.includes('blank')}
              onChange={() => toggleType('blank')}
              title="Fill in the blank"
              hint="Choose the word that completes the sentence"
            />
            <Check
              checked={types.includes('pos')}
              onChange={() => toggleType('pos')}
              title="Part of speech"
              hint="Noun, verb, adjective or adverb?"
            />
          </div>
        )}
      </Section>

      <Section step="4" title="Order">
        <Segmented
          value={order}
          onChange={(v) => set({ order: v })}
          options={[
            { value: 'sequential', label: 'In order' },
            { value: 'shuffle', label: 'Shuffle' },
          ]}
        />
      </Section>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            disabled={Boolean(problem)}
            onClick={() => onStart({ termId, groupIds: validGroupIds, mode, types, order })}
            className="min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg transition active:bg-sky-700 disabled:bg-slate-300 disabled:shadow-none"
          >
            {problem || `Start · ${total} ${mode === 'quiz' ? 'questions' : 'cards'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
