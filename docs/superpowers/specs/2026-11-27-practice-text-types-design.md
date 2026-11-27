# Practice text types (design, short)

Approved by Ashiqur on 2026-11-27 after the clickable demo (https://claude.ai/artifact/U5EuSFCvw5fQNqWjSvak4J).

## Intent and why
Adaptive Practice shows one kind of text (generated sentences). Some people want to type code, some quotes, some facts, some their own text. Everything must stay adaptive: one ring, one level, one set of focus keys, whatever kind of text is shown. The kind changes; the adapting does not.

## What the person sees
- The strip tabs become the text types: **Mixed · Sentences · Quotes · Facts · Code · Custom** (replacing adaptive / quotes / facts / code). Speed and accuracy stay on the right of the strip.
- Ring, level track, focus keys and letter row are the same on every type. The old separate letter row of the quotes / facts / code tabs goes away.
- **Mixed** rotates through sentences, quotes, facts and code (code less often, never the same kind twice in a row). A small tag under the text names the kind (Sentences, Quote, Fact, Code, Your text).
- **Code** shows a language row (JavaScript, Python, SQL, CSS, HTML); "any" is the default, a choice is remembered.
- **Custom**: a paste box (max 1,000 characters), button "Practise this text", then the text is typed as one run and repeats; "Change text" returns to the box. Marked as the person's own, not checked by us.
- The last chosen type (and code language) is remembered in localStorage and read only after hydration.

## Goals / non-goals / anti-goals
- Goals: every type counts toward level and key progress (same `applySegment`/`finishSession` path); quotes and facts keep using the checked libraries; code stays generated from templates.
- Non-goals: new quote/fact/code content; user accounts or saving custom texts across devices; changing Smart lessons, the daily challenge or the speed test.
- Anti-goals: no new friction while typing; no invented sources; custom text never shown as checked.

## Approaches considered
- A (chosen): source tabs in the existing strip, one adaptive screen.
- B: a second chip row under the strip (two rows of choices, more clutter).
- C: a "Text: Mixed" dropdown (cleanest, each type one click further away).

## How it is built (my calls)
- `AdaptivePractice` gets a `source` prop and a `language` prop; its `startText` picks the text by source: sentences = `generatePracticeSegment` (as now), quotes / facts = `pickPassage` with the checked libraries and recent-passage memory, code = `generateCode` with the level and plan weights, mixed = choose a kind then use that path, custom = the sanitised pasted text.
- `TypingPractice` keeps the tab state and renders `AdaptivePractice` for every type; its old non-adaptive branch is removed.
- Custom text is normalised (curly quotes and dashes to plain, whitespace collapsed, characters the typing box cannot expect dropped) and capped at 1,000 characters.
- Sessions are logged as practice with `modeDetail` carrying the type; the analytics event `practice_complete` keeps `category: 'adaptive'` and gains `source`.
- Tests of the pure parts (custom text cleaning, mixed rotation) run in the repo's existing test setup if one exists; otherwise they are checked in the browser.

## Left to the builder
Exact sanitising rules, the rotation weights for Mixed, small copy for the tags and notes, and the phone-width wrapping of six tabs.
