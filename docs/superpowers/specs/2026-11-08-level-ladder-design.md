# Level ladder on the speed-test result card — design

Date: 2026-11-08 · Status: approved by Ashiqur 2026-11-08 ("ok", then "do it" for the tile averages) · Piece A of the "attract with more features" work.

## Goal
Show a speed-test finisher, in one short row, where their net speed sits between Beginner and Elite and what the next step is. Beginners learn where they stand; everyone sees how they compare with their own recent average. The rest of the result card stays exactly as it is today.

## What Ashiqur chose (demo "Look B", 2026-11-08)
- Keep the current card unchanged; add one compact element.
- Placed right after the stat tiles (correct, errors, gross wpm, consistency, words).
- Style: the "pin ladder" with a small caption line under it (demo layout "Look B: ladder with one caption line").
- Dropped on purpose: the comparison table, the side panel, the study-mean bar as visible text, new coach wording, a lesson button.

## Behaviour
- **Where:** `PracticeFeedback.tsx`, after the stat tiles block and before "Weak spots". Speed test only (`detailed` is true), because the rank labels exist only there. Practice and lessons are not changed; extend later if wanted.
- **Ladder:** five equal segments with names and thresholds: Beginner (under 40), Average (40), Skilled (60), Pro (80), Elite (100+). Levels already passed are filled; the current level is filled to the exact position of the net WPM inside its band (Elite fills over 100 to 130); a gold bubble "You 36" points at that position; a dotted line marks the user's average when it falls in a band.
- **Caption (one line):** `<Level> · +N to <Next level> · avg <A> · FreeTyper levels`. At Elite: `Elite · top level`. The words "FreeTyper levels" carry a tooltip: "FreeTyper's own labels, not a standard. Study mean 51.56 WPM (Dhakal et al., CHI 2018)."
- **Average:** mean net WPM of the user's speed-test sessions from `freetyper-progress` (mode `speed-test`), the last 30 before the run just finished. Shown only with at least 3 such sessions; otherwise the dotted line and "avg" are omitted and nothing else changes. The ladder itself needs no history, so a first test still shows it.
- **Levels:** one shared constant (`LEVELS`) feeds both the ladder and the existing rank pill (`rankLabel`), so the two cannot disagree. Thresholds are unchanged from today (40 / 60 / 80 / 100); they are our labels, not a standard.
- **Accessibility:** the ladder is `role="img"` with an `aria-label` that says speed, level and next step; meaning is never carried by colour alone (names, thresholds and the caption are text). Colours come from the existing theme tokens, so all four themes work.
- **Hydration:** the average reads localStorage, so it renders only after mount (the card only appears after a finished run, but the rule in AGENTS.md still applies).
- **Phone:** five equal segments with names at about 12 px must fit at 390 px; if a name does not fit, shorten only the label font, never wrap the row.

## Raw speed and mistakes against your average (added 2026-11-08)
Ashiqur asked to keep raw keystrokes and mistakes in the comparison. Chosen option: show them **in the tiles that already exist**, not as new rows.
- The "gross wpm" tile (raw speed, all typed characters) and the "errors" tile each get a small dim line under the label: `avg 31` and `avg 4`. Nothing else moves; the ladder row is unchanged.
- The averages use the same sessions as the ladder: the last 30 speed-test sessions before the one just finished, shown only with at least 3. With fewer, the tiles look exactly as today.
- Gross average = mean of `totalChars / 5 / (duration / 60)`; errors average = mean error rate (`incorrectChars / duration`) scaled to the length of the finished run and rounded, so a 15 s run is compared with a 15 s share of longer tests (added after the final review; a plain mean of counts mixed test lengths). These match how the tiles compute this run's numbers, so the comparison is like for like.
- No colour judgement on the tiles (no red/green); the user reads the two numbers side by side. Lower mistakes is better, which the guide sentence states.

## Not in scope
A global "average of all visitors" (no server), accuracy or typo comparison, practice and lessons cards, new coach text, new GA4 events, any change to how scores are saved.

## Files
- New `src/components/skills/typing/levelLadder.ts` — pure functions: `LEVELS`, `levelFor(net)`, `positionInBand(net)`, `nextStep(net)`, `averages(sessions, excludeId, duration)` (returns `{ count, net, gross, errors }` over the last 30 speed-test sessions before the newest, or `null` under 3).
- New `src/components/skills/typing/LevelLadder.tsx` — the view.
- Edit `PracticeFeedback.tsx` — render the ladder after the tiles; `rankLabel` uses `LEVELS`; the `Tile` component gets an optional dim `sub` line used by the gross wpm and errors tiles.
- Edit `src/data/home/typing-speed-content.ts` — one paragraph in the guide describing the ladder, its labels and the study note; bump the visible date and the "Last real edit" comment (same commit).
- New `scripts/test-ladder.mjs` — unit tests, run like `scripts/test-mouse.mjs` (`node --experimental-strip-types`).

## Privacy and data
No new storage key, no network call, no GA4 event. The privacy page needs no change.

## Testing
1. Unit tests: boundaries (39 / 40 / 59 / 60 / 99 / 100 / 130+), position in band, next step text, averages (net, gross, errors) with 0, 2, 3 and 40 sessions (uses the last 30 before the newest), games and other modes excluded, gross formula checked against a known session.
2. `npx tsc --noEmit`, `npm run build`; lint compared on touched files before and after.
3. `next start` in a browser: first test, beginner, skilled and elite examples; dark, light, midnight, paper; 390 px width; no console errors; the rank pill and the ladder show the same level.

## Open choices (defaults in bold)
- Show on practice and lessons too: **no, speed test only for now**.
- Average window: **last 30 speed-test sessions, minimum 3**.
- Caption wording as above; the tooltip carries the source.
- Raw speed and mistakes: **small `avg` line inside the existing tiles** (chosen by Ashiqur on 2026-11-08 from three options).
