# FreeTyper — Project Blueprint

Free typing platform at **freetyper.com**: speed test, lessons, practice, keyboard guide, progress tracker and two games.
No login, no database, privacy-first (all data stays in the browser), to be funded by ads once AdSense approves.

This is the living reference. History lives in git. Per-guide detail lives in the header comment of each content file.

## 1. Status (updated 2026-10-06)
- **Product:** 7 tools, 7 guides, 10 blog posts and the legal pages are built, browser-tested and **live** (latest release 2026-10-05: the 34-lesson course with a 95 % gate; before it 2026-10-04: settings, touch input, GA4 events, `/typing-test` alias). All settings work. Live course test: 30/30 passed.
- **Built, tested, not deployed — branches `feat/weak-pairs` and `feat/result-card` (the latter, at commit `399759d`, is built on the former, so merging it ships both):** the new result card (speed graph, consistency, weak spots) on the speed test, practice and lessons — new suite `card` 36/36, pure checks `run-check` — plus letter-pair statistics, the **adaptive** Practice tab (now the default), the a–z letter row with a focus marker and click-to-drill, a “Weakest letter pairs” card on Progress, and the matching guide/privacy updates. New suites: `pairs` 19/19, `letters` 32/32, plus pure-logic checks; all older suites still pass. Deploy next (after the phone-keyboard fix if wanted).
- **AdSense:** application rejected — **“Low value content”**. The setup is correct and live. “Verify site ownership” is still open in the dashboard.
- **Done because of the rejection:**
  - every guide rewritten from the real code, with verified sources
  - blog cut from 25 to 10 posts, all rewritten
  - real author and dates, BlogPosting schema, bugs found while documenting fixed
- **Analytics snapshot (GA4 6 Jul–3 Oct 2026, Search Console last 3 months; exports were read on 2026-10-04):**
  - ~850 users, 1,123 sessions; new users rose from ~5/day (Aug) to ~40–55/day (late Sep), so today’s run-rate is well above 500 a month.
  - **Bing is the main source:** Bing 692 sessions (+ Yahoo 75, DuckDuckGo 17, all Bing-powered) ≈ 70 %. **Google organic: only 41 sessions (~4 %).** ChatGPT referrals: 53.
  - **Google has barely indexed the site:** 13 clicks / 44 impressions in 3 months; Pages report (to 21 Sep): 4 indexed, 34 not (32 “Discovered – currently not indexed”). Sitemap last read 28 Sep (old 38-URL version).
  - Visitors engage (organic ≈ 232 s per session). 93 % of views are tool pages; blog only 3.4 %. Lessons and practice are the 2nd and 3rd most visited pages.
  - Top countries: India 27.5 %, US 24 %, then Canada, China, Philippines, Pakistan, UK. **Key events were 0** (no conversions tracked) until the events below shipped.
- **GA4 events are live from the 2026-10-04 release.** Key events and custom dimensions still have to be registered in GA4 (§8) before WPM/category breakdowns appear.
- **Still open (needs Ashiqur):** see the TODO in §8.

## 2. Stack and release
- Next.js 16 (App Router, TypeScript) · Tailwind v4 · lucide-react · Inter + JetBrains Mono.
- **Read `node_modules/next/dist/docs/` before writing Next code** (`AGENTS.md`: this is not the Next.js you know).
- Docker standalone build · GitHub → **Coolify** → Hetzner · Cloudflare DNS and email routing.
- Repo: `github.com/ashiqur0202/FreeTyper`. A push to `master` auto-deploys (~3 min).
- **Release routine:**
  1. work on a branch (never commit to `master` directly)
  2. `npx tsc --noEmit` and `npm run build`
  3. test on `next start` in a headless browser
  4. fast-forward `master`, push
  5. poll the live site to confirm
- Analytics: GA4 `G-QC5509TVSF` · Search Console verified · Bing Webmaster Tools not set up yet · mail: `contact@freetyper.com`.

