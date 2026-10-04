# FreeTyper.com — Project Blueprint

Standalone typing platform. No login, privacy-first, monetized via ads & affiliates.

> **Status (2026-10-04):** AdSense rejected (“Low value content”). **Everything below marked done is LIVE on freetyper.com** (master `c74eb2d`): all 7 tool guides rewritten from the real code + verified sources, ~10 tool bugs fixed, real author/date bylines, BlogPosting schema, and pinned (sticky) left/right sidebars. Release was browser-tested first (32/32 functional checks + 46/46 sidebar checks, re-run against the live site; no console errors) — testing caught a hydration error on `/keyboard-guide` for users with saved stats, fixed before release. **Blog (2026-10-04, branch `content/blog-consolidation`, not deployed yet):** cut from 25 to 10 posts (15 deleted, 74 internal links remapped, sitemap 38 → 23 URLs); the 10 kept posts still carry the OLD templated bodies and are next to be rewritten. **Still open:** Verify site ownership (AdSense UI), the blog cut/rewrite, Search Console indexing + traffic, then reapply. See **TODO — AdSense fix plan**.

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
└── FallingWordsGame.tsx, WordAttackGame.tsx
src/components/layout/ → Sidebar, SidebarProvider, RightSidebar, SettingsProvider, Footer, ContactPanel
src/components/tools/  → ToolClient (dynamic imports), ToolPageContent (viewport shell)
src/components/blog/   → BlogContent (+ auto TOC), BlogCard
src/components/seo/    → JsonLd (Org/WebSite/WebApp/Breadcrumb/FAQ/HowTo), FAQ
src/components/content/ → ExpandableSeoContent (guide open by default, toggle “Show less”; first heading rendered as the page’s visible H1; TOC hash expand)
src/lib/content-dates.ts → dynamic “Updated Month Year” placeholders ({{UPDATED_*}}) — **no content uses them any more** (all guides carry a real fixed date); safe to delete later
src/config/ → tools.ts (7 tools), site.ts
src/data/
├── home/typing-speed-content.ts          # Home guide — REWRITTEN 2026-10-03 (~2k words, verified facts, FAQ list feeds visible FAQ + JSON-LD)
├── tools/*-content.ts (6 files)          # REWRITTEN 2026-10-03, ~1.6–1.7k words each: lessons, practice, keyboard-guide, progress, falling-words, word-attack. Each exports meta, faqs (feeds visible FAQ + JSON-LD), previewHtml, bodyHtml, howToSteps; header comment names the code files it describes — update guide + code together
└── blog/
    ├── typing-skills.ts                  # Post index (slug, title, meta) — 10 kept (cut from 25 on 2026-10-04)
    ├── article-content.ts                # Re-exports articles/*
    └── articles/
        ├── typing-speed.ts               # how-to-type-faster, good-typing-speed, improve-typing-accuracy
        ├── touch-typing.ts               # touch-typing-for-beginners, muscle-memory-and-touch-typing, 10-bad-typing-habits
        ├── practice.ts                   # data-entry-typing-test, typing-speed-for-programmers
        └── productivity.ts               # mechanical-vs-membrane-keyboards, fix-typing-posture-and-avoid-wrist-pain
        (typing-tests.ts deleted — all 6 test posts removed; the speed-test topic lives on the home guide)
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
- Latest result: **net WPM**, accuracy, time, **gross WPM**, correct / errors / words, rank (beginner<40 · average 40–59 · skilled 60–79 · pro 80–99 · elite 100+), WPM bar (0–120), vs last test, coach tip. (Removed the unsupported “top 5%” percentile label 2026-10-03.)
- **Scoring (as coded):** net WPM = correct chars ÷ 5 ÷ minutes; gross = all typed chars ÷ 5 ÷ minutes; accuracy = correct ÷ typed. **Backspace removes the stepped-back char from the tally** (right or wrong), so accuracy reflects the text left on screen and a fix costs time, not accuracy. Coach: <95% “hold accuracy”, <88% “not a real score”. Custom duration 1–120 **minutes**. Text: words (easy+medium pools), sentences (quotes/news/fun passages), code (5 snippets). Guides must stay consistent with this.
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
- Falling Words: exact-match before prefix highlight so the input clears and the next word types; drops count as misses (real accuracy, not fake 100%). 10 tiers, 3 lives, points 10/25/50 by word length (no combos), tier thresholds 10/20/36/48/75/90/126/144/180 cumulative words; fall speed scaled by real elapsed time (frame-rate independent since 2026-10-03). Accuracy = cleared ÷ (cleared + dropped), not keystrokes
- Word Attack: 8 rounds, one word at a time with its own timer; result saved when each **round** ends (one latest-5 entry per game, updated each round; each round adds only its own delta session `Word Attack - Round N` to progress); WPM/time count active play only (not the get-ready / round-complete screens). Points by word length 10/25/50 × combo (x1 for 1–2, x1.5 for 3–5, x2 for 6–8, x2.5 for 9–11, x3 for 12+); combo resets only on a timeout and carries across rounds. Timer lives outside React setState so the save is not dropped
- High scores still in `freetyper-fw-highscore` / `freetyper-wa-highscore`

## Polished Tool Pages (same bar as home)
| Route | UX highlights | SEO |
|---|---|---|
| `/` | Speed test, same-page result + latest 5, share/practice | Rewritten guide (~2k) + FAQ/HowTo/WebApp/Breadcrumb |
| `/typing-lessons` | Lesson pills, LiveKeyboard + focusKeys, same-page coach, auto-next (unlock needs only finishing, no accuracy gate) | Rewritten guide (~1.6k) |
| `/typing-practice` | Category pills (20 built-in passages), weak keys, same-page coach, auto-next | Rewritten guide (~1.6k) |
| `/keyboard-guide` | Finger filters, home-row toggle, key stats, weak keys (full finger map incl. punctuation; space = thumbs) | Rewritten guide (~1.7k) |
| `/typing-progress` | Stats, chart, heatmap, sessions, achievements (local-day streak) | Rewritten guide (~1.7k) |
| `/typing-game-falling-words` | Start after game over; result + latest 5; real miss accuracy | Rewritten guide (~1.7k) + FAQ/HowTo |
| `/typing-game-word-attack` | Start after last round; result saved per round + latest 5 | Rewritten guide (~1.7k) + FAQ/HowTo |

Tool SEO pages: full-viewport tool above the fold → guide below (visible H1 = guide’s first heading, open by default) → JSON-LD (WebApplication + FAQPage + HowTo).  
**Home stays the speed test** (`/`). Practice is `/typing-practice` — daily habit, not the landing URL (search intent for “typing speed test” owns `/`).  
`/typing-speed-test` **308 redirect → `/`** (home owns the keyword; slug is not in the sitemap).  
Bylines: every tool guide and the home page use a **real fixed date** (“Last updated October 3, 2026”) + author Ashiqur Rahman → `/about#author`. **When you change a guide, bump its date** (the `<time datetime>` in `previewHtml` + the “Last real edit” header comment). Never fake freshness.  
Guide rules: describe only what the code does; cite only sources actually opened (Dhakal et al., CHI 2018 — verified: 168,000 volunteers, mean 51.56 WPM SD 20.2, fastest 10% above ~78, slowest 10% below ~26, uncorrected error rate 1.167%, trained typists ~+5 WPM; Wikipedia “Words per minute”); no invented stats; state the tool’s limits.  
Tool pages use the **full middle column** (between left nav and right rail). Right sidebar is visible (200px) with on-site links + a short tip — not an empty ad slot.  
**Sidebars are pinned (2026-10-04):** on desktop both `<aside>`s are `md:sticky md:top-0 md:h-screen md:self-start` (+ `overflow-y-auto`). Root cause of the old behaviour: the `main` flex row stretched each aside to the full page height, so `sticky` had no room to move — never give them `h-auto`/`min-h-screen` or drop `self-start`. Mobile drawer (`fixed`) is unchanged. If an ad is ever placed in the right rail, check AdSense’s policy on sticky placement first.

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
- JSON-LD: Org + WebSite (layout); WebApplication + FAQPage + HowTo on home + tools (FAQ text = the visible FAQ); Breadcrumb on home; **BlogPosting + Breadcrumb on every blog post** (author → `/about#author`); JSON-LD escapes `<`. Note: Google no longer shows HowTo rich results and limits FAQ rich results — kept as harmless, accurate markup, not a ranking lever
- Org logo → `/opengraph-image` (not the old 404 `/og-image.png`). No fake SearchAction (`/?q=` does not exist)
- Guides: real author byline + date, honest “Limits” and “Sources and method” sections, open by default (no collapsed body)
- OG/Twitter cards · dynamic `opengraph-image.tsx` (1200×630) · sitemap (tools + blog, **no** `/typing-speed-test`) · `app/robots.ts` (Allow + Sitemap) · RSS (tools + 10 posts) · PWA
- **Do not** put ads.txt in `public/robots.txt` — that file was blocking a real robots.txt; ads stay in `public/ads.txt`
- Settings `/settings` is `noindex`. About/contact/legal have unique titles + canonicals
- GA4 `G-QC5509TVSF` · Google Search Console verified
- **AdSense: application rejected — see “Audit” section.** Setup is live and verified. Publisher `ca-pub-3237588309372777`. `adsbygoogle.js` in root `<head>` (`layout.tsx`, every page) + `<meta name="google-adsense-account">`. `public/ads.txt` is `google.com, pub-3237588309372777, DIRECT, f08c47fec0942fa0`. No in-article `<ins>` units — Auto ads from the AdSense UI. In the dashboard, turn **off** overlay / anchor / vignette ads so they do not sit on the typing area. **Do not** put ads.txt in `public/robots.txt`
- Privacy (Sep 2026): operator named (Ashiqur Rahman); honest about GA; Google-required third-party cookie wording (vendors including Google, prior visits, opt-out, web beacons/IP); **not directed at children under 13**. Do not claim “no tracking” while Analytics is on
- About: named operator, scoring method, what’s on the site, what we store / don’t claim. Contact: email box (copy + open mail) + mailto message form (`ContactPanel`) — no server inbox, nothing posted to our servers
- `contact@freetyper.com` MX is live (Cloudflare Email Routing). Reviewers test this address
- Expandable SEO guide is **open by default** (changed 2026-10-03 after the “low value content” rejection; supersedes the earlier collapsed product call)
- Login: **not now**. Guest + localStorage stays the product. Optional magic-link sync is a later conversation, not this round
- Site title: `FreeTyper — Type Faster. Free Forever.` (no decorative unicode)
- Blog: **10 posts** (cut from 25 on 2026-10-04 — see Blog section); bodies are still the old long templated drafts until each is rewritten
- Legal: /about, /contact, /privacy, /terms, /disclaimer
- Deploy: GitHub → Coolify (Docker) → Hetzner · Repo: `github.com/ashiqur0202/FreeTyper` · push to `master` auto-deploys (~3 min). Workflow used 2026-10-03/04: work on a branch → `tsc` + `npm run build` + headless-browser tests on `next start` → fast-forward `master` → push → poll the live site to confirm

## Done
- [x] Live keyboard visualizer (full layout, hint, flash, focusKeys)
- [x] Same-page results (speed test / practice / lessons) — no takeover card; next text stays typeable
- [x] PracticeFeedback: per-run coach + max 5 newest-first performances (localStorage logs)
- [x] Speed-test result is the full score (net/gross WPM, correct/errors/words, rank, bar, share)
- [x] Animations (progress glow, result appear, shimmer, fade-up)
- [x] Backspace support · 3-line scrolling text
- [x] Home elite SEO (methodology, TOC, E-E-A-T, sources, benchmarks, FAQ/HowTo/Breadcrumb) — superseded by the 2026-10-03 rewrite
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
- [x] ~~Product call: keep ExpandableSeoContent collapsed~~ — reversed 2026-10-03 (guide open by default)
- [x] Product call: **no login this round** — guest + localStorage only
- [x] Right sidebar filled (tool links + tip) so the site does not look unfinished
- [x] Fixed broken leftover sentences in `improve-typing-accuracy`
- [x] **2026-10-03 batch (live since 2026-10-04):** all 7 tool guides rewritten from the code (see 3a) · real author/date bylines · `BlogPosting` schema · sitemap no fake lastmod · 23 redirect links fixed · dead `ResultCard.tsx` / stray draft deleted · README replaced
- [x] **Bugs found and fixed while writing the guides (live):** unsupported “top 5%” result label removed · keyboard guide: 6 keys had no finger + space labelled “right index” · streak used UTC day (now local) · Falling Words fall speed was per-frame (now time-based) · Word Attack double-counted progress and logged cumulative snapshots, WPM counted idle screens (now per-round delta, active time only)
- [x] **Release 2026-10-04:** merged to `master` + pushed → Coolify; verified live (new H1, guide dates, BlogPosting, either-thumb label, sitemap `lastmod` only on posts). Pre-release browser tests caught + fixed a `/keyboard-guide` hydration mismatch (stats read from localStorage on first paint → now rendered after hydration via `useSyncExternalStore`)
- [x] **Sticky sidebars** (2026-10-04): left + right rails stay pinned on long pages (see layout note); verified 46/46 locally and on the live site at 900px and 560px viewport heights, plus mobile drawer unchanged

## Audit — AdSense rejection (2026-10-03)
Full code + live-site audit. **Status: AdSense application rejected — “Low value content”** (dashboard: “Your site isn't ready to show ads · Verify site ownership · policy violation”). Only ~4 pages are in Google's index.

**Google's stated bar (verbatim criteria):** a site must (1) provide authentic, high-quality information, tools or services; (2) exhibit **ongoing curation and structural maintenance**; (3) **generate and sustain genuine user interest**. Wording also asks for “a consistent presence on the web”.
→ Maps to: (1) content quality/originality, (2) posts all published in a few batches then frozen, (3) no traffic yet. Also, the dashboard still shows **“Verify site ownership”** as an open step — do that first (meta tag + ads.txt are live; click Verify in AdSense → Sites).

**Verified OK (live, re-checked 2026-10-04):** AdSense `<script>` + `google-adsense-account` meta in `<head>` on every page · `/ads.txt` correct · `robots.txt` allows all + sitemap · sitemap had 38 URLs when checked (7 static, 6 tools, 25 posts) — 23 after the blog cut · canonicals correct · legal pages + working `contact@` address. The deploy is done; it is not a technical-setup problem.

**Likely causes (ranked, inferred — not confirmed by Google):**
1. **Scaled / AI-looking content.** 25 posts × ~3k words + 7 tool guides (~815 KB text), one generic author (“FreeTyper Team”), batch dates (5 on Jun 8–12, 4 on Jul 27, 16 on Aug 7), repeated structure (23/25 have a “Table of Contents” H2; repeated “From Article to Action” / “Bottom Line” closers). The “de-AI pass” changed wording, not substance — no first-hand experience, original data or screenshots.
2. **Weak sourcing.** Home guide “Sources” are mostly “commonly reported across typing platforms…” — vague, few verifiable links. Unsupported benchmark tables read as low-value. → **FIXED for the 7 tool pages 2026-10-03; blog posts still have it.**
3. **No real author entity.** Bylines are “FreeTyper Editorial/Team”; no bio/author page/credentials on posts (About does name Ashiqur Rahman). → byline + schema now point to `/about#author`; **posts are only truthful once you review/rewrite them.**
4. **Tool pages are an app with the guide collapsed** behind “Read more”, H1 is `sr-only`, so visitors see little publisher content. → **FIXED and live 2026-10-04:** visible H1, guide open, guides rewritten.
5. **New domain, no authority/traffic, poor indexing** (rest are “Discovered – not indexed”). AdSense wants indexed pages and real visitors.

**Small defects found:**
- 23 internal links in `src/data/**` point to `/typing-speed-test` (308 → `/`); link to `/` directly
- `sitemap.ts` uses `new Date()` as `lastModified` for static/tool/legal pages → looks changed on every deploy; use real dates
- Blog posts have no `BlogPosting`/`Article` JSON-LD and no author link (`blog/[slug]/page.tsx`)
- `ResultCard.tsx` is dead code (not imported anywhere) — delete
- `typing_speed_test.md` (stray draft) and default create-next-app `README.md` at repo root
- `siteConfig.author` is just “FreeTyper”; check privacy line “our users” (`privacy/page.tsx:56`) matches real data collection
- This file itself: “Done” section is a changelog that duplicates the sections above; AdSense/ads.txt notes repeated 3×; pillar lists duplicate the post table

**Plan (in order):**
1. Cut the blog to ~8–10 posts worth standing behind; rewrite by hand with real experience/data/screenshots under Ashiqur’s name; `noindex` or remove the rest
2. Replace vague sources with real, linkable citations (or delete the claim)
3. Show the guide text on tool pages (visible H1, no collapsed body) so each page works as content, not just an app
4. Fix the small defects above (redirect links, sitemap dates, `BlogPosting` schema + author page, dead files)
5. Get indexed + real traffic: Search Console “request indexing” for key URLs, a few honest backlinks/posts (Reddit, Show HN, Product Hunt)
6. Reapply only after a few weeks with organic traffic and more pages indexed — repeated rejections don’t help

## TODO — AdSense fix plan (started 2026-10-03)
Owner: **[C]** = Claude does it in code · **[A]** = Ashiqur (needs login / real experience). Do in order.

### 1. Verify site ownership — [A] blocked: option not found in the AdSense UI
Status: the dashboard shows “Verify site ownership” but there is no visible button. Everything Google needs is already live (`ca-pub-…` script in `<head>`, `google-adsense-account` meta, `ads.txt`). Try, in this order:
- [ ] AdSense → **Sites** (left menu) → click the **freetyper.com row/arrow** (not the banner) → look for **Verify** / “Fix” / “Get ready” next to *Site ownership*. On mobile, use the desktop view.
- [ ] Confirm you are in the AdSense account whose publisher ID is `pub-3237588309372777` (account menu top-right). A different Google account hides the button.
- [ ] If it only offers methods: choose **AdSense code snippet** (already in `<head>`) or **Meta tag** (already present) → Verify. Open `https://freetyper.com/` → View Source → search `ca-pub-3237588309372777` first to make sure it is there.
- [ ] If there is no button at all: Google auto-verifies when its crawler sees the snippet; this can take a few days. Wait 3–7 days, refresh. After the content fixes below, the **Request review** button appears — that review re-checks ownership too.
- [ ] If still stuck after the content fixes: AdSense **Help → Contact** (only offered once eligible) or post on the AdSense Community forum with a screenshot. Paste the screenshot/wording here and I will adapt the steps.
Not a code problem — nothing to change in the repo for this item.

### 2. Code fixes — [C]
- [x] Replace the 23 internal links to `/typing-speed-test` with `/` (`src/data/**`) — `/blog/typing-speed-test` links kept (real post)
- [x] Sitemap: removed fake `lastModified` (only blog posts keep their real date)
- [x] Blog posts: `BlogPosting` + Breadcrumb JSON-LD; author name links to `/about#author`; JSON-LD now escapes `<`
- [x] Author: “FreeTyper Team/Editorial” → **Ashiqur Rahman** (site config, post index, tool/home bylines → `/about#author`). Removed the unverifiable “Reviewed for accuracy” claim. NOTE: only truthful once you actually rewrite/review the posts (section 3)
- [x] Tool pages + home: guide’s first heading is now the visible H1 (no `sr-only` H1); guide is **open by default** (toggle now says “Show less”). To revert: `useState(true)` → `false` in `ExpandableSeoContent.tsx`
- [x] Deleted `ResultCard.tsx`, `typing_speed_test.md`; real `README.md`
- [x] Reviewed `privacy/page.tsx:56`: it is Google’s required cookie wording, not a claim about us — left as is
- [x] `tsc` clean, `npm run build` passes, changed files lint-clean (repo has ~57 pre-existing lint errors, e.g. `useTypingEngine.ts` refs-in-render — separate cleanup)
- [x] **Commit + push + Coolify deploy** — done 2026-10-04 (5 commits + sticky-sidebar fix; live)
- [ ] Optional [C]: delete unused `content-dates.ts` + placeholder injection; address the ~57 pre-existing lint errors (see Next Up)

### 3a. Tool-page guide rewrites — [C] (one page at a time, review before moving on)
Rules: describe only what the tool really does (read its code first); every number either comes from the code or a source that was actually opened and checked; no invented stats/benchmarks; no templated TOC/closers; ~1–2k words; short keywords in title/H1/intro, long-tail as question H2s + FAQ; FAQ list feeds both visible FAQ and JSON-LD; real fixed “last updated” date; byline Ashiqur Rahman.
- [x] `/` home speed test — done 2026-10-03 (sources: Dhakal et al. CHI 2018, verified in the paper; Wikipedia WPM)
- [x] `/typing-lessons` — done 2026-10-03 (7 lessons, no accuracy gate to unlock — documented honestly; Dhakal et al. verified: trained typists ~+5 WPM, fewer uncorrected errors)
- [x] `/typing-practice` — done 2026-10-03 (20 built-in passages = 5 each in quotes/news/code/fun; weak keys = ≥5 presses, 5 lowest accuracy → 40 words from ~123-word list; untimed; documented limits)
- [x] `/keyboard-guide` — done 2026-10-03. Code fixes alongside: finger map now covers ` = [ ] \ ' (were unmapped/grey); space bar is “either thumb”, grey (was labelled right index). Guide cites Dhakal et al. finger-use nuance (verified in paper)
- [x] `/typing-progress` — done 2026-10-03. Code fix alongside: streak days now use the **local** calendar day (was UTC via toISOString → rolled over at the wrong hour outside UTC; users may see one streak reset on upgrade). Documented quirks: best WPM/accuracy exclude games but chart + avg include them; avg = last 30 sessions; speed badges use best single (possibly short) run; reset does not clear lesson unlocks or latest-5 logs
- [x] `/typing-game-falling-words` — done 2026-10-03. Code fix alongside: fall speed now scaled by real elapsed time (was per-frame → faster on 120/144 Hz; closes the “Falling Words frame-rate speed” known bug). Documented: score by word length (10/25/50, no combos), tier thresholds 10/20/36/48/75/90/126/144/180 cumulative words, fall time ~3.2s→0.6s, accuracy = words cleared ÷ (cleared+dropped) not keystrokes, pools are 60×3-letter / 80×5-letter / 258×5–10-letter words. Difficulty curve is very steep (product note)
- [x] `/typing-game-word-attack` — done 2026-10-03. **Code fixes alongside (found while reading the code):** (1) each round-end save used to prepend a *new cumulative* log entry and add a *cumulative* session, so latest-5 filled with one game’s snapshots and progress double-counted sessions/time/words (and unlocked session badges early) — now one log entry per game (updated each round) and each round adds only its own delta session (`Word Attack - Round N`); (2) WPM/time counted the “get ready”/“round complete” screens — now only active play time. Documented: 8 rounds (5/6/6/7/7/8/8/10 words; 6/5/5/5/5/5/5/4.5 s per word), points by word length 10/25/50 × combo (x1 ≤2, x1.5 3–5, x2 6–8, x2.5 9–11, x3 12+), combo only resets on timeout (not typos), accuracy = words cleared ÷ attempted. Unused config in gameData: wordAttackRounds.duration/basePoints, scoringRules.speedBonus*
- [ ] Optional [A]: add one real screenshot of a FreeTyper result card to the home guide (most “genuine” signal); rename sidebar link “start” → “speed test” (better anchor text)
- [ ] [A] After the deploy: Search Console → request indexing for `/`, `/blog`, `/typing-practice`, `/typing-lessons`, `/keyboard-guide`, `/typing-progress`, both game pages (Google must re-crawl the rewritten pages)

### 3. Blog content quality — [A] + [C] (needs your real experience; Claude must not invent first-hand claims)
- [x] Decide which posts to keep — **10 chosen 2026-10-04** (list in the Blog section)
- [x] [C] Remove the 15 other posts — **deleted outright** (Ashiqur’s call: they were not indexed yet, so no redirects/noindex); gone from blog list, sitemap, RSS; internal links to them remapped (74) to the nearest kept post or tool; no broken internal links in the built site. Removed URLs now 404
- [ ] [C] Rewrite each of the 10 kept posts from scratch (see rules in the Blog section) — then [A] review under your name
- [ ] [C] Zero external sources currently exist in any post; every rewritten post must cite real, opened sources (rewrite step covers this)
- [ ] [C] Remove templated repeats (“Table of Contents” H2, “From Article to Action”, “Bottom Line” closers)

### 4. Ongoing presence + traffic — [A]
- [ ] Publish **1 real post/week** (ongoing curation is an explicit AdSense criterion)
- [ ] Search Console → URL Inspection → **Request indexing** for `/`, `/blog`, `/typing-practice`, `/typing-lessons`, `/keyboard-guide`, key posts
- [ ] Share honestly where typists are (Reddit r/typing, Show HN, Product Hunt) and note referrers in GA4
- [ ] Wait until GA4 shows steady organic users and more pages are indexed

### 5. Reapply — [A]
- [ ] AdSense → Sites → **Request review** after sections 1–4 (not before; repeated rejections don’t help)
- [ ] Once approved: turn **off** overlay / anchor / vignette Auto ads so they miss the typing area

## Next Up (product backlog, after AdSense)
- [x] ~~Commit + deploy the 2026-10-03 batch~~ — done 2026-10-04
- [ ] Product decisions raised by the guides: (a) lessons unlock without any accuracy check — add a 95% gate? (b) Falling Words tiers 7–10 fall in under 1 s (very steep) — ease the speed curve? (c) only 20 practice passages — add more; (d) progress export/import; (e) unused config in `gameData.ts` (`wordAttackRounds.duration/basePoints`, `scoringRules.speedBonus*`)
- [ ] Add the browser checks to the repo: this session’s headless-Chrome scripts (functional + sticky sidebars) lived in a temp folder and are not saved. Recreate as Playwright tests in the repo (`tests/`) so every release can run them (cover: speed-test run, keyboard-guide labels, Word Attack per-round progress, Falling Words speed, hydration on pages with stored data, sticky rails)
- [ ] Cleanup: ~57 pre-existing lint errors (e.g. `useTypingEngine.ts` refs read/written during render, set-state-in-effect in the games); delete unused `src/lib/content-dates.ts` + the placeholder injection in `ExpandableSeoContent`
- [ ] Wire remaining settings into tools: font size → `.typing-text`; sound → key beeps; hints → LiveKeyboard gold pulse
- [ ] Known bugs (next coding pass): command palette vs typing on `/`; Esc in focus mode; mobile `keydown` vs input; LiveKeyboard missing shift glyphs
- [ ] Sound on games (Falling Words / Word Attack)
- [ ] Keyboard layouts (DVORAK, Colemak)
- [ ] Multiplayer races · Leaderboards · School mode (needs optional login later)
- [ ] More games (Type Racer, Zombie Typing)

## Blog (10 posts — consolidated 2026-10-04)
Index: `src/data/blog/typing-skills.ts` · Bodies: `src/data/blog/articles/*.ts` · Posts render at `/blog/[slug]` with BlogPosting + Breadcrumb JSON-LD.

**State:** the 10 posts below were kept because each has a distinct search intent that the tool pages do not already answer. Their bodies are still the **old ~3k-word templated drafts** (no external sources; some with heavy unsupported percentages) — they are the next job. 15 others were deleted.

| # | Slug | Why kept | Pre-rewrite risk (from the audit scan) | Status |
|---|------|----------|----------------------------------------|--------|
| 1 | `how-to-type-faster` | core intent; 8 H2s, no templated TOC | 10 % figures, 0 sources | **REWRITTEN 2026-10-04** (~1.3k words; “What the Research Supports”: Dhakal et al. inter-key interval, finger-use, rollover, error figures verified in the paper + Cambridge write-up advice; correlations flagged as such; 4-week plan labelled as our own suggestion; no promised gains) |
| 2 | `good-typing-speed` | the one benchmark post (absorbs average / how-many / for-work topics) | 9 % figures, 6 “study” mentions, 0 sources | **REWRITTEN 2026-10-04** (~1.2k words; Dhakal et al. figures verified in the paper incl. sample caveats; Karat 1999 + job ranges via Wikipedia WPM; no age table — no reliable source found; retitled “What Large-Scale Data Shows”) |
| 3 | `improve-typing-accuracy` | distinct intent | **64 % figures**, 0 sources | **REWRITTEN 2026-10-04** (~1.3k words; all 64 invented figures gone; Dhakal et al. error rate 1.167%, 90% <2.66%, KSPC 1.173, correction/speed correlations verified in the paper; final vs keystroke accuracy explained; routine labelled as our suggestions) |
| 4 | `touch-typing-for-beginners` | practical plan (absorbs touch-typing guide / adult posts) | 17 % figures | **REWRITTEN 2026-10-04** (~1.3k words; “A Realistic Plan”; Wikipedia Touch typing + Dhakal et al. (training only ~+5 WPM, finger counts) + Cambridge write-up; says no honest guide can promise days — vendor timelines range weeks→months with no controlled study found; steps map to the 7 lessons incl. the no-accuracy-gate caveat) |
| 5 | `muscle-memory-and-touch-typing` | motor-learning angle, citable | 3 “study” mentions, 0 sources | **REWRITTEN 2026-10-04** (~1.2k words; Wikipedia Muscle memory; Walker 2002 (+20% motor speed after sleep), Walker 2003, Brawn 2010 (effect debated; depends on training time of day), Walker & Stickgold 2004 — abstracts verified via Europe PMC; says plainly these are lab motor tasks not typing, no typing-specific spacing evidence found) |
| 6 | `10-bad-typing-habits` | distinct, low-claim | 4 % figures | **REWRITTEN 2026-10-04** (~1.3k words; retitled “10 Typing Habits to Fix, and the Evidence Behind Each”; each habit tagged Evidence / our suggestion — Dhakal et al., Cambridge write-up, OSHA keyboard/wrist-support/checklist pages, NHS RSI + CTS; “advice with weak support” section (key force, ‘typing causes CTS’, ‘must use ten fingers’)) |
| 7 | `typing-speed-for-programmers` | niche intent (our code mode) | 8 % figures | rewrite pending |
| 8 | `data-entry-typing-test` | job-test intent | 14 % figures, employer claims unverified | rewrite pending — verify how such tests score (net WPM, KSPH) |
| 9 | `mechanical-vs-membrane-keyboards` | honest “how to choose” (absorbs best-keyboards) | thin hard evidence | rewrite pending — say what is and isn’t known |
| 10 | `fix-typing-posture-and-avoid-wrist-pain` | highest value; public guidance exists | 0 % figures, 0 sources | **REWRITTEN 2026-10-04** (~1.5k words; OSHA keyboard / wrist-rest / checklist pages, Thomsen 2008 + Waersted 2010 reviews, NHS CTS + RSI pages; says what evidence does not show) |

**Deleted 2026-10-04 (15):** `typing-practice`, `best-free-typing-games`, `type-numbers-and-symbols-without-looking`, `best-keyboards-for-fast-typing`, `touch-typing-guide`, `how-to-learn-touch-typing-as-an-adult`, `average-typing-speed`, `how-many-words-per-minute`, `typing-speed-for-work`, `free-typing-test`, `one-minute-typing-test`, `3-minute-typing-test-vs-5-minute-typing-test`, `5-minute-typing-test`, `typing-accuracy-test`, `typing-speed-test` (blog). Reasons: overlapped the home/tool guides (6 test posts; practice; games; numbers) or each other (4 benchmark posts, 3 touch-typing, 2 keyboards). Their old text stays in git history (`git log -- src/data/blog`).

**Rewrite rules (same bar as the tool guides):**
- 1.2–2k words, answer first, one clear question per post; no templated “Table of Contents”, “From Article to Action”, “Bottom Line”
- Facts only from sources actually opened and checked, linked inline; no invented statistics; no fake first-hand stories — say what is unknown
- Use the site’s own measured behaviour where relevant (scoring rules, rank bands) and link to the right tool
- Real `date` (first published) and `updated` (BlogPost field, shown on the page, feeds `dateModified` + sitemap) when substantively rewritten; never batch-backdate; byline Ashiqur Rahman
- Then **1 new post per week** (ongoing curation is an AdSense criterion); keep a topic queue here

**Topic queue (draft ideas, none written):** how typing speed is scored by employers (net vs gross, accuracy floors) · typing on a laptop vs external keyboard · how to practice typing 10 minutes a day · does typing speed matter for programmers (with evidence) · common typing errors by key pair (from the Dhakal et al. error data)
