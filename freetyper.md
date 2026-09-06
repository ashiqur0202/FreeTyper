# FreeTyper.com — Project Blueprint

Standalone typing platform. No login, privacy-first, monetized via ads & affiliates.

## Tech Stack
- **Next.js 16** (App Router, TS) + **Tailwind v4** + **lucide-react**
- Fonts: Inter + JetBrains Mono · Docker standalone on Hetzner via Coolify · Cloudflare DNS
- No Vercel. No database. All data in localStorage.
- Appearance: 4 themes (dark / light / midnight / paper) + 6 accent colors, stored in `freetyper-settings`. Default **dark + gold**. Manual only — no auto day/night.

## Key Components
```
src/components/skills/typing/
├── types.ts, typingData.ts, gameData.ts
├── useTypingEngine.ts        # rAF timer, WPM/accuracy, backspace support
├── useTypingProgress.ts      # localStorage progress/achievements
├── TypingPassage.tsx          # Word-wrap + justified passage (flush left and right)
├── TypingSpeedTest.tsx        # 9 durations, 3 text modes, command palette, focus mode, same-page result
├── LiveKeyboard.tsx           # Full QWERTY, hint pulse, flash, optional focusKeys dim
├── PracticeFeedback.tsx       # Guide + latest 5 performances (newest first); richer card on speed tests
├── TypingLessons.tsx          # Progressive lessons, pills, LiveKeyboard, same-page coach + auto-next
├── TypingPractice.tsx         # Categories + weak keys, LiveKeyboard, same-page coach + auto-next
├── KeyboardGuide.tsx          # Finger filters, home-row mode, personal key stats
├── TypingProgress.tsx         # Stats, WPM chart, weak keys, sessions, achievements
├── KeyboardHeatmap.tsx, AchievementToast.tsx
├── GameFeedback.tsx           # Game result + latest 5 (score, WPM, hits/misses, coach)
├── FallingWordsGame.tsx, WordAttackGame.tsx
└── ResultCard.tsx             # leftover; unused (replaced by PracticeFeedback)
src/components/layout/ → Sidebar, SidebarProvider, RightSidebar, SettingsProvider, Footer, ContactPanel
src/components/tools/  → ToolClient (dynamic imports), ToolPageContent (viewport shell)
src/components/blog/   → BlogContent (+ auto TOC), BlogCard
src/components/seo/    → JsonLd (Org/WebSite/WebApp/Breadcrumb/FAQ/HowTo), FAQ
src/components/content/ → ExpandableSeoContent (preview + Read more, SEO-safe, TOC hash expand)
src/lib/content-dates.ts → Dynamic “Updated Month Year” for SEO bylines ({{UPDATED_*}})
src/config/ → tools.ts (7 tools), site.ts
src/data/
├── home/typing-speed-content.ts          # Home speed-test SEO (~3.7k)
├── tools/typing-lessons-content.ts       # Lessons SEO (~3.5k)
├── tools/typing-practice-content.ts      # Practice SEO (~3k)
├── tools/keyboard-guide-content.ts       # Guide SEO (~3k)
├── tools/typing-progress-content.ts      # Progress SEO (~3k)
├── tools/falling-words-content.ts        # Falling Words SEO
├── tools/word-attack-content.ts          # Word Attack SEO
└── blog/
    ├── typing-skills.ts                  # Post index (slug, title, meta) — 25 live
    ├── article-content.ts                # Re-exports articles/*
    └── articles/
        ├── typing-speed.ts               # Pillar 1 bodies (6 posts)
        ├── typing-tests.ts               # Pillar 2 bodies (6 posts)
        ├── touch-typing.ts               # Pillar 3 bodies (5 posts)
        ├── practice.ts                   # Pillar 4 bodies (5 posts)
        └── productivity.ts               # Pillar 5 bodies (3 posts)
src/app/ → page (speed test + SEO), [slug] (all 7 tools + SEO),
           settings, blog, about, contact, privacy, terms, disclaimer, opengraph-image
```