## 3. Architecture map
```
src/app/        page (speed test), [slug] (6 tool routes), blog, blog/[slug], about, contact, privacy,
                terms, disclaimer, settings (noindex), sitemap.ts, robots.ts, feed.xml, manifest.ts, opengraph-image
src/components/skills/typing/
                TypingSpeedTest, TypingLessons, TypingPractice, KeyboardGuide, TypingProgress,
                FallingWordsGame, WordAttackGame, LiveKeyboard, TypingPassage, PracticeFeedback, GameFeedback
                useTypingEngine (timer, WPM, Backspace), useTypingProgress (localStorage),
                useKeySound, mobileInput (touch/IME fallback)
                courseData (6 stages, 34 lessons, pass marks), courseWords (word list, sentences, passages),
                lessonText (text generator), courseProgress (unlock, skip, migration)
                pairStats (letter-pair stats, scoring, storage), pairDrill (weak-pair and single-key drill text),
                letterStats (per-letter status), LetterRow (the a–z row on Practice)
                runStats (per-run curve, consistency, weak spots), RunGraph (SVG graph), PracticeFeedback (the result card + coach notes)
                typingData (practice passages, finger map), gameData (word pools, tiers, rounds, scoring)
src/components/layout/   Sidebar, RightSidebar (both pinned), SettingsProvider, Footer, ContactPanel
src/components/          content/ExpandableSeoContent, seo/JsonLd, blog/BlogContent+BlogCard, tools/ToolClient
src/config/     tools.ts (7 tools), site.ts (name, author, AdSense id)
src/lib/        post-dates.ts (the one visible post date), key-sound.ts (Web Audio), analytics.ts (GA4 events), content-dates.ts (unused)
src/data/       home/typing-speed-content.ts and tools/*-content.ts  (guides: meta, faqs, previewHtml, bodyHtml, howToSteps)
                blog/typing-skills.ts (index) and blog/articles/*.ts (bodies)
public/ads.txt  google.com, pub-3237588309372777, DIRECT, f08c47fec0942fa0
```

## 4. Product rules
The guides and posts must stay consistent with these.

**Speed test**
- Durations 15 s–30 min, or custom 1–120 **minutes**. Text: words (easy + medium pools), sentences (quotes/news/fun), code (5 snippets).
- The timer starts on the first keystroke. Result: net WPM, accuracy, gross WPM, correct/errors/words, rank, vs last run, coach note. Last 5 runs kept.
- Net WPM = correct chars ÷ 5 ÷ minutes. Gross = all typed chars ÷ 5 ÷ minutes. Accuracy = correct ÷ typed.
- **Backspace removes the stepped-back character from the tally (right or wrong).** Accuracy describes the text left on screen; a fix costs time, not accuracy.
- Rank labels (ours, not a standard): beginner <40 · average 40–59 · skilled 60–79 · pro 80–99 · elite 100+.
- Coach: below 95 % “hold accuracy”, below 88 % “not a real score”.

**Lessons (34 lessons, 6 stages)**
- Home row 1–5 · top row 6–10 · bottom row 11–16 · Shift & punctuation 17–22 · numbers & symbols 23–28 · speed & accuracy 29–34.
- Text is generated at the start of every attempt from only the keys unlocked so far (`lessonText.ts`), so a retry shows new text.
- **Gate:** 95 % accuracy passes a lesson; lesson 32 (accuracy challenge) needs 98 %. A miss restarts the same lesson with new text; after 3 misses a "move on anyway" button appears (lesson is stored as skipped, which also unlocks the next).
- Only lesson 1 is open at the start; any opened lesson can be repeated (not mid-run).
- Migration: old `freetyper-lessons-progress` is converted once (old lesson → matching new range) into `freetyper-course-progress`.

