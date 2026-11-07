# Mouse and Trackpad Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/mouse-practice`, a free page with a Learn tab (guided mouse and trackpad steps) and an Aim tab (30-second target game), on the existing tool-page pattern.

**Architecture:** Pure logic (step wording, aim scoring) lives in two dependency-free `.ts` files that a plain Node script tests. Browser-only parts are small client components (`MouseLearn`, `drills`, `AimTrainer`) under one shell (`MousePractice`). Saved state (device choice, finished steps, best scores) is one `localStorage` key read through `useSyncExternalStore`, so nothing renders from storage before hydration. The page is registered like every other tool: `config/tools.ts`, `ToolClient`, sidebars, `[slug]/page.tsx` and a content file.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, lucide-react, pointer/wheel/context-menu DOM events. No new dependencies. No test framework exists in the repo: logic tests run with `node --experimental-strip-types` (Node 22.20).

**Spec:** `docs/superpowers/specs/2026-11-07-mouse-practice-design.md`. Changes agreed after the spec was written (2026-11-07): Learn is the default tab; the title and description lean toward beginners and trackpad; two GA4 events are added.

## Global Constraints

- Branch `feat/mouse-practice` (on top of `feat/shared-laptop-keyboard`); never commit to `master`; no push until Ashiqur says so.
- Anything read from `localStorage` renders only after hydration (use `useSyncExternalStore`, never `useState` + effect: the repo lint rejects set-state-in-effect).
- Device cannot be detected: the user picks `Mouse` or `Trackpad`; default `mouse`.
- Aim sizes: large 80 px, medium 56 px, small 36 px; run length 30 s; score = `max(0, hits - misses)`; accuracy = hits ÷ (hits + misses) as an integer percent, 0 when there are no clicks; default size medium for Mouse, large for Trackpad.
- Right-click blocks the browser menu only inside the practice box; everywhere else the menu stays.
- No pinch or multi-finger gesture steps. The guide states this.
- Guide content follows `AGENTS.md`: describe only what the code does, no invented numbers, state limits, visible date November 7, 2026 (not backdated).
- New GA4 events use `trackEvent` from `src/lib/analytics.ts`; send only numbers and short fixed labels.
- Do not add lint errors: compare `npx eslint` on every touched file against `master`.
- Test pages on `next start` (`npm run build` first). Use a fresh port and stop only servers you started.

## Review Focus

1. **A double-click also fires two single clicks.** The "double-click" step must not finish the earlier "click" step's logic twice or mark itself done on a plain click. Test: one click does not complete `double`; a `dblclick` does.
2. **Right-click outside the practice box.** The browser menu must still open there. Test: `contextmenu` on the page body is not `defaultPrevented`; inside the box it is.
3. **Drag released off target or cancelled.** Releasing outside the drop zone, or a `pointercancel`, must not complete the step and must reset the card. Test both.
4. **Aim edge cases.** A run with zero clicks gives accuracy 0 (not NaN) and score 0; clicks after 30 s are ignored; restarting resets the counters; a miss near the target edge counts as a miss.
5. **Touch and slow trackpad.** A `touch` pointer shows the "built for mouse or trackpad" note without blocking; a trackpad step open for 10 s shows the touchpad-settings hint.
6. **Saved state before hydration.** The server render and first client render both show the default (`mouse`, nothing finished, no best scores); saved values appear after hydration with no console warning.

## File Structure

| File | Responsibility |
|---|---|
| `src/components/skills/mouse/mouseData.ts` (new) | Types `Device`, `StepId`; `STEPS` (wording per device); `HINT_AFTER_MS` |
| `src/components/skills/mouse/aimScoring.ts` (new) | `AIM_SIZES`, `AIM_SECONDS`, `scoreRun`, `randomTarget`, `isNewBest`, `defaultSize` |
| `src/components/skills/mouse/useMouseProgress.ts` (new) | Saved device, finished steps, best scores; `useIsClient` |
| `src/components/skills/mouse/drills.tsx` (new) | Seven drill components, one per step |
| `src/components/skills/mouse/MouseLearn.tsx` (new) | Learn tab: progress dots, instruction, current drill, trackpad hint |
| `src/components/skills/mouse/AimTrainer.tsx` (new) | Aim tab: size picker, run loop, results, best |
| `src/components/skills/mouse/MousePractice.tsx` (new) | Shell: tabs, device toggle, touch note |
| `scripts/test-mouse.mjs` (new) | Node tests for `mouseData.ts` and `aimScoring.ts` |
| `src/data/tools/mouse-practice-content.ts` (new) | `meta`, `faqs`, `previewHtml`, `bodyHtml`, `howToSteps` |
| `src/config/tools.ts`, `ToolClient.tsx`, `Sidebar.tsx`, `RightSidebar.tsx`, `src/app/[slug]/page.tsx` (modify) | Registration |
| `src/app/globals.css` (modify) | `.mp-*` styles |
| `freetyper.md`, `analytics.md` (modify) | Status, new events, launch note |

