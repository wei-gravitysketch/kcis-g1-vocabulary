import { vocabulary } from '../data/vocabulary'
import { partsOfSpeech, type PartOfSpeech } from '../data/partsOfSpeech'
import { pictures } from '../data/pictures'
import { sentences } from '../data/sentences'
import type { QuestionType } from './questionTypes'
import { canSpeak } from './speak'

export type { QuestionType } from './questionTypes'
export type Mode = 'flashcards' | 'quiz'
export type Order = 'sequential' | 'shuffle'

export interface SessionConfig {
  termId: string
  groupIds: string[]
  mode: Mode
  types: QuestionType[]
  order: Order
}

/** Every question type where the child taps one of several options. */
export interface ChoiceQuestion {
  kind: 'choice'
  type: 'listen' | 'picture' | 'trueFalse' | 'blank' | 'pos' | 'oddOneOut'
  word: string
  options: string[]
  answer: string
  /** blank: the full sentence and the blanked prompt. */
  sentence?: string
  prompt?: string
  /** picture / trueFalse (picture variant): the emoji to show. */
  picture?: string
  /** trueFalse: the word shown to the child (the target word, or a different one). */
  shown?: string
  /** listen / trueFalse (listen variant): the text read aloud. */
  audio?: string
}

/** Build the word from letter tiles. scramble = the word's letters; spell = audio only + decoys. */
export interface SpellQuestion {
  kind: 'spell'
  type: 'scramble' | 'spell'
  word: string
  tiles: string[]
}

export interface MatchPair {
  word: string
  sentence: string
  prompt: string
  /** Filler pairs (added when too few words are left) do not count in the score. */
  scored: boolean
}

export interface MatchQuestion {
  kind: 'match'
  type: 'match'
  pairs: MatchPair[]
}

export type Question = ChoiceQuestion | SpellQuestion | MatchQuestion

export interface AnswerResult {
  word: string
  correct: boolean
}

export const POS_CHOICES: PartOfSpeech[] = ['noun', 'verb', 'adj', 'adv']
export const BLANK = '_____'
const MATCH_SIZE = 4
const MATCH_MIN = 3

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
const containsWord = (text: string, word: string) =>
  new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?![A-Za-z])`, 'i').test(text)

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
export const hasPicture = (word: string) => word in pictures
const isSingleWord = (word: string) => /^[a-z]+$/i.test(word)

/** Whether `word` can be asked with question `type` (depends on its data and on speech support). */
export function canAsk(word: string, type: QuestionType): boolean {
  switch (type) {
    case 'listen':
      return canSpeak
    case 'picture':
      return hasPicture(word)
    case 'trueFalse':
      return canSpeak || hasPicture(word)
    case 'blank':
    case 'match':
      return hasBlank(word)
    case 'pos':
    case 'oddOneOut':
      return hasPos(word)
    case 'scramble':
      return isSingleWord(word)
    case 'spell':
      return canSpeak && isSingleWord(word)
  }
}

/** Replace the target word in a sentence with a blank. */
export function blankOut(sentence: string, word: string): string {
  const re = new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?![A-Za-z])`, 'gi')
  return sentence.replace(re, `$1${BLANK}`)
}

/** `n` random words other than `word`, skipping any rejected by `reject`. */
function distractors(word: string, n: number, reject: (w: string) => boolean = () => false): string[] {
  return shuffle(allWords.filter((w) => w !== word && !reject(w))).slice(0, n)
}

const choiceWithWords = (type: ChoiceQuestion['type'], word: string, extra: Partial<ChoiceQuestion> = {}): ChoiceQuestion => ({
  kind: 'choice',
  type,
  word,
  answer: word,
  options: shuffle([word, ...distractors(word, 3)]),
  ...extra,
})

function blankQuestion(word: string): ChoiceQuestion {
  const sentence = pickOne(sentences[word])
  return {
    kind: 'choice',
    type: 'blank',
    word,
    sentence,
    prompt: blankOut(sentence, word),
    answer: word,
    options: shuffle([word, ...distractors(word, 3, (w) => containsWord(sentence, w))]),
  }
}