**Practice**
- 20 built-in passages (5 each: quotes, news, code, fun) on the four text tabs, plus the **adaptive** tab. Untimed.
- **Adaptive tab = the default** (category id `adaptive`, first tab; the old `weak` id only survives in old practice logs). Each run is generated from your data:
  1. **Warm-up:** until ≥ 8 letters have ≥ 10 presses (`MIN_JUDGED_TO_ADAPT`), 40 random `COURSE_WORDS`.
  2. **Focus key** (`pickFocus`): the worst letter whose level is okay/weak/weakest; else the most common letter still under 10 presses (order e t a o i n s h r d l c u m w f g y p b v k j x q z); else null.
  3. Focus key → `generateKeyDrill` (40 real words containing it, extra weight on weak pairs ending in it). Null → `generatePairDrill` on the top 5 weak pairs → else a general mix. Which case is active is exposed as `data-weak-focus` = warmup | auto | manual | pairs | mixed (visible text only for warmup / pairs / mixed; the key itself is shown by the marker in the letter row).
  4. Recomputed for every run, so it moves on by itself when a key turns good. Any other tab = normal text.
  - **Pairs** (`pairStats.ts`): each letter typed after a letter is a sample (a–z only, ≤ 676 pairs): samples, recent-weighted errors (decay 0.97), and a timing only for a *correct* key whose gap from the previous key is 15–2000 ms and not right after a Backspace (EMA 0.25). Score = 4 × recent error rate (de ÷ (dn + 2)) + (ms ÷ your median pair ms − 1, ≥ 0); needs ≥ 5 samples, listed from 0.3, top 5; speed compared only once ≥ 8 pairs have ≥ 3 timings.
  - `pairDrill.ts`: each pair gets up to 3 of its own words first, the rest weighted random, no immediate repeats; a pair almost no word contains gets a repeated chunk (“qzqz qzqzqz”).
  - Typing in any tab (and the speed test and lessons) feeds the data; the games feed key presses only, and Word Attack marks every letter correct (inflates accuracy).
- Pair data lives in `freetyper-pairs`, written at most every 2 s and on page hide (never per keystroke), cleared by Reset on the progress page. Never sent to GA.
- **Letter row** (`LetterRow.tsx`, `letterStats.ts`) under the Practice tabs: 26 boxes a–z. Level from score = 4 × error rate (`keyStats`) + (ms into the letter ÷ your median letter − 1, floored at 0; ms = average of timed pairs ending in the letter). good < 0.15 · okay < 0.3 · weak < 0.6 · weakest ≥ 0.6 · grey under 10 presses. Colours = the heatmap palette; a bar under each letter repeats the level without colour. The key being drilled (auto or manual) gets an accent ring and a ▼ marker above it; a “n/m good” count and a “?” popover (legend, bar, marker) replace the old text lines, and “back to adaptive” shows only in manual mode. Short text lines remain only for warm-up / all-good states (the auto and manual sentences are `sr-only`). Scores recompute on load and after each finished run.
  - Click a letter → manual drill for that key (`generateKeyDrill`); it keeps drilling it until another letter, another tab, or “back to adaptive”. Locked during a run. The summary reads “n/m good”.

**Result card** (`PracticeFeedback.tsx`; same card on speed test, practice and lessons; label “result”)
- Headline (net WPM / WPM, accuracy, time, ↑/↓ vs the previous run; speed test also the rank pill), then — for runs ≥ 5 s with a saved curve — the **graph**, then stat tiles (speed test: correct · errors · gross WPM · consistency · words; practice/lessons: correct · errors · consistency), then **Weak spots in this run** + “drill these”, coach note, buttons, best/avg/clean line. The old “wpm scale” bar was removed.
- Data (`runStats.ts`) comes from the engine: every typed key is recorded (time, right/wrong, expected key, previous letter, gap). **Curve** = per second: speed = WPM of correct keys (rolling 5 s; 3 s under 20 s runs), raw = WPM of all keys (rolling 3 s; 2 s under 20 s runs), mistakes per second; the last partial second is scaled up (no false dip); long runs are averaged down to ≤ 120 points. **Keystroke-based**: a corrected mistake still shows on the graph, while net WPM/accuracy keep the Backspace rules.
- **Consistency** = 100 − (std ÷ mean of per-second raw WPM × 100) between first and last key, clamped 0–100. Our own measure, say so.
- **Weak spots** (max 4): keys with ≥ 2 mistakes (top 2) and letter pairs ≥ 1.5 × this run's median pair and ≥ 120 ms (needs ≥ 5 pairs typed ≥ 2 times with a clean timing; top 2). “drill these” = adaptive tab (button on Practice, link elsewhere).
- Storage: `run` is saved only in the latest-5 logs (`-speed-log`, `-practice-log`, `-lessons-log`, ~0.6–1.2 KB each) and is stripped (`withoutRun`) before `addSession`, so the long `freetyper-progress` history never grows. Old runs (and runs < 5 s) render the card without graph/consistency.
- Graph (`RunGraph.tsx`): hand-drawn SVG, no chart library; hover / touch / arrow keys show one second; has an `aria-label` summary.

