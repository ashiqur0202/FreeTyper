# FreeTyper — Project Blueprint

Free typing platform at **freetyper.com**: speed test, lessons, practice, keyboard guide, progress tracker and two games.
No login, no database, privacy-first (all data stays in the browser), to be funded by ads once AdSense approves.

This is the living reference. History lives in git. Per-guide detail lives in the header comment of each content file.

## 1. Status (updated 2026-10-04)
- **Product:** 7 tools, 7 guides, 10 blog posts and the legal pages are built and browser-tested. All settings work.
- **AdSense:** application rejected — **“Low value content”**. The setup is correct and live. “Verify site ownership” is still open in the dashboard.
- **Done because of the rejection:**
  - every guide rewritten from the real code, with verified sources
  - blog cut from 25 to 10 posts, all rewritten
  - real author and dates, BlogPosting schema, bugs found while documenting fixed
- **Still open (needs Ashiqur):** verify ownership · request indexing · publish 1 post a week · let real traffic build · request a review (§7).

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
- Analytics: GA4 `G-QC5509TVSF` · Search Console verified · mail: `contact@freetyper.com`.

## 3. Architecture map
```
src/app/        page (speed test), [slug] (6 tool routes), blog, blog/[slug], about, contact, privacy,
                terms, disclaimer, settings (noindex), sitemap.ts, robots.ts, feed.xml, manifest.ts, opengraph-image
src/components/skills/typing/
                TypingSpeedTest, TypingLessons, TypingPractice, KeyboardGuide, TypingProgress,
                FallingWordsGame, WordAttackGame, LiveKeyboard, TypingPassage, PracticeFeedback, GameFeedback
                useTypingEngine (timer, WPM, Backspace), useTypingProgress (localStorage),
                useKeySound, mobileInput (touch/IME fallback)
                typingData (lessons, passages, finger map), gameData (word pools, tiers, rounds, scoring)
src/components/layout/   Sidebar, RightSidebar (both pinned), SettingsProvider, Footer, ContactPanel
src/components/          content/ExpandableSeoContent, seo/JsonLd, blog/BlogContent+BlogCard, tools/ToolClient
src/config/     tools.ts (7 tools), site.ts (name, author, AdSense id)
src/lib/        post-dates.ts (the one visible post date), key-sound.ts (Web Audio), content-dates.ts (unused)
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

**Lessons (7)**
- Home row · top row · bottom row · common words · sentences · numbers & symbols · speed building. One short passage each.
- Unlock = finishing the lesson. **There is no accuracy gate.**

**Practice**
- 20 built-in passages (5 each: quotes, news, code, fun), plus a weak-key drill. Untimed.
- Weak key = at least 5 presses; the 5 lowest accuracy. The drill is 40 words from a ~123-word list.

**Progress**
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

**Storage keys:** `freetyper-settings`, `-progress`, `-speed-log`, `-practice-log`, `-lessons-log`, `-lessons-progress`, `-fw-log`, `-wa-log`, `-fw-highscore`, `-wa-highscore`.

**Input:** window `keydown` plus a hidden-input `input` fallback for touch/IME. Capitals and shifted symbols highlight the key and the opposite-hand Shift.

## 5. Pages and SEO
| Route | What | Guide |
|---|---|---|
| `/` | speed test (home owns “typing speed test”) | ~2k words + FAQ |
| `/typing-lessons` `/typing-practice` `/keyboard-guide` `/typing-progress` | tools | ~1.6–1.7k words each + FAQ |
| `/typing-game-falling-words` `/typing-game-word-attack` | games | ~1.7k words each + FAQ |
| `/blog`, `/blog/[slug]` | 10 sourced posts | — |
| `/about` `/contact` `/privacy` `/terms` `/disclaimer` | trust and legal | — |

- A tool page is a full-viewport tool, then the guide (its first heading is the visible H1, open by default). `/typing-speed-test` redirects 308 to `/`.
- Metadata: unique titles and canonicals · OG/Twitter and a generated OG image · PWA manifest.
- `robots.ts` allows all and points to the sitemap.
- `sitemap.ts`: **23 URLs** (7 static + 6 tools + 10 posts). Posts use `updated ?? date`; other URLs omit `lastmod` rather than fake it.
- `feed.xml`: tools + posts, dated `updated ?? date`.
- JSON-LD: Organization + WebSite (layout); WebApplication + FAQPage + HowTo on home and tools (FAQ text = the visible FAQ); Breadcrumb; **BlogPosting** on posts (author → `/about#author`). Output escapes `<`.
- Google has largely retired HowTo/FAQ rich results, so that markup is harmless and accurate, not a ranking lever.
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
Likely causes (inferred, not confirmed): bulk templated content with no sources or real author (fixed), guides collapsed behind “Read more” (fixed), and a new domain with almost no indexed pages or traffic (open).

- [ ] **[A]** AdSense → Sites → freetyper.com → **Verify site ownership**. The snippet, meta tag and ads.txt are all live. If there is no button, Google auto-verifies within days; otherwise contact AdSense help or the community with a screenshot.
- [ ] **[A]** Search Console → request indexing for `/`, `/blog`, the 6 tool pages and the 10 posts.
- [ ] **[A]** Publish 1 real post a week. Share honestly (Reddit r/typing, Show HN, Product Hunt). Watch GA4 for steady organic users.
- [ ] **[A]** After several weeks of steady activity, **request a review** (repeated rejections do not help).
- [ ] **[A, optional]** Add a real screenshot of a result card to the home guide. Rename the sidebar link “start” to “speed test”.

## 8. Backlog (after AdSense)
- **Decisions:** add a 95 % accuracy gate to lessons? · ease Falling Words tiers 7–10? · more than 20 practice passages · progress export/import.
- **Engineering:**
  - save the browser checks as Playwright tests in `tests/` (speed run, finger labels, Word Attack progress, Falling Words speed, hydration with stored data, sticky rails, touch input)
  - test touch typing on a real phone
  - clear the ~57 older lint errors (refs read/written during render, set-state-in-effect)
  - delete `content-dates.ts` and its injection in `ExpandableSeoContent`
  - unused config in `gameData.ts` (`wordAttackRounds.duration/basePoints`, `scoringRules.speedBonus*`)
- **Features:** Dvorak/Colemak · multiplayer races, leaderboards, school mode (needs optional login) · more games.

## 9. Gotchas
- **Sidebars:** keep `md:sticky md:top-0 md:h-screen md:self-start` on both asides. `h-auto` or `min-h-screen` stretches them in the flex row and breaks sticky.
- **Hydration:** anything read from localStorage must render only after hydration (see `KeyboardGuide`, `useSyncExternalStore`).
- **Slash key:** `/` opens the speed-test command palette unless the passage starts with `/`.
- **Escaping:** JSON-LD uses `\\u003c`. Template-literal guides cannot contain backticks or `${`.
- **Lint:** the repo has older lint errors. A change must not add new ones — compare before and after on the files you touch.
- **Dates:** never backdate or auto-update visible dates. The sitemap and feed use real dates only.
