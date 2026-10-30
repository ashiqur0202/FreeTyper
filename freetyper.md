# FreeTyper — Project Blueprint

Free typing platform at **freetyper.com**: speed test, lessons, practice, keyboard guide, progress tracker and two games.
No login, no database, privacy-first (all data stays in the browser), to be funded by ads once AdSense approves.

This is the living reference. History lives in git. Per-guide detail lives in the header comment of each content file.

## 0. Resume here (updated 2026-10-24)
- **Keep this file and `analytics.md` current.** At the end of every session or change, update the status here and add a dated entry to `analytics.md` if any numbers were read. They are how a new session learns the project state.
- **Repo state (2026-10-24):** the logo release (branch `feat/logo-k`, which also carried the earlier docs-only commits) was fast-forwarded into `master` and pushed on 2026-10-24, so `master` = `origin/master` = that branch and it deploys through Coolify (~3 min). Run `git log --oneline -5` and `git status` to see the exact commit. The older branches (`docs/*`, `feat/logo-k`) hold no unmerged work and can be deleted.
- **Docs branch (2026-10-28; its docs commits were released with the 2026-10-30 release):** `docs/engagement-ideas` held 5 docs-only commits (engagement ideas, PageSpeed audit, top-5 growth features, Bing keyword read in `analytics.md`). They ship with the next code release; nothing is decided or started from them. Ashiqur said “nothing to do for now” on 10-28. The weekly analytics read was done 2026-10-30 (see `analytics.md`); the formal Bing retitle CTR read is due about 11-01 to 11-08 (preliminary: CTR flat). See §8 for the three new to-do blocks.
- **Do next, in this order (all [C] = Claude in code):**
  1. **Fix the phone overflow** (§9): the on-screen keyboard makes `/`, `/typing-lessons` and `/typing-practice` scroll sideways on a 390 px screen. GA4 (2026-10-10) shows only 2.5 % mobile (97 % desktop, 70 % Edge), so it is lower priority than first assumed, but it may also be why mobile is so low (see `analytics.md`).
  2. **Share the result as an image** (§8, item 4; plan is written out there).
  3. **Move the browser tests into the repo** (§8 “Playwright tests”). The suites that were used for every release (`run`, `fixes`, `events`, `course`, `pairs`, `letters`, `card`, `sticky`, `hydration`, plus pure-logic checks) were plain `puppeteer-core` + Chrome scripts kept in Claude's temporary scratchpad **outside the repo**, so they can disappear. Rebuild them from the behaviour in §4. They ran against `next start -p 3100` (or the live site via a `BASE` URL); `card` types ~20 s per page.
  4. **Coding tracks** only after Bing Webmaster shows which language people search for.
