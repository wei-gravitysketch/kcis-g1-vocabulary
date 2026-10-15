// Validates the content in src/data. Run with `npm run validate`.
import { vocabulary } from '../src/data/vocabulary'
import { partsOfSpeech } from '../src/data/partsOfSpeech'
import { sentences } from '../src/data/sentences'
import { pictures } from '../src/data/pictures'

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
for (const [word, emoji] of Object.entries(pictures)) {
  if (!words.has(word)) errors.push(`pictures: "${word}" is not in the vocabulary`)
  const other = seenPictures.get(emoji)
  if (other) errors.push(`pictures: "${word}" and "${other}" share the same picture ${emoji}`)
  seenPictures.set(emoji, word)
}

for (const word of Object.keys(sentences)) {
  if (!words.has(word)) errors.push(`sentences: "${word}" is not in the vocabulary`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(
  `OK: ${words.size} words, ${Object.keys(partsOfSpeech).length} with part of speech, ${Object.keys(pictures).length} with a picture`,
)