function trueFalseQuestion(word: string): ChoiceQuestion {
  const variants = [hasPicture(word) && 'picture', canSpeak && 'listen'].filter(Boolean)
  const variant = pickOne(variants)
  const isTrue = Math.random() < 0.5
  const shown = isTrue ? word : distractors(word, 1)[0]
  return {
    kind: 'choice',
    type: 'trueFalse',
    word,
    shown,
    answer: isTrue ? 'yes' : 'no',
    options: ['yes', 'no'],
    ...(variant === 'picture' ? { picture: pictures[word] } : { audio: word }),
  }
}

/** Three words of one part of speech plus the target, which has a different one. */
function oddOneOutQuestion(word: string): ChoiceQuestion {
  const pos = partsOfSpeech[word]
  const groups = POS_CHOICES.filter((p) => p !== pos)
    .map((p) => allWords.filter((w) => w !== word && partsOfSpeech[w] === p))
    .filter((g) => g.length >= 3)
  const same = shuffle(pickOne(groups)).slice(0, 3)
  return { kind: 'choice', type: 'oddOneOut', word, answer: word, options: shuffle([word, ...same]) }
}

export function spellQuestion(word: string, type: SpellQuestion['type']): SpellQuestion {
  const letters = word.toLowerCase().split('')
  if (type === 'spell') {
    const decoys = Array.from({ length: 3 }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)])
    return { kind: 'spell', type, word, tiles: shuffle([...letters, ...decoys]) }
  }
  let tiles = shuffle(letters)
  for (let i = 0; i < 5 && letters.length > 1 && tiles.join('') === letters.join(''); i++) tiles = shuffle(letters)
  return { kind: 'spell', type, word, tiles }
}

function matchQuestion(words: string[]): MatchQuestion {
  const fillers = distractors(words[0], Math.max(0, MATCH_MIN - words.length), (w) => words.includes(w) || !hasBlank(w))
  const pairs = [...words.map((w) => ({ w, scored: true })), ...fillers.map((w) => ({ w, scored: false }))].map(
    ({ w, scored }) => {
      const sentence = pickOne(sentences[w])
      return { word: w, sentence, prompt: blankOut(sentence, w), scored }
    },
  )
  return { kind: 'match', type: 'match', pairs }
}

function buildOne(word: string, type: Exclude<QuestionType, 'match'>): Question {
  switch (type) {
    case 'listen':
      return choiceWithWords('listen', word, { audio: word })
    case 'picture':
      return choiceWithWords('picture', word, { picture: pictures[word] })
    case 'trueFalse':
      return trueFalseQuestion(word)
    case 'blank':
      return blankQuestion(word)
    case 'pos':
      return { kind: 'choice', type: 'pos', word, options: POS_CHOICES, answer: partsOfSpeech[word] }
    case 'oddOneOut':
      return oddOneOutQuestion(word)
    case 'scramble':
    case 'spell':
      return spellQuestion(word, type)
  }
}

/**
 * Build the question list. Each word is asked exactly once, with a type picked at random
 * among the chosen types it supports; words that support none are skipped.
 * Words given the "match" type are grouped (up to 4) into one matching question.
 */
export function buildQuestions(words: readonly string[], types: readonly QuestionType[]): Question[] {
  const questions: Question[] = []
  let matchGroup: string[] = []
  for (const word of words) {
    const eligible = types.filter((t) => canAsk(word, t))
    if (eligible.length === 0) continue
    const type = pickOne(eligible)
    if (type === 'match') {
      matchGroup.push(word)
      if (matchGroup.length === MATCH_SIZE) {
        questions.push(matchQuestion(matchGroup))
        matchGroup = []
      }
    } else {
      questions.push(buildOne(word, type))
    }
  }
  if (matchGroup.length) questions.push(matchQuestion(matchGroup))
  return questions
}

/** Number of words that can be asked with at least one of the chosen types. */
export function countAskable(words: readonly string[], types: readonly QuestionType[]): number {
  return words.filter((w) => types.some((t) => canAsk(w, t))).length
}

export const randomSentence = (word: string): string | null => (hasBlank(word) ? pickOne(sentences[word]) : null)
