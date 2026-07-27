# FreeTyper.com — Project Blueprint

Standalone typing platform. No login, privacy-first, monetized via ads & affiliates.

## Tech Stack
- **Next.js 16** (App Router, TS) + **Tailwind v4** (dark, gold accent) + **lucide-react**
- Fonts: Inter + JetBrains Mono · Docker standalone on Hetzner via Coolify · Cloudflare DNS
- No Vercel. No database. All data in localStorage.

## Key Components
```
src/components/skills/typing/
├── types.ts, typingData.ts, gameData.ts
├── useTypingEngine.ts        # rAF timer, WPM/accuracy, backspace support
├── useTypingProgress.ts      # localStorage progress/achievements
├── TypingSpeedTest.tsx        # 9 durations, 3 text modes, command palette, focus mode, 3-line scroll
├── LiveKeyboard.tsx           # Full QWERTY, hint pulse, flash, optional focusKeys dim
├── ResultCard.tsx             # Animated WPM, ranks, confetti, share; next/retry labels
├── TypingLessons.tsx          # Progressive lessons, pills, LiveKeyboard, ResultCard
├── TypingPractice.tsx         # Categories + weak keys, LiveKeyboard, ResultCard
├── KeyboardGuide.tsx          # Finger filters, home-row mode, personal key stats
├── TypingProgress.tsx         # Stats, WPM chart, weak keys, sessions, achievements
├── KeyboardHeatmap.tsx, AchievementToast.tsx
└── FallingWordsGame.tsx, WordAttackGame.tsx
src/components/layout/ → Sidebar, SidebarProvider, RightSidebar, SettingsProvider, Footer
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
    ├── typing-skills.ts                  # Post index (slug, title, meta) — 9 live
    ├── article-content.ts                # Re-exports articles/*
    └── articles/
        ├── typing-speed.ts               # Pillar 1 bodies (6 posts)
        ├── typing-tests.ts               # Pillar 2 bodies (3 posts)
        ├── touch-typing.ts               # Pillar 3 (empty)
        ├── practice.ts                   # Pillar 4 (empty)
        └── productivity.ts               # Pillar 5 (empty)
src/app/ → page (speed test + SEO), [slug] (all 7 tools + SEO),
           settings, blog, about, contact, privacy, terms, disclaimer, opengraph-image
```

## Speed Test Features
- **3-line scrolling** (monkeytype-style) · **Backspace** to correct mistakes
- **Live keyboard** — full QWERTY, gold hint pulse on next key, green/red flash on type
- **Progress bar** with glow · Live WPM + accuracy
- **Focus mode** (fullscreen, Esc to exit) · **Command palette** (`/` key)
- **Result card** — rank gradient (Elite/Pro/Skilled/Avg/Beginner), animated WPM counter, confetti on 60+ WPM, share text or ASCII card

## Polished Tool Pages (same bar as home)
| Route | UX highlights | SEO |
|---|---|---|
| `/` | Speed test fills viewport | Elite cornerstone + FAQ/HowTo/WebApp/Breadcrumb |
| `/typing-lessons` | Lesson pills, scroll, LiveKeyboard + focusKeys, ResultCard | Expandable 3k+ guide |
| `/typing-practice` | Category pills, weak keys, LiveKeyboard, ResultCard | Expandable 3k+ guide |
| `/keyboard-guide` | Finger filters, home-row toggle, key stats, weak keys | Expandable 3k+ guide |
| `/typing-progress` | Stats, chart, heatmap, sessions, achievements | Expandable 3k+ guide |
| `/typing-game-falling-words` | 10 tiers, lives, high score, token UI | Expandable guide + FAQ/HowTo |
| `/typing-game-word-attack` | 8 rounds, combos, timers, token UI | Expandable guide + FAQ/HowTo |

Tool SEO pages: full-viewport tool above the fold → ExpandableSeoContent below → JSON-LD (WebApplication + FAQPage + HowTo).  
`/typing-speed-test` canonical → `/` (home owns the keyword).  
SEO bylines use **dynamic month + year only** (`Updated July 2026`) via `src/lib/content-dates.ts`.

## Settings (localStorage: `freetyper-settings`)
| Setting | Values | Default |
|---|---|---|
| fontSize | small / default / large | default |
| soundEnabled | boolean | false |
| keyboardLayout | qwerty | qwerty |
| showKeyboardHints | boolean | true |
| accentColor | gold / blue / green / red / purple / cyan | gold |

## Brand
- Accent: `#e2b714` · Dark theme: surface `#323234`, raised `#3a3a3c`, border `#4a4a4c`
- Logo: keyboard key + gold cursor · Wordmark: **Free** (white) + **Typer** (gold)

## SEO & Infra
- JSON-LD: Org + WebSite (layout); WebApplication + FAQPage + HowTo on home + polished tools; Breadcrumb on home
- Expandable SEO: E-E-A-T byline, in-article TOC, sources/citations, methodology; body always in DOM
- OG/Twitter cards · dynamic `opengraph-image.tsx` (1200×630) · sitemap (tools + blog) · robots · RSS · PWA
- GA4 `G-QC5509TVSF` · Google Search Console verified · AdSense still placeholder (pending ID)
- Legal: /about, /contact, /privacy, /terms, /disclaimer
- Deploy: GitHub → Coolify (Docker) → Hetzner · Repo: `github.com/ashiqur0202/FreeTyper`

