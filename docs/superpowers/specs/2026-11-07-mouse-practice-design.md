# Mouse and trackpad practice: design

Date: 2026-11-07. Status: draft for Ashiqur's review. Branch: `feat/mouse-practice` (off `master`).

## What and why

A free tool page, `/mouse-practice`, where people practise using a **mouse or a laptop trackpad**. It has two tabs:

- **Learn**: short guided steps (click, double-click, right-click, drag and drop, scroll, a mixed drill), with wording and steps that match the device the person picks.
- **Aim**: a 30-second target game with a score, accuracy, reaction time and saved best scores.

It runs fully in the browser, needs no signup and follows the site's existing tool pattern (tool entry, component, content file, sidebar link). It lives on FreeTyper, decided by Ashiqur on 2026-11-07. The site's topic widens a little, from typing to typing and mouse skills.

Audience (from Ashiqur): beginners learning the pointer, and people who want to get faster and more accurate. The trackpad is required, not optional: the page is for laptop users too.

## Device choice: mouse or trackpad

The browser cannot tell a laptop trackpad from a mouse. Both report `pointerType: "mouse"`, and only a touchscreen reports `"touch"`. So the page asks: **"I'm using: Mouse | Trackpad"**.

- The choice changes only wording and the order of steps. The checks underneath use the same pointer, wheel and context-menu events, so both devices pass the same tests.
- The choice is saved in `localStorage` and read only after hydration (project rule). Until then the page renders with "Mouse".
- If the first pointer event is `"touch"`, show a note: this page is built for a mouse or a laptop trackpad; on a touchscreen it still works but is not what it is designed for. Do not block anything.

### Learn steps, by device

| # | Mouse wording | Trackpad wording | Event the check uses |
|---|---|---|---|
| 1 | Move the pointer onto the target | same | `pointerenter` on the target |
| 2 | Click the target | Press the pad, or tap it | `click` |
| 3 | Double-click | Tap twice quickly, or press twice | `dblclick` |
| 4 | Right-click | Two-finger tap, or press the pad's bottom-right corner | `contextmenu` (default menu blocked inside the practice box only) |
| 5 | Drag the card to the box | Press and hold, then slide; or tap, tap again and slide if your laptop has tap-to-drag | `pointerdown` / `pointermove` / `pointerup` |
| 6 | Scroll with the wheel | Scroll with two fingers | `wheel` / `scroll` on the practice list |
| 7 | Mixed drill: three actions in a row | same | combination of the above |

Each step shows the instruction, a success check and progress dots. Finished steps are remembered per device choice.

Trackpad settings differ between laptops: tap-to-click, two-finger right-click and tap-to-drag can be turned off. When a trackpad step is not completed within about 10 seconds, show a hint: "If nothing happens, check your laptop's touchpad settings." The page does not name operating-system menus or claim defaults.

Not included in the first version: pinch-to-zoom and three or four-finger swipes. Browsers report pinch inconsistently, and system gestures never reach the page. The guide says so.

## Aim tab

- 30-second run. One circular target at a time at a random position inside the play area, never overlapping the edge.
- Size choice: large (80 px), medium (56 px), small (36 px) diameter. The default is medium for Mouse and large for Trackpad. These are suggestions to tune after testing, not researched values.
- Score per run: hits, misses (a click that is not on a target), accuracy (hits ÷ clicks), average reaction time (target shown → hit), score = hits − misses, floored at 0.
- Best score per size stored in `localStorage` (read after hydration). Last run shown with the best.
- Pointer events only. No sound in the first version.

## Where the code goes

| Piece | File |
|---|---|
| Tool entry (id `mouse-practice`, icon `Mouse`) | `src/config/tools.ts` |
| Page component and tab shell | `src/components/skills/mouse/MousePractice.tsx` |
| Learn tab | `src/components/skills/mouse/MouseLearn.tsx` |
| Aim tab | `src/components/skills/mouse/AimTrainer.tsx` |
| Steps, wording, saved state | `src/components/skills/mouse/mouseData.ts` and `useMouseProgress.ts` |
| Page guide, FAQ, structured data | `src/data/tools/mouse-practice-content.ts` |
| Register the component | `src/components/tools/ToolClient.tsx` |
| Sidebar link | `src/components/layout/Sidebar.tsx` |
| Status | `freetyper.md` (sections 0, 3) |

