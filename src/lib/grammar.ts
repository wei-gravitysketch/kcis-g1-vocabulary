// Parts of Speech test: parse the tagged sentence bank and build questions.
// Each question shows one sentence and asks for every word of one kind (noun, verb,
// adjective or article). There may be one or several answers; the child is not told how many.

import { grammarSentences } from '../data/grammarSentences'
import { shuffle } from './shuffle'

export type WordKind = 'noun' | 'verb' | 'adj' | 'article'

export const WORD_KINDS: WordKind[] = ['noun', 'verb', 'adj', 'article']

/** Tag used in the sentence bank -> kind. */
export const TAGS: Record<string, WordKind> = { n: 'noun', v: 'verb', adj: 'adj', art: 'article' }

export const KIND_LABELS: Record<WordKind, { one: string; many: string }> = {
  noun: { one: 'noun', many: 'nouns' },
  verb: { one: 'verb', many: 'verbs' },
  adj: { one: 'adjective', many: 'adjectives' },
  article: { one: 'article', many: 'articles' },
}

export const QUESTION_COUNTS = [5, 10, 20, 30] as const
export type QuestionCount = (typeof QUESTION_COUNTS)[number]

export interface Token {
  text: string
  /** null: another kind of word (in, on, and, ...), never an answer. */
  kind: WordKind | null
}

export interface TaggedSentence {
  tokens: Token[]
  /** Final punctuation: "." or "!" */
  end: string
  /** The plain sentence, e.g. "The big dog runs in the park." */
  text: string
}

export interface GrammarQuestion {
  /** Index of the sentence in the bank. */
  id: number
  sentence: TaggedSentence
  kind: WordKind
  /** Indexes of the tokens that are of `kind`. */
  answer: number[]
}

/** Parse "The/art big/adj dog/n runs/v." Throws on markup it does not understand. */
export function parseSentence(raw: string): TaggedSentence {
  const m = /^(.+?)([.!])$/.exec(raw)
  if (!m) throw new Error(`must end with . or !: ${raw}`)
  const tokens = m[1].split(' ').map((part): Token => {
    const t = /^([A-Za-z]+)(?:\/([a-z]+))?$/.exec(part)
    if (!t) throw new Error(`bad word "${part}" in: ${raw}`)
    const [, text, tag] = t
    if (tag !== undefined && !Object.hasOwn(TAGS, tag)) throw new Error(`unknown tag "${tag}" in: ${raw}`)
    return { text, kind: tag === undefined ? null : TAGS[tag] }
  })
  return { tokens, end: m[2], text: tokens.map((t) => t.text).join(' ') + m[2] }
}

// A sentence with bad markup is left out here (`npm run validate` reports it).
export const grammarBank: TaggedSentence[] = grammarSentences.flatMap((raw) => {
  try {
    return [parseSentence(raw)]
  } catch {
    return []
  }
})

const question = (id: number, kind: WordKind): GrammarQuestion => {
  const sentence = grammarBank[id]
  const answer = sentence.tokens.flatMap((t, i) => (t.kind === kind ? [i] : []))
  return { id, sentence, kind, answer }
}

/**
 * `count` questions on different sentences. The kinds take turns (all four in random order,
 * then again) so every test mixes nouns, verbs, adjectives and articles evenly.
 */
export function buildGrammarQuestions(count: number): GrammarQuestion[] {
  const kinds: WordKind[] = []
  while (kinds.length < count) {
    let round = shuffle(WORD_KINDS)
    if (round[0] === kinds.at(-1)) round = round.reverse()
    kinds.push(...round)
  }
  const pool = shuffle(grammarBank.map((_, id) => id))
  const questions: GrammarQuestion[] = []
  for (const kind of kinds.slice(0, count)) {
    const i = pool.findIndex((id) => grammarBank[id].tokens.some((t) => t.kind === kind))
    if (i >= 0) questions.push(question(pool.splice(i, 1)[0], kind))
  }
  return questions
}

export const isCorrect = (q: GrammarQuestion, picked: readonly number[]) =>
  picked.length === q.answer.length && q.answer.every((i) => picked.includes(i))

export const answerWords = (q: GrammarQuestion) => q.answer.map((i) => q.sentence.tokens[i].text)
