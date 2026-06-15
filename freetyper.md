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
├── LiveKeyboard.tsx           # Full QWERTY, hint pulse, correct/incorrect flash, flex-grow sizing
├── ResultCard.tsx             # Animated WPM, rank gradients, confetti, share text/card
├── TypingLessons.tsx, TypingPractice.tsx, KeyboardGuide.tsx
├── TypingProgress.tsx, KeyboardHeatmap.tsx, AchievementToast.tsx
└── FallingWordsGame.tsx, WordAttackGame.tsx
src/components/layout/ → Sidebar, SidebarProvider, RightSidebar, SettingsProvider, Footer
src/components/tools/  → ToolClient (dynamic imports), ToolPageContent (SEO wrapper)
src/components/blog/   → BlogContent (+ auto TOC), BlogCard
src/components/seo/    → JsonLd (Org/WebSite/WebApp/Breadcrumb/FAQ/HowTo generators), FAQ
src/components/content/ → ExpandableSeoContent (preview + Read more, SEO-safe — content always in DOM)
src/config/ → tools.ts (7 tools), site.ts
src/data/   → blog/, home/ (typing-speed-content)
src/app/    → page (speed test + SEO content), settings, blog, [slug] (tools), about, contact, privacy, terms, disclaimer
```

## Speed Test Features
- **3-line scrolling** (monkeytype-style) · **Backspace** to correct mistakes
- **Live keyboard** — full QWERTY, gold hint pulse on next key, green/red flash on type
- **Progress bar** with glow · Live WPM + accuracy
- **Focus mode** (fullscreen, Esc to exit) · **Command palette** (`/` key)
- **Result card** — rank gradient (Elite/Pro/Skilled/Avg/Beginner), animated WPM counter, confetti on 60+ WPM, share text or ASCII card

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
- JSON-LD (WebApplication + FAQPage + HowTo on home), OG/Twitter cards, sitemap, robots.txt, RSS, PWA manifest
- Google Analytics GA4 `G-QC5509TVSF` wired · Google Search Console verified · AdSense still placeholder (pending ID)
- Home `/` is the canonical speed-test page; `/typing-speed-test` canonical → `/`
- Legal: /about, /contact, /privacy, /terms, /disclaimer
- Deploy: GitHub → Coolify (Docker) → Hetzner · Repo: `github.com/ashiqur0202/FreeTyper`

## Done
- [x] Live keyboard visualizer (full layout, hint, flash)
- [x] Shareable result card (animated WPM, confetti, share)
- [x] Animations (progress glow, result appear, shimmer, fade-up)
- [x] Backspace support
- [x] 3-line scrolling text (monkeytype-style)
- [x] Home page SEO content (typing speed test) — preview + Read more, WebApplication/FAQPage/HowTo JSON-LD
- [x] howToSchema generator + home metadata + canonical (home owns the keyword)
- [x] Typing window layout (tool fills viewport; SEO content starts below the fold)
- [x] GA4 wired (`G-QC5509TVSF`) · Google Search Console verification meta

## Next Up
- [ ] Connect settings to tools (font size, sound, hints) — currently cosmetic, nothing reads `useSettings`
- [ ] Accent color picker changes CSS site-wide (wire sidebar swatches + inject `--color-accent`)
- [ ] AdSense publisher ID (replace placeholder)
- [ ] SEO polish: sources/citations, E-E-A-T (author + updated date), in-article TOC, OG image (1200x630), fix dead internal links to unbuilt blog posts
- [ ] Keyboard layouts (DVORAK, Colemak)
- [ ] Multiplayer races · Leaderboards · School mode
- [ ] More games (Type Racer, Zombie Typing)

## Blog Posts (25 — SEO Strategy)
- Total Articles: 25
- Content Type: Evergreen
- Goal: SEO, Topical Authority, AdSense, Organic Traffic
- Cornerstone Articles: 3,000–5,000+ words
- Supporting Articles: 1,500–2,500 words
- Include FAQs, Internal Links, Screenshots, and Practical Examples

---

# Pillar 1: Typing Speed

## Priority: High

1. How to Type Faster: 15 Proven Techniques to Increase Your WPM
2. What Is a Good Typing Speed? WPM Benchmarks by Age and Profession
3. Average Typing Speed: Statistics and How You Compare
4. How Many Words Per Minute Should You Type?
5. What Is a Good Typing Speed for Work?
6. How to Improve Typing Accuracy From 90% to 99%

---

# Pillar 2: Typing Tests

## Priority: High

7. Free Typing Test: Complete Guide to Measuring Your WPM
8. Typing Speed Test: Everything You Need to Know
9. 1 Minute Typing Test: What Is a Good Score?
10. 3 Minute Typing Test vs 5 Minute Typing Test: Which Is More Accurate?
11. 5 Minute Typing Test: What Is a Good WPM?
12. Typing Accuracy Test: Why Accuracy Matters More Than Speed

---

# Pillar 3: Touch Typing & Learning

## Priority: High

13. Touch Typing Guide: Learn to Type Without Looking at the Keyboard
14. Touch Typing for Beginners: A Complete 30-Day Learning Plan
15. How to Learn Touch Typing as an Adult
16. The Science Behind Muscle Memory and Touch Typing
17. 10 Bad Typing Habits That Are Slowing You Down

---

# Pillar 4: Practice & Improvement

## Priority: Medium

18. Typing Practice: Daily Exercises to Build Speed and Muscle Memory
19. Best Free Typing Games to Improve Your Speed
20. How to Type Numbers and Symbols Without Looking
21. How to Pass a Data Entry Typing Test for Job Interviews
22. Typing Speed for Programmers: How Fast Should Coders Type?

---

# Pillar 5: Productivity & Hardware

## Priority: Medium

23. Best Keyboards for Fast Typing
24. Mechanical vs Membrane Keyboards: Which Is Better for Typing?
25. How to Fix Your Typing Posture and Avoid Wrist Pain