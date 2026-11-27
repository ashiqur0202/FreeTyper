# Practice text types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Practice strip tabs become text types (Mixed, Sentences, Quotes, Facts, Code, Custom), all inside the one adaptive screen so every type counts toward level and keys.

**Architecture:** `AdaptivePractice` gets a `source` (and code `language`, `customText`) and picks each next text by source, using the existing generators (`generatePracticeSegment`, `pickPassage`, `generateCode`). `TypingPractice` keeps the tab state and always renders `AdaptivePractice`; its old non-adaptive branch is deleted. A new pure module holds the types, custom-text cleaning, mixed rotation and remembered choices.

**Tech Stack:** Next.js (breaking-change version, no new Next APIs needed), React client components, Tailwind tokens. The repo has no unit-test runner; checks are `npx tsc --noEmit`, `npm run build`, `npm run check:text`, lint on touched files, and browser runs on `next start`.

**Spec:** `docs/superpowers/specs/2026-11-27-practice-text-types-design.md`. Approved demo: https://claude.ai/artifact/U5EuSFCvw5fQNqWjSvak4J

## Global Constraints
- Work on branch `feat/text-types`; never commit to `master`; no push without Ashiqur's say-so.
- Anything read from `localStorage` renders only after hydration (read in `useEffect`).
- No new lint errors (TypingPractice.tsx has 10 old ones; compare before and after on touched files).
- Working files are CRLF: keep line endings when editing.
- Tab names exactly: `Mixed · Sentences · Quotes · Facts · Code · Custom`. Custom limit 1,000 characters. Code languages: JavaScript, Python, SQL, CSS, HTML (+ "Any" default).
- Custom text is the person's own: tagged "Your text" and never described as checked.
- Quotes and facts keep their checked libraries and the "Checked against Wikipedia" / quote credit lines (already produced by `pickPassage`).

## Review Focus
- Custom text empty, whitespace only, or all unsupported characters: "Practise this text" stays disabled; nothing crashes.
- Custom text with curly quotes, em dashes, tabs, line breaks, emoji: cleaned to typable plain text; if nothing is left it counts as empty.
- Switching type while a text is running: tabs are disabled while typing (as now); no half-run is logged under the wrong type.
- Stored source or language that is invalid or from an old version: falls back to `mixed` / `any` without error.
- Mixed never shows the same kind twice in a row; Code in Mixed is rarer than the others.
- Phone width: six tabs plus the stats wrap without sideways scroll.

---

### Task 1: Sources module

**Files:**
- Create: `src/components/skills/typing/engine/sources.ts`

**Interfaces:**
- Produces:
  - `type PracticeSource = 'mixed' | 'sentences' | 'quotes' | 'facts' | 'code' | 'custom'`
  - `type TextKind = 'sentences' | 'quotes' | 'facts' | 'code' | 'custom'` (the kind actually shown; Mixed resolves to one of the first four)
  - `const SOURCE_TABS: { id: PracticeSource; label: string }[]` in the tab order above (labels capitalised)
  - `const CUSTOM_MAX = 1000`
  - `cleanCustomText(raw: string): string` — maps curly quotes/dashes/ellipsis/non-breaking space to plain ASCII, turns every run of whitespace (including line breaks and tabs) into one space, drops any other character outside printable ASCII (32–126), trims, caps at `CUSTOM_MAX`, trims again.
  - `nextMixedKind(prev: TextKind | null, rand?: Rand): Exclude<TextKind, 'custom'>` — weights sentences 3, quotes 3, facts 3, code 1; never returns `prev`. `Rand` is from `./rng`.
  - `loadSourcePrefs(): { source: PracticeSource; language: CodeLanguage | 'any' }` and `saveSourcePrefs(p)` — key `freetyper-practice-source`, JSON, try/catch, invalid values fall back to `{ source: 'mixed', language: 'any' }`. `CodeLanguage` is from `./code`.

- [ ] **Step 1: Implement the module** as specified above, matching the style of `engine/library.ts` (doc comment on top, small exported functions).
- [ ] **Step 2: Check the pure functions in Node** with a throwaway script in the scratchpad (not committed) that transpiles via `npx tsc` or imports with `node --experimental-strip-types`: `cleanCustomText('“Hi” —\n\tthere 😀')` → `"Hi" - there`; `cleanCustomText('😀😀')` → `''`; `cleanCustomText('a'.repeat(1500)).length` → `1000`; 2000 calls of `nextMixedKind` never repeat `prev` and code share is below 20 %.
- [ ] **Step 3: `npx tsc --noEmit`** — expect no errors.
- [ ] **Step 4: Commit** `feat: sources module for practice text types`.

### Task 2: AdaptivePractice picks text by source

**Files:**
- Modify: `src/components/skills/typing/AdaptivePractice.tsx` (props, `startText`, `handleComplete`, note under text)

**Interfaces:**
- Consumes: Task 1 exports; `pickPassage`, `quoteItems`, `factItems`, `loadRecentPassages`, `rememberPassage` from `./engine/library`; `generateCode`, `CODE_LANGUAGE_NAMES` from `./engine/code`; `planOf`, `planWeight`, `levelIndex`, `segmentLines`, `generatePracticeSegment` from `./smartEngine`.
- Produces: `AdaptivePractice` props become `{ tabs: ReactNode; subRow?: ReactNode; pinKey?: string | null; source: PracticeSource; language: CodeLanguage | 'any'; customText: string }`. Changing `source`, `language` or `customText` while idle starts a new text. `subRow` renders directly under `PracticeStrip` inside the box.