**Progress**
- A “Weakest letter pairs” card (top 5: ms, × your typical pair, % errors, samples); under ~100 recorded pairs it says more typing is needed.
- Best WPM/accuracy exclude games; the chart and average include them (average = last 30 sessions).
- Streak = consecutive **local** days. Reset does not clear lesson unlocks or the latest-5 logs. 14 achievements.

**Falling Words**
- 10 tiers, 3 lives. Points by word length 10/25/50 (no combos).
- Tier thresholds (cumulative words): 10/20/36/48/75/90/126/144/180. Fall time ~3.2 s at tier 1, ~0.6 s at tier 10, scaled by elapsed time.
- Accuracy = cleared ÷ (cleared + dropped). Lists: 60 three-letter, 80 five-letter, 258 words of 5–10 letters.

**Word Attack**
- 8 rounds (5/6/6/7/7/8/8/10 words; 6/5/5/5/5/5/5/4.5 s per word).
- Points 10/25/50 × combo (×1 for 1–2, ×1.5 for 3–5, ×2 for 6–8, ×2.5 for 9–11, ×3 for 12+). The combo resets only on a timeout.
- One latest-5 entry per game; each round adds its own session to progress; WPM counts active play only.

**Settings** (`freetyper-settings`)
- Theme (dark / light / midnight / paper) · accent (6) · font size (typing text 14/18/22 px via `data-font-size`).
- Sound (soft tick / lower thud, Web Audio) · keyboard hints (next-key highlight) · layout (a fixed “QWERTY” label).
- Default is dark + gold `#e2b714`.

**Storage keys:** `freetyper-settings`, `-progress`, `-speed-log`, `-practice-log`, `-lessons-log`, `-pairs`, `-course-progress` (old `-lessons-progress` is read once for migration), `-fw-log`, `-wa-log`, `-fw-highscore`, `-wa-highscore`.

**Engine:** `onKeyStats(key, correct, {prev, gapMs})` — speed test, practice and lessons all feed `recordPair`; the games do not (no meaningful timing). The engine also feeds a per-run recorder (`runStats.createRecorder`) and returns `session.run` when a run finishes.

**Input:** window `keydown` plus a hidden-input `input` fallback for touch/IME. Capitals and shifted symbols highlight the key and the opposite-hand Shift.

## 5. Pages and SEO
| Route | What | Guide |
|---|---|---|
| `/` | speed test (home owns “typing speed test”) | ~2k words + FAQ |
| `/typing-lessons` `/typing-practice` `/keyboard-guide` `/typing-progress` | tools | ~1.6–1.7k words each + FAQ |
| `/typing-game-falling-words` `/typing-game-word-attack` | games | ~1.7k words each + FAQ |
| `/blog`, `/blog/[slug]` | 10 sourced posts | — |
| `/about` `/contact` `/privacy` `/terms` `/disclaimer` | trust and legal | — |

