# FreeTyper — analytics log

Short notes on traffic and search data over time. Product rules and status are in `freetyper.md`. **Keep this file short: key numbers only, one compact entry per week. Full older text is in git history.**

## Rules
- Update it every analytics read, same session, and update `freetyper.md` section 0.
- Only numbers read from the tool that day; write the source and date range. No estimates.
- Each week: (1) update **Major insights**, (2) add a row to the **Trend table**, (3) add a short dated entry at the top of the **Log** (max about 15 lines), (4) condense the entry from two weeks ago. Raw exports go in `analytics/` (git-ignored). No logins or secrets.

## Weekly routine (ask Claude: "run the weekly analytics")
All read in the signed-in Chrome; nothing is changed. Same windows every time.
1. **GA4**, property `FreeTyper` (ID `541715664`; other properties in the account are other sites, check the name top left). Home: last 7 days. Reports snapshot: 28 days. Events report (`r=top-events`, 2 pages), Tech details (`r=user-technology-detail`); these URLs work typed into navigate. Also read device category (mobile share).
2. **Search Console** `https://freetyper.com/`: Performance 28 days (queries, pages); Pages (indexed count, "last update" date, indexed list, "Crawled" list); Sitemaps.
3. **Bing Webmaster** (dismiss the Copilot popup "Not now"): Search Performance (`searchperf`, `&activeTab=keywords|pages|devices|countries`), AI Performance (`aiperformance`), Sitemaps, Site Explorer (indexed / error / warning / excluded).
4. Watch each week: GA4 key events (still 0?), Google indexed count, Bing clicks vs GA bing sessions, mobile share, `www` vs bare host in Bing, Bing keywords for coding or exam terms.
- **Lags:** GA4 Home trails a little; Search Console data trails days and the Page indexing report can be a week old (note its "last update"); Bing Search and AI Performance showed only 5 days (12 to 16 Oct) on 10-18.

## Major insights (read this first)
Each has its first-seen date. If one stops being true, mark it "(superseded date: why)", do not delete. Suggestions are labelled.

| # | Seen | Insight | Status / action |
|---|---|---|---|
| 1 | 10-10 | **Search traffic is mostly Bing, Yahoo, DuckDuckGo (~82 % of sessions); Google ~1.6 %.** | Still true 10-18 (bing 343 sessions in 7 d, google 2). Bing is the main lever. |
| 2 | 10-10 | **Users stepped up mid-Sept (~8 to ~50 a day), flat since.** | Still flat 10-18 (~40 to 78/day). New users 302 vs 293. |
| 3 | 10-10 | **Visitors who start use it deeply (69 % engagement, 9m 53s) but only ~12 % complete a practice event** (142 of 1,163 users, 28 d). | Getting people to start is the gap. Suggestion, untested: better title/description on the top 3 pages. |
| 4 | 10-10 | **Audience is desktop (Edge ~70 %, Chrome ~25 %).** Mobile 2.5 % in GA4; Bing 0 mobile clicks. | Phone overflow bug may be part of it. |
| 5 | 10-18 | **Bing ranks us for "free typing lessons / practice" at positions 4 to 9** (189 clicks, 9.8K impressions, 12 to 16 Oct), nearly all to `/typing-lessons`, `/typing-practice`, `/keyboard-guide`. | CTR 1.2 to 3.4 % on bigger queries: snippet wording is the cheapest lever (suggestion). |
| 6 | 10-18 | **Bing cites us heavily in AI answers** (13.6K in 5 days, was 0) **but few visits follow** (GA4: 8 AI sessions in 7 d). | A citation is not a click. Watch AI sessions. |
| 7 | 10-18 | **Google indexes little:** 2 pages (`/`, `/typing-lessons`); `/typing-practice` crawled, not indexed; 17 discovered, never fetched. GSC: 7 clicks in 28 d, all for "freetyper". | Don't read trends into Google yet. Ashiqur: request indexing. Cause unknown. |
| 8 | 10-18 | **Site answers on two hosts:** `www.freetyper.com` returns 200; Bing lists most pages under `www`. Canonical points to the bare domain. | Open decision: 301 from `www` to bare domain. |
| 9 | 10-18 | **Bing still shows/cites two removed posts** (`typing-speed-test`, `how-many-words-per-minute`, both 404). Tiny. | Open decision: redirect or accept 404. |
| 10 | 10-10 | **GA4 key events still 0** after 2+ weeks. | Ashiqur: mark `test_complete`, `lesson_complete`, `practice_complete`, `game_complete` as key events. |
| 11 | 10-18 | **No coding or exam-typing keyword in Bing's top 25** (74 more unread). | Coding-track decision still waits. |

## Trend table (one row a week; windows differ where noted, read direction not exact change)
| Date | GA4 users 28 d | GA4 new / returning, 7 d | Key events | GSC clicks / impr, 28 d | Google indexed | Bing clicks / impr | Bing AI citations | Mobile |
|---|---|---|---|---|---|---|---|---|
| 10-10 | 920 (30 d) | 293 / 63 | 0 | 8 / 24 | 3 (stale) | no data yet | 0 | 2.5 % |
| 10-18 | 1,163 | 302 / 63 | 0 | 7 / 22 | 2 | 189 / 9.8K (12 to 16 Oct) | 13.6K (12 to 16 Oct) | not read |

## Log (newest first)

