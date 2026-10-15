import { vocabulary } from '../data/vocabulary.js'
import { partsOfSpeech } from '../data/partsOfSpeech.js'
import { sentences } from '../data/sentences.js'

export const POS_CHOICES = ['noun', 'verb', 'adj', 'adv']
export const BLANK = '_____'

export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickOne = (list) => list[Math.floor(Math.random() * list.length)]
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const allWords = [...new Set(vocabulary.flatMap((t) => t.groups.flatMap((g) => g.words)))]

export const getTerm = (termId) => vocabulary.find((t) => t.id === termId)

/** Unique words (library order) of the chosen groups. */
export function collectWords(termId, groupIds) {
  const term = getTerm(termId)
  if (!term) return []
  const words = term.groups.filter((g) => groupIds.includes(g.id)).flatMap((g) => g.words)
  return [...new Set(words)]
}

export const hasBlank = (word) => (sentences[word]?.length ?? 0) > 0
export const hasPos = (word) => word in partsOfSpeech

/** Replace the target word in a sentence with a blank. */
export function blankOut(sentence, word) {
  const re = new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?![A-Za-z])`, 'gi')
  return sentence.replace(re, `$1${BLANK}`)
}

function blankQuestion(word) {
  const sentence = pickOne(sentences[word])
  const pool = allWords.filter((w) => w !== word && !new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i').test(sentence))
  const options = shuffle([word, ...shuffle(pool).slice(0, 3)])
  return { kind: 'blank', word, sentence, prompt: blankOut(sentence, word), options, answer: word }
}

function posQuestion(word) {
  return { kind: 'pos', word, options: POS_CHOICES, answer: partsOfSpeech[word] }
}

/**
 * Build the question list: one question per word, each word asked exactly once.
 * `types` is a subset of ['blank', 'pos']; words that cannot be asked are skipped.
 */
export function buildQuestions(words, types) {
  const questions = []
  for (const word of words) {
    const eligible = types.filter((t) => (t === 'blank' ? hasBlank(word) : hasPos(word)))
    if (eligible.length === 0) continue
    questions.push(pickOne(eligible) === 'blank' ? blankQuestion(word) : posQuestion(word))
  }
  return questions
}

export function countQuestions(words, types) {
  return words.filter((w) => types.some((t) => (t === 'blank' ? hasBlank(w) : hasPos(w)))).length
}

export const randomSentence = (word) => (hasBlank(word) ? pickOne(sentences[word]) : null)