## Speed Test Features
- **3-line scrolling** (monkeytype-style) · **Backspace** to correct mistakes
- **Justified passage** — words wrap as units; lines flush left and right (`TypingPassage`)
- **Live keyboard** — full QWERTY, gold hint pulse on next key, green/red flash on type
- **One-line chrome** — durations + words/sentences/code + focus, then clock / WPM / accuracy
- **Progress bar** with glow · Live WPM + accuracy
- **Focus mode** (fullscreen, Esc to exit) · **Command palette** (`/` key)
- **Same-page result** — next test loads immediately so you can keep typing; score sits under the keyboard
- Latest result: **net WPM**, accuracy, time, **gross WPM**, correct / errors / words, rank (beginner→elite) + band, WPM bar (0–120), vs last test, coach tip
- **Latest 5 tests** only (newest first) in `freetyper-speed-log`
- **Share** copies `WPM · accuracy` · **practice** CTA → `/typing-practice`

## Practice & Lessons (same loop)
- Stay on the page after a run. Next passage / next lesson loads; type immediately (no extra click)
- Compact top: pills + live WPM/accuracy on one row (lessons has no “lessons” label)
- Keyboard, then a quiet divider, then **guide** + **performances** (max 5, newest first)
- Practice log: `freetyper-practice-log` · Lessons log: `freetyper-lessons-log`
- Tips are per-run (accuracy first, vs last, category/lesson-specific). Low accuracy → finger-map link; practice can offer weak-key drill
- Lessons still unlock in order; finishing auto-opens the next unlocked lesson
- Layout: tool starts near the top (`pt-16` mobile to clear the menu, `md:pt-10` desktop) — not vertically centered (results would clip / look empty)

## Games (same result loop)
- After a run: **start panel on top**, **GameFeedback below** (result + latest 5, newest first) — same as practice/speed test
- Compact in-game HUD (score / round-or-tier / WPM), not a splash takeover
- Logs: `freetyper-fw-log` (Falling Words), `freetyper-wa-log` (Word Attack)
- Falling Words: exact-match before prefix highlight so the input clears and the next word types; drops count as misses (real accuracy, not fake 100%)
- Word Attack: save a result when a **round** ends (so the card shows without waiting for all 8); last round returns to start + latest 5. Timer lives outside React setState so the save is not dropped
- High scores still in `freetyper-fw-highscore` / `freetyper-wa-highscore`

## Polished Tool Pages (same bar as home)
| Route | UX highlights | SEO |
|---|---|---|
| `/` | Speed test, same-page result + latest 5, share/practice | Elite cornerstone + FAQ/HowTo/WebApp/Breadcrumb |
| `/typing-lessons` | Lesson pills, LiveKeyboard + focusKeys, same-page coach, auto-next | Expandable 3k+ guide |
| `/typing-practice` | Category pills, weak keys, same-page coach, auto-next | Expandable 3k+ guide |
| `/keyboard-guide` | Finger filters, home-row toggle, key stats, weak keys | Expandable 3k+ guide |
| `/typing-progress` | Stats, chart, heatmap, sessions, achievements | Expandable 3k+ guide |
| `/typing-game-falling-words` | Start after game over; result + latest 5; real miss accuracy | Expandable guide + FAQ/HowTo |
| `/typing-game-word-attack` | Start after last round; result saved per round + latest 5 | Expandable guide + FAQ/HowTo |

Tool SEO pages: full-viewport tool above the fold → ExpandableSeoContent below → JSON-LD (WebApplication + FAQPage + HowTo).  
**Home stays the speed test** (`/`). Practice is `/typing-practice` — daily habit, not the landing URL (search intent for “typing speed test” owns `/`).  
`/typing-speed-test` **308 redirect → `/`** (home owns the keyword; slug is not in the sitemap).  
SEO bylines use **dynamic month + year only** (`Updated July 2026`) via `src/lib/content-dates.ts`.  
Tool pages use the **full middle column** (between left nav and right rail). Right sidebar is visible (200px) with on-site links + a short tip — not an empty ad slot.

## Settings (localStorage: `freetyper-settings`)
| Setting | Values | Default |
|---|---|---|
| theme | dark / light / midnight / paper | dark |
| accentColor | gold / blue / green / red / purple / cyan | gold |
| fontSize | small / default / large | default |
| soundEnabled | boolean | false |
| keyboardLayout | qwerty | qwerty |
| showKeyboardHints | boolean | true |

