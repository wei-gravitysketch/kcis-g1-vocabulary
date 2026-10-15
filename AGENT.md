# KCIS Grade 1 Vocabulary Cards — Project Spec

A static, mobile-first website of English vocabulary flashcards and quizzes for
Grade 1 students (age ~6) at 康橋國小. Used mainly on **iPad and phones**; must be
installable via **Add to Home Screen**. Personal project: commit straight to `main`,
no PRs. Every push to `main` deploys to GitHub Pages
(https://wei-gravitysketch.github.io/kcis-g1-vocabulary/).

## Stack
- Vite + React + **TypeScript** (strict; no router, no backend) + Tailwind CSS v4.
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
- `scripts/validate-data.ts` (`npm run validate`) enforces: every vocabulary word has
  >= 10 unique sentences that contain the word; POS values are valid; ids unique.
  When adding vocabulary, add its sentences + POS and run validate.

### Current library
Term 1: Week 1, 2, 3, My Words to Know (Week 4), Week 5, 6, 7, My Words to Know (Week 8).
Term 2: Week 11, 12, 13, My Words to Know (Week 14), Week 15, 16, 17, My Words to Know (Week 18).
"My Words to Know" groups are always named `My Words to Know (Week N)`, N being the week they cover.

## Home screen (settings)
Header: small kicker "KCIS Grade 1" + title "Vocabulary Practice" (home-screen app name "G1 Vocabulary").

1. **Term** — dropdown, single select (Term 1, Term 2, ...).
2. **Word List** — after a term is chosen, show its groups as multi-select toggle chips
   (with Select all / Clear). At least one must be selected. Each chip has a small
   **See words** button on its right that opens a dialog listing that group's words (with
   speak buttons). Below the chips, right-aligned, a small **All words table ↗** link opens
   `words.html` in a new tab.
3. **Mode** (choose one):
   - **Flashcards** — just show the cards.
   - **Quiz** — mixture of question types; checkboxes (at least one):
     - *Fill in the blank*: a sentence with the target word blanked out + 4 options
       (1 correct, 3 distractors picked at random from the whole vocabulary library,
       distinct from the answer). The sentence is picked at random from the word's bank.
     - *Part of speech*: show a word, choose noun / verb / adj / adv. Only words that
       have an entry in `partsOfSpeech.ts` are eligible.
     If both are checked, each word gets one randomly chosen applicable type.
4. **Order** — *In order* (library order) or *Shuffle*.
5. **Start** button (disabled until the selection can produce at least one card/question).
   The last selection is remembered in `localStorage`.

## Session behavior
- Words = union of the selected groups, de-duplicated. **Each word appears exactly once**;
  the session walks through the whole set.
- **Flashcards**: big word card with the speak button right beside the word, tap to reveal
  part of speech + an example sentence, Previous / Next, progress bar, finish screen with
  Again / Home.
- **Quiz**: one question per word, progress indicator, tap an option -> immediate
  right/wrong feedback (show the correct answer). The Next button sits directly under the
  options, right-aligned (not pinned to the bottom). Part-of-speech questions show the speak
  button beside the word. Final **result screen** shows score, accuracy %, the missed words,
  and buttons: *Retry missed words*, *Home*.
- **Celebration** on every correct answer: a ~2.5 s non-blocking full-screen animation picked
  at random (never the same twice in a row) with a matching sound effect:
  fireworks, rocket launch, whale jumping out of the water, balloons, rainbow + stars.
  Animations: `src/components/Celebration.tsx` + `cel-*` keyframes in `src/index.css`.
  Sounds: synthesized with the Web Audio API in `src/lib/celebrations.ts` (no audio files).
  Hidden when the user prefers reduced motion.

## All words page (`words.html`)
Standalone second Vite entry (`src/words.tsx` -> `src/components/AllWords.tsx`): one table per
term, rows grouped by word list, with part of speech and a speak button. Generated from the
same data files.

## Speech
`src/lib/speak.ts` uses the browser's built-in Web Speech API (free, offline, no key). It picks
the most natural en-US voice available on the device (prefers Premium/Enhanced voices and
names like Ava, Samantha; never Apple novelty voices). Voice quality depends on the device:
on iPad, downloading an enhanced voice under Settings > Accessibility > Spoken Content > Voices
improves it.

## PWA / Add to Home Screen
`public/manifest.webmanifest`, `apple-touch-icon.png` and icons in `public/`, iOS meta tags
in `index.html` (standalone display, status bar style, app title). Use `%BASE_URL%`-relative
paths so it works under the GitHub Pages sub-path. No service worker in v1 (online use). Two HTML entries: `index.html`, `words.html`
(see `vite.config.ts` `build.rollupOptions.input`).

## Conventions
- Shared types live next to their data/logic (`Term`/`WordGroup` in `vocabulary.ts`, `PartOfSpeech` in
  `partsOfSpeech.ts`, `SessionConfig`/`Question`/... in `lib/session.ts`). Avoid `any`.
- Keep components small, in `src/components/`; pure logic in `src/lib/` (session building,
  shuffling, blanking) so it can be unit-tested.
- Prefer config/data changes over code changes for content updates.
