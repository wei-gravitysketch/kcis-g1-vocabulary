import { useState } from 'react'
import Home from './components/Home'
import Flashcards from './components/Flashcards'
import Quiz from './components/Quiz'
import Result from './components/Result'
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
          onHome={home}
          onFinish={(results) => setScreen({ name: 'result', results, config: screen.config })}
        />
      )
    case 'result':
      return (
        <Result
          results={screen.results}
          onHome={home}
          onRetryMissed={(missed) => start(screen.config, missed)}
        />
      )
    default:
      return <Home onStart={start} />
  }
}
