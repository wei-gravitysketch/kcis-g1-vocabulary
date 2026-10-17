import { useState } from 'react'
import { buildGrammarQuestions, KIND_LABELS, type GrammarQuestion } from '../../lib/grammar'
import type { AnswerResult } from '../../lib/session'
import { shuffle } from '../../lib/shuffle'
import Quiz from '../Quiz'
import Result, { PracticeCard } from '../Result'
import GrammarHome from './GrammarHome'
import SentenceView, { MarkedSentence } from './SentenceView'

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; questions: GrammarQuestion[]; run: number }
  | { name: 'result'; questions: GrammarQuestion[]; results: AnswerResult[] }

/** The Parts of Speech test (parts-of-speech/): home -> quiz -> result. */
export default function GrammarApp() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const home = () => setScreen({ name: 'home' })
  const start = (questions: GrammarQuestion[]) => setScreen({ name: 'quiz', questions, run: Date.now() })

  switch (screen.name) {
    case 'quiz':
      return (
        <Quiz
          key={screen.run}
          questions={screen.questions}
          renderQuestion={(q, onAnswer) => <SentenceView q={q} onAnswer={onAnswer} />}
          onHome={home}
          onFinish={(results) => setScreen({ name: 'result', questions: screen.questions, results })}
        />
      )
    case 'result': {
      // SentenceView reports each answer under the sentence text.
      const { questions, results } = screen
      const wrong = new Set(results.filter((r) => !r.correct).map((r) => r.word))
      const missed = questions.filter((q) => wrong.has(q.sentence.text))
      return (
        <Result
          correct={results.length - missed.length}
          total={results.length}
          onHome={home}
          onRetryMissed={missed.length ? () => start(shuffle(missed)) : undefined}
        >
          {missed.length > 0 && (
            <PracticeCard title="Sentences to practice">
              <ul className="flex flex-col divide-y divide-slate-100">
                {missed.map((q) => (
                  <li key={q.id} className="py-2">
                    <p className="text-sm font-bold tracking-wide text-slate-500 uppercase">{KIND_LABELS[q.kind].many}</p>
                    <MarkedSentence q={q} />
                  </li>
                ))}
              </ul>
            </PracticeCard>
          )}
        </Result>
      )
    }
    default:
      return <GrammarHome onStart={({ count, kinds }) => start(buildGrammarQuestions(count, kinds))} />
  }
}