Theme + accent are **wired** (sidebar Theme modal + Settings → Appearance → `data-theme` + CSS vars). Font size, sound, and hints are still stored only — tools do not read them yet.

## Brand
- Default: **dark + gold** (`#e2b714`) · surface `#323234`, raised `#3a3a3c`, border `#4a4a4c`
- **light** — cool sage-linen (eye-comfort; not pure white) · **midnight** — near-black · **paper** — medium parchment
- Accents darken slightly on light/paper so gold stays readable
- Logo: keyboard key + gold cursor · Wordmark: **Free** (white/bright) + **Typer** (gold)
- No auto day/night or OS follow — user picks a theme and it sticks

## SEO & Infra
- JSON-LD: Org + WebSite (layout); WebApplication + FAQPage + HowTo on home + polished tools; Breadcrumb on home
- Org logo → `/opengraph-image` (not the old 404 `/og-image.png`). No fake SearchAction (`/?q=` does not exist)
- Expandable SEO: E-E-A-T byline, in-article TOC, sources/citations, methodology; body always in DOM
- OG/Twitter cards · dynamic `opengraph-image.tsx` (1200×630) · sitemap (tools + blog, **no** `/typing-speed-test`) · `app/robots.ts` (Allow + Sitemap) · RSS (tools + 25 posts) · PWA
- **Do not** put ads.txt in `public/robots.txt` — that file was blocking a real robots.txt; ads stay in `public/ads.txt`
- Settings `/settings` is `noindex`. About/contact/legal have unique titles + canonicals
- GA4 `G-QC5509TVSF` · Google Search Console verified
- **AdSense:** live publisher `ca-pub-3237588309372777`. `adsbygoogle.js` in root `<head>` (`layout.tsx`, every page) + `<meta name="google-adsense-account">`. `public/ads.txt` is `google.com, pub-3237588309372777, DIRECT, f08c47fec0942fa0`. No in-article `<ins>` units — Auto ads from the AdSense UI. In the dashboard, turn **off** overlay / anchor / vignette ads so they do not sit on the typing area. **Do not** put ads.txt in `public/robots.txt`
- Privacy (Sep 2026): operator named (Ashiqur Rahman); honest about GA; Google-required third-party cookie wording (vendors including Google, prior visits, opt-out, web beacons/IP); **not directed at children under 13**. Do not claim “no tracking” while Analytics is on
- About: named operator, scoring method, what’s on the site, what we store / don’t claim. Contact: email box (copy + open mail) + mailto message form (`ContactPanel`) — no server inbox, nothing posted to our servers
- `contact@freetyper.com` MX is live (Cloudflare Email Routing). Reviewers test this address
- Expandable SEO stays **Read more** (collapsed). Full body remains in the DOM for crawlers. Do not auto-expand the guide for AdSense — product call
- Login: **not now**. Guest + localStorage stays the product. Optional magic-link sync is a later conversation, not this round
- Site title: `FreeTyper — Type Faster. Free Forever.` (no decorative unicode)
- Blog: **25 evergreen posts** live (pillars 1–5); de-AI voice pass done site-wide on bodies
- Legal: /about, /contact, /privacy, /terms, /disclaimer
- Deploy: GitHub → Coolify (Docker) → Hetzner · Repo: `github.com/ashiqur0202/FreeTyper`

