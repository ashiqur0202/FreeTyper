# Level Ladder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a Beginner-to-Elite "pin ladder" after the stat tiles on the speed-test result card, and an `avg` line under the "gross wpm" and "errors" tiles, both based on the user's own recent speed-test sessions.

**Architecture:** A pure module (`levelLadder.ts`) owns the level list, band maths and the averages; a small view (`LevelLadder.tsx`) draws the ladder; `PracticeFeedback.tsx` renders it and passes the averages to two tiles. `TypingSpeedTest.tsx` passes the saved sessions in as a prop. No new storage, network call or GA4 event.

**Tech Stack:** Next.js 16 (read `node_modules/next/dist/docs/` before writing Next code), React, Tailwind v4 theme tokens, `node --experimental-strip-types` for unit tests.

**Spec:** `docs/superpowers/specs/2026-11-08-level-ladder-design.md`. Demo of the chosen look: "Look B" (ladder, then one caption line), shown in the demo at `https://claude.ai/artifact/MfLUizFDVG8RPLv7xaTQNx`.

## Global Constraints
- Levels (net WPM): Beginner under 40, Average 40, Skilled 60, Pro 80, Elite 100+. They are FreeTyper's own labels, not a standard. The band for Elite fills from 100 to 130.
- Average window: last 30 speed-test sessions before the one just finished; shown only with at least 3. Games, practice and lessons sessions are not counted. Daily-challenge runs are speed-test sessions and are counted.
- Speed test only (`detailed` card). Practice and lessons cards are unchanged.
- Work on branch `feat/level-ladder`. Never commit to `master`; do not push.
- Anything read from `localStorage` renders only after hydration (the card exists only after a finished run, so the prop is safe; confirm in Task 3).
- Do not add lint errors: compare `npx eslint <touched files>` before and after.
- Visible copy: no invented statistics; the study line is only "Study mean 51.56 WPM (Dhakal et al., CHI 2018)" in the tooltip.
- Bump the visible guide date and the "Last real edit" comment in the same commit as the guide text. Never backdate: use the real day of the commit.
- No secrets in any file.

## Review Focus
1. Net exactly on a threshold (40, 60, 80, 100) belongs to the higher level; net 0 shows Beginner at 0 % with no `NaN`. (Task 1 tests.)
2. Net above 130 clamps the pin at the right end of Elite and the caption says "top level". (Task 1 + Task 2.)
3. Old or odd saved sessions (zero duration, missing `incorrectChars`, non-numbers) are skipped, never producing `NaN` or `Infinity` in an average. (Task 1 tests.)
4. Fewer than 3 earlier sessions: no `avg` text, no dotted line, tiles look as today. (Task 1 + Task 3 browser check.)
5. At 390 px width all five level names stay on one line each and the card does not scroll sideways, in all four themes. (Task 3.)

## File Structure
- Create `src/components/skills/typing/levelLadder.ts` — pure logic, no React, `import type` only for types.
- Create `src/components/skills/typing/LevelLadder.tsx` — view, no data fetching.
- Create `scripts/test-ladder.mjs` — unit tests, same style as `scripts/test-mouse.mjs`.
- Modify `src/components/skills/typing/PracticeFeedback.tsx` — `rankLabel`, `Tile`, props, render.
- Modify `src/components/skills/typing/TypingSpeedTest.tsx` — pass `history`.
- Modify `src/data/home/typing-speed-content.ts` — guide paragraph and dates.
- Modify `freetyper.md` — status, §4 result card rules, §8.

---

### Task 1: Level and average logic (pure, tested)

**Files:**
- Create: `src/components/skills/typing/levelLadder.ts`
- Test: `scripts/test-ladder.mjs`

**Interfaces:**
- Produces (exact):
  ```ts
  import type { TypingSession } from './types';
  export interface Level { key: 'beginner' | 'average' | 'skilled' | 'pro' | 'elite'; name: string; min: number; threshold: string }
  export const LEVELS: readonly Level[];            // 5 entries, thresholds '<40','40','60','80','100+'
  export const ELITE_FILL_MAX = 130;
  export const AVG_WINDOW = 30;
  export const AVG_MIN = 3;
  export function levelIndex(net: number): number;                       // 0..4
  export function bandFill(net: number, i: number): number;              // 0..1
  export function nextStep(net: number): { name: string; gap: number } | null;
  export interface Averages { count: number; net: number; gross: number; errors: number }
  export function averages(sessions: TypingSession[], excludeId: string): Averages | null;
  ```