- A tool page is a full-viewport tool, then the guide (its first heading is the visible H1, open by default). `/typing-speed-test` and `/typing-test` redirect 308 to `/` (next.config.ts).
- Metadata: unique titles and canonicals · OG/Twitter and a generated OG image · PWA manifest.
- `robots.ts` allows all and points to the sitemap.
- `sitemap.ts`: **23 URLs** (7 static + 6 tools + 10 posts). Posts use `updated ?? date`; other URLs omit `lastmod` rather than fake it.
- `feed.xml`: tools + posts, dated `updated ?? date`.
- JSON-LD: Organization + WebSite (layout); WebApplication + FAQPage + HowTo on home and tools (FAQ text = the visible FAQ); Breadcrumb; **BlogPosting** on posts (author → `/about#author`). Output escapes `<`.
- Google has largely retired HowTo/FAQ rich results, so that markup is harmless and accurate, not a ranking lever.
- **GA4 custom events** (`src/lib/analytics.ts` → `trackEvent`). Numbers and short fixed labels only; never typed text.
  - `test_complete` {duration_s, text_mode, wpm, accuracy} · `lesson_attempt` {lesson_number, passed, wpm, accuracy, attempt} · `lesson_complete` (passes only) {lesson_number, lesson, wpm, accuracy} · `lesson_skip` {lesson_number} · `practice_complete` {category (adaptive, quotes, news, code, fun), wpm, accuracy}
  - `game_complete` {game, score, wpm, accuracy, level} (Falling Words at game over; Word Attack after round 8) · `game_round_complete` {game, round, score}
  - `setting_change` {setting, value} · `share_result` {source} (counted when the button is used)
  - The privacy page discloses these. Add a new event only if it follows the same rule and is added there.
- **AdSense:** publisher `ca-pub-3237588309372777` in the root `<head>`, the `google-adsense-account` meta, and `public/ads.txt`. Auto ads only (no `<ins>` units).
- **Never put ads.txt in `robots.txt`.** When approved, turn off overlay / anchor / vignette formats so they miss the typing area.
- Privacy/About: operator named (Ashiqur Rahman); honest about GA and Google’s cookie wording; not directed at children under 13; never claim “no tracking”.
- Login: **not now** (guest + localStorage).

## 6. Content standards
**Guides and posts**
- Describe only what the code does. Cite only sources actually opened and checked. No invented statistics or first-hand stories. State limits and label our own suggestions.
- The FAQ array feeds both the visible FAQ and the schema. Byline: Ashiqur Rahman.
- **Bump the visible date when you edit.** Guides: the `<time datetime>` and the “Last real edit” comment. Posts: the `updated` field.
- Readers see one date (`Updated …`, else `Published …`); JSON-LD keeps both.
- Update the guide and the code in the same commit.

**Sources verified so far**
- Dhakal et al., CHI 2018 (168,960 volunteers; mean 51.56 WPM, SD 20.2; top 10 % above ~78, bottom 10 % below ~26; uncorrected errors 1.167 %; trained ~+5 WPM) · University of Cambridge write-up.
- OSHA workstation pages · NHS (carpal tunnel, RSI) · Thomsen 2008 · Waersted 2010.
- Walker 2002 and 2003 · Brawn 2010 · Walker & Stickgold 2004 · Rempel 1997 · Gerard 1999.
- Minelli 2015 · Xia 2018 · SSC India CHSL 2026 notice · eSkill docs · Wikipedia (Words per minute, Touch typing, Muscle memory, Data entry clerk).

**Blog: 10 posts, ~1.0–1.5k words, rewritten 2026-10-04**
- `how-to-type-faster` · `good-typing-speed` · `improve-typing-accuracy` · `touch-typing-for-beginners` · `muscle-memory-and-touch-typing`
- `10-bad-typing-habits` · `typing-speed-for-programmers` · `data-entry-typing-test` · `mechanical-vs-membrane-keyboards` · `fix-typing-posture-and-avoid-wrist-pain`
- 15 older templated posts were deleted (not indexed; no redirects) and their links remapped. The old text is in git history.

**Next posts (1 a week):** how employers score typing tests (net vs gross, accuracy floors) · laptop vs external keyboard · practising 10 minutes a day · common typing errors by key pair (from the Dhakal error data).