---

### Task 1: Pure logic and its tests

**Files:**
- Create: `src/components/skills/mouse/mouseData.ts`, `src/components/skills/mouse/aimScoring.ts`
- Test: `scripts/test-mouse.mjs`

**Interfaces:**
- Produces (`mouseData.ts`):
  - `type Device = 'mouse' | 'trackpad'`
  - `type StepId = 'move' | 'click' | 'double' | 'right' | 'drag' | 'scroll' | 'mixed'`
  - `const STEPS: { id: StepId; title: string; text: Record<Device, string> }[]` (seven entries in the spec's order; wording from the spec's step table)
  - `const HINT_AFTER_MS = 10000`
- Produces (`aimScoring.ts`):
  - `type AimSize = 'large' | 'medium' | 'small'`
  - `const AIM_SIZES: Record<AimSize, number>` = `{ large: 80, medium: 56, small: 36 }`; `const AIM_SECONDS = 30`
  - `type AimEvent = { hit: boolean; reactionMs?: number }`
  - `type AimResult = { hits: number; misses: number; accuracy: number; avgReactionMs: number; score: number }`
  - `function scoreRun(events: AimEvent[]): AimResult`
  - `function randomTarget(areaW: number, areaH: number, d: number, rand?: () => number): { x: number; y: number }` (top-left of a target of diameter `d`, fully inside the area)
  - `function isNewBest(prev: number | undefined, score: number): boolean`
  - `function defaultSize(device: Device): AimSize`

- [ ] **Step 1: Write `scripts/test-mouse.mjs` (failing).** Import both `.ts` files. Assertions with `node:assert/strict`:
  - `STEPS.length === 7`, ids in order `move, click, double, right, drag, scroll, mixed`, every step has non-empty `text.mouse` and `text.trackpad`, and `text.trackpad` of `right` mentions "two-finger".
  - `scoreRun([])` equals `{ hits: 0, misses: 0, accuracy: 0, avgReactionMs: 0, score: 0 }`.
  - `scoreRun` of 3 hits (reactions 400, 500, 600) and 1 miss gives `hits 3, misses 1, accuracy 75, avgReactionMs 500, score 2`.
  - Score floors at 0: 1 hit, 4 misses gives `score 0`.
  - `randomTarget(500, 300, 80, () => 0)` is `{x: 0, y: 0}` and `randomTarget(500, 300, 80, () => 0.999999)` stays within `x <= 420`, `y <= 220`.
  - `isNewBest(undefined, 1) === true`, `isNewBest(5, 5) === false`, `isNewBest(5, 6) === true`, `isNewBest(5, 0) === false`.
  - `defaultSize('mouse') === 'medium'`, `defaultSize('trackpad') === 'large'`.
- [ ] **Step 2: Run to verify it fails.** Run: `node --experimental-strip-types scripts/test-mouse.mjs`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement both files** with the signatures above. Neither file imports anything except types between themselves (`aimScoring.ts` uses `import type { Device } from './mouseData'`, which Node strips, so write it as a type-only import); keep them free of React so Node can load them.
- [ ] **Step 4: Run the test.** Same command. Expected: exits 0 with all assertions passing.
- [ ] **Step 5: Commit** `feat: mouse practice step wording and aim scoring, with tests`.

---

### Task 2: Saved state hook

**Files:**
- Create: `src/components/skills/mouse/useMouseProgress.ts`

**Interfaces:**
- Consumes: `Device`, `StepId`, `AimSize` from Task 1.
- Produces:
  - `type MouseProgress = { device: Device; done: Record<Device, StepId[]>; best: Partial<Record<AimSize, number>> }`
  - `function useIsClient(): boolean` (false on server and during hydration)
  - `function useMouseProgress(): { progress: MouseProgress; ready: boolean; setDevice(d: Device): void; completeStep(d: Device, s: StepId): void; recordBest(size: AimSize, score: number): boolean }` (`recordBest` returns whether it was a new best)

