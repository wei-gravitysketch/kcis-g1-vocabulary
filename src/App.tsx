import { useState } from 'react'
import Home from './components/Home'
import Flashcards from './components/Flashcards'
import Quiz from './components/Quiz'
import QuestionView from './components/quiz/QuestionView'
import Result, { PracticeCard } from './components/Result'
import { buildQuestions, collectWords, shuffle, type AnswerResult, type Question, type SessionConfig } from './lib/session'

type Screen =
  | { name: 'home' }
  | { name: 'flashcards'; words: string[]; config: SessionConfig; run: number }
  | { name: 'quiz'; questions: Question[]; config: SessionConfig; run: number }
  | { name: 'result'; results: AnswerResult[]; config: SessionConfig }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const home = () => setScreen({ name: 'home' })

  const start = (config: SessionConfig, onlyWords?: string[]) => {
    const base = onlyWords ?? collectWords(config.termId, config.groupIds)
    const words = config.order === 'shuffle' ? shuffle(base) : base
    if (config.mode === 'flashcards') {
      setScreen({ name: 'flashcards', words, config, run: Date.now() })
    } else {
      setScreen({ name: 'quiz', questions: buildQuestions(words, config.types), config, run: Date.now() })
    }
  }

  switch (screen.name) {
    case 'flashcards':
      return <Flashcards key={screen.run} words={screen.words} onHome={home} onAgain={() => start(screen.config)} />
    case 'quiz':
      return (
        <Quiz
          key={screen.run}
          questions={screen.questions}
          renderQuestion={(q, onAnswer) => <QuestionView q={q} onAnswer={onAnswer} />}
          onHome={home}
          onFinish={(results) => setScreen({ name: 'result', results, config: screen.config })}
        />
      )
    case 'result': {
      const { results, config } = screen
      const missed = results.filter((r) => !r.correct).map((r) => r.word)
      return (
        <Result
          correct={results.length - missed.length}
          total={results.length}
          onHome={home}
          onRetryMissed={missed.length ? () => start(config, missed) : undefined}
        >
          {missed.length > 0 && (
            <PracticeCard title="Words to practice">
              <div className="flex flex-wrap gap-2">
                {missed.map((w) => (
                  <span key={w} className="rounded-full bg-rose-100 px-4 py-2 text-lg font-semibold text-rose-800">
                    {w}
                  </span>
                ))}
              </div>
            </PracticeCard>
          )}
        </Result>
      )
    }
    default:
      return <Home onStart={start} />
  }
}