- [ ] **Step 1: Write the failing tests** in `scripts/test-ladder.mjs` (header `// Run: node --experimental-strip-types scripts/test-ladder.mjs`, `t(name, fn)` helper and final count line like `test-mouse.mjs`). Helper `s(id, wpm, totalChars, incorrectChars, duration, mode = 'speed-test')` returns a session object. Tests and assertions:
  - `levelIndex`: 0→0, 39→0, 40→1, 59→1, 60→2, 79→2, 80→3, 99→3, 100→4, 250→4.
  - `bandFill`: `(36,0)=0.9`, `(50,0)=1`, `(50,1)=0.5`, `(50,2)=0`, `(0,0)=0`, `(115,4)=0.5`, `(300,4)=1`.
  - `nextStep`: `(36)` deep-equals `{ name: 'Average', gap: 4 }`; `(99)` is `{ name: 'Elite', gap: 1 }`; `(100)` and `(250)` are `null`.
  - `averages` with prior `[s('a',30,150,3,60), s('b',20,100,5,60), s('c',40,200,4,60)]` plus current `s('d',50,250,2,60)` and `excludeId 'd'` deep-equals `{ count: 3, net: 30, gross: 30, errors: 4 }`.
  - `averages` returns `null` with two prior sessions, and with three sessions of which one is `mode: 'game'`, `'practice'` or `'lesson'` (those are ignored).
  - 40 prior sessions with `wpm` 1 to 40 (appended oldest first): result `count: 30`, `net: 26` (mean of 11..40 is 25.5, rounded).
  - A session with `duration: 0`, one with `incorrectChars: undefined`, and one with `wpm: NaN` are skipped; with three good sessions beside them the result is unchanged and every field is finite.

- [ ] **Step 2: Run** `node --experimental-strip-types scripts/test-ladder.mjs` — expected: FAIL (module not found).

- [ ] **Step 3: Implement** `levelLadder.ts` with the signatures above. `bandFill` uses `lo = LEVELS[i].min`, `hi = LEVELS[i + 1]?.min ?? ELITE_FILL_MAX`, clamped 0..1. `averages` keeps `mode === 'speed-test'`, `id !== excludeId`, finite `wpm`, `totalChars`, `incorrectChars`, `duration > 0`; takes the last `AVG_WINDOW` (array order is oldest first); needs at least `AVG_MIN`; gross per session is `totalChars / 5 / (duration / 60)`; all three means rounded with `Math.round`.

- [ ] **Step 4: Run** the test script — expected: every test prints `ok -`, exit code 0.

- [ ] **Step 5: Commit** `git add scripts/test-ladder.mjs src/components/skills/typing/levelLadder.ts && git commit -m "feat: level ladder logic and averages, with unit tests"` (end the message with the attribution line from the session instructions).

---

### Task 2: Ladder view and result-card integration

**Files:**
- Create: `src/components/skills/typing/LevelLadder.tsx`
- Modify: `src/components/skills/typing/PracticeFeedback.tsx` (`rankLabel` near line 41, `Tile` near line 480, `PracticeFeedbackProps` near line 506, the tiles block near lines 617-631)
- Modify: `src/components/skills/typing/TypingSpeedTest.tsx` (the `useTypingProgress()` line near 160 and the `<PracticeFeedback` element near 625)

**Interfaces:**
- Consumes: everything exported by Task 1.
- Produces: `export default function LevelLadder(props: { net: number; avg: number | null }): JSX.Element`; `PracticeFeedback` gains optional prop `history?: TypingSession[]`; `Tile` gains optional prop `sub?: string`.

- [ ] **Step 1: Build `LevelLadder.tsx`** as "Look B" from the demo: five equal columns; each has a 10 px rounded track (`bg-surface-border`) filled with `bandFill(net, i)` in the accent colour (passed bands full at reduced opacity, current band full opacity); under it the level name and its threshold in small text, current name in accent and bold. The current column carries a pin bubble "You {net}" above the track, positioned at `clamp(round(fill × 100), 18, 82) %` of the column. When `avg` is not null, a dotted vertical line sits in the band `levelIndex(avg)` at `bandFill(avg, i) × 100 %`. Below: one caption line `"{Name} · +{gap} to {Next}"` or `"{Name} · top level"`, then `" · avg {avg}"` when `avg` is not null, then `" · "` and a `<span title="FreeTyper's own labels, not a standard. Study mean 51.56 WPM (Dhakal et al., CHI 2018).">FreeTyper levels</span>`. Wrapper: `role="img"` with `aria-label` `"Level ladder: {net} net words per minute, {Name}, {next step text}"`. Use only existing theme tokens (`text-accent`, `bg-accent-bg`, `text-text-dim`, `text-text-bright`, `bg-surface-border`); for the pin bubble copy the text colour that existing solid-accent buttons use (search `bg-accent ` in `src`). Names stay on one line (`whitespace-nowrap`), never wrap.