- **Ashiqur's list ([A], most valuable for growth):** ~~Bing Webmaster Tools~~ (done 2026-10-08, §2) · GA4 **key events + custom dimensions** (events do arrive; registering them is not retroactive, so do it first) · Search Console: request indexing for the pages Google has not fetched (`/`, `/typing-lessons`, `/typing-practice` are already indexed) · ~~AdSense site verification~~ (done, all green; re-applied 10-26) · one sourced blog post a week · monthly analytics entry in `analytics.md`.
- **Growth plan:** the prioritised, weekly-revised list of growth actions lives in `analytics.md` ("Growth plan"); §8 below keeps the longer product detail.
- **Done 2026-10-18:** GA4 key events marked (4) plus 7 custom dimensions and 7 custom metrics (the §8 GA4 todo is finished); Google indexing requested for `/typing-practice`, `/keyboard-guide`, `/typing-progress`, the 2 games, `/blog` and 2 posts (8 pages). **New titles/descriptions for lessons, practice and keyboard guide are LIVE since 2026-10-18 (master `0441c19`, confirmed on the live site).** Do not change them again before the Bing CTR read on about 11-01 to 11-08.
- **New logo released 2026-10-24 (pushed to `master`; tsc, build and lint on the touched files were clean, and it was checked on `next start`; check the live site and a real tab after the deploy, and expect browsers to keep the old cached icon for a while):** the "K" mark (F and T share one top bar, the T stem is a pale cursor; gold `#e2b714` on dark `#1a1812`; in the sidebar and footer the gold parts follow the accent chosen in Settings via `--color-accent`, and the T-stem cursor blinks via `.cursor-blink`, switched off under `prefers-reduced-motion`; **the browser-tab icon blinks and follows the accent too**, through `FaviconBlink.tsx` (sets the href of every `<link rel="icon">` to the blinking inline SVG every 500 ms, skipped under reduced motion; **it must never remove those links: Next/React owns them, and the earlier version called `l.remove()`, which made client navigation throw `Cannot read properties of null (reading 'removeChild')` (seen in dev on `/` to `/blog` and `/typing-lessons` to `/typing-practice`; the live site had the same code since 10-24); fixed on branch `fix/favicon-removechild` 2026-10-30, not yet released**; verified in headless Chrome that the link toggles and survives client navigation, but not seen in a visible tab). The static `/favicon.svg`, `.ico`, app icons and share image stay gold and still, which is what search engines and bookmarks see). Files: `public/favicon.svg`, `src/app/favicon.ico` (16/32/48), `src/app/apple-icon.png` (180, full-bleed), `public/icon-192.png` and `icon-512.png` (in the manifest), `src/components/layout/LogoMark.tsx` (sidebar and footer), the mark in `opengraph-image.tsx`, and the Organization/publisher `logo` in `JsonLd.tsx` now points to `/icon-512.png` (square) instead of the 1200×630 OG image. The wordmark has no cursor after it. Google may take days to weeks to show the new favicon; re-request indexing of `/` if it is slow. The design boards were demo pages only and are not in the repo.
- **Weekly analytics cycle (started 2026-10-18):** once a week Claude reads GA4, Search Console and Bing Webmaster in the signed-in Chrome and adds a dated entry to the top of `analytics.md` (steps in its "Weekly routine"). Last run **2026-10-30**; **every Friday** (next **2026-11-06**), now with a daily / weekly / monthly growth verdict (`analytics.md`: Friday routine and Growth scorecard).
- **Latest reading (2026-10-30, details in `analytics.md`):** GA4 28 d 1,289 users, **key events now counting (2,497)**, mobile 4.7 %; Bing 12 to 28 Oct 674 clicks / 32.7K impressions (CTR 2.06 %, flat since the 10-18 retitle), AI citations 39.4K; chatgpt.com sessions 61 in 7 d (+154 %); Google 9 indexed / 14 not, 16 clicks (15 for the brand); Bing Site Explorer 44 indexed, 10 warnings, 2 excluded; `share_result` still 6 in 28 d.
- **Earlier reading (2026-10-18, details in `analytics.md`):** GA4 28 days 1,163 users, 7-day new users 302 (flat), key events still 0. **Bing now has data** (12–16 Oct: 189 clicks, 9.8K impressions, mostly desktop, queries like "free typing practice/lessons" at positions 4–9; 13.6K AI citations, up from 0). Google: 2 pages indexed (`/`, `/typing-lessons`), `/typing-practice` crawled but not indexed, 7 clicks in 28 days. Bing lists the `www.` host (it returns 200; canonical points to the apex): consider a 301. No coding or exam keyword in Bing's top 25 yet.
- **Growth reading (2026-10-10, details in `analytics.md`):** daily users stepped up from ~8 to ~50 between 14 and 24 Sep and have been **flat since** (new users +2.8 % week on week);  ~82 % of sessions come from Bing/Yahoo/DuckDuckGo, Google ~1.6 %; visitors who start use the site deeply (68.6 % engagement rate, 6m 41s) but only ~1 in 5 start a core action; returning users are few. Suggested focus: key events, Bing queries, IndexNow, the share image, a few real backlinks.
- **Open question from earlier:** the Coolify dashboard once showed a Redis `MISCONF` 500 error (likely full disk on the server). The site itself stayed up; whether the dashboard was fixed is unknown. Check disk space on the Hetzner server if the dashboard still errors.
- **Known harmless noise:** `next build` prints “Failed to download dynamic font” (no network for the OG image font); Google's ad script occasionally throws `Uncaught Error: int64` in headless tests (not our code, passes on rerun).
- **Numbers to refresh:** newer numbers are logged in `analytics.md` (first entry 2026-10-10); the snapshot in §1 is from 2026-10-04, before the lessons course and adaptive practice shipped. Re-export GA4 and Search Console to see their effect (watch `lesson_attempt` pass rates and `practice_complete` with category `adaptive`).

