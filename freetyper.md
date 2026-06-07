# FreeTyper.com — Project Blueprint

Standalone typing skills platform. No login, privacy-first, monetized via ads & affiliates.

---

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (dark theme, amber accent)
- **Icons:** lucide-react
- **Fonts:** Inter (next/font/google)
- **Deployment:** Docker (`output: 'standalone'`) on Hetzner CX23 via Coolify
- **DNS:** Cloudflare
- **No Vercel. No database. All data in localStorage.**

---

## Directory Structure

```
freetyper/
├── public/
│   ├── ads.txt                          # Google AdSense
│   ├── og-image.png                     # 1200x630 OG image
│   ├── robots.txt                       # Allow all, point to sitemap
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (Header + Footer + GA + AdSense)
│   │   ├── page.tsx                     # Homepage (typing hub — tool cards, hero, CTA)
│   │   ├── globals.css                  # Tailwind base + dark theme
│   │   ├── manifest.ts                  # PWA manifest
│   │   ├── not-found.tsx                # Creative 404 page
│   │   ├── sitemap.ts                   # Dynamic sitemap generation
│   │   ├── robots.ts                    # Dynamic robots.txt
│   │   ├── feed.xml/
│   │   │   └── route.ts                 # RSS 2.0 feed
│   │   ├── blog/
│   │   │   ├── page.tsx                 # Blog listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Individual blog post
│   │   ├── [slug]/
│   │   │   └── page.tsx                 # Dynamic route for all 7 tools
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── disclaimer/
│   │       └── page.tsx
│   ├── config/
│   │   ├── tools.ts                     # 7 tool definitions (typing-only)
│   │   └── site.ts                      # Site config (name, url, description, keywords)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Site header + mobile menu
│   │   │   └── Footer.tsx               # Site footer with links
│   │   ├── tools/
│   │   │   ├── ToolClient.tsx           # Maps tool.id → component
│   │   │   ├── ToolPageContent.tsx      # SEO wrapper (breadcrumbs, FAQs, related tools)
│   │   │   └── TypingSidebar.tsx        # Left sidebar navigation
│   │   ├── skills/
│   │   │   └── typing/
│   │   │       ├── types.ts             # TypeScript interfaces
│   │   │       ├── typingData.ts        # Lessons, practice text, finger maps
│   │   │       ├── gameData.ts          # Word pools, difficulty tiers, scoring
│   │   │       ├── useTypingEngine.ts   # Core typing logic hook
│   │   │       ├── useTypingProgress.ts # Progress/achievement tracking hook
│   │   │       ├── TypingLessons.tsx     # 7 progressive lessons
│   │   │       ├── TypingPractice.tsx    # Practice with themed content
│   │   │       ├── TypingSpeedTest.tsx   # Timed WPM tests
│   │   │       ├── KeyboardGuide.tsx     # Interactive keyboard reference
│   │   │       ├── TypingProgress.tsx    # Progress dashboard
│   │   │       ├── KeyboardHeatmap.tsx   # Error heatmap visualization
│   │   │       ├── AchievementToast.tsx  # Achievement notification toast
│   │   │       ├── FallingWordsGame.tsx  # Falling words arcade game
│   │   │       └── WordAttackGame.tsx    # Word attack combo game
│   │   ├── blog/
│   │   │   ├── BlogContent.tsx          # HTML renderer + auto TOC
│   │   │   └── BlogCard.tsx             # Blog post preview card
│   │   └── seo/
│   │       ├── JsonLd.tsx               # JSON-LD script injection
│   │       └── FAQ.tsx                  # FAQ accordion component
│   ├── data/
│   │   ├── tool-faqs/
│   │   │   └── typing.ts               # FAQ data for each tool
│   │   ├── tool-guides/
│   │   │   └── typing.ts               # ~2000 word guides for each tool
│   │   └── blog/
│   │       ├── typing-skills.ts         # Blog post metadata array (8 posts)
│   │       └── article-content.ts       # HTML content for blog posts
│   └── lib/
│       └── seo/
│           └── schema.ts               # JSON-LD schema generators
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── Dockerfile
├── CLAUDE.md
└── README.md
```

---

## Site Config (`src/config/site.ts`)