## 7. AdSense plan
Google’s stated bar: authentic, high-quality content and tools · **ongoing curation** · **sustained, genuine user interest**.
Likely causes (inferred): bulk templated content with no sources or real author (fixed), guides collapsed behind “Read more” (fixed), and a new domain with almost no Google-indexed pages (open; traffic itself is now rising).
- [ ] **[A]** AdSense → Sites → freetyper.com → **Verify site ownership** (snippet, meta tag and ads.txt are live; if there is no button, Google auto-verifies within days, else contact AdSense help with a screenshot).
- [ ] **[A]** After several weeks of steady growth and more pages indexed: **request a review** (repeated rejections do not help).

## 8. TODO (owner: **[A]** Ashiqur · **[C]** Claude in code)
**Now — growth is limited by distribution, not features**
- [ ] **[A]** Confirm the events arrive: GA4 → Reports → Realtime, finish a test on freetyper.com and look for `test_complete` under “Event count by Event name” (DebugView with the GA Debugger extension shows the parameters).
- [ ] **[A]** Set up **Bing Webmaster Tools** (free): import the site from Search Console, submit `sitemap.xml`, read its queries. Bing is ~70 % of traffic.
- [ ] **[A]** Search Console: **resubmit the sitemap** (23 URLs) and **request indexing** for `/`, `/blog`, the 6 tool pages and the 10 posts.
- [ ] **[A]** Request indexing for `/typing-lessons` in Search Console (content changed a lot on 2026-10-05).
- [ ] **[A]** GA4, once each event has appeared at least once (register the custom definitions first — they are not retroactive): Admin → Events → mark `test_complete`, `lesson_complete`, `practice_complete`, `game_complete` as **key events**; Admin → Custom definitions → add dimensions `text_mode`, `category`, `game`, `lesson`, `passed`, `setting`, `value` and metrics `wpm`, `accuracy`, `duration_s`, `score`, `level`, `lesson_number`, `attempt`.
- [ ] **[A]** Publish 1 sourced post a week; share honestly (Reddit r/typing, Show HN, Product Hunt); look for a few real links.
- [ ] **[A]** Re-export Search Console + GA4 monthly into `analytics/` (git-ignored) so progress can be compared.

**Next — product work the data supports**
- [ ] **[C]** **Deploy `feat/result-card`** (it contains `feat/weak-pairs`; merge fast-forward, push, poll, run the `pairs` / `letters` / `course` / `card` suites against the live site; the `card` suite types for ~20 s per page), then request indexing for `/typing-practice` (guide changed a lot) and check the GA4 `practice_complete` category values (`adaptive` is new).
- [ ] **[C]** **Fix the phone overflow** (see §9): scale `LiveKeyboard` to the screen width or hide it on touch devices.
- [x] Longer lessons course (34 lessons, 95 % gate) — **live since 2026-10-05**. Now watch `lesson_attempt` (pass rate per lesson) in GA4 to find lessons that are too hard.
- [ ] **[C]** A clear, printable **touch-typing finger chart** (people already search “keyboard finger chart / touch typing diagram”; the keyboard guide ranks ~position 47–73 for it).
- [ ] **[C]** Preset **duration pages** (e.g. 1-minute, 5-minute test) as real working tools with a short unique intro — only after pages are being indexed, and never thin duplicates.
- [ ] **[C]** Save the browser checks as **Playwright tests** in `tests/` (speed run, finger labels, Word Attack progress, Falling Words speed, hydration, sticky rails, touch input, GA4 events, redirects).
- [ ] **[A]** Test touch typing on a real phone; optional: real screenshot of a result card for the home guide; rename sidebar “start” → “speed test”.

**Planned product work (agreed 2026-10-05; build order)**
- [x] **[C] 1. Weak-pair drills (bigrams), letter row, adaptive default** — built on `feat/weak-pairs` (rules in §4 Practice). Ideas left: a user-set target WPM (keybr has one) · a “you improved” summary after a drill (“th 260 → 190 ms”) · adaptive for digits and punctuation (pairs are letters only) · an adaptive entry on the home page · a Dhakal-style hand/finger-pair view.
- [ ] **[C] 2. Coding tracks.** Start with **one** language, chosen from real Bing Webmaster queries (guess: JavaScript). Four thin tracks would repeat the “low value content” problem.
  - ~15 original snippets, ordered by difficulty, each run or compiled to prove it is correct, each with a note on the symbols it trains.
  - Decide how Enter, Tab and leading indentation work in code (proposal: skip leading indentation automatically after Enter; a setting later). Check the engine first.
  - Start as a Practice category; a route per language only once it has its own guide and enough content.