- [ ] **Step 1: Add the props and render `subRow`** between `PracticeStrip` and the ring grid, only when given.
- [ ] **Step 2: In `startText`, branch on the resolved kind** (`source`, or `nextMixedKind(lastKindRef.current)` for Mixed; keep it in a `lastKindRef`):
  - `sentences`: current `generatePracticeSegment` path, unchanged.
  - `quotes` / `facts`: `pickPassage(items, stateRef.current, Math.min(target, 320), loadRecentPassages())`, then `rememberPassage` for each id; use `choice.text` and `choice.note`.
  - `code`: `generateCode({ level: levelIndex(state.unlocked) as 0 | 1 | 2, weight: planWeight(nextPlan), targetChars: Math.min(target, 320), rand: Math.random, language: language === 'any' ? undefined : language })`; note `"<Language> code, made for your level."`.
  - `custom`: the text from props (already cleaned); note per spec. If empty, fall back to `sentences` so the screen is never blank.
  Keep a `kind` state and a `note` that says which kind it is (used for the tag under the text: Sentences, Quote, Fact, Code, Your text).
- [ ] **Step 3: Log and analytics.** In `handleComplete`, `modeDetail` for the session is the kind shown (`adaptive` for sentences so old history keeps its label, otherwise `quotes`, `facts`, `code`, `custom`); the log entry `modeDetail` is `` `${label} · ${end.state.unlocked} keys` `` with `label` `adaptive` for sentences and the kind name otherwise. `practice_complete` keeps `category: 'adaptive'` and gains `source` (the tab) and `kind`.
- [ ] **Step 4: Effects.** When `source`, `language` or `customText` changes after mount and nothing is running, call `startText(restart)`. Guard the first run so mount still starts exactly one text.
- [ ] **Step 5: `npx tsc --noEmit`** — expect no errors (TypingPractice will not pass the new props yet; do Task 3 in the same sitting before running it, or give the new props temporary defaults).
- [ ] **Step 6: Commit** `feat: adaptive practice picks text by source`.

### Task 3: Tabs, code language row, custom paste, old branch removed

**Files:**
- Modify: `src/components/skills/typing/TypingPractice.tsx`
- Create: `src/components/skills/typing/CustomTextBox.tsx`
- Modify: `src/components/skills/typing/PracticeFeedback.tsx` only if `categoryLabel` does not already label `quotes`, `facts`, `code`, `custom` and `adaptive · N keys` sensibly (check lines near 226, 602, 803, 893; add `custom` → "Custom").

**Interfaces:**
- `CustomTextBox({ initial, onUse }: { initial: string; onUse: (cleaned: string) => void })`: textarea (`maxLength` `CUSTOM_MAX`, counter "n / 1,000"), button "Practise this text" disabled while `cleanCustomText(value)` is empty, and a short line "Your own text. We do not check it." Styled with the existing tokens like the demo.
- `TypingPractice` state: `source`, `language`, `customText` (the active custom text, `''` means show the box), loaded once in an effect from `loadSourcePrefs()` and saved on change. Tabs come from `SOURCE_TABS`, disabled while running (as now).

- [ ] **Step 1: Replace `Category`/`CATEGORIES`/`changeCategory`** with the source tabs; the pre-hydration placeholder row lists the same six labels.
- [ ] **Step 2: Build `subRow`:** for `code`, a "Language" label and chips `Any, JavaScript, Python, SQL, CSS, HTML` (pressed state like the demo); for `mixed`, one dim line "Rotates through sentences, quotes, facts and code. Code comes up less often."; otherwise none.
- [ ] **Step 3: Custom flow:** for `custom` with empty `customText`, render `CustomTextBox` in place of the typing area (inside the page layout under the box, with the strip and ring still shown by giving `AdaptivePractice` an `idle`-style placeholder, or render the box as `children` — implementer's call, keep the strip and ring visible). After "Practise this text" set `customText`; a "Change text" button next to the note clears it.
- [ ] **Step 4: Delete the old non-adaptive branch** (the `if (category === 'adaptive')` split, `generateText` for quotes/facts/code, `LetterRow` use, progress line, old input and feedback) and every import, state and ref that becomes unused. Keep `pinKey` (letter picked in the row) working: picking a key only applies to Sentences; if another type is active, switch the tab to Sentences first.
- [ ] **Step 5: Checks:** `npx tsc --noEmit`; `npx eslint` on the four touched files and compare with the baseline (10 old errors in TypingPractice.tsx must not grow, ideally shrink as dead code goes); `npm run check:text`.
- [ ] **Step 6: Commit** `feat: practice text types (mixed, sentences, quotes, facts, code, custom)`.

### Task 4: Browser QA, docs

- [ ] **Step 1: `npm run build`** (retry once on the known `next/font/google` flake), then `next start` on a free port.
- [ ] **Step 2: In Chrome check every Review Focus line:** each tab shows the right text, tag and note; ring and letter row identical on all; typing updates speed/accuracy and the ring; a finished text starts the next of the same type; Code language chips change the language; Custom with curly quotes/emoji/empty/1,500 characters; reload remembers type and language; Mixed over ten texts never repeats a kind; 390 px frame has no sideways scroll; light and midnight themes by eye.
- [ ] **Step 3: Docs.** `freetyper.md` section 0 (what changed, branch, what was and was not checked) and the Practice guide text if it names the old tabs (`src/data/tools/typing-practice-content.ts`: update to the new types and bump its visible date).
- [ ] **Step 4: Commit** `docs: freetyper.md and practice guide for text types`. Stop the test server. Do not push.