```typescript
export const siteConfig = {
  name: 'FreeTyper',
  title: 'FreeTyper — Free Typing Lessons, Speed Test & Practice',
  description: 'Free typing lessons, practice drills, speed tests, and typing games. Learn to type faster with visual guides. No signup required.',
  url: 'https://freetyper.com',
  author: 'FreeTyper',
  keywords: [
    'typing test',
    'typing speed test',
    'wpm test',
    'typing practice',
    'typing lessons',
    'touch typing',
    'free typing',
    'typing games',
    'keyboard practice',
    'typing speed',
    'words per minute',
    'typing tutor',
    'learn to type',
    'typing accuracy',
    'no login',
    'privacy-first',
  ],
  links: {
    github: 'https://github.com/ashiqur0202/freetyper',
  },
} as const
```

---

## Tool Definitions (`src/config/tools.ts`)

Define a `Tool` type and the 7 typing tools. All tools have `category: 'typing'`.

| id | name | seoTitle | icon | featured |
|---|---|---|---|---|
| `typing-lessons` | Typing Lessons | Typing Lessons: Learn Fast with Visual Finger Guides (Free) | GraduationCap | ✅ |
| `typing-practice` | Typing Practice | Typing Practice: Drills & Weak-Key Fix (Free) | PenTool | ✅ |
| `typing-speed-test` | Typing Speed Test | Typing Speed Test: Check Your WPM in 60 Seconds (Free) | Timer | ✅ |
| `keyboard-guide` | Keyboard Guide | Keyboard Guide: Color-Coded Finger Placement Map (Free) | Keyboard | ❌ |
| `typing-progress` | Typing Progress | Typing Progress Tracker: WPM History & Achievements (Free) | BarChart3 | ✅ |
| `typing-game-falling-words` | Falling Words Game | Falling Words Game: Type Fast & Beat Every Level (Free) | ArrowDown | ✅ |
| `typing-game-word-attack` | Word Attack Game | Word Attack Game: Combos, Scores & Timed Rounds (Free) | Crosshair | ✅ |

**SEO Title format:** `{Tool Name}: {Specific Benefit} (Free)`
**URLs:** `freetyper.com/typing-lessons`, `freetyper.com/typing-speed-test`, etc.

---

## Key Architecture Patterns

### 1. Routing
- `src/app/[slug]/page.tsx` — dynamic route serves all 7 tools
- `generateStaticParams()` builds all tool pages at compile time (SSG)
- `generateMetadata()` uses `tool.seoTitle` for `<title>` and `openGraph.title`

### 2. Component Mapping
`ToolClient.tsx` maps `tool.id` → component:
```
typing-lessons          → TypingLessons
typing-practice         → TypingPractice
typing-speed-test       → TypingSpeedTest
keyboard-guide          → KeyboardGuide
typing-progress         → TypingProgress
typing-game-falling-words → FallingWordsGame
typing-game-word-attack   → WordAttackGame
```
Each tool is a standalone `'use client'` component rendered inside `ToolPageContent` (SEO wrapper).

### 3. Typing Engine
- `useTypingEngine.ts` — core hook: real-time WPM/accuracy, input handling, error tracking, timed/untimed modes
- `useTypingProgress.ts` — localStorage-based progress: WPM history, accuracy trends, achievements (14 badges), streak tracking, per-key error stats
- Both hooks are **shared** across all tools and games

### 4. Typing Games
- `FallingWordsGame.tsx` — words fall from top, type before they hit bottom. 10 difficulty tiers. Lives system. `requestAnimationFrame` for 60fps.
- `WordAttackGame.tsx` — words appear with timers, type for combos and multipliers. 8 rounds.
- Both use `gameData.ts` for word pools (easy/medium/hard) and integrate with `useTypingProgress`
- Mobile: hidden `<input>` for keyboard support. High scores in localStorage.

### 5. Data Files
- `typingData.ts` — 7 progressive lessons, practice text collections, finger mapping, keyboard color scheme
- `gameData.ts` — word pools (60 easy / 90 medium / 300+ hard), game tier configs, scoring rules
- `types.ts` — interfaces: `TypingSession`, `Achievement`, `KeyStats`, `ProgressData`

### 6. SEO & Schema
JSON-LD schemas on every page:
- `Organization` — site identity
- `WebSite` + `SearchAction` — site search
- `WebApplication` — per tool page
- `HowTo` — tool guides
- `FAQPage` — tool FAQs
- `Article` + publisher — blog posts
- `BreadcrumbList` — navigation
- `CollectionPage` + `ItemList` — hub page

Plus: canonical URLs, OG images, Twitter cards, RSS 2.0 feed, PWA manifest, auto TOC on blog posts.

