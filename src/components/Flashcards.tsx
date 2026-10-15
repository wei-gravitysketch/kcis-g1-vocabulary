import { useMemo, useState } from 'react'
import { POS_LABELS, partsOfSpeech } from '../data/partsOfSpeech'
import { pickCelebration, pickOops, pickPraise, playSceneSound, type SceneKind } from '../lib/celebrations'
import { canAsk, randomSentence, spellQuestion, type SpellQuestion } from '../lib/session'
import Celebration from './Celebration'
import SpellView from './quiz/SpellView'
import type { Outcome } from './quiz/types'
import Shell, { BigButton } from './Shell'
import SpeakButton from './SpeakButton'

/** Practice spelling the current card's word (unscramble), right from the flashcard. Not scored. */
function SpellingChallenge({ word, onBack }: { word: string; onBack: () => void }) {
  const [q, setQ] = useState<SpellQuestion>(() => spellQuestion(word, 'scramble'))
  const [attempt, setAttempt] = useState(0)
  const [outcome, setOutcome] = useState<(Outcome & { praise: string }) | null>(null)
  const [scene, setScene] = useState<{ kind: SceneKind; id: number } | null>(null)

  const onAnswer = (o: Outcome) => {
    setOutcome({ ...o, praise: o.correct ? pickPraise() : '' })
    const kind = o.correct ? pickCelebration() : pickOops()
    setScene({ kind, id: Date.now() })
    playSceneSound(kind)
  }

  const retry = () => {
    setQ(spellQuestion(word, 'scramble'))
    setAttempt((a) => a + 1)
    setOutcome(null)
  }

  return (
    <>
      <SpellView key={attempt} q={q} onAnswer={onAnswer} />
      <div className="flex min-h-16 items-center justify-between gap-4">
        <p className={`text-xl font-bold ${outcome?.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
          {outcome && (outcome.correct ? `🎉 ${outcome.praise}` : outcome.message)}
        </p>
        {outcome && (
          <div className="flex w-44 shrink-0">
            <BigButton tone="light" onClick={retry}>
              Try again
            </BigButton>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mx-auto min-h-11 rounded-xl px-4 text-base font-semibold text-sky-700 active:bg-sky-50"
      >
        ← Back to card
      </button>
      {scene && <Celebration key={scene.id} kind={scene.kind} onDone={() => setScene(null)} />}
    </>
  )
}

export default function Flashcards({
  words,
  onHome,
  onAgain,
}: {
  words: string[]
  onHome: () => void
  onAgain: () => void
}) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [spelling, setSpelling] = useState(false)
  const examples = useMemo(() => words.map(randomSentence), [words])
  const done = index >= words.length

  if (done) {
    return (
      <Shell onHome={onHome} progress={1} label={`${words.length}/${words.length}`}>
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-800">All done!</h2>
          <p className="mt-1 text-lg text-slate-500">You saw {words.length} cards.</p>
        </div>
        <div className="flex gap-3">
          <BigButton tone="light" onClick={onHome}>
            Home
          </BigButton>
          <BigButton onClick={onAgain}>Again</BigButton>
        </div>
      </Shell>
    )
  }

  const word = words[index]
  const pos = partsOfSpeech[word]
  const go = (next: number) => {
    setIndex(next)
    setRevealed(false)
    setSpelling(false)
  }

  return (
    <Shell
      onHome={onHome}
      progress={index / words.length}
      label={`${index + 1}/${words.length}`}
      footer={
        <div className="flex gap-3 pt-2">
          <BigButton tone="light" disabled={index === 0} onClick={() => go(index - 1)}>
            ← Back
          </BigButton>
          <BigButton onClick={() => go(index + 1)}>{index === words.length - 1 ? 'Finish' : 'Next →'}</BigButton>
        </div>
      }
    >
      {spelling ? (
        <SpellingChallenge key={word} word={word} onBack={() => setSpelling(false)} />
      ) : (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setRevealed((r) => !r)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRevealed((r) => !r)}
            className="flex min-h-[22rem] cursor-pointer flex-col items-center justify-center gap-6 rounded-[2rem] bg-white p-6 text-center shadow-md ring-1 ring-slate-200 select-none"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl leading-tight font-extrabold break-words text-sky-700 sm:text-7xl">{word}</span>
              <SpeakButton text={word} label={`Listen to ${word}`} />
            </div>
            {revealed ? (
              <div className="flex flex-col items-center gap-2">
                {pos && (
                  <span className="rounded-full bg-amber-100 px-4 py-1 text-lg font-semibold text-amber-800">
                    {POS_LABELS[pos]}
                  </span>
                )}
                {examples[index] && <p className="text-xl text-slate-600">{examples[index]}</p>}
              </div>
            ) : (
              <p className="text-slate-400">Tap the card to see more</p>
            )}
          </div>
          {canAsk(word, 'scramble') && (
            <button
              type="button"
              onClick={() => setSpelling(true)}
              className="mx-auto min-h-11 rounded-xl px-4 text-base font-semibold text-sky-700 active:bg-sky-50"
            >
              ✏️ Spelling challenge
            </button>
          )}
        </>
      )}
    </Shell>
  )
}
