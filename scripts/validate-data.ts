// Validates the content in src/data. Run with `npm run validate`.
import { vocabulary } from '../src/data/vocabulary'
import { partsOfSpeech } from '../src/data/partsOfSpeech'
import { sentences } from '../src/data/sentences'
import { pictures } from '../src/data/pictures'
import { grammarSentences } from '../src/data/grammarSentences'
import { parseSentence, type TaggedSentence, type WordKind } from '../src/lib/grammar'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const MIN_SENTENCES = 10
const VALID_POS = new Set<string>(['noun', 'verb', 'adj', 'adv'])
const errors: string[] = []

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ids = new Set<string>()
const words = new Set<string>()
for (const term of vocabulary) {
  if (ids.has(term.id)) errors.push(`duplicate id: ${term.id}`)
  ids.add(term.id)
  for (const group of term.groups) {
    if (ids.has(group.id)) errors.push(`duplicate id: ${group.id}`)
    ids.add(group.id)
    group.words.forEach((w) => words.add(w))
  }
}

for (const word of words) {
  const list = sentences[word]
  if (!list) {
    errors.push(`"${word}": no sentences`)
    continue
  }
  if (new Set(list).size !== list.length) errors.push(`"${word}": duplicate sentences`)
  if (list.length < MIN_SENTENCES) errors.push(`"${word}": ${list.length} sentences (need ${MIN_SENTENCES})`)
  const re = new RegExp(`(^|[^A-Za-z])${escapeRegExp(word)}(?![A-Za-z])`, 'i')
  for (const s of list) {
    if (!re.test(s)) errors.push(`"${word}": sentence does not contain the word: ${s}`)
  }
}

for (const [word, pos] of Object.entries(partsOfSpeech)) {
  if (!words.has(word)) errors.push(`partsOfSpeech: "${word}" is not in the vocabulary`)
  if (!VALID_POS.has(pos)) errors.push(`partsOfSpeech: "${word}" has invalid value "${pos}"`)
}
const seenPictures = new Map<string, string>()
for (const [word, picture] of Object.entries(pictures)) {
  if (!words.has(word)) errors.push(`pictures: "${word}" is not in the vocabulary`)
  if (!/^\/pictures\/[a-z]+\.png$/.test(picture)) errors.push(`pictures: "${word}" is not a PNG path`)
  if (!existsSync(resolve('public', picture.slice(1)))) errors.push(`pictures: "${word}" image does not exist: ${picture}`)
  const other = seenPictures.get(picture)
  if (other) errors.push(`pictures: "${word}" and "${other}" share the same picture`)
  seenPictures.set(picture, word)
}

for (const word of Object.keys(sentences)) {
  if (!words.has(word)) errors.push(`sentences: "${word}" is not in the vocabulary`)
}

// ----- Parts of Speech sentence bank -----
const MIN_GRAMMAR_SENTENCES = 200
// Untagged words must be one of these (they are never an answer). Add a word here only if
// a 6-year-old could not mistake it for a noun, verb, adjective or article.
const OTHER_WORDS = new Set([
  'and', 'in', 'on', 'under', 'at', 'to', 'with', 'into', 'near', 'by', 'from', 'over',
  'behind', 'around', 'across', 'after', 'for', 'of',
])
const VOWEL = /^[aeiou]/i

if (grammarSentences.length < MIN_GRAMMAR_SENTENCES)
  errors.push(`grammar: ${grammarSentences.length} sentences (need ${MIN_GRAMMAR_SENTENCES})`)
const grammarTexts = new Set<string>()
const kindOf = new Map<string, { kind: WordKind | null; sentence: string }>()
const kindCounts = new Map<WordKind, number>()
for (const raw of grammarSentences) {
  let sentence: TaggedSentence
  try {
    sentence = parseSentence(raw)
  } catch (e) {
    errors.push(`grammar: ${(e as Error).message}`)
    continue
  }
  const { tokens, text } = sentence
  if (grammarTexts.has(text.toLowerCase())) errors.push(`grammar: duplicate sentence: ${text}`)
  grammarTexts.add(text.toLowerCase())
  if (!/^[A-Z]/.test(text)) errors.push(`grammar: must start with a capital letter: ${text}`)
  if (!tokens.some((t) => t.kind === 'noun') || !tokens.some((t) => t.kind === 'verb'))
    errors.push(`grammar: not a complete sentence (needs a noun and a verb): ${text}`)
  tokens.forEach((t, i) => {
    const word = t.text.toLowerCase()
    if (t.kind === null && !OTHER_WORDS.has(word)) errors.push(`grammar: "${t.text}" has no tag: ${text}`)
    const isArticle = word === 'a' || word === 'an' || word === 'the'
    if (isArticle !== (t.kind === 'article')) errors.push(`grammar: "${t.text}" tagged wrongly: ${text}`)
    const next = tokens[i + 1]?.text ?? ''
    if (word === 'a' && VOWEL.test(next)) errors.push(`grammar: "a ${next}" should be "an": ${text}`)
    if (word === 'an' && !VOWEL.test(next)) errors.push(`grammar: "an ${next}" should be "a": ${text}`)
    const seen = kindOf.get(word)
    if (seen && seen.kind !== t.kind)
      errors.push(`grammar: "${word}" is tagged ${t.kind ?? 'other'} here but ${seen.kind ?? 'other'} in "${seen.sentence}": ${text}`)
    if (!seen) kindOf.set(word, { kind: t.kind, sentence: text })
  })
  for (const kind of new Set(tokens.map((t) => t.kind))) if (kind) kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(
  `OK: ${words.size} words, ${Object.keys(partsOfSpeech).length} with part of speech, ${Object.keys(pictures).length} with a picture`,
)
console.log(
  `OK: ${grammarSentences.length} grammar sentences (with ${[...kindCounts].map(([k, n]) => `${k}: ${n}`).join(', ')})`,
)