### 7. Blog
- 8 typing blog posts (category: `typing-skills`)
- Stored as HTML string constants in `src/data/blog/article-content.ts`
- Metadata in `src/data/blog/typing-skills.ts`
- Blog posts:
  1. How to Type Faster: Complete Guide
  2. Average Typing Speed by Age and Profession (2026)
  3. Touch Typing: The Ultimate Guide
  4. WPM Test: How to Measure and Improve
  5. Typing Games: Fun Ways to Improve Speed
  6. Ergonomic Typing: Prevent RSI
  7. Keyboard Shortcuts Everyone Should Know
  8. Best Typing Software and Tools for 2026

### 8. Layout
- Root layout: `Header` + `Footer` + Google Analytics + AdSense scripts
- Tool pages: `TypingSidebar` (left) + main content + optional right area
- Homepage: hero, quick stats, tool cards grid, intro content, getting started steps, comparison table, FAQ, CTA
- Mobile: responsive, no sidebar — tool navigation via header menu
- Dark theme default (`<html class="dark">`)
- Theme color: `#d97706` (amber-600) — typing accent

---

## Component Overview

### Typing Engine Components (build from scratch)
All typing components are custom-built for FreeTyper:

| Component | Purpose |
|---|---|
| `src/components/skills/typing/types.ts` | TypeScript interfaces: `TypingSession`, `Achievement`, `KeyStats`, `ProgressData` |
| `src/components/skills/typing/typingData.ts` | Progressive lessons, practice text (quotes, news, code), finger mapping, keyboard colors |
| `src/components/skills/typing/gameData.ts` | Word pools (easy/medium/hard), game tier configs, scoring rules |
| `src/components/skills/typing/useTypingEngine.ts` | Core typing hook: real-time WPM/accuracy, input handling, error tracking, timed/untimed modes |
| `src/components/skills/typing/useTypingProgress.ts` | localStorage-based progress: WPM history, accuracy trends, achievements (14 badges), streak tracking, per-key error stats |
| `src/components/skills/typing/TypingLessons.tsx` | 7 progressive lessons from home row to speed building |
| `src/components/skills/typing/TypingPractice.tsx` | Practice with themed content (quotes, news headlines, code snippets) |
| `src/components/skills/typing/TypingSpeedTest.tsx` | Timed WPM tests (1/3/5/10 min) with detailed results |
| `src/components/skills/typing/KeyboardGuide.tsx` | Interactive keyboard reference with color-coded finger mapping |
| `src/components/skills/typing/TypingProgress.tsx` | Progress dashboard with WPM history, accuracy trends, achievements |
| `src/components/skills/typing/KeyboardHeatmap.tsx` | Error heatmap visualization |
| `src/components/skills/typing/AchievementToast.tsx` | Achievement notification toast |
| `src/components/skills/typing/FallingWordsGame.tsx` | Falling words arcade game |
| `src/components/skills/typing/WordAttackGame.tsx` | Word attack combo game |

### Layout & Pages (build from scratch)

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout with FreeTyper branding, GA, AdSense |
| `src/app/page.tsx` | Homepage — speed test (instant start) + tool cards below |
| `src/app/[slug]/page.tsx` | Dynamic route for all 7 tools |
| `src/app/sitemap.ts` | Dynamic sitemap generation |
| `src/app/robots.ts` | Dynamic robots.txt |
| `src/app/manifest.ts` | PWA manifest |
| `src/app/feed.xml/route.ts` | RSS 2.0 feed |
| `src/app/blog/page.tsx` | Blog listing page |
| `src/app/blog/[slug]/page.tsx` | Individual blog post page |
| `src/app/not-found.tsx` | Creative 404 page |
| `src/components/layout/Header.tsx` | Header with navigation (Home, Tools, Games, Blog) + mobile menu |
| `src/components/layout/Footer.tsx` | Footer with typing-related links |
| `src/components/tools/ToolClient.tsx` | Maps tool.id → component |
| `src/components/tools/ToolPageContent.tsx` | SEO wrapper with breadcrumbs, FAQs, related tools |
| `src/components/tools/TypingSidebar.tsx` | Left sidebar navigation for tools |
| `src/components/seo/JsonLd.tsx` | JSON-LD script injection |
| `src/components/seo/FAQ.tsx` | FAQ accordion component |
| `src/components/blog/BlogContent.tsx` | HTML renderer with auto TOC and heading IDs |
| `src/components/blog/BlogCard.tsx` | Blog post preview card |
| `src/app/about/page.tsx` | About page |
| `src/app/contact/page.tsx` | Contact page |
| `src/app/privacy/page.tsx` | Privacy policy |
| `src/app/terms/page.tsx` | Terms of service |
| `src/app/disclaimer/page.tsx` | Disclaimer |

