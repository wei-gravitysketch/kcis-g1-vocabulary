import { useState } from 'react'
import Home from './components/Home.jsx'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Result from './components/Result.jsx'
import { buildQuestions, collectWords, shuffle } from './lib/session.js'

// screen: { name: 'home' } | { name: 'flashcards', words, config, run }
//       | { name: 'quiz', questions, config } | { name: 'result', results, config }
export default function App() {
  const [screen, setScreen] = useState({ name: 'home' })
  const home = () => setScreen({ name: 'home' })

  const start = (config, onlyWords) => {
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
