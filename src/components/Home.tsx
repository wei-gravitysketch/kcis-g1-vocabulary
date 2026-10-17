import { useEffect, useMemo, useState } from 'react'
import { vocabulary, type WordGroup } from '../data/vocabulary'
import { DEFAULT_TYPES, LEVELS, QUESTION_TYPES } from '../lib/questionTypes'
import { collectWords, countAskable, type QuestionType, type SessionConfig } from '../lib/session'
import HomeLayout, { Section, Segmented } from './HomeLayout'
import WordListDialog from './WordListDialog'

// v2: question types changed (Basic/Advanced); older saved settings are ignored.
const STORAGE_KEY = 'vocab-settings-v2'

const defaults: SessionConfig = {
  termId: vocabulary[0].id,
  groupIds: [],
  mode: 'flashcards',
  types: DEFAULT_TYPES,
  order: 'sequential',
}

function loadSettings(): SessionConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<SessionConfig> | null
    if (saved && vocabulary.some((t) => t.id === saved.termId)) {
      const types = (saved.types ?? defaults.types).filter((t) => QUESTION_TYPES.some((q) => q.id === t))
      return { ...defaults, ...saved, types }
    }
  } catch {
    // ignore: storage unavailable or corrupt
  }
  return defaults
}

function Check({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean
  onChange: () => void
  title: string
  hint: string
}) {
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

export default function Home({ onStart }: { onStart: (config: SessionConfig) => void }) {
  const [settings, setSettings] = useState(loadSettings)
  const { termId, groupIds, mode, types, order } = settings
  const term = vocabulary.find((t) => t.id === termId) ?? vocabulary[0]
  const set = (patch: Partial<SessionConfig>) => setSettings((s) => ({ ...s, ...patch }))
  const [viewing, setViewing] = useState<WordGroup | null>(null)

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
  const total = mode === 'flashcards' ? words.length : countAskable(words, types)

  const toggleGroup = (id: string) =>
    set({ groupIds: validGroupIds.includes(id) ? validGroupIds.filter((g) => g !== id) : [...validGroupIds, id] })
  const toggleType = (t: QuestionType) => set({ types: types.includes(t) ? types.filter((x) => x !== t) : [...types, t] })

  let problem = ''
  if (validGroupIds.length === 0) problem = 'Pick at least one word list.'
  else if (mode === 'quiz' && types.length === 0) problem = 'Pick at least one question type.'
  else if (total === 0) problem = 'No words match this question type.'

  return (
    <HomeLayout
      page="vocabulary"
      title="Vocabulary Practice"
      startLabel={problem || `Start · ${total} ${mode === 'quiz' ? 'words' : 'cards'}`}
      canStart={!problem}
      onStart={() => onStart({ termId, groupIds: validGroupIds, mode, types, order })}
    >

      <Section step="1" title="Term">
        <div className="relative">
          <select
            value={termId}
            onChange={(e) => set({ termId: e.target.value, groupIds: [] })}
            className="min-h-14 w-full appearance-none rounded-2xl border-2 border-slate-200 bg-white pr-14 pl-4 text-lg font-semibold text-slate-800"
          >
            {vocabulary.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 right-4 size-7 -translate-y-1/2 text-sky-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Section>

      <Section
        step="2"
        title="Word List"
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
              <div
                key={g.id}
                className={`flex min-h-16 items-center rounded-2xl border-2 transition ${
                  on ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleGroup(g.id)}
                  className="flex min-h-16 flex-1 flex-col justify-center px-4 py-2 text-left"
                >
                  <span className="font-semibold text-slate-800">{g.name}</span>
                  <span className="text-sm text-slate-500">{g.words.length} words</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewing(g)}
                  className="mr-2 min-h-10 shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-sky-700 ring-1 ring-slate-200 active:bg-sky-50"
                >
                  See words
                </button>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex justify-end">
          <a
            href={`${import.meta.env.BASE_URL}words.html`}
            target="_blank"
            rel="noopener"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 underline-offset-2 hover:underline active:bg-slate-100"
          >
            All words table ↗
          </a>
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
          <div className="mt-4 flex flex-col gap-4">
            {LEVELS.map((level) => {
              const ids = QUESTION_TYPES.filter((t) => t.level === level.id).map((t) => t.id)
              const all = ids.every((id) => types.includes(id))
              return (
                <div key={level.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-base font-bold tracking-wide text-slate-500 uppercase">{level.title}</h3>
                    <button
                      type="button"
                      onClick={() =>
                        set({ types: all ? types.filter((t) => !ids.includes(t)) : [...new Set([...types, ...ids])] })
                      }
                      className="min-h-10 rounded-xl px-3 text-sm font-semibold text-sky-700 active:bg-sky-50"
                    >
                      {all ? 'Clear' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {QUESTION_TYPES.filter((t) => t.level === level.id).map((t) => (
                      <Check
                        key={t.id}
                        checked={types.includes(t.id)}
                        onChange={() => toggleType(t.id)}
                        title={t.title}
                        hint={t.hint}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
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

      {viewing && <WordListDialog group={viewing} onClose={() => setViewing(null)} />}
    </HomeLayout>
  )
}