### Data Files (build from scratch)

| File | Purpose |
|---|---|
| `src/data/tool-faqs/typing.ts` | FAQ data for each tool |
| `src/data/tool-guides/typing.ts` | ~2000 word guides for each tool |
| `src/data/blog/typing-skills.ts` | Blog post metadata array |
| `src/data/blog/article-content.ts` | HTML content for blog posts |
| `src/lib/seo/schema.ts` | JSON-LD schema generators |

### Config Files

| File | Notes |
|---|---|
| `next.config.ts` | `output: 'standalone'`, `trailingSlash: false`, `images: { unoptimized: true }` |
| `package.json` | Same deps as FreeTyper needs (next, react, tailwind, lucide-react) |
| `tailwind.config.ts` | Dark theme, amber accent |
| `tsconfig.json` | Standard Next.js TypeScript config |
| `postcss.config.mjs` | Tailwind PostCSS plugin |
| `Dockerfile` | Docker build for Coolify deployment |

---

## Homepage Structure (`src/app/page.tsx`)

The homepage IS the speed test. Users land and immediately start typing. Below the fold: tool cards, content, FAQ.

### Above the Fold
1. **Instant Speed Test** — User lands and sees the test immediately. 1-minute mode default. Start typing = start test. Zero clicks needed.
2. **Results Panel** — After test: WPM, accuracy, percentile ("You type faster than X% of people"), share button

### Below the Fold
3. **Tool Cards** — 7 tools in a 2-column grid with icons
4. **Quick Stats** — Free Forever / No Login / Progressive / Track Progress
5. **Intro Content** — What is FreeTyper, why typing speed matters
6. **How to Get Started** — 5-step guide
7. **Typing Speed Comparison** — 40 WPM vs 80 WPM table
8. **Who Uses FreeTyper** — Students, Writers, Professionals, Beginners
9. **FAQ** — 4 common questions
10. **CTA** — "Ready to Type Faster?" with link to lessons

---

## SEO Checklist

- [x] `seoTitle` on every tool (keyword-first, high-CTR format)
- [x] `generateMetadata()` for dynamic titles, descriptions, OG, Twitter cards
- [x] JSON-LD schemas on every page (Organization, WebSite, WebApplication, HowTo, FAQPage, Article, BreadcrumbList)
- [x] Canonical URLs on every page
- [x] OG image (1200x630)
- [x] `sitemap.xml` with all pages
- [x] `robots.txt` pointing to sitemap
- [x] RSS 2.0 feed at `/feed.xml`
- [x] PWA manifest at `/manifest.webmanifest`
- [x] Auto TOC on blog posts from h2/h3 headings
- [x] Author bios on blog posts (E-E-A-T)
- [x] Breadcrumb navigation on every page
- [x] Legal pages: /about, /contact, /privacy, /terms, /disclaimer

---

## Analytics & Monetization

- **Google Analytics:** Create a new GA4 property for freetyper.com (do NOT reuse any other project's tracking ID)
- **Google AdSense:** Apply for freetyper.com as a new site (AdSense requires separate site approval per domain)
- **ads.txt:** `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` — fill in with your publisher ID once approved
- **Affiliate links:** keyboard recommendations, typing courses, ergonomic equipment (future)

---

## Deployment

1. Push to GitHub → Coolify auto-deploys via Docker → Cloudflare DNS points to Hetzner
2. Self-hosted on Hetzner via Coolify + Docker
3. Separate Coolify app/container for freetyper.com

---

## Content Guidelines

- All content must be genuine — no fabricated data or statistics
- Cite real, verifiable sources
- Typing benchmarks should use industry-standard ranges
- No fake testimonials or inflated usage stats

---

## Next Up (After MVP Launch)

- [ ] Submit sitemap to Google Search Console
- [ ] Add keyboard layout options (DVORAK, Colemak)
- [ ] Multiplayer typing races
- [ ] Leaderboards (daily/weekly/all-time)
- [ ] School/classroom mode
- [ ] More typing games (Type Racer, Zombie Typing)
- [ ] Writing skills category (future expansion)