## Done
- [x] Live keyboard visualizer (full layout, hint, flash, focusKeys)
- [x] Shareable result card (animated WPM, confetti, share, next/retry labels)
- [x] Animations (progress glow, result appear, shimmer, fade-up)
- [x] Backspace support · 3-line scrolling text
- [x] Home elite SEO (methodology, TOC, E-E-A-T, sources, benchmarks, FAQ/HowTo/Breadcrumb)
- [x] Lessons / practice / keyboard guide / progress — Monkeytype-clean UX + 3k+ SEO each
- [x] Falling Words + Word Attack — brand tokens, polished HUD/end screens, elite SEO
- [x] Shared SEO tool shell in `[slug]/page.tsx` · ExpandableSeoContent TOC hash expand
- [x] Dynamic OG image · GA4 · GSC verification · sitemap includes blog posts
- [x] Typing window layout (tool fills viewport; SEO below the fold)
- [x] Dynamic SEO “Updated Month Year” bylines (`content-dates.ts`)
- [x] Blog live: **9 / 25** posts (Pillar 1 complete; Pillar 2 partial)
- [x] Removed unused raw draft `.md` files (`blog/1–4.md`); content lives in `articles/*.ts` only

## Next Up
- [ ] Connect settings to tools (font size, sound, hints) — currently cosmetic, nothing reads `useSettings`
- [ ] Accent color picker changes CSS site-wide (wire sidebar swatches + inject `--color-accent`)
- [ ] AdSense publisher ID (replace placeholder)
- [ ] Keyboard layouts (DVORAK, Colemak)
- [ ] Multiplayer races · Leaderboards · School mode
- [ ] More games (Type Racer, Zombie Typing)
- [ ] Remaining blog posts (**16 left**): Pillar 2 #8, #11–12; full Pillars 3–5

## Blog Posts (25 — SEO Strategy)
- **Live: 9** · Planned: 25 · Remaining: 16
- Content Type: Evergreen
- Goal: SEO, Topical Authority, AdSense, Organic Traffic
- Target length: **3,000+ words** per article (current live posts meet this bar)
- Include FAQs, Internal Links to tools (`/`, lessons, practice, progress, games), Practical Examples
- Index: `src/data/blog/typing-skills.ts` · Bodies: `src/data/blog/articles/*.ts`

### Live posts (9)

| # | Slug | Title | Pillar | ~Words |
|---|------|--------|--------|--------|
| 1 | `how-to-type-faster` | How to Type Faster: 15 Proven Techniques… | 1 Speed | long |
| 2 | `good-typing-speed` | What Is a Good Typing Speed?… | 1 Speed | long |
| 3 | `average-typing-speed` | Average Typing Speed: Statistics… | 1 Speed | long |
| 4 | `how-many-words-per-minute` | How Many Words Per Minute Should You Type? | 1 Speed | long |
| 5 | `typing-speed-for-work` | What Is a Good Typing Speed for Work? | 1 Speed | long |
| 6 | `improve-typing-accuracy` | How to Improve Typing Accuracy From 90% to 99% | 1 Speed | ~3.0k |
| 7 | `free-typing-test` | Free Typing Test: Complete Guide to Measuring Your WPM | 2 Tests | ~3.3k |
| 8 | `one-minute-typing-test` | 1 Minute Typing Test: What Is a Good Score? | 2 Tests | ~3.1k |
| 9 | `3-minute-typing-test-vs-5-minute-typing-test` | 3 Min vs 5 Min Typing Test: Which Is More Accurate? | 2 Tests | ~4.4k |

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

## Priority: High · Status: **3/6 live**

7. [x] Free Typing Test: Complete Guide to Measuring Your WPM → `/blog/free-typing-test`
8. [ ] Typing Speed Test: Everything You Need to Know
9. [x] 1 Minute Typing Test: What Is a Good Score? → `/blog/one-minute-typing-test`
10. [x] 3 Minute Typing Test vs 5 Minute Typing Test: Which Is More Accurate? → `/blog/3-minute-typing-test-vs-5-minute-typing-test`
11. [ ] 5 Minute Typing Test: What Is a Good WPM?
12. [ ] Typing Accuracy Test: Why Accuracy Matters More Than Speed

---

# Pillar 3: Touch Typing & Learning

## Priority: High · Status: **0/5** (module empty)

13. [ ] Touch Typing Guide: Learn to Type Without Looking at the Keyboard
14. [ ] Touch Typing for Beginners: A Complete 30-Day Learning Plan
15. [ ] How to Learn Touch Typing as an Adult
16. [ ] The Science Behind Muscle Memory and Touch Typing
17. [ ] 10 Bad Typing Habits That Are Slowing You Down

---

# Pillar 4: Practice & Improvement

## Priority: Medium · Status: **0/5** (module empty)

18. [ ] Typing Practice: Daily Exercises to Build Speed and Muscle Memory
19. [ ] Best Free Typing Games to Improve Your Speed
20. [ ] How to Type Numbers and Symbols Without Looking
21. [ ] How to Pass a Data Entry Typing Test for Job Interviews
22. [ ] Typing Speed for Programmers: How Fast Should Coders Type?

---

# Pillar 5: Productivity & Hardware

## Priority: Medium · Status: **0/3** (module empty)

23. [ ] Best Keyboards for Fast Typing
24. [ ] Mechanical vs Membrane Keyboards: Which Is Better for Typing?
25. [ ] How to Fix Your Typing Posture and Avoid Wrist Pain