## Done
- [x] Live keyboard visualizer (full layout, hint, flash, focusKeys)
- [x] Same-page results (speed test / practice / lessons) — no takeover card; next text stays typeable
- [x] PracticeFeedback: per-run coach + max 5 newest-first performances (localStorage logs)
- [x] Speed-test result is the full score (net/gross WPM, correct/errors/words, rank, bar, share)
- [x] Animations (progress glow, result appear, shimmer, fade-up)
- [x] Backspace support · 3-line scrolling text
- [x] Home elite SEO (methodology, TOC, E-E-A-T, sources, benchmarks, FAQ/HowTo/Breadcrumb)
- [x] Lessons / practice / keyboard guide / progress — Monkeytype-clean UX + 3k+ SEO each
- [x] Falling Words + Word Attack — brand tokens, polished HUD/end screens, elite SEO
- [x] Shared SEO tool shell in `[slug]/page.tsx` · ExpandableSeoContent TOC hash expand
- [x] Dynamic OG image · GA4 · GSC verification · sitemap includes blog posts
- [x] Typing window layout (tool fills viewport; SEO below the fold)
- [x] Dynamic SEO “Updated Month Year” bylines (`content-dates.ts`)
- [x] Blog live: **25 / 25** posts (all 5 pillars complete)
- [x] Blog de-AI / voice pass on **all 25** posts (less template CTAs, lighter brand spam, varied opens/closes; keywords + internal links kept for SEO)
- [x] Removed unused raw draft `.md` files (`blog/1–4.md`); content lives in `articles/*.ts` only
- [x] Indexing hygiene: real `robots.ts` (deleted bogus `public/robots.txt`), sitemap drops duplicate speed-test slug, 308 `/typing-speed-test` → `/`, settings `noindex`, legal unique titles/canonicals, RSS includes blog, JSON-LD logo + no fake site search
- [x] Tool pages fill the middle column (lessons, practice, guide, progress, games)
- [x] `TypingPassage` — word wrap + justified lines (practice / lessons / speed test)
- [x] Lessons pills + stats left-aligned with the passage (no centered wrap indent)
- [x] Themes: dark / light / midnight / paper + accent picker (sidebar Theme + Settings). Default dark + gold. Manual only
- [x] Speed-test result → practice CTA (`/typing-practice`) + share
- [x] Practice / lessons / home chrome compacted; top padding aligned with sidebar (mobile clears hamburger)
- [x] Product call: **do not** put practice on `/` — home owns “typing speed test”; practice is the post-test habit
- [x] Keyboard guide: hover no longer scales keys or reflows the page
- [x] Timed tests generate enough text for 15–30 min (no more empty passage while the clock runs)
- [x] Games no longer write fake 100% accuracy into best-accuracy / achievements
- [x] Falling Words + Word Attack: compact HUD, GameFeedback (score/WPM/hits/misses + latest 5), top-aligned like practice
- [x] After game over: start screen on top, result + latest 5 underneath (both games)
- [x] Falling Words: full-word match clears input (next word types); drops = misses
- [x] Word Attack: persist result when a round ends (not only after round 8); timer no longer swallows the save
- [x] AdSense: real `ca-pub-3237588309372777` script + meta + `ads.txt` (no display slots; Auto ads from dashboard)
- [x] About / privacy / terms / contact rewritten for AdSense (no “we don’t track you”, no “all ages”, no unverified open-source claim)
- [x] About: named operator (Ashiqur Rahman), scoring method, what’s on the site, storage, what we don’t claim
- [x] Privacy: Google-required third-party cookie / opt-out wording; operator named
- [x] Contact: email box (copy + open mail) + topic/message form that opens mailto (`ContactPanel`)
- [x] `contact@freetyper.com` MX via Cloudflare Email Routing
- [x] Product call: keep ExpandableSeoContent **Read more** collapsed (do not auto-open the guide for AdSense)
- [x] Product call: **no login this round** — guest + localStorage only
- [x] Right sidebar filled (tool links + tip) so the site does not look unfinished
- [x] Fixed broken leftover sentences in `improve-typing-accuracy`

## Next Up
- [x] About / privacy / contact live (named operator, cookie wording, email box)
- [ ] **Deploy** AdSense snippet (commit → push → Coolify). Then confirm live `https://freetyper.com/ads.txt` is the google.com pub line and View Source on `/` has `ca-pub-3237588309372777` inside `<head>`
- [ ] In AdSense UI: turn **off** overlay / anchor / vignette ads so they miss the typing area
- [ ] **GSC**: other URLs are Discovered/not indexed (normal). Request indexing for `/blog`, `/typing-practice`, `/typing-lessons` once each — do not wait on this for AdSense
- [ ] Optional: human polish 2–3 flagship intros in your own voice (strongest “genuine” signal for review)
- [ ] Wire remaining settings into tools: font size → `.typing-text`; sound → key beeps; hints → LiveKeyboard gold pulse
- [ ] Known bugs (next coding pass): command palette vs typing on `/`; Falling Words frame-rate speed; Esc in focus mode; mobile `keydown` vs input; LiveKeyboard missing shift glyphs
- [ ] Sound on games (Falling Words / Word Attack)
- [ ] Keyboard layouts (DVORAK, Colemak)
- [ ] Multiplayer races · Leaderboards · School mode (needs optional login later)
- [ ] More games (Type Racer, Zombie Typing)