## 1. Status (updated 2026-10-07)
- **Product:** 7 tools, 7 guides, 10 blog posts and the legal pages are built, browser-tested and **live** (latest release 2026-10-06: adaptive practice, the letter row, weak pairs and the new result card; before it 2026-10-05: the 34-lesson course with a 95 % gate; 2026-10-04: settings, touch input, GA4 events, `/typing-test` alias). All settings work. Suites run against the live site on 2026-10-06: pairs 19/19, letters 32/32, card 36/36, course 30/30.
- **Live since 2026-10-06 (commit `d81054c`):** the result card (speed graph, consistency, weak spots) on the speed test, practice and lessons; letter-pair statistics; the **adaptive** Practice tab (now the default); the a–z letter row with a focus marker and click-to-drill; a “Weakest letter pairs” card on Progress; and the matching guide/privacy updates.
- **AdSense:** first application rejected — **“Low value content”**; **re-applied 2026-10-26 09:36, result pending; site ownership verified (all green, per Ashiqur)** (see §7). The setup is correct and live. “Verify site ownership” is still open in the dashboard.
- **Done because of the rejection:**
  - every guide rewritten from the real code, with verified sources
  - blog cut from 25 to 10 posts, all rewritten
  - real author and dates, BlogPosting schema, bugs found while documenting fixed
