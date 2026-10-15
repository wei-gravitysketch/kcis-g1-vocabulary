import type { AnswerResult } from '../../lib/session'

/** What a question view reports once the child has finished answering it. */
export interface Outcome {
  results: AnswerResult[]
  correct: boolean
  /** Shown when the answer was wrong, e.g. "Answer: garden". */
  message: string
}

export type OnAnswer = (outcome: Outcome) => void