## Blog Posts (25 — SEO Strategy)
- **Live: 25** · Planned: 25 · Remaining: 0
- Content Type: Evergreen
- Goal: SEO, Topical Authority, AdSense, Organic Traffic
- Target length: **3,000+ words** per article (current live posts meet this bar)
- Include FAQs, Internal Links to tools (`/`, lessons, practice, progress, games), Practical Examples
- Index: `src/data/blog/typing-skills.ts` · Bodies: `src/data/blog/articles/*.ts`
- **Voice pass (2026-08):** all pillars de-templated for AdSense/quality optics; keep product links; avoid claiming “never AI” unless fully rewritten by hand

### Live posts (25)

| # | Slug | Title | Pillar | ~Words |
|---|------|--------|--------|--------|
| 1 | `how-to-type-faster` | How to Type Faster: 15 Proven Techniques… | 1 Speed | long |
| 2 | `good-typing-speed` | What Is a Good Typing Speed?… | 1 Speed | long |
| 3 | `average-typing-speed` | Average Typing Speed: Statistics… | 1 Speed | long |
| 4 | `how-many-words-per-minute` | How Many Words Per Minute Should You Type? | 1 Speed | long |
| 5 | `typing-speed-for-work` | What Is a Good Typing Speed for Work? | 1 Speed | long |
| 6 | `improve-typing-accuracy` | How to Improve Typing Accuracy From 90% to 99% | 1 Speed | ~3.0k |
| 7 | `free-typing-test` | Free Typing Test: Complete Guide to Measuring Your WPM | 2 Tests | ~3.3k |
| 8 | `typing-speed-test` | Typing Speed Test: Everything You Need to Know | 2 Tests | ~3.5k |
| 9 | `one-minute-typing-test` | 1 Minute Typing Test: What Is a Good Score? | 2 Tests | ~3.1k |
| 10 | `3-minute-typing-test-vs-5-minute-typing-test` | 3 Min vs 5 Min Typing Test: Which Is More Accurate? | 2 Tests | ~4.4k |
| 11 | `5-minute-typing-test` | 5 Minute Typing Test: What Is a Good WPM? | 2 Tests | ~3.5k |
| 12 | `typing-accuracy-test` | Typing Accuracy Test: Why Accuracy Matters More Than Speed | 2 Tests | ~3.5k |
| 13 | `touch-typing-guide` | Touch Typing Guide: Learn to Type Without Looking… | 3 Touch | ~3.5k |
| 14 | `touch-typing-for-beginners` | Touch Typing for Beginners: A Complete 30-Day Plan | 3 Touch | ~3.2k |
| 15 | `how-to-learn-touch-typing-as-an-adult` | How to Learn Touch Typing as an Adult | 3 Touch | ~3.3k |
| 16 | `muscle-memory-and-touch-typing` | The Science Behind Muscle Memory and Touch Typing | 3 Touch | ~3.3k |
| 17 | `10-bad-typing-habits` | 10 Bad Typing Habits That Are Slowing You Down | 3 Touch | ~3.2k |
| 18 | `typing-practice` | Typing Practice: Daily Exercises to Build Speed… | 4 Practice | ~3.2k |
| 19 | `best-free-typing-games` | Best Free Typing Games to Improve Your Speed | 4 Practice | ~3.1k |
| 20 | `type-numbers-and-symbols-without-looking` | How to Type Numbers and Symbols Without Looking | 4 Practice | ~3.1k |
| 21 | `data-entry-typing-test` | How to Pass a Data Entry Typing Test for Job Interviews | 4 Practice | ~3.1k |
| 22 | `typing-speed-for-programmers` | Typing Speed for Programmers: How Fast Should Coders Type? | 4 Practice | ~3.1k |
| 23 | `best-keyboards-for-fast-typing` | Best Keyboards for Fast Typing | 5 Productivity | ~3.1k |
| 24 | `mechanical-vs-membrane-keyboards` | Mechanical vs Membrane Keyboards: Which Is Better for Typing? | 5 Productivity | ~3.1k |
| 25 | `fix-typing-posture-and-avoid-wrist-pain` | How to Fix Your Typing Posture and Avoid Wrist Pain | 5 Productivity | ~3.1k |

