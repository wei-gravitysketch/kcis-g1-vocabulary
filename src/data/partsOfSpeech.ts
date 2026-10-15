// Part of speech per word: 'noun' | 'verb' | 'adj' | 'adv'.
// Words not listed here (pronouns, prepositions, numbers, modals, ...) are never
// asked in the part-of-speech question. One primary part of speech per word.
export type PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv'

export const POS_LABELS: Record<PartOfSpeech, string> = {
  noun: 'Noun',
  verb: 'Verb',
  adj: 'Adjective',
  adv: 'Adverb',
}

export const partsOfSpeech: Record<string, PartOfSpeech> = {
  // Term 1
  community: 'noun',
  garden: 'noun',
  plant: 'noun',
  neighbors: 'noun',
  help: 'verb',
  apartment: 'noun',
  brick: 'noun',
  stores: 'noun',

  center: 'noun',
  meet: 'verb',
  pieces: 'noun',
  wooden: 'adj',
  gourd: 'noun',
  beads: 'noun',
  join: 'verb',
  instrument: 'noun',

  compare: 'verb',
  alike: 'adj',
  contrast: 'verb',
  different: 'adj',
  act: 'verb',
  visualize: 'verb',

  up: 'adv',
  have: 'verb',

  crosswalk: 'noun',
  lines: 'noun',
  safe: 'adj',
  place: 'noun',
  cross: 'verb',
  first: 'adj',
  guard: 'noun',
  walk: 'verb',

  pictures: 'noun',
  wait: 'verb',
  person: 'noun',

  'informational text': 'noun',
  title: 'noun',
  'text features': 'noun',
  label: 'noun',
  heading: 'noun',
  support: 'verb',

  are: 'verb',
  was: 'verb',
  look: 'verb',

  // Term 2
  eat: 'verb',
  dig: 'verb',
  den: 'noun',
  sleep: 'verb',
  winter: 'noun',
  chill: 'noun',
  snowfalls: 'noun',

  spring: 'noun',
  summer: 'noun',
  coat: 'noun',
  brown: 'adj',
  blend: 'verb',
  dirt: 'noun',
  burrow: 'noun',
  icy: 'adj',

  elements: 'noun',
  poetry: 'noun',
  rhythm: 'noun',
  understanding: 'noun',
  details: 'noun',

  too: 'adv',
  goes: 'verb',
  make: 'verb',

  bigger: 'adj',
  shoes: 'noun',
  big: 'adj',
  race: 'noun',
  fast: 'adj',
  running: 'verb',
  small: 'adj',
  superfast: 'adj',

  need: 'verb',
  new: 'adj',
  points: 'noun',
  maybe: 'adv',

  drama: 'noun',
  play: 'noun',
  characters: 'noun',
  setting: 'noun',
  dialogue: 'noun',
  inferences: 'noun',

  ride: 'verb',
  part: 'noun',
}