- **Analytics (latest in `analytics.md`; older snapshot from 2026-10-04 in git history):** GA4 2026-09-12 to 10-09: 909 active users, engagement rate 68.6 %, 6m 41s per user, 97 % desktop, Edge 70 %. Search Console (28 days to 10-06): 8 clicks, 24 impressions; Google has indexed 3 pages (`/`, `/typing-lessons`, `/typing-practice`); 13 of the “not indexed” URLs are old deleted posts that return 404 on purpose. Bing: sitemap OK (23 URLs), search data not ready on 10-10, 0 AI citations. Top countries: India, US, Philippines, Canada. **Key events: 0 (not registered yet).**
- **GA4 events are live from the 2026-10-04 release and confirmed arriving** (4–9 Oct: `practice_complete`, `lesson_attempt`, `lesson_complete`, `test_complete`, `game_complete`, `setting_change` seen; `share_result` not checked). Key events and custom dimensions still have to be registered (§8).
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
- **IndexNow (released 2026-10-30 together with post 11; first submission still to run: `node scripts/indexnow.mjs --all`):** key file `public/bc0913c67f5d7b38b5f9f5ec8d2c412e.txt` (public by design) and `scripts/indexnow.mjs`. After a release is live, run `node scripts/indexnow.mjs <changed urls>` (only added/changed URLs; `--all` once for the first submission). Submitting before the key file is live returns 403. Endpoint `api.indexnow.org/indexnow` is from the protocol's usual setup; the docs page fetched names only a placeholder, so check the HTTP status on first use (200/202 = ok). It does not help Google.
- Analytics: GA4 `G-QC5509TVSF` · Search Console verified · **Bing Webmaster Tools set up 2026-10-08**: verified with the `msvalidate.01` meta tag (`verification.other` in `src/app/layout.tsx`, commit `7487820`; the stray `BingSiteAuth.xml` XML-file method is not used) and `sitemap.xml` submitted. Bing also feeds Yahoo, DuckDuckGo and Ecosia, so no separate submissions. Yandex/IndexNow are optional and not set up · mail: `contact@freetyper.com`.

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
src/components/layout/   Sidebar, RightSidebar (both pinned), SettingsProvider, Footer, ContactPanel, LogoMark (K mark), FaviconBlink (tab icon), PracticeCard (sidebar streak / daily goal / continue lesson), AppearanceControls (dark/light switch, accent, text size at the top of the right sidebar)
src/components/          content/ExpandableSeoContent, seo/JsonLd, blog/BlogContent+BlogCard, tools/ToolClient
src/config/     tools.ts (7 tools), site.ts (name, author, AdSense id)
src/lib/        post-dates.ts (the one visible post date), key-sound.ts (Web Audio), analytics.ts (GA4 events), content-dates.ts (unused)
src/data/       home/typing-speed-content.ts and tools/*-content.ts  (guides: meta, faqs, previewHtml, bodyHtml, howToSteps)
                blog/typing-skills.ts (index) and blog/articles/*.ts (bodies)
public/ads.txt  google.com, pub-3237588309372777, DIRECT, f08c47fec0942fa0
public/         favicon.svg, icon-192.png, icon-512.png (the K logo; src/app also holds favicon.ico and apple-icon.png)
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
- **Quick controls (branch `feat/appearance-controls`, 2026-10-30, not merged):** `AppearanceControls` sits in the left sidebar under "settings" (reachable on phones through the hamburger menu); it was first on the right sidebar and was moved. It has a dark/light switch (dark and midnight count as dark, so it flips between `dark` and `light`), the six accent swatches and three text-size buttons (14/18/22 px). The old theme popup was removed; midnight and paper are now only on the Settings page. Same `updateSetting` and `setting_change` event everywhere.

**Storage keys:** `freetyper-daily-goal` (5/10/15/20 minutes), `freetyper-settings`, `-progress`, `-speed-log`, `-practice-log`, `-lessons-log`, `-pairs`, `-course-progress` (old `-lessons-progress` is read once for migration), `-fw-log`, `-wa-log`, `-fw-highscore`, `-wa-highscore`.

**Engine:** `onKeyStats(key, correct, {prev, gapMs})` — speed test, practice and lessons all feed `recordPair`; the games do not (no meaningful timing). The engine also feeds a per-run recorder (`runStats.createRecorder`) and returns `session.run` when a run finishes.

**Input:** window `keydown` plus a hidden-input `input` fallback for touch/IME. Capitals and shifted symbols highlight the key and the opposite-hand Shift.

## 5. Pages and SEO
| Route | What | Guide |
|---|---|---|
| `/` | speed test (home owns “typing speed test”) | ~2k words + FAQ |
| `/typing-lessons` `/typing-practice` `/keyboard-guide` `/typing-progress` | tools | ~1.6–1.7k words each + FAQ |
| `/typing-game-falling-words` `/typing-game-word-attack` | games | ~1.7k words each + FAQ |
| `/blog`, `/blog/[slug]` | 11 sourced posts (10 + the 10-30 practice-schedule post) | — |
| `/about` `/contact` `/privacy` `/terms` `/disclaimer` | trust and legal | — |

- A tool page is a full-viewport tool, then the guide (its first heading is the visible H1, open by default). `/typing-speed-test` and `/typing-test` redirect 308 to `/` (next.config.ts).
- Metadata: unique titles and canonicals · OG/Twitter and a generated OG image · PWA manifest.
- `robots.ts` allows all and points to the sitemap.
- `sitemap.ts`: **24 URLs** (7 static + 6 tools + 11 posts). Posts use `updated ?? date`; other URLs omit `lastmod` rather than fake it.
- `feed.xml`: tools + posts, dated `updated ?? date`.
- JSON-LD: Organization + WebSite (layout); WebApplication + FAQPage + HowTo on home and tools (FAQ text = the visible FAQ); Breadcrumb; **BlogPosting** on posts (author → `/about#author`). Output escapes `<`.
- Google has largely retired HowTo/FAQ rich results, so that markup is harmless and accurate, not a ranking lever.
- **GA4 custom events** (`src/lib/analytics.ts` → `trackEvent`). Numbers and short fixed labels only; never typed text.
  - `test_complete` {duration_s, text_mode, wpm, accuracy} · `lesson_attempt` {lesson_number, passed, wpm, accuracy, attempt} · `lesson_complete` (passes only) {lesson_number, lesson, wpm, accuracy} · `lesson_skip` {lesson_number} · `practice_complete` {category (adaptive, quotes, news, code, fun), wpm, accuracy}
  - `game_complete` {game, score, wpm, accuracy, level} (Falling Words at game over; Word Attack after round 8) · `game_round_complete` {game, round, score}
  - `setting_change` {setting, value} · `share_result` {source} (counted when the button is used) · `continue_click` {target: start | lesson | practice, lesson_number} (the sidebar card's link; privacy page updated)
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

**Blog: 11 posts, ~1.0–1.5k words; 10 rewritten 2026-10-04, the 11th, `how-long-to-practice-typing-each-day`, released 2026-10-30**
- `how-to-type-faster` · `good-typing-speed` · `improve-typing-accuracy` · `touch-typing-for-beginners` · `muscle-memory-and-touch-typing`
- `10-bad-typing-habits` · `typing-speed-for-programmers` · `data-entry-typing-test` · `mechanical-vs-membrane-keyboards` · `fix-typing-posture-and-avoid-wrist-pain`
- 15 older templated posts were deleted (not indexed; no redirects) and their links remapped. The old text is in git history.

**Post 11 (2026-10-30, released):** based on Baddeley & Longman 1978 (*Ergonomics* 21(8) 627-635; read in full from the gwern.net PDF; 4 schedules, 18 per group; 1 h/day learned fastest). It says plainly that the study never tested sessions under an hour; the 10–20 min routine is labelled our suggestion. Ashiqur should read and edit it in his own voice before release. After release: IndexNow + request indexing for the URL. Employer-scoring is already covered by `data-entry-typing-test`, so it is dropped from the list below.

**Next posts (1 a week):** laptop vs external keyboard (weak evidence found, vendor blogs only) · common typing errors by key pair (from the Dhakal error data).

## 7. AdSense plan
Google’s stated bar: authentic, high-quality content and tools · **ongoing curation** · **sustained, genuine user interest**.
Likely causes (inferred): bulk templated content with no sources or real author (fixed), guides collapsed behind “Read more” (fixed), and a new domain with almost no Google-indexed pages (open; traffic itself is now rising).
- [x] **[A]** **Done (reported 2026-10-28): site ownership shows all green ticks and there is no verify option left.** Original step: AdSense → Sites → freetyper.com → **Verify site ownership** (snippet, meta tag and ads.txt are live; if there is no button, Google auto-verifies within days, else contact AdSense help with a screenshot).
- [x] **[A]** **Re-applied on 2026-10-26 at 09:36** (Ashiqur's report; he first said 10-25 and corrected it). Google had indexed **9 pages** at that point per Ashiqur (was 2 on 10-18; not re-read by Claude). **Result not known yet: check the AdSense dashboard and the email; if rejected, note the reason here and do not re-apply again until the content or indexing has clearly changed (repeated rejections do not help).**

## 8. TODO (owner: **[A]** Ashiqur · **[C]** Claude in code)
**Now — growth is limited by distribution, not features**
- [x] Events arrive (confirmed in GA4 Events report, 2026-10-10).
- [x] **[A]** **Bing Webmaster Tools** set up and sitemap submitted (2026-10-08).
- [ ] **[A]** Check Bing Webmaster in about a week: sitemap status, pages indexed, and the **search queries** (they decide the coding-track language and any exam-typing pages). Search Performance still said “check back in 48 hours” on 2026-10-10. Optionally use its URL Submission and set up IndexNow.
- [ ] **[A]** Search Console: **resubmit the sitemap** (23 URLs) and **request indexing** for `/blog`, `/keyboard-guide`, `/typing-progress`, the 2 games and the 10 posts. `/`, `/typing-lessons`, `/typing-practice` are already indexed (reported 2026-10-10); re-request them after big content changes.
- [ ] **[A]** GA4, once each event has appeared at least once (register the custom definitions first — they are not retroactive): Admin → Events → mark `test_complete`, `lesson_complete`, `practice_complete`, `game_complete` as **key events**; Admin → Custom definitions → add dimensions `text_mode`, `category`, `game`, `lesson`, `passed`, `setting`, `value` and metrics `wpm`, `accuracy`, `duration_s`, `score`, `level`, `lesson_number`, `attempt`.
- [ ] **[A]** Publish 1 sourced post a week; share honestly (Reddit r/typing, Show HN, Product Hunt); look for a few real links.
- [ ] **[A]** Re-export Search Console + GA4 monthly into `analytics/` (git-ignored) and add a dated entry at the top of `analytics.md` so progress can be compared.

**Next — product work the data supports**
- [ ] **[A]** After the 2026-10-06 release: request indexing for `/typing-practice` and `/` in Search Console (both guides changed), and in GA4 check that `practice_complete` shows the new category `adaptive` (register `category` as a dimension if not yet).
- [ ] **[C]** **Fix the phone overflow** (see §9; first thing to do): scale `LiveKeyboard` to the screen width or hide it on touch devices; re-measure `scrollWidth - clientWidth` at 390 px on `/`, `/typing-lessons`, `/typing-practice` (it is 119 px today) and check the result card still fits.
- [x] Longer lessons course (34 lessons, 95 % gate) — **live since 2026-10-05**. Now watch `lesson_attempt` (pass rate per lesson) in GA4 to find lessons that are too hard.
- [ ] **[C]** A clear, printable **touch-typing finger chart** (people already search “keyboard finger chart / touch typing diagram”; the keyboard guide ranks ~position 47–73 for it).
- [ ] **[C]** Preset **duration pages** (e.g. 1-minute, 5-minute test) as real working tools with a short unique intro — only after pages are being indexed, and never thin duplicates.
- [ ] **[C]** Save the browser checks as **Playwright tests** in `tests/` (speed run, finger labels, Word Attack progress, Falling Words speed, hydration, sticky rails, touch input, GA4 events, redirects, **plus the newer ones: course gate/migration, pair recording, adaptive tab and letter row, result card**). Right now they exist only in a temporary folder outside the repo (see §0), so this protects the release routine.
- [ ] **[A]** Test touch typing on a real phone; optional: real screenshot of a result card for the home guide; rename sidebar “start” → “speed test”.

**Planned product work (agreed 2026-10-05; build order)**
- [x] **[C] 1. Weak-pair drills (bigrams), letter row, adaptive default** — live (rules in §4 Practice). Ideas left: a user-set target WPM (keybr has one) · a “you improved” summary after a drill (“th 260 → 190 ms”) · adaptive for digits and punctuation (pairs are letters only) · an adaptive entry on the home page · a Dhakal-style hand/finger-pair view.
- [ ] **[C] 2. Coding tracks.** Start with **one** language, chosen from real Bing Webmaster queries (guess: JavaScript). Four thin tracks would repeat the “low value content” problem.
  - ~15 original snippets, ordered by difficulty, each run or compiled to prove it is correct, each with a note on the symbols it trains.
  - Decide how Enter, Tab and leading indentation work in code (proposal: skip leading indentation automatically after Enter; a setting later). Check the engine first.
  - Start as a Practice category; a route per language only once it has its own guide and enough content.
- [x] **[C] 3. Upgrade the result card** — live (rules in §4 Result card). The graph shows from 5 s (it was 10 s; fast typists finishing a short quote got none). Ideas left: a per-run keyboard heatmap behind a toggle (demoed, left out to keep the card short) · a “you improved” comparison of weak pairs after a drill · result-card guide screenshots. The share image is item 4.
- [ ] **[C] 4. Share the result as an image (agreed 2026-10-06, not built).** Today “share” (speed test only) copies one text line (`20 WPM · 55% accuracy — FreeTyper`); an image gets noticed in feeds and puts `freetyper.com` in front of people (helps the traffic goal).
  - A purpose-made **1200×630 PNG drawn on a canvas in the browser** (not a screenshot of the live card: that has buttons, the coach note and a window-dependent size). Content: big WPM, accuracy, time, rank, a mini speed graph, date, `freetyper.com`; theme colours. Nothing is uploaded; it shows only the finished run, never typed text.
  - Button behaviour: phones → Web Share API with the image attached; desktop → copy the image to the clipboard (`ClipboardItem`, PNG); if blocked/unsupported → download the PNG and copy the old text line.
  - Add the share button to **practice and lessons** too (only the speed test has one today). Keep the `share_result` GA event, with `source` = speed_test | practice | lessons (update the privacy page text only if the payload changes).
  - Update the guides (result card section) and `freetyper.md`; add a browser test (button produces a PNG blob of 1200×630; fallbacks work when the clipboard is blocked).

**PageSpeed audit of `/` (2026-10-26, pagespeed.web.dev, lab test, no field data yet; not started, do later)**
- Desktop: Performance 77, Accessibility 87, Best Practices 100, SEO 100 (FCP 0.9 s, LCP 1.3 s, TBT 330 ms, CLS 0, Speed Index 2.3 s). Mobile detail read from the same report (slow 4G): FCP 3.5 s, LCP 7.1 s, TBT 200 ms, Speed Index 6.2 s; mobile score and the failing “Agentic Browsing” check (1/2) not read.
- [ ] **[C]** Mobile LCP: the element is the “start typing to begin” hint with 3,280 ms render delay (shows only after JS runs). Find out why it is not in the server HTML. Likely the only real bug here.
- [ ] **[C]** Accessibility: label the hidden `input.sr-only`; raise contrast on the duration/“words”/“code” buttons, keyboard key labels and the guide byline/date/sources/“Show less”; mark inline guide links (e.g. underline), not colour only.
- [ ] **[C]** Smaller own-code items: 13.7 KiB legacy polyfills in the main chunk; one 11 KiB render-blocking CSS (~150 ms); 166 ms forced reflow in chunk `13h9vpz4kt-4o.js`; key-pulse animates box-shadow/colours (non-composited); 13,896 DOM elements (typing text alone has 3,583 children); no preconnect.
- Other findings from the same report (no action chosen yet): total payload 880 KiB (third-party ~508: AdSense 252, GA4 184, consent message 73; own ~222: main chunk 71, two fonts 49+41, second chunk 39, HTML 22); main-thread work 1.7 s mobile / 2.4 s desktop (script evaluation 809 ms on mobile); long tasks: our main chunk `2ncdmtj91g36a.js` 181 ms, GA4 129 ms, consent message 56 ms; critical request chain 2.5 s on mobile; AdSense scripts have a 14-day cache set by Google (not ours to change). Not read: mobile score, the failing “Agentic Browsing” check, the 16 passed audits.
- [ ] **[A+C]** Third-party weight: ~299 KiB of the unused JS is mostly Google (AdSense ~148, GA4 ~74, consent message ~37; our own ~46). Only deferral/delayed loading is possible; check the effect on ads and GA events before changing. Re-run mobile and desktop after any fix and compare. Do not read too much into 77 before field data exists.

**Top 5 growth features (researched 2026-10-28; ranking is Claude's judgment, from our own data plus public pages; not agreed or built)**
- Evidence: Bing keywords (top 75 of 209, `analytics.md` 10-28) are all generic “free typing lessons/practice”; **no data-entry, coding, exam, language or “N-minute test” keyword**. Only ~12 % of visitors start an action; few return; `share_result` was 6 in 28 d.
- Competitors (public pages, 2026-10-28): Monkeytype has XP, daily streaks, daily/weekly leaderboards, challenges and badges (per third-party docs mirrors). keybr: adaptive lessons, profile with daily goals, leaderboard and multiplayer (third-party reviews). Typing.com: lessons, tests, games, classroom tools, certificates and accounts; its coding units are HTML/CSS/JS. Ratatype: free test and lessons in several languages, **certificate costs $5**. 10FastFingers: 24 h competitions, multiplayer, 40+ languages, custom tests. Many free sites give a typing certificate (typingtest.me, TestDome top 25 %, Speed Typing Online). Official sources for Monkeytype/keybr could not be fetched (JS pages).
- [x] 1. **Faster start (built 2026-10-30 on branch `feat/continue-streak`, not merged):** the right-sidebar **Your practice** card (`PracticeCard.tsx`, desktop only because the sidebar is hidden on phones). New visitors see “Start lesson 1”; returning ones see the current streak (shown as broken once a local day is missed; “Practise today to keep it” when it was last extended yesterday), minutes typed today against a daily goal (click the goal to cycle 5/10/15/20 min; stored in `freetyper-daily-goal`) and “Continue lesson N” (hidden on the lessons page; “Keep going: practice” once all 34 lessons are done). Reads the saved progress only after hydration (`useSyncExternalStore`, server snapshot null), refreshes on a `freetyper-progress-updated` event sent after each save, on focus and across tabs. Minutes today come from saved session durations (all modes, games included). Success signals: `continue_click` events, returning users, `lesson_attempt` per user. The one-click 1-minute test for new visitors was not built: the home page already is the test.
- [ ] 2. **Reason to return:** (streak and daily goal are now in the sidebar card, see 1) daily challenge, ghost race (client-only; competitors lean on streaks and leaderboards, we stay login-free).
- [ ] 3. **Share the result as an image** (plan in item 4 above).
- [ ] 4. **Finger chart page + free printable certificate:** Bing already shows finger-layout and chart searches converting (10 of 11 clicks); free certificates exist elsewhere and Ratatype charges $5, so a free one is a differentiator. Label it not an official qualification. Job-skill tracks (data entry first; then terminal; medical and legal last, accuracy risk) only after **demand shows up**: none does in Bing yet.
- [ ] 5. **Better snippets for the big phrases** (“typing lessons” CTR 0.67 %): measure the 10-18 retitle first (read about 11-01 to 11-08), then decide on duration pages. No “N-minute test” demand seen yet, so they drop below this.

**Engagement ideas (2026-10-26; Claude's suggestions, not agreed or built; reason: ~12 % start a core action, few return; GA4 28 d is now ~18k events for ~1.2k users)**
- [ ] **[C]** Ghost race: replay your best run's per-second curve as a ghost cursor (client-only; the run recorder already has the data). Best effort versus payoff.
- [ ] **[C]** Daily challenge: one text per day for everyone, picked from the date, no backend.
- [ ] **[C]** Daily goal and streak on the first screen (streak exists only on Progress today).
- [ ] **[C]** "Continue lesson N" button for returning visitors and a one-click 1-minute test for new ones; “you improved” summary after a drill.
- [ ] **[C]** Printable typing certificate (name typed locally, labelled not an official qualification) and the printable finger chart above.
- Before building: check the 18k events by event name and new vs returning users, and look for bot/data-centre traffic (Ashburn, unchecked). Accounts and leaderboards stay off the list (privacy-first, needs a backend). Google's own idea list was not pasted yet; compare when it is.

**Later — ideas, validate first**
- Custom text importer (paste your own text): **dropped for now** (no SEO value, narrow audience, odd-input edge cases). Revisit only if students ask.
- Exam / language typing tests (India, Pakistan and Bangladesh are in the top countries): check Bing Webmaster queries before building.
- Make guides easy for AI assistants to cite (clear definitions, sourced numbers) — ChatGPT already refers visitors.
- Accounts, leaderboards, multiplayer races, Dvorak/Colemak, more games, progress export/import, ease Falling Words tiers 7–10, more than 20 practice passages.
- Cleanup: ~57 older lint errors · delete `content-dates.ts` · unused config in `gameData.ts` (`wordAttackRounds.duration/basePoints`, `scoringRules.speedBonus*`).

**Recently done (2026-10-03 to 06):** all guides and posts rewritten · blog 25 → 10 · settings, touch input, shift hints, Esc/slash fixes · sticky sidebars · one visible post date · About/Disclaimer wording fixed · `/typing-test` alias · GA4 events · 34-lesson course (live 2026-10-05) · weak pairs, letter row, adaptive practice and the new result card (live 2026-10-06).

## 9. Gotchas
- **Phone overflow (open bug):** the on-screen `LiveKeyboard` is ~119 px wider than a 390 px screen on `/`, `/typing-lessons` and `/typing-practice`, so the page scrolls sideways. Fix idea: scale the keyboard to the width or hide it on touch devices.
- **Sidebars:** keep `md:sticky md:top-0 md:h-screen md:self-start` on both asides. `h-auto` or `min-h-screen` stretches them in the flex row and breaks sticky.
- **Hydration:** anything read from localStorage must render only after hydration (see `KeyboardGuide`, `useSyncExternalStore`).
- **Slash key:** `/` opens the speed-test command palette unless the passage starts with `/`.
- **Escaping:** JSON-LD uses `\\u003c`. Template-literal guides cannot contain backticks or `${`.
- **Lint:** the repo has older lint errors. A change must not add new ones — compare before and after on the files you touch.
- **Dates:** never backdate or auto-update visible dates. The sitemap and feed use real dates only.