### 2026-10-18 — weekly check (GA4 7 d = 10-11 to 10-17, 28 d = 09-20 to 10-17; GSC 28 d to 10-16; Bing 12 to 16 Oct)
- **GA4 7 d:** sessions bing 343, direct 80, yahoo 27, in.search.yahoo 15, chatgpt 8, duckduckgo 7, google 2. Countries: US 98, India 73, Singapore 36, Canada 17, UK 12, Philippines 10, Pakistan 10 (US passed India; Singapore up from 11). Views: Lessons 379, Practice 295, Speed test 224, Keyboard guide 129, Progress 78, Falling Words 39, Word Attack 31.
- **GA4 28 d:** 1,163 users, 13,107 events, engagement rate 69.5 %. Edge 811 users (11m 19s), Chrome 292 (7m 17s), Safari 29 (1m 33s). Bounce: Lessons 21.9 %, Practice 17.4 %, Speed test 15.5 %.
- **Events, 28 d (events / users):** lesson_attempt 1,208 / 131 · practice_complete 1,187 / 142 · lesson_complete 784 / 94 · test_complete 453 / 94 · game_complete 189 / 37 · setting_change 138 / 24 · share_result 6 / 2 · lesson_skip 1. Shares overlap.
- **GSC:** 7 clicks, 22 impressions, position 4.5; only queries "freetyper" (6 clicks / 13 impr) and "free ty". Indexed list: `/` (crawled 09-18), `/typing-lessons` (10-05). Crawled-not-indexed (4): `/typing-practice` (10-12), `/typing-game-word-attack`, `/keyboard-guide`, `/typing-game-falling-words` (all 09-06). Sitemap read 10-14, 23 URLs. The 13 old 404 posts no longer count.
- **Bing search:** 189 clicks / 9.8K impressions (46, 39, 31, 33, 40 clicks a day); desktop 189 clicks, mobile 148 impressions / 0 clicks. Pages: `/typing-lessons` 5.7K impr / 99 clicks, `/typing-practice` 2.9K / 68, `/keyboard-guide` 788 / 18, `/` 200 / 2. Top queries (impr / clicks / pos): free typing practice 898 / 23 / 7.0 · typing lessons 697 / 9 / 8.0 · free typing lessons 353 / 12 / 4.9 · free online typing lessons 325 / 4 / 4.1. Countries: US 66 clicks, Rest of World 105, Canada 11. 99 keywords, top 25 read.
- **Bing AI:** 13.6K citations; pages `/` 6.2K, `/typing-lessons` 4.6K, `/typing-practice` 1.6K, `/keyboard-guide` 1.0K; 256 grounding queries (top: free typing lessons for beginners 896, free typing lessons 667). Bing says it is a sample.
- **Bing sitemaps:** bare host submitted 10-08, crawled 10-15, 23 URLs; `www` host crawled 10-12, 23 URLs; 0 errors. **Site Explorer:** indexed 46, error 0, warning 7, excluded 1 (not opened). 6-month totals 806 clicks / 53.5K impressions: does not match the 5-day figure, not compared.
- **Live check (curl):** `www` returns 200 with canonical to the bare domain; `http` redirects to `https`; removed slugs 404.
- **Changes since 10-10:** no site release since 10-06; docs only.
- **Next check (10-25):** Bing range beyond 5 days? clicks near 30 to 45 a day? `/typing-practice` back in Google's index? key events registered? mobile share; open the 7 Bing warnings and 1 excluded URL; read the other Bing keywords.

### 2026-10-10 — first week (condensed from three entries: first read, deep dive, trend check)
- **GA4 30 d:** 920 users (+543 % vs previous period), 8.3K events, 0 key events. 7 d: 293 new, 63 returning. Sessions: Organic 392, Direct 51, AI 8. Countries 7 d: India 93, US 74, Philippines 20, Canada 19.
- **Engagement (09-12 to 10-09):** 909 users, engagement rate 68.6 %, 6m 41s per user. Bounce: Lessons 23.3 %, Practice 17.4 %, Speed test 17.5 %, Keyboard guide 13.7 %, Progress 3.0 %. Desktop 97.3 %, mobile 2.5 % (41.7 % engagement), Edge 70.5 %, Chrome 24.3 %.
- **Events 4 to 9 Oct (281 users):** practice_complete 69 users, lesson_attempt 56, test_complete 41, lesson_complete 39, game_complete 20, setting_change 12.
- **Trend:** about 7 to 8 users a day to 13 Sep, step up 14 to 24 Sep to about 50, plateau at 40 to 68 after. Cause unknown (GA flags 22 to 23 Sep spike; Ashburn data-centre traffic possible but unchecked).
- **GSC (09-09 to 10-06):** 8 clicks, 24 impressions, position 18.5; queries "freetyper" 6 clicks, plus "touch typing diagram", "keyboard finger chart" (0 clicks, positions 56 to 73). Indexing report (stale, 10-04): 3 indexed, 35 not; 13 of the not-indexed were old posts returning 404 on purpose.
- **Bing:** verified 10-08, sitemap 23 URLs OK, search data "not ready", AI citations 0.
- **Site check:** each page had a unique title (41 to 65 characters), description, canonical, one H1, JSON-LD, about 1,700 to 2,600 words.

## Open questions
- Why does Google crawl but not index `/keyboard-guide`, the two game pages and now `/typing-practice`? (No reason given; URL Inspection may add detail.)
- Do the 13 removed blog slugs need redirects, or is 404 fine? (Content decision.)
- How do Bing's clicks compare with GA's bing sessions? (Same order of size on 10-18, not reconciled.)
- What caused the mid-September step up?