- [x] **[C] 3. Upgrade the result card** — built on `feat/result-card` (rules in §4 Result card). The graph shows from 5 s (it was 10 s; fast typists finishing a short quote got none). Ideas left: a per-run keyboard heatmap behind a toggle (demoed, left out to keep the card short) · a “you improved” comparison of weak pairs after a drill · result-card guide screenshots. The share image is item 4.
- [ ] **[C] 4. Share the result as an image (agreed 2026-10-06, not built).** Today “share” (speed test only) copies one text line (`20 WPM · 55% accuracy — FreeTyper`); an image gets noticed in feeds and puts `freetyper.com` in front of people (helps the traffic goal).
  - A purpose-made **1200×630 PNG drawn on a canvas in the browser** (not a screenshot of the live card: that has buttons, the coach note and a window-dependent size). Content: big WPM, accuracy, time, rank, a mini speed graph, date, `freetyper.com`; theme colours. Nothing is uploaded; it shows only the finished run, never typed text.
  - Button behaviour: phones → Web Share API with the image attached; desktop → copy the image to the clipboard (`ClipboardItem`, PNG); if blocked/unsupported → download the PNG and copy the old text line.
  - Add the share button to **practice and lessons** too (only the speed test has one today). Keep the `share_result` GA event, with `source` = speed_test | practice | lessons (update the privacy page text only if the payload changes).
  - Update the guides (result card section) and `freetyper.md`; add a browser test (button produces a PNG blob of 1200×630; fallbacks work when the clipboard is blocked).

**Later — ideas, validate first**
- Custom text importer (paste your own text): **dropped for now** (no SEO value, narrow audience, odd-input edge cases). Revisit only if students ask.
- Exam / language typing tests (India, Pakistan and Bangladesh are in the top countries): check Bing Webmaster queries before building.
- Make guides easy for AI assistants to cite (clear definitions, sourced numbers) — ChatGPT already refers visitors.
- Accounts, leaderboards, multiplayer races, Dvorak/Colemak, more games, progress export/import, ease Falling Words tiers 7–10, more than 20 practice passages.
- Cleanup: ~57 older lint errors · delete `content-dates.ts` · unused config in `gameData.ts` (`wordAttackRounds.duration/basePoints`, `scoringRules.speedBonus*`).

**Recently done (2026-10-03 to 06):** all guides and posts rewritten · blog 25 → 10 · settings, touch input, shift hints, Esc/slash fixes · sticky sidebars · one visible post date · About/Disclaimer wording fixed · `/typing-test` alias · GA4 events · 34-lesson course (live 2026-10-05) · weak pairs, letter row, adaptive practice and the new result card (built 2026-10-06, branches only).

## 9. Gotchas
- **Phone overflow (open bug):** the on-screen `LiveKeyboard` is ~119 px wider than a 390 px screen on `/`, `/typing-lessons` and `/typing-practice`, so the page scrolls sideways. Fix idea: scale the keyboard to the width or hide it on touch devices.
- **Sidebars:** keep `md:sticky md:top-0 md:h-screen md:self-start` on both asides. `h-auto` or `min-h-screen` stretches them in the flex row and breaks sticky.
- **Hydration:** anything read from localStorage must render only after hydration (see `KeyboardGuide`, `useSyncExternalStore`).
- **Slash key:** `/` opens the speed-test command palette unless the passage starts with `/`.
- **Escaping:** JSON-LD uses `\\u003c`. Template-literal guides cannot contain backticks or `${`.
- **Lint:** the repo has older lint errors. A change must not add new ones — compare before and after on the files you touch.
- **Dates:** never backdate or auto-update visible dates. The sitemap and feed use real dates only.
