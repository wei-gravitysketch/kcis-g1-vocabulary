# KCIS Grade 1 Vocabulary Cards — Project Spec

A static, mobile-first website of English vocabulary flashcards and quizzes for
Grade 1 students (age ~6) at 康橋國小. Used mainly on **iPad and phones**; must be
installable via **Add to Home Screen**. It holds two tests, switched with the menu (☰):
- **Vocabulary** — `/kcis-g1-vocabulary/` (`index.html`): flashcards + vocabulary quiz.
- **Parts of Speech** — `/kcis-g1-vocabulary/parts-of-speech/` (`parts-of-speech/index.html`):
  find the nouns / verbs / adjectives / articles in a sentence. Personal project: commit straight to `main`,
no PRs. Every push to `main` deploys to GitHub Pages
(https://wei-gravitysketch.github.io/kcis-g1-vocabulary/).

## Stack
- Vite + React + **TypeScript** (strict; no router, no backend) + Tailwind CSS v4.
  Each test is its own HTML page (Vite multi-page build), so every route is a real file on
  GitHub Pages; pages link to each other with plain `<a href>`.
- All source is `.ts` / `.tsx`; no `.js` files in `src/` or `scripts/`. `tsc` type-checks only
  (`noEmit`); Vite does the bundling.
- `vite.config.ts` `base` must equal `/<repo-name>/` (currently `/kcis-g1-vocabulary/`).
- Deploy: `.github/workflows/deploy.yml` (validates data, type-checks + builds, publishes `dist`).
- Commands: `npm run dev`, `npm run build` (= `tsc && vite build`), `npm run typecheck`,
  `npm run validate` (runs `scripts/validate-data.ts` via `tsx`).

## Design principles
- Clean and simple; large tap targets (>= 56px), large type, high contrast, child-friendly.
- Responsive: phone portrait through iPad landscape. Respect iOS safe areas
  (`viewport-fit=cover`, `env(safe-area-inset-*)`). Use `min-h-dvh`.
- No hover-only interactions. No external network resources (fonts, CDNs).
- UI language is English (kids' vocabulary). Keep UI text minimal.

## Data model (all content lives in `src/data/`, never hard-code in components)
Three-level hierarchy; the **names of every level are free-form strings**:
`Term -> Week / "My Words to Know" (group) -> vocabulary (word)`.

- `src/data/vocabulary.ts` — the vocabulary library, pure config, easy to extend:
  `Term[]` = `[{ id, name, groups: [{ id, name, words: string[] }] }]`.
  Ids must be unique. A word may appear in several groups (it is de-duplicated within a
  session). Multi-word entries (e.g. "text features") are allowed.
- `src/data/partsOfSpeech.ts` — `Record<string, PartOfSpeech>`, `PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv'`. Words that
  are not one of these (pronouns, prepositions, determiners, numbers, modals...) are
  **omitted** and are never asked in the part-of-speech question. One primary part of
  speech per word; the example sentences should use that sense.
- `src/data/sentences.ts` — the sentence bank: `Record<string, string[]>` (word -> full sentences).
  Sentences are stored **complete** (containing the word exactly as spelled in the
  vocabulary entry); the blank is produced at runtime. **Each word needs >= 10
  sentences**, beginner level (6-year-old reader: short, concrete, simple words), and
  the bank can be extended freely (more sentences per word are fine). Avoid putting
  "a/an" directly before the target word when avoidable (it leaks/contradicts the
  answer), and make the sentence have a clear single answer.
- `src/data/pictures.ts` — `Record<string, string>` (word -> one emoji), used by the Picture and
  True-or-false questions (not flashcards). Only words that one picture shows clearly; others are never asked with a picture. Emoji must be unique.
- `src/data/grammarSentences.ts` — the Parts of Speech sentence bank (`string[]`, >= 200).
  Each noun / verb / adjective / article carries a tag after a slash:
  `'The/art big/adj dog/n runs/v in the/art park/n.'` (`n`, `v`, `adj`, `art`). Untagged words
  are other kinds of words and never an answer. Sentences need not contain all four kinds but
  must be **complete sentences** (at least one noun and one verb), start with a capital letter
  and end with `.` or `!` (no other punctuation). To keep every answer clear for a 6-year-old,
  avoid words whose kind is arguable: pronouns, possessives (my, his), numbers, is/are, helping
  verbs (can, will), adverbs, -ing forms, and nouns used as adjectives ("school bus"). Names
  (Tom, Mom, Grandma) are nouns. Mix the answer counts (one or several of a kind).
- `scripts/validate-data.ts` (`npm run validate`) enforces: every vocabulary word has
  >= 10 unique sentences that contain the word; POS values are valid; ids unique; picture
  words exist and pictures are unique. For the grammar bank: >= 200 unique sentences that
  parse; capital + end punctuation; a noun and a verb in each; untagged words only from its
  `OTHER_WORDS` list (in, on, and, ...); a word is tagged the same way in every sentence;
  a/an/the are always (and only) articles; "a"/"an" agree with the next word.
  When adding vocabulary, add its sentences + POS (+ picture if it fits) and run validate.

### Current library
Term 1: Week 1, 2, 3, My Words to Know (Week 4), Week 5, 6, 7, My Words to Know (Week 8).
Term 2: Week 11, 12, 13, My Words to Know (Week 14), Week 15, 16, 17, My Words to Know (Week 18).
"My Words to Know" groups are always named `My Words to Know (Week N)`, N being the week they cover.

## Menu (switch tests)
Both home (settings) screens have a round **menu button (☰) at the top right** of the header
(row of the "KCIS Grade 1" kicker, title below). It opens a small panel listing the tests
(📚 Vocabulary, 🔍 Parts of Speech) with the current one marked; tap outside / Escape closes.
It is **not shown while a test is running** (flashcards, quiz, result screens use `Shell`).
Code: `src/components/AppMenu.tsx` (list of pages), shared home layout (header with menu,
numbered `Section`s, `Segmented`, fixed Start bar that primes audio + speech) in
`src/components/HomeLayout.tsx`.

## Home screen (settings)
Header: small kicker "KCIS Grade 1" + title "Vocabulary Practice" + menu button (no subtitle;
home-screen app name "G1 Vocabulary").

1. **Term** — dropdown, single select (Term 1, Term 2, ...). Native arrow hidden; a large
   chevron icon with comfortable right padding is drawn instead.
2. **Word List** — after a term is chosen, show its groups as multi-select toggle chips
   (with Select all / Clear). At least one must be selected. Each chip has a small
   **See words** button on its right that opens a dialog listing that group's words (with
   speak buttons). While the dialog is open the page behind it must not scroll. Below the chips, right-aligned, a small **All words table ↗** link opens
   `words.html` in a new tab.
3. **Mode** (choose one):
   - **Flashcards** — just show the cards.
   - **Quiz** — mixture of question types, as checkboxes grouped by level, each level with
     Select all / Clear. At least one type. **Default: all Basic types.** (Registry with
     titles/hints/levels: `src/lib/questionTypes.ts`.)
     - **Basic** (listen / look, little reading)
       - *Listen and choose*: the word is read aloud (auto + 🔊 button); tap it among 4 words.
       - *Picture*: an emoji picture; tap its word among 4. Only words in `pictures.ts`.
       - *True or false*: picture variant ("Is this “X”?") or listen variant ("Did you hear
         this word?"); answer 👍 Yes / 👎 No; 50% true.
       - *Fill in the blank*: a sentence with the word blanked + 4 options (distractors never
         appear in the sentence). Sentence picked at random from the bank.
     - **Advanced** (grammar, spelling, more reading)
       - *Part of speech*: noun / verb / adjective / adverb. Only words in `partsOfSpeech.ts`.
       - *Unscramble*: the word's letters as shuffled tiles (🔊 hint); tap in order, ⌫ undo.
       - *Listen and spell*: audio only; tiles = letters + 3 decoys.
       - *Match*: up to 4 words matched to their blanked sentences (tap word, then sentence).
         Words given this type are grouped into one question; if fewer than 3 are left,
         unscored filler pairs are added. A word is wrong if it was ever mismatched.
       - *Odd one out*: 4 words, 3 share a part of speech; tap the different one (the target).
         Instructions name the kinds: "(noun, verb, adjective or adverb)".
       Multi-word entries are skipped for the spelling types; audio types need speech support.
     Each word gets one randomly chosen type among the checked types it supports.
4. **Order** — *In order* (library order) or *Shuffle*.
5. **Start** button (disabled until the selection can produce at least one card/question).
   The last selection is remembered in `localStorage`.

## Session behavior
- Words = union of the selected groups, de-duplicated. **Each word appears exactly once**;
  the session walks through the whole set.
- **Flashcards**: big word card with the speak button right beside the word (no picture:
  it gives away too much), tap to reveal part of speech + an example sentence, Previous /
  Next, progress bar, finish screen with Again / Home. Under the card a small
  **✏️ Spelling challenge** link swaps the card for an Unscramble of that word (single-word
  entries only): same celebration/oops scenes as the quiz, *Try again* reshuffles,
  *Back to card* returns. Not scored; moving to another card leaves the challenge.
- **Quiz**: one question per word (a Match question covers several words), progress
  indicator, immediate right/wrong feedback (show the correct answer). The Next button sits
  directly under the question, right-aligned (not pinned to the bottom). Views:
  `src/components/quiz/` (`ChoiceView`, `SpellView`, `MatchView`) report an `Outcome` to
  `Quiz.tsx`, which plays the scene and shows feedback. `Quiz.tsx` is generic (any question
  type, drawn by a `renderQuestion` prop) and shared with the Parts of Speech test. Final
  **result screen** (`Result.tsx`, shared) shows score (per word), accuracy %, the missed words,
  and buttons: *Retry missed words*, *Home*.
- The Start tap primes Web Audio and speech (`primeAudio`, `primeSpeech`) so iOS allows the
  automatic read-aloud of listening questions.
- **Answer scenes**: after every answer a ~2.5 s non-blocking full-screen emoji animation
  plays with a matching sound effect.
  - Correct (15): fireworks, rocket, whale, balloons, rainbow, UFO + alien + planets,
    unicorn, butterflies, fish, party poppers, shooting stars, trophy, dinosaur, bunny,
    flowers.
  - Wrong (3, gentle and cute): peeking monkey 🙈, puzzled puppy 🐶❓, little rain cloud.
  - On a correct answer a praise phrase (15: "Amazing!", "Excellent!", ...) is **shown** as
    the feedback text. It is **not spoken** (the synthesized voice sounded too flat).
  - **No repeats within a round**: scenes, oops scenes and praises each come from a
    "shuffle bag" — every item is used once before any repeats, and a new round never starts
    with the previous round's last item.
  - Code: kinds, praises, picking and sounds in `src/lib/celebrations.ts` (Web Audio API, no
    audio files); scenes in `src/components/Celebration.tsx`; `cel-*` keyframes (including
    reusable motion primitives: across, hop, bob, rise, fall, flutter, pop, grow...) in
    `src/index.css`. Animals moving across the screen move right-to-left because Apple's
    emoji face left. Hidden when the user prefers reduced motion.

## Parts of Speech test (`parts-of-speech/`)
Entry `parts-of-speech/index.html` -> `src/grammar.tsx` -> `src/components/grammar/GrammarApp.tsx`
(home -> quiz -> result). Logic in `src/lib/grammar.ts`; it does not import the vocabulary data
(so this page's bundle stays small).
- **Home**: header "KCIS Grade 1" / "Parts of Speech" + menu; one section **How many
  questions?** — 5 / 10 / 20 / 30 (default 10, remembered in `localStorage`); one line saying
  what the test is; Start button.
- **Question** (`SentenceView.tsx`): "Tap all the nouns." (or verbs / adjectives / articles) and
  the sentence as big word chips (🔊 reads the sentence). The child toggles words, then taps
  **Check** (bottom right, where Next appears afterwards). One or several words may be right;
  **nothing tells how many** (same wording every time). Correct only if the picked set equals
  the answer set exactly. After checking: right picks green, missed answers green dashed, wrong
  picks red struck through; wrong answers show "Answer: dog, park".
- **Building a test**: each question uses a different sentence; the kinds take turns (all four
  in random order, then again) so a test mixes them evenly; a sentence is only asked for a kind
  it contains.
- Same answer scenes, praise, sounds and progress bar as the vocabulary quiz (shared `Quiz`).
- **Result**: shared `Result` screen (Blankie Bear on 100%), "Sentences to practice" lists the
  missed sentences with their kind and the answer words marked; *Retry missed* re-asks them.

## Blankie Bear (被被熊) — reward for a perfect quiz
When a quiz (either test) ends at **100%**, Blankie Bear appears on the result screen: a bear head (white,
blue ears, small grumpy face) on a blue-and-white striped blanket. It must look **exactly like
the owner's drawing**: `bear/bearShape.ts` is a tracing of that drawing in its own pixel space
(head, ears, face, the 3-cornered blanket, the 7 stripe lines that stop short of the edges, and
the blue bands where they were colored), fitted to the original ink to within ~1-2 px. Only the
line quality (clean round strokes) and coloring (soft colored-pencil pattern leaning right, like
the original strokes) are improved. Do not restyle the shapes.
- Flies around the screen until the result screen is left (wander toward random targets,
  gentle bob, tilts with motion). Enters by shooting up from the bottom.
- The blanket ripples while flying: every blanket point is displaced per frame (more the
  farther from the neck), trailing behind horizontal motion, hanging lower when flying up, plus
  a travelling wave (`makeDeform` in `BlankieBear.tsx`). At rest it is the exact tracing. Blue
  bands are oversized shapes clipped by the deformed blanket outline.
- Sounds: chime on arrival, soft whoosh ~every 1.2 s (louder when faster), occasional "wheee".
- Can be dragged (pointer events; works with touch). While dragged it blushes and keeps making
  cute squeak / boop / giggle sounds; on release it is flung with the drag's momentum.
- **Must not slow page load**: `Result.tsx` loads it with `React.lazy` only on a perfect score,
  so it is a separate ~3 KB (gzip) chunk. Animation writes SVG attributes / transforms directly
  in `requestAnimationFrame` (no React re-render per frame).
- Files: `src/components/bear/` (`BlankieBear.tsx`, `bearShape.ts`, `bearSounds.ts`); audio
  helpers shared with the celebrations live in `src/lib/audio.ts`.
- Reduced motion: stays in place (still draggable), slow ripple, no flying sounds.

## All words page (`words.html`)
Standalone second Vite entry (`src/words.tsx` -> `src/components/AllWords.tsx`): one
collapsible table per term (plus Expand all / Collapse all), rows grouped by word list, with part of speech and a speak button. Generated from the
same data files.

## Speech
`src/lib/speak.ts` uses the browser's built-in Web Speech API (free, offline, no key). It picks
the most natural en-US voice available on the device (prefers Premium/Enhanced voices and
names like Ava, Samantha; never Apple novelty voices). Voice quality depends on the device:
on iPad, downloading an enhanced voice under Settings > Accessibility > Spoken Content > Voices
improves it.

## PWA / Add to Home Screen
`public/manifest.webmanifest`, `apple-touch-icon.png` and icons in `public/`, iOS meta tags
in `index.html` and `parts-of-speech/index.html` (standalone display, status bar style, app
title). Use `%BASE_URL%`-relative paths so it works under the GitHub Pages sub-path. No service
worker in v1 (online use). Three HTML entries: `index.html`, `parts-of-speech/index.html`,
`words.html` (see `vite.config.ts` `build.rollupOptions.input`); a new page must be added there.

## Conventions
- Shared types live next to their data/logic (`Term`/`WordGroup` in `vocabulary.ts`, `PartOfSpeech` in
  `partsOfSpeech.ts`, `SessionConfig`/`Question`/... in `lib/session.ts`). Avoid `any`.
- Keep components small, in `src/components/`; pure logic in `src/lib/` (session building,
  shuffling, blanking, grammar questions) so it can be unit-tested. `shuffle` lives in
  `src/lib/shuffle.ts` so pages can use it without pulling in other data.
- Prefer config/data changes over code changes for content updates.