---

# Pillar 1: Typing Speed

## Priority: High · Status: **Complete (6/6)**

1. [x] How to Type Faster: 15 Proven Techniques to Increase Your WPM → `/blog/how-to-type-faster`
2. [x] What Is a Good Typing Speed? WPM Benchmarks by Age and Profession → `/blog/good-typing-speed`
3. [x] Average Typing Speed: Statistics and How You Compare → `/blog/average-typing-speed`
4. [x] How Many Words Per Minute Should You Type? → `/blog/how-many-words-per-minute`
5. [x] What Is a Good Typing Speed for Work? → `/blog/typing-speed-for-work`
6. [x] How to Improve Typing Accuracy From 90% to 99% → `/blog/improve-typing-accuracy`

---

# Pillar 2: Typing Tests

## Priority: High · Status: **Complete (6/6)**

7. [x] Free Typing Test: Complete Guide to Measuring Your WPM → `/blog/free-typing-test`
8. [x] Typing Speed Test: Everything You Need to Know → `/blog/typing-speed-test`
9. [x] 1 Minute Typing Test: What Is a Good Score? → `/blog/one-minute-typing-test`
10. [x] 3 Minute Typing Test vs 5 Minute Typing Test: Which Is More Accurate? → `/blog/3-minute-typing-test-vs-5-minute-typing-test`
11. [x] 5 Minute Typing Test: What Is a Good WPM? → `/blog/5-minute-typing-test`
12. [x] Typing Accuracy Test: Why Accuracy Matters More Than Speed → `/blog/typing-accuracy-test`

---

# Pillar 3: Touch Typing & Learning

## Priority: High · Status: **Complete (5/5)**

13. [x] Touch Typing Guide: Learn to Type Without Looking at the Keyboard → `/blog/touch-typing-guide`
14. [x] Touch Typing for Beginners: A Complete 30-Day Learning Plan → `/blog/touch-typing-for-beginners`
15. [x] How to Learn Touch Typing as an Adult → `/blog/how-to-learn-touch-typing-as-an-adult`
16. [x] The Science Behind Muscle Memory and Touch Typing → `/blog/muscle-memory-and-touch-typing`
17. [x] 10 Bad Typing Habits That Are Slowing You Down → `/blog/10-bad-typing-habits`

---

# Pillar 4: Practice & Improvement

## Priority: Medium · Status: **Complete (5/5)**

18. [x] Typing Practice: Daily Exercises to Build Speed and Muscle Memory → `/blog/typing-practice`
19. [x] Best Free Typing Games to Improve Your Speed → `/blog/best-free-typing-games`
20. [x] How to Type Numbers and Symbols Without Looking → `/blog/type-numbers-and-symbols-without-looking`
21. [x] How to Pass a Data Entry Typing Test for Job Interviews → `/blog/data-entry-typing-test`
22. [x] Typing Speed for Programmers: How Fast Should Coders Type? → `/blog/typing-speed-for-programmers`

---

# Pillar 5: Productivity & Hardware

## Priority: Medium · Status: **Complete (3/3)**

23. [x] Best Keyboards for Fast Typing → `/blog/best-keyboards-for-fast-typing`
24. [x] Mechanical vs Membrane Keyboards: Which Is Better for Typing? → `/blog/mechanical-vs-membrane-keyboards`
25. [x] How to Fix Your Typing Posture and Avoid Wrist Pain → `/blog/fix-typing-posture-and-avoid-wrist-pain`