- [ ] **Step 1: Implement** with a module-level store: storage key `freetyper-mouse`; `subscribe`/`getSnapshot` over the raw string (plus a listener set so writes notify the same tab); parse with `useMemo` into `MouseProgress`; any parse failure or bad shape falls back to the default `{ device: 'mouse', done: { mouse: [], trackpad: [] }, best: {} }`. Server snapshot is always the default. Writes are wrapped in `try/catch`. `completeStep` ignores duplicates.
- [ ] **Step 2: Verify.** Run `npx tsc --noEmit`, expected exit 0; run `npx eslint src/components/skills/mouse/useMouseProgress.ts`, expected 0 problems.
- [ ] **Step 3: Commit** `feat: saved state for mouse practice (device, steps, best scores)`.

---

### Task 3: Learn drills

**Files:**
- Create: `src/components/skills/mouse/drills.tsx`, `src/components/skills/mouse/MouseLearn.tsx`
- Modify: `src/app/globals.css` (append `.mp-*` block)

**Interfaces:**
- Consumes: `STEPS`, `HINT_AFTER_MS`, `Device`, `StepId` (Task 1); `useMouseProgress` (Task 2); `trackEvent` from `@/lib/analytics`.
- Produces: `type DrillProps = { onDone: () => void }`; named exports `MoveDrill, ClickDrill, DoubleClickDrill, RightClickDrill, DragDrill, ScrollDrill, MixedDrill: (p: DrillProps) => JSX.Element`; `const DRILLS: Record<StepId, (p: DrillProps) => JSX.Element>`; default export `MouseLearn(): JSX.Element` taking no props, reading the device and progress from `useMouseProgress`.

- [ ] **Step 1: Implement drills** (each has `data-testid="drill-<id>"` on its practice box):
  - Move: three targets lit one by one; `onPointerEnter` on the lit target advances; done after the third.
  - Click: one target, done on `click`.
  - Double-click: done on `dblclick` only; a single click shows "again, quicker".
  - Right-click: `onContextMenu` on the practice box only calls `preventDefault()` and completes.
  - Drag: a card and a drop zone using pointer events with `setPointerCapture`; done on `pointerup` over the zone; `pointerup` elsewhere or `pointercancel` returns the card.
  - Scroll: a 200 px list with 12 rows; done once the box `scrollTop` has moved at least 120 px (listen to `scroll`, never `preventDefault` a `wheel`).
  - Mixed: three prompts in a row (click, double-click, right-click) in random order.
- [ ] **Step 2: Implement `MouseLearn`:** progress dots (finished steps filled), current step = first unfinished (or the last when all are done, with a "all steps done" message), instruction from `STEPS[i].text[device]`, current drill from `DRILLS`; on `onDone` call `completeStep` and `trackEvent('mouse_step_complete', { step, device })`. If the device is `trackpad` and the step is not done after `HINT_AFTER_MS`, show "If nothing happens, check your laptop's touchpad settings." A "Back to step 1" control resets nothing saved, only the viewing position.
- [ ] **Step 3: Verify.** `npx tsc --noEmit` exits 0; `npx eslint` on the three touched files shows no problems.
- [ ] **Step 4: Commit** `feat: mouse practice Learn tab with seven drills`.

---

### Task 4: Aim trainer

**Files:**
- Create: `src/components/skills/mouse/AimTrainer.tsx`

**Interfaces:**
- Consumes: `AIM_SIZES, AIM_SECONDS, scoreRun, randomTarget, isNewBest, defaultSize, AimEvent, AimSize` (Task 1); `useMouseProgress` (Task 2); `trackEvent`.
- Produces: default export `AimTrainer(): JSX.Element`.

- [ ] **Step 1: Implement.** States `idle | running | done`. Size buttons (large, medium, small), preselected with `defaultSize(device)` until the user chooses. Start button begins a 30-second run (a 100 ms interval compares `performance.now()`, not a counted tick, so the run ends at 30 s). One target button at a time inside a fixed-height play area (height 320 px, full width), positioned with `randomTarget`. `onPointerDown` on the target records `{ hit: true, reactionMs }` and moves the target; `onPointerDown` on the area (target stops propagation) records `{ hit: false }`. Events after the end are ignored. At the end show `scoreRun` results (hits, misses, accuracy, average reaction, score), the best for that size, and "New best" via `recordBest`; send `trackEvent('aim_run_complete', { size, hits, accuracy, score })`. "Try again" returns to `idle` with counters cleared.
- [ ] **Step 2: Verify.** `npx tsc --noEmit` exits 0; `npx eslint src/components/skills/mouse/AimTrainer.tsx` shows no problems.
- [ ] **Step 3: Commit** `feat: mouse practice Aim tab with scoring and best scores`.

---

### Task 5: Shell, registration and page content

