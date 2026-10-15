// Vocabulary library: Term -> group (Week / My Words to Know) -> words.
// Names are free-form. Ids must be unique. See AGENT.md.
export interface WordGroup {
  id: string
  name: string
  words: string[]
}

export interface Term {
  id: string
  name: string
  groups: WordGroup[]
}

export const vocabulary: Term[] = [
  {
    id: 'term1',
    name: 'Term 1',
    groups: [
      {
        id: 't1-w1',
        name: 'Week 1',
        words: ['community', 'garden', 'plant', 'neighbors', 'help', 'apartment', 'brick', 'stores'],
      },
      {
        id: 't1-w2',
        name: 'Week 2',
        words: ['center', 'meet', 'pieces', 'wooden', 'gourd', 'beads', 'join', 'instrument'],
      },
      {
        id: 't1-w3',
        name: 'Week 3',
        words: ['compare', 'alike', 'contrast', 'different', 'act', 'visualize'],
      },
      {
        id: 't1-mw4',
        name: 'My Words to Know (Week 4)',
        words: ['up', 'two', 'that', 'have', 'they'],
      },
      {
        id: 't1-w5',
        name: 'Week 5',
        words: ['crosswalk', 'lines', 'safe', 'place', 'cross', 'first', 'guard', 'walk'],
      },
      {
        id: 't1-w6',
        name: 'Week 6',
        words: ['pictures', 'wait', 'person'],
      },
      {
        id: 't1-w7',
        name: 'Week 7',
        words: ['informational text', 'title', 'text features', 'label', 'heading', 'support'],
      },
      {
        id: 't1-mw8',
        name: 'My Words to Know (Week 8)',
        words: ['by', 'are', 'was', 'you', 'look'],
      },
    ],
  },
  {
    id: 'term2',
    name: 'Term 2',
    groups: [
      {
        id: 't2-w11',
        name: 'Week 11',
        words: ['eat', 'dig', 'den', 'sleep', 'through', 'winter', 'chill', 'snowfalls'],
      },
      {
        id: 't2-w12',
        name: 'Week 12',
        words: ['spring', 'summer', 'coat', 'brown', 'blend', 'dirt', 'burrow', 'icy'],
      },
      {
        id: 't2-w13',
        name: 'Week 13',
        words: ['elements', 'poetry', 'rhythm', 'understanding', 'details'],
      },
      {
        id: 't2-mw14',
        name: 'My Words to Know (Week 14)',
        words: ['all', 'too', 'her', 'goes', 'make'],
      },
      {
        id: 't2-w15',
        name: 'Week 15',
        words: ['bigger', 'shoes', 'big', 'race', 'fast', 'running', 'small', 'superfast'],
      },
      {
        id: 't2-w16',
        name: 'Week 16',
        words: ['need', 'new', 'points', 'what', 'should', 'maybe', 'help', 'both'],
      },
      {
        id: 't2-w17',
        name: 'Week 17',
        words: ['drama', 'play', 'characters', 'setting', 'dialogue', 'inferences'],
      },
      {
        id: 't2-mw18',
        name: 'My Words to Know (Week 18)',
        words: ['five', 'ride', 'part', 'your'],
      },
    ],
  },
]
