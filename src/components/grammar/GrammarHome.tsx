import { useEffect, useState } from 'react'
import { KIND_LABELS, QUESTION_COUNTS, WORD_KINDS, type QuestionCount, type WordKind } from '../../lib/grammar'
import HomeLayout, { Check, Section, Segmented } from '../HomeLayout'

const STORAGE_KEY = 'grammar-settings-v1'

export interface GrammarSettings {
  count: QuestionCount
  kinds: WordKind[]
}

const defaults: GrammarSettings = { count: 10, kinds: WORD_KINDS }

/** Example words shown under each kind on the settings screen. */
const EXAMPLES: Record<WordKind, string> = {
  noun: 'dog, park, Tom',
  verb: 'run, eat, sing',
  adj: 'big, red, happy',
  article: 'a, an, the',
}

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

function loadSettings(): GrammarSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<GrammarSettings> | null
    return {
      count: QUESTION_COUNTS.find((n) => n === saved?.count) ?? defaults.count,
      kinds: Array.isArray(saved?.kinds) ? WORD_KINDS.filter((k) => saved.kinds!.includes(k)) : defaults.kinds,
    }
  } catch {
    // ignore: storage unavailable or corrupt
  }
  return defaults
}

export default function GrammarHome({ onStart }: { onStart: (settings: GrammarSettings) => void }) {
  const [settings, setSettings] = useState(loadSettings)
  const { count, kinds } = settings
  const set = (patch: Partial<GrammarSettings>) => setSettings((s) => ({ ...s, ...patch }))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const allKinds = kinds.length === WORD_KINDS.length
  // Keep library order so the saved setting is stable.
  const toggleKind = (k: WordKind) =>
    set({ kinds: kinds.includes(k) ? kinds.filter((x) => x !== k) : WORD_KINDS.filter((x) => x === k || kinds.includes(x)) })

  return (
    <HomeLayout
      page="grammar"
      title="Parts of Speech"
      startLabel={kinds.length ? `Start · ${count} questions` : 'Pick at least one word kind.'}
      canStart={kinds.length > 0}
      onStart={() => onStart(settings)}
    >
      <Section step="1" title="How many questions?">
        <Segmented<QuestionCount>
          value={count}
          onChange={(v) => set({ count: v })}
          options={QUESTION_COUNTS.map((n) => ({ value: n, label: String(n) }))}
        />
      </Section>

      <Section
        step="2"
        title="Word Kinds"
        action={
          <button
            type="button"
            className="min-h-11 rounded-xl px-3 text-base font-semibold text-sky-700 active:bg-sky-50"
            onClick={() => set({ kinds: allKinds ? [] : WORD_KINDS })}
          >
            {allKinds ? 'Clear' : 'Select all'}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {WORD_KINDS.map((k) => (
            <Check
              key={k}
              checked={kinds.includes(k)}
              onChange={() => toggleKind(k)}
              title={capitalize(KIND_LABELS[k].one)}
              hint={EXAMPLES[k]}
            />
          ))}
        </div>
      </Section>
    </HomeLayout>
  )
}
