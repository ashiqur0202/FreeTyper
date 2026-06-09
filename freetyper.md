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
src/components/seo/    → JsonLd, FAQ
src/config/ → tools.ts (7 tools), site.ts
src/data/   → tool-faqs/, tool-guides/, blog/
src/app/    → page (speed test), settings, blog, [slug] (tools), about, contact, privacy, terms, disclaimer
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
- JSON-LD schemas, OG/Twitter cards, sitemap, robots.txt, RSS, PWA manifest
- Google Analytics GA4 + AdSense placeholders · Legal: /about, /contact, /privacy, /terms, /disclaimer
- Deploy: GitHub → Coolify (Docker) → Hetzner · Repo: `github.com/ashiqur0202/FreeTyper`

## Done
- [x] Live keyboard visualizer (full layout, hint, flash)
- [x] Shareable result card (animated WPM, confetti, share)
- [x] Animations (progress glow, result appear, shimmer, fade-up)
- [x] Backspace support
- [x] 3-line scrolling text (monkeytype-style)

## Next Up
- [ ] Connect settings to tools (font size, sound, hints)
- [ ] Accent color picker changes CSS site-wide
- [ ] OG image (1200x630)
- [ ] Keyboard layouts (DVORAK, Colemak)
- [ ] Multiplayer races · Leaderboards · School mode
- [ ] More games (Type Racer, Zombie Typing)