- [ ] **Step 2: `PracticeFeedback.tsx` edits.** (a) `rankLabel(wpm)` returns `LEVELS[levelIndex(wpm)].key` so the pill and ladder share one list (output strings unchanged: `elite`, `pro`, `skilled`, `average`, `beginner`). (b) `Tile` accepts `sub?: string` and renders it as a third dim line (`text-[9px] text-text-dim`) under the label when present. (c) Add prop `history?: TypingSession[]`; inside, `const avgs = detailed && history ? averages(history, latest.id) : null`. (d) In the tiles block pass `sub={avgs ? \`avg ${avgs.gross}\` : undefined}` to the "gross wpm" tile and `sub={avgs ? \`avg ${avgs.errors}\` : undefined}` to the "errors" tile. (e) Directly after the tiles `div` and before the weak-spots block, when `detailed`, render `<LevelLadder net={latest.wpm} avg={avgs ? avgs.net : null} />` inside a wrapper with `mt-4`.

- [ ] **Step 3: `TypingSpeedTest.tsx` edits.** Destructure `progress` from `useTypingProgress()` and pass `history={progress.sessions}` to `<PracticeFeedback`. Practice and lessons call sites stay untouched.

- [ ] **Step 4: Verify** `npx tsc --noEmit` passes, `node --experimental-strip-types scripts/test-ladder.mjs` still passes, and `npx eslint` on the three touched files reports no more problems than before the change (record the before count first).

- [ ] **Step 5: Commit** `git commit -am "feat: level ladder and average lines on the speed-test result card"` plus the new file and the attribution line.

---

### Task 3: Browser check, guide text and status docs

**Files:**
- Modify: `src/data/home/typing-speed-content.ts` (the "Last real edit" comment near line 12 and the visible `<time datetime>` near line 87; find the guide section that explains the rank labels and add the ladder paragraph there)
- Modify: `freetyper.md` (section 0 status and repo state, section 4 "Result card" rules, section 8 TODO)

**Interfaces:** Consumes Tasks 1 and 2. Produces nothing later tasks use.

- [ ] **Step 1: Build and serve.** `npx tsc --noEmit`, `npm run build`, then `npx next start -p 3100`.
- [ ] **Step 2: Browser checks** on `http://localhost:3100/`, finishing real 15-second tests:
  - First test: ladder shows, pin at the right place, no `avg` text anywhere, tiles unchanged.
  - After at least 4 finished tests: `avg` lines appear under "gross wpm" and "errors"; the caption shows `avg {n}`; a dotted line shows in the right band.
  - The pill and the ladder name the same level.
  - Themes dark, light, midnight, paper (Settings page) and width 390 px: five names visible on one line each, no horizontal page scroll, no overlap of pin and caption.
  - Console shows no errors from the site. Practice and lessons result cards look exactly as before.
- [ ] **Step 3: Guide text.** Add one short paragraph to the home guide describing the ladder: that the levels are FreeTyper's own labels with the 40/60/80/100 limits, that the average line uses the user's last 30 speed tests on this device, and the study mean sentence with its source. Set both date markers to the day of this commit.
- [ ] **Step 4: Update `freetyper.md`** (status lines, §4 result-card rules for the ladder and the tile `avg` lines, §8). Keep the file under about 250 lines.
- [ ] **Step 5: Commit** `git commit -am "docs: guide paragraph for the level ladder; status"` plus the attribution line. Do not push; ask Ashiqur before merging to `master`.

---

## Self-review
- Spec coverage: placement (Task 2), Look B (Task 2 step 1), levels and shared constant (Tasks 1-2), average rules (Task 1), tile averages (Task 2 step 2), hydration, accessibility and themes (Tasks 2-3), guide and date (Task 3), no storage or GA4 change (Global Constraints), out-of-scope list respected.
- Names match across tasks: `LEVELS`, `levelIndex`, `bandFill`, `nextStep`, `averages`, `Averages`, `AVG_MIN`, `AVG_WINDOW`, `ELITE_FILL_MAX`, `LevelLadder`, `history`, `sub`.
