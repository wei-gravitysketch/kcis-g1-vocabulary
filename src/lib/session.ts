import { vocabulary } from '../data/vocabulary'
import { partsOfSpeech, type PartOfSpeech } from '../data/partsOfSpeech'
import { sentences } from '../data/sentences'

export type QuestionType = 'blank' | 'pos'
export type Mode = 'flashcards' | 'quiz'
export type Order = 'sequential' | 'shuffle'

export interface SessionConfig {
  termId: string
  groupIds: string[]
  mode: Mode
  types: QuestionType[]
  order: Order
}

export interface BlankQuestion {
  kind: 'blank'
  word: string
  sentence: string
  prompt: string
  options: string[]
  answer: string
}

export interface PosQuestion {
  kind: 'pos'
  word: string
  options: PartOfSpeech[]
  answer: PartOfSpeech
}

export type Question = BlankQuestion | PosQuestion

export interface AnswerResult {
  word: string
  correct: boolean
}

export const POS_CHOICES: PartOfSpeech[] = ['noun', 'verb', 'adj', 'adv']
export const BLANK = '_____'

export function shuffle<T>(list: readonly T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickOne = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const allWords = [...new Set(vocabulary.flatMap((t) => t.groups.flatMap((g) => g.words)))]

export const getTerm = (termId: string) => vocabulary.find((t) => t.id === termId)

/** Unique words (library order) of the chosen groups. */
export function collectWords(termId: string, groupIds: readonly string[]): string[] {
  const term = getTerm(termId)
  if (!term) return []
  const words = term.groups.filter((g) => groupIds.includes(g.id)).flatMap((g) => g.words)
  return [...new Set(words)]
}

export const hasBlank = (word: string) => (sentences[word]?.length ?? 0) > 0
export const hasPos = (word: string) => word in partsOfSpeech

const canAsk = (word: string, type: QuestionType) => (type === 'blank' ? hasBlank(word) : hasPos(word))

/** Replace the target word in a sentence with a blank. */
export function blankOut(sentence: string, word: string): string {
  const re = new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?![A-Za-z])`, 'gi')
  return sentence.replace(re, `$1${BLANK}`)
}

function blankQuestion(word: string): BlankQuestion {
  const sentence = pickOne(sentences[word])
  const pool = allWords.filter((w) => w !== word && !new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i').test(sentence))
  const options = shuffle([word, ...shuffle(pool).slice(0, 3)])
  return { kind: 'blank', word, sentence, prompt: blankOut(sentence, word), options, answer: word }
}

function posQuestion(word: string): PosQuestion {
  return { kind: 'pos', word, options: POS_CHOICES, answer: partsOfSpeech[word] }
}

/**
 * Build the question list: one question per word, each word asked exactly once.
 * Words that cannot be asked with any of the chosen types are skipped.
 */
export function buildQuestions(words: readonly string[], types: readonly QuestionType[]): Question[] {
  const questions: Question[] = []
  for (const word of words) {
    const eligible = types.filter((t) => canAsk(word, t))
    if (eligible.length === 0) continue
    questions.push(pickOne(eligible) === 'blank' ? blankQuestion(word) : posQuestion(word))
  }
  return questions
}

export function countQuestions(words: readonly string[], types: readonly QuestionType[]): number {
  return words.filter((w) => types.some((t) => canAsk(w, t))).length
}

export const randomSentence = (word: string): string | null => (hasBlank(word) ? pickOne(sentences[word]) : null)
