# Mouse Practice Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline) — steps use checkbox syntax.

**Goal:** Turn the Learn tab into four unlockable levels (13 new drills), add Moving and Shrinking Aim modes, ranks, and the `level_pass` event.

**Architecture:** Pure rules and geometry in `levelRules.ts` (Node-tested). Drills are client components with the shared props `{ onDone, device }` in `drills2.tsx`, `drills3.tsx`, `drills4.tsx`; a `course.tsx` maps drill ids to components and wording. `MouseLevels.tsx` replaces `MouseLearn.tsx` (level pills, lock state, drill dots, current drill). `AimTrainer.tsx` gains a mode. `done` in `useMouseProgress` keeps any drill id as a string.

**Spec:** `docs/superpowers/specs/2026-11-07-mouse-practice-design.md` (see "Addendum 2026-11-07 (later)").

## Global Constraints
- Branch `feat/mouse-practice`; no push. Pass marks live only as constants in `levelRules.ts`.
- A drill calls `onDone` once, only when its pass condition is met. Failing shows the result and Try again.
- Nothing random at first render (drills mount only after user action, but keep initial values fixed; randomise only inside event handlers/start).
- Right-click menu blocked only inside a drill box. No lint or type errors added.
- Tests: `node --experimental-strip-types scripts/test-mouse.mjs`, `npx tsc --noEmit`, real-browser checks on `next start` on a fresh port.

## Review Focus
1. A level never unlocks from partial progress (`isLevelUnlocked(3, [all of level 1, 4 of 5 of level 2])` is false).
2. Old saved data (only the 7 step ids) still loads and still counts Level 1 as passed.
3. `steer` ratio is 0, not NaN, with no samples; pointer leaving the box mid-steer must not count as finished.
4. `hold` released early resets; `select` accepts only the exact target sentence (extra or missing words fail).
5. A wrong action in `gauntlet` costs a point but never ends the run; score floors at 0.
6. Moving target stays inside the area on every step (bounce) even with a large time step.

## Tasks
1. **Rules and geometry** (`levelRules.ts`, tests): `LEVEL_ITEMS`, level names/ranks, `isLevelPassed`, `isLevelUnlocked`, `rankOf`, thresholds, `meetsAccuracy`, `distToSegment`, `insideRatio`, `scalePath`, `stepTarget`, `shrinkDiameter`, `gauntletScore`. Test first, commit.
2. **Saved state** (`useMouseProgress.ts`): `done` holds strings, `best` keyed by string, `recordBest(key, score)`; old data loads. Commit.
3. **Level 2 drills** (`drills2.tsx`: `TargetsDrill` (used by `small` and `tiny`), `PreciseDragDrill`, `HoldDrill`, `SelectDrill`, `FindDrill`). Commit.
4. **Level 3 drills** (`drills3.tsx`: `MovingDrill`, `SteerDrill`, `QuickDrill`, `MenuDrill`, `SortDrill`). Commit.
5. **Level 4 and Aim modes** (`drills4.tsx`: `GauntletDrill`, `ShrinkDrill`; `AimTrainer.tsx` modes Classic/Moving/Shrinking with locks). Commit.
6. **Shell and wiring** (`course.tsx`, `MouseLevels.tsx`, `MousePractice.tsx`, CSS, `level_pass` event, content and docs). Commit.
7. **Real-browser verification and fixes**, docs, final commit.
