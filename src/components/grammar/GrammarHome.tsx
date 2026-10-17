import { useEffect, useState } from 'react'
import { QUESTION_COUNTS, type QuestionCount } from '../../lib/grammar'
import HomeLayout, { Section, Segmented } from '../HomeLayout'

const STORAGE_KEY = 'grammar-settings-v1'
const DEFAULT_COUNT: QuestionCount = 10

function loadCount(): QuestionCount {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as { count?: number } | null
    const count = QUESTION_COUNTS.find((n) => n === saved?.count)
    if (count) return count
  } catch {
    // ignore: storage unavailable or corrupt
  }
  return DEFAULT_COUNT
}

export default function GrammarHome({ onStart }: { onStart: (count: QuestionCount) => void }) {
  const [count, setCount] = useState(loadCount)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count }))
    } catch {
      // ignore
    }
  }, [count])

  return (
    <HomeLayout
      page="grammar"
      title="Parts of Speech"
      startLabel={`Start · ${count} questions`}
      canStart
      onStart={() => onStart(count)}
    >
      <Section step="1" title="How many questions?">
        <Segmented<QuestionCount>
          value={count}
          onChange={setCount}
          options={QUESTION_COUNTS.map((n) => ({ value: n, label: String(n) }))}
        />
        <p className="mt-4 text-slate-500">Find the nouns, verbs, adjectives and articles in each sentence.</p>
      </Section>
    </HomeLayout>
  )
}
