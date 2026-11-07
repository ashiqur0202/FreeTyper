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
