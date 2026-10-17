import type { Question } from '../../lib/session'
import ChoiceView from './ChoiceView'
import MatchView from './MatchView'
import SpellView from './SpellView'
import type { OnAnswer } from './types'

/** One vocabulary quiz question, drawn by the view for its kind. */
export default function QuestionView({ q, onAnswer }: { q: Question; onAnswer: OnAnswer }) {
  switch (q.kind) {
    case 'choice':
      return <ChoiceView q={q} onAnswer={onAnswer} />
    case 'spell':
      return <SpellView q={q} onAnswer={onAnswer} />
    case 'match':
      return <MatchView q={q} onAnswer={onAnswer} />
  }
}