**Files:**
- Create: `src/components/skills/mouse/MousePractice.tsx`, `src/data/tools/mouse-practice-content.ts`
- Modify: `src/config/tools.ts`, `src/components/tools/ToolClient.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/RightSidebar.tsx`, `src/app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `MouseLearn` (Task 3), `AimTrainer` (Task 4), `useMouseProgress`, `useIsClient` (Task 2).
- Produces: default export `MousePractice(): JSX.Element`; content exports `meta: { title; description }`, `faqs`, `previewHtml`, `bodyHtml`, `howToSteps` (same shapes as `keyboard-guide-content.ts`).

- [ ] **Step 1: `MousePractice`:** tabs `Learn` (default) and `Aim`; a `Mouse | Trackpad` toggle calling `setDevice` (until `useIsClient()` is true it shows `mouse`); a one-time note when a `pointerdown` with `pointerType === 'touch'` is seen: "This page is built for a mouse or a laptop trackpad. It still works on a touchscreen." (dismissible, never blocking).
- [ ] **Step 2: Register.** `tools.ts`: add `Mouse` from lucide-react to the import and `iconMap`; add the entry `{ id: 'mouse-practice', name: 'Mouse Practice', seoTitle, description, iconName: 'Mouse', category: 'typing', featured: true }` (title and description lean toward "mouse practice for beginners" and "trackpad practice"; description at most 160 characters). `ToolClient.tsx`: `dynamic` import and `componentMap['mouse-practice']`. `Sidebar.tsx`: add `{ href: '/mouse-practice', label: 'mouse', icon: Mouse }` after `progress`. `RightSidebar.tsx`: add `{ href: '/mouse-practice', label: 'Mouse practice' }` after `Progress`. `[slug]/page.tsx`: import the content file, add a `seoToolPages['mouse-practice']` entry (`h1: 'Mouse and Trackpad Practice for Beginners'`, `howToName: 'How to Practise Mouse and Trackpad Skills on FreeTyper'`) and add `slug === 'mouse-practice'` to the top-aligned layout condition.
- [ ] **Step 3: Write `mouse-practice-content.ts`** from the spec's "Page guide" section: file header comment naming the files it describes, `Last real edit: 2026-11-07`, visible date `<time datetime="2026-11-07">November 7, 2026</time>`; FAQs cover: mouse versus trackpad steps, why you choose the device, the aim score formula, what is saved in the browser, tap-to-click and right-click settings differ by laptop, what it cannot teach (pinch, multi-finger gestures), touchscreens. No statistics and no outside claims.
- [ ] **Step 4: Verify.** `npx tsc --noEmit` exits 0; `npx eslint` on every touched file; compare each against `git show master:<path> | npx eslint --stdin --stdin-filename <path>`: counts must not rise.
- [ ] **Step 5: Commit** `feat: add the mouse and trackpad practice page`.

---

### Task 6: Browser verification, docs and handoff

**Files:**
- Modify: `freetyper.md` (sections 0 and 3 plus a short rules entry), `analytics.md` (log entry: new events `mouse_step_complete` with params `step`, `device`; `aim_run_complete` with `size`, `hits`, `accuracy`, `score`; GA4 needs `step`, `device`, `size`, `hits`, `accuracy` registered as custom definitions by Ashiqur)

- [ ] **Step 1: Build and serve.** `npm run build`, then `next start -p <fresh port>`. Expected: `/mouse-practice` returns 200 and is listed in `/sitemap.xml`.
- [ ] **Step 2: Test in Chrome with synthetic events** (javascript tool), one check each, expected results in brackets: one `click` on the double-click drill does not complete it [step still open]; a `dblclick` does [done]; `contextmenu` on `body` is not default-prevented and inside the right-click box is [both true]; drag released off the zone and a `pointercancel` leave the step open and the card back [true]; scrolling the list box 150 px completes the scroll step [done]; aim: a hit sequence of 3 hits and 1 miss shows score 2 and accuracy 75; a run ends at 30 s and a later click changes nothing; restart clears counters.
- [ ] **Step 3: Hydration and state.** Set `localStorage['freetyper-mouse']` to a trackpad device with two finished steps and one best score, reload: the console has no hydration warnings and the saved values show after load; clear it and reload: defaults show.
- [ ] **Step 4: Look at it** in dark and light themes at desktop width and in a 390 px frame (no horizontal overflow, targets inside the area); read the console for errors.
- [ ] **Step 5: Docs.** Update `freetyper.md` (what shipped on the branch, the two GA4 events, still-unchecked: real phone, real trackpad) and add the `analytics.md` log note. Run `node --experimental-strip-types scripts/test-mouse.mjs` and `npx tsc --noEmit` one last time.
- [ ] **Step 6: Commit** `docs: record the mouse practice page and its events`. Stop here: the push is Ashiqur's call and goes out together with the keyboard work.