`ToolData.category` is `'typing'` today; widen it if the type needs it. No existing tool changes behaviour.

## Page guide (content rules)

Follows `AGENTS.md`: describe only what the code does, cite only sources that were opened, no invented statistics or stories, state limits, label suggestions as suggestions, visible date 2026-11-07 (not backdated). The guide covers: how the page works, mouse versus trackpad steps, the aim scoring formula, what is stored in the browser, limits (no pinch, no system gestures, device choice is manual, settings vary by laptop, not suited to people who cannot use a pointing device).

## Testing

- `npx tsc --noEmit`, `npm run build`, lint compared on touched files.
- `next start` in a real browser with simulated pointer, double-click, context-menu, drag and wheel events: each Learn step completes for both device choices; Aim run scores correctly (known hit/miss sequences).
- Hydration: saved values appear only after load; no console errors.
- Phone width: layout does not overflow (real phone and real trackpad are known gaps and are stated as such).

## Out of scope (first version)

Leaderboards, accounts, sound, custom cursors, pinch and multi-finger gestures, per-operating-system setup instructions.

## Risks

- A trackpad with gestures turned off cannot complete some steps: handled by the hint above, not by lowering the check.
- Drag steps are the likeliest to differ across browsers: test with pointer capture and cancel handling.
- Widening the site's topic: wording on the home and about pages stays typing-first; the mouse page is listed as an extra tool.

## Addendum 2026-11-07 (later): levels from beginner to mastery

Approved by Ashiqur after he tried version 1. The Learn tab becomes four levels; each opens when the one before is passed. Everything stays free. All pass marks below are our own suggestions, not researched standards, and are constants in `levelRules.ts`.

| Level | Drills (id) | Passed when |
|---|---|---|
| 1 Beginner | the 7 steps (`move click double right drag scroll mixed`) | all 7 finished |
| 2 Comfortable | `small` 10 targets of 36 px; `precise` drag a card onto a 44 px spot 3 times; `hold` press and hold a circle 1 s; `select` select a highlighted sentence; `find` scroll a 60-row list and click "Item 47" | all 5 done; `small` needs at least 80% accuracy |
| 3 Skilled | `moving` 8 drifting targets; `steer` move the pointer from a start dot to an end dot along a corridor; `quick` 5 double-clicks within 20 s; `menu` 3 rounds of right-click then choose the named item from a custom menu; `sort` drag cards 1 to 4 into their slots | all 5 done; `steer` needs at least 85% of pointer samples inside the corridor |
| 4 Mastery | `gauntlet` 60 s of click, double-click, right-click and drag prompts, score = correct - wrong (min 0), at least 15; `shrink` 30 s aim where the target shrinks 4 px per hit from 80 px to 24 px, score at least 15; `tiny` 20 targets of 24 px, at least 90% accuracy | all 3 done |

- A failed drill shows its result and a Try again button; it is never marked done until it passes.
- Ranks by highest level passed: none, Beginner, Comfortable, Skilled, Master. Shown at the top and saved per device choice, like finished drills (`done` keeps drill ids from all levels).
- Locked levels are visible with "Pass Level N to open this". No lock on the Aim tab's classic mode.
- Aim modes: Classic (always), Moving (opens with Level 3, when Level 2 is passed) and Shrinking (opens with Level 4, when Level 3 is passed). Best scores are kept per mode and size.
- New event `level_pass` (`level`, `device`) fires once when the last drill of a level is finished.
- Same pass marks on mouse and trackpad, so a rank means the same on both. The guide says Levels 3 and 4 may feel harder on a trackpad.
- Not included: timed ranking against other people, accounts, sound.
