// Quiz question types, their difficulty level and the copy shown on the home screen.

export type QuestionType =
  | 'listen'
  | 'picture'
  | 'trueFalse'
  | 'blank'
  | 'pos'
  | 'scramble'
  | 'spell'
  | 'match'
  | 'oddOneOut'

export type Level = 'basic' | 'advanced'

export interface QuestionTypeInfo {
  id: QuestionType
  level: Level
  title: string
  hint: string
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  // Basic: listen / look and choose; little reading.
  { id: 'listen', level: 'basic', title: 'Listen and choose', hint: 'Hear a word, tap the word you heard' },
  { id: 'picture', level: 'basic', title: 'Picture', hint: 'Look at the picture, tap the right word' },
  { id: 'trueFalse', level: 'basic', title: 'True or false', hint: 'Does the word match the picture or sound?' },
  { id: 'blank', level: 'basic', title: 'Fill in the blank', hint: 'Choose the word that completes the sentence' },
  // Advanced: grammar, spelling, more reading.
  { id: 'pos', level: 'advanced', title: 'Part of speech', hint: 'Noun, verb, adjective or adverb?' },
  { id: 'scramble', level: 'advanced', title: 'Unscramble', hint: 'Tap the letters in the right order' },
  { id: 'spell', level: 'advanced', title: 'Listen and spell', hint: 'Hear a word, spell it with letter tiles' },
  { id: 'match', level: 'advanced', title: 'Match', hint: 'Match each word to its sentence' },
  { id: 'oddOneOut', level: 'advanced', title: 'Odd one out', hint: 'Find the word that is a different kind' },
]

export const LEVELS: { id: Level; title: string }[] = [
  { id: 'basic', title: 'Basic' },
  { id: 'advanced', title: 'Advanced' },
]

export const DEFAULT_TYPES: QuestionType[] = QUESTION_TYPES.filter((t) => t.level === 'basic').map((t) => t.id)
