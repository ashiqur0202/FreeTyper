# FreeTyper — analytics log

Short notes on traffic and search data over time. Product rules and status are in `freetyper.md`. **Keep this file short: key numbers only, one compact entry per week. Full older text is in git history.**

## Rules
- Update it every analytics read, same session, and update `freetyper.md` section 0.
- Only numbers read from the tool that day; write the source and date range. No estimates.
- Each week: (1) update **Major insights**, (2) add a row to the **Trend table**, (2b) **revise the Growth plan** from the new insights, (3) add a short dated entry at the top of the **Log** (max about 15 lines), (4) condense the entry from two weeks ago. Raw exports go in `analytics/` (git-ignored). No logins or secrets.

## Friday routine (every Friday; ask Claude: "run the Friday analytics")
All read in the signed-in Chrome; nothing is changed. Same windows every time.
1. **GA4**, property `FreeTyper` (ID `541715664`; other properties in the account are other sites, check the name top left). Home: last 7 days. Reports snapshot: 28 days. Events report (`r=top-events`, 2 pages), Tech details (`r=user-technology-detail`); these URLs work typed into navigate. Also read device category (mobile share).
2. **Search Console** `https://freetyper.com/`: Performance 28 days (queries, pages); Pages (indexed count, "last update" date, indexed list, "Crawled" list); Sitemaps.
3. **Bing Webmaster** (dismiss the Copilot popup "Not now"): Search Performance (`searchperf`, `&activeTab=keywords|pages|devices|countries`), AI Performance (`aiperformance`), Sitemaps, Site Explorer (indexed / error / warning / excluded).
4. Watch each week: GA4 key events (still 0?), Google indexed count, Bing clicks vs GA bing sessions, mobile share, `www` vs bare host in Bing, Bing keywords for coding or exam terms.
5. **Growth verdict (our method, a suggestion):** compare three angles and say plainly whether the site is growing. Drop the last 1 to 2 days of Bing and Search Console (they lag).
   - **Daily:** the per-day series (Bing clicks and impressions, GA4 users per day). Note the level, a 7-day average and any spike. Never judge from one day.
   - **Weekly:** the last 7 full days against the 7 before: GA4 new and returning users, Bing clicks and impressions, Google impressions.
   - **Monthly:** 28 or 30 days against the previous period, plus the trend table: GA4 users, Google indexed count, Bing indexed count, key events, mobile share.
   - **Verdict:** growing if at least two of GA4 new users, Bing clicks and Google impressions are up on the previous equal period and none is sharply down; flat if within about 5 %; falling otherwise. Name the numbers that are too small to trust (Google clicks are in the teens). Add a row to the Growth scorecard below.
- **Lags:** GA4 Home trails a little; Search Console data trails days and the Page indexing report can be a week old (note its "last update"); Bing Search and AI Performance showed only 5 days (12 to 16 Oct) on 10-18.

## Major insights (read this first)
Each has its first-seen date. If one stops being true, mark it "(superseded date: why)", do not delete. Suggestions are labelled.

| # | Seen | Insight | Status / action |
|---|---|---|---|
| 1 | 10-10 | **Search traffic is mostly Bing, Yahoo, DuckDuckGo (~82 % of sessions); Google ~1.6 %.** | Still true 10-30 (7 d: bing 384, yahoo 38, google 16; chatgpt.com 61). Bing is the main lever. |
| 2 | 10-10 | **Users stepped up mid-Sept (~8 to ~50 a day), flat since.** | Still flat 10-18 (~40 to 78/day). New users 302 vs 293. 10-30: 7 d new users 378 (+18.5 % vs the previous 7 d), returning 107; Bing clicks 31 to 61 a day, no clear trend. |
| 3 | 10-10 | **Visitors who start use it deeply (69 % engagement, 9m 53s) but only ~12 % complete a practice event** (142 of 1,163 users, 28 d). | Getting people to start is the gap. Retitle live since 10-18. 10-30: practice_complete 231 of 1,289 users (17.8 %), test_complete 193 (14.9 %); up from ~12 %, cause not known (windows and releases differ). |
| 4 | 10-10 | **Audience is desktop (Edge ~70 %, Chrome ~25 %).** Mobile 2.5 % in GA4; Bing 0 mobile clicks. | Phone overflow bug may be part of it. 10-30: mobile 61 of 1,289 users (4.7 %, engagement 58.6 %); Bing mobile 2 clicks of 444 impressions. |
| 5 | 10-18 | **Bing ranks us for "free typing lessons / practice" at positions 4 to 9** (189 clicks, 9.8K impressions, 12 to 16 Oct), nearly all to `/typing-lessons`, `/typing-practice`, `/keyboard-guide`. | CTR 1.2 to 3.4 % on bigger queries: snippet wording is the cheapest lever (suggestion). 10-30 preliminary: Bing CTR flat at about 2.07 % before and 2.06 % after the retitle (see log). |
| 6 | 10-18 | **Bing cites us heavily in AI answers** (13.6K in 5 days, was 0) **but few visits follow** (GA4: 8 AI sessions in 7 d). | A citation is not a click. Watch AI sessions. 10-30: 39.4K citations in 17 d; GA4 sessions from chatgpt.com 61 in 7 d (+154 %), so some AI answers now lead to visits. |
| 7 | 10-18 | **Google indexes little:** 2 pages (`/`, `/typing-lessons`); `/typing-practice` crawled, not indexed; 17 discovered, never fetched. GSC: 7 clicks in 28 d, all for "freetyper". | Don't read trends into Google yet. Indexing requested for 5 pages on 10-18. 10-30 (read by Claude): 9 indexed, 14 not (1 crawled, 13 discovered); 16 clicks in 28 d, 15 for the brand. Cause of the 14 unknown. |
| 8 | 10-18 | **Site answers on two hosts:** `www.freetyper.com` returns 200; Bing lists most pages under `www`. Canonical points to the bare domain. | Open decision: 301 from `www` to bare domain. 10-30: Bing's pages report still lists `www` URLs. |
| 9 | 10-18 | **Bing still shows/cites two removed posts** (`typing-speed-test`, `how-many-words-per-minute`, both 404). Tiny. | Open decision: redirect or accept 404. 10-30: `how-many-words-per-minute` still listed (10 impressions). |
| 10 | 10-10 | **GA4 key events were 0** for 2+ weeks, so conversions could not be measured. | Fixed 2026-10-18: 4 events marked (not retroactive). **Confirmed 10-30: 2,497 key events in 28 d (Oct 2 to 29).** |
| 11 | 10-18 | **No coding or exam-typing keyword in Bing's top 25** (74 more unread). | Coding-track decision still waits. 10-30: still none in the top 25 of 240 keywords. |
| 12 | 10-30 | **ChatGPT sends visits:** `chatgpt.com / ai-assistant` 61 sessions in 7 d (+154 %), 44 first-time users; 8 a week on 10-18. | Watch weekly. Clear definitions and sourced numbers in guides may help (suggestion). |

## Trend table (one row a week; windows differ where noted, read direction not exact change)
| Date | GA4 users 28 d | GA4 new / returning, 7 d | Key events | GSC clicks / impr, 28 d | Google indexed | Bing clicks / impr | Bing AI citations | Mobile |
|---|---|---|---|---|---|---|---|---|
| 10-10 | 920 (30 d) | 293 / 63 | 0 | 8 / 24 | 3 (stale) | no data yet | 0 | 2.5 % |
| 10-18 | 1,163 | 302 / 63 | 0 | 7 / 22 | 2 | 189 / 9.8K (12 to 16 Oct) | 13.6K (12 to 16 Oct) | not read |
| 10-30 | 1,289 (Oct 2 to 29) | 378 / 107 | 2,497 | 16 / 38 (1 to 28 Oct) | 9 | 674 / 32.7K (12 to 28 Oct) | 39.4K (12 to 28 Oct) | 4.7 % |

## Growth scorecard (one row each Friday: is the site growing, from three angles)
| Date | Daily (Bing) | Weekly (7 d vs previous 7 d) | Monthly (28 to 30 d) | Verdict |
|---|---|---|---|---|
| 10-30 | 31 to 61 clicks a day, average 39.6 (12 to 28 Oct). About 37 a day before the retitle, 41.5 after. | Bing clicks 259 to 274 (+5.8 %; 12 to 18 vs 19 to 25 Oct), impressions 12.5K to 13.4K (+7 %). GA4 new users 378 (+18.5 %), returning 107 (+3.9 %). | GA4 users 1,163 (10-17) to 1,289 (10-29), +10.8 %. Google indexed 2 to 9. Bing indexed 46 to 44. Key events 0 to 2,497. AI citations about 2.7K a day to 2.3K (flat). GA4's own 30 d card says +111.6 %, but its previous period holds the early-September low, so it flatters. | **Growing slowly, from a low base.** Up: GA4 new users, Bing clicks and impressions (+6 to 7 % a week), key events, Google indexed pages. Flat: Bing clicks a day, CTR 2.06 %, AI citations a day. Weak: Google clicks (16 in 28 d, too few to trust), mobile (4.7 %), returning users (107 a week), shares (6 in 28 d). |

## Growth plan (revise every weekly cycle; max 8 open items)
Each item names the insight it answers (#) and the number that tells us if it worked. Owner: **[A]** Ashiqur, **[C]** Claude in code. Order = priority. Weekly: tick what is done, drop what the data disproves, add what the new insights call for, then re-sort. Moving an item to "Done / dropped" keeps the reason in one line.

| Pri | Owner | Action | Why (#) | Success signal |
|---|---|---|---|---|
| 1 | done | **Done 2026-10-18:** 4 key events marked, 7 custom dimensions (`text_mode`, `category`, `game`, `lesson`, `passed`, `setting`, `value`) and 7 custom metrics (`wpm`, `accuracy`, `duration_s`, `score`, `level`, `lesson_number`, `attempt`; unit Standard). Not retroactive: reports by these fields fill from 10-19 on. Next: read key events and the lesson pass rate next week. | 10 | Key events > 0 from 10-19 on; `lesson_attempt` pass rate by `lesson_number`. |
| 2 | C | **LIVE since 2026-10-18 (master `0441c19`, confirmed on the live site).** New titles/descriptions for `/typing-lessons`, `/typing-practice`, `/keyboard-guide` use Bing's query words; dates bumped. Do not touch them until the CTR read (about 11-01 to 11-08). Next: re-request indexing for these 3 pages (quota used up on 10-18), then watch Bing CTR. | 3, 5 | Bing CTR on those pages (about 1.7 to 2.3 % on 10-18); GA4 share of users who complete an event (about 12 %). Needs 2+ weeks to judge. Preliminary 10-30 (log): CTR flat, impressions and clicks up about 12 %; the formal read stays 11-01 to 11-08. |
| 3 | A + C | **Indexing requested 2026-10-18** for `/typing-practice`, `/keyboard-guide`, `/typing-progress`, `/typing-game-falling-words`, `/typing-game-word-attack`, `/blog`, `/blog/how-to-type-faster`, `/blog/good-typing-speed` (Google: added to the priority crawl queue; stopped at about 10 to respect the daily limit). Still to request (a few a day): `/blog/improve-typing-accuracy` and the other 7 posts, `/about`, legal pages. Re-request the 3 retitled pages after the SEO change is live. **10-30:** Google shows 9 indexed; the new post `/blog/how-long-to-practice-typing-each-day` also needs a request. | 7 | Google indexed count (2 on 10-18); Page indexing report "last update" date. |
| 4 | C | **Wait: do not start before the retitle read (about 11-01 to 11-08).** Then, as its own change: a permanent `www` to bare-domain redirect in `next.config.ts` (DNS is "DNS only", so a Cloudflare rule would not apply), and redirect the two removed posts to the nearest live post. Reason for waiting: two changes at once would blur whether the retitle moved Bing CTR; Bing may also dip for days while it re-associates the host. Verify after deploy that Coolify forwards the original host (curl with the `www` host). | 8, 9 | Bing pages listed under one host; no more hits on the two 404 slugs; Bing CTR read first, unaffected. |
| 5 | A | Bing: **IndexNow done 10-30** (key file live, 2 URLs sent, HTTP 202). Still: open the 10 warnings and 2 excluded URLs in Site Explorer; read keywords beyond the top 25 of 240. | 1, 11 | Warnings cleared; any coding or exam keyword found. |
| 6 | C | Share the result as an image (plan in `freetyper.md` §8). | 2, 3 | `share_result` events (6 in 28 d on 10-18); returning users (63 a week). |
| 7 | C | Fix the phone overflow (`LiveKeyboard` wider than a 390 px screen). | 4 | Mobile share of users and Bing mobile clicks (0 on 10-16). Low priority until mobile shows up. |
| 8 | A | One sourced blog post a week (post 11 live 10-30); ask for a few real links (Reddit r/typing, Show HN). | 1, 7 | Pages indexed; sessions from non-Bing sources. |

**Waiting on data (do not start):** coding tracks (need a Bing coding keyword, insight 11); exam-typing pages (same); duration preset pages (only once pages are being indexed).
**Done / dropped:** 2026-10-18: GA4 key events, custom dimensions and metrics set; 8 Search Console indexing requests sent. Not changed: GA4 `purchase` placeholder was already in the key-events list.

## Log (newest first)

### 2026-10-30 — weekly check (GA4 28 d = Oct 2 to 29, 7 d = Oct 23 to 29; GSC 28 d to 10-28; Bing 12 to 28 Oct; all read by Claude)
- **GA4 28 d:** 1,289 users (1,265 new), 19,766 events, engagement rate 71.65 %, 14m 44s per user. Home card 30 d: 1.4K users (+111.6 % vs previous 30 d), 5.7K views. **7 d:** 378 new (+18.5 %), 107 returning (+3.9 %). Sessions: bing 384, direct 92, chatgpt.com 61 (+154 %), yahoo 38, ca.search.yahoo referral 19, google 16, ecosia 11.
- **Key events now count: 2,497 in 28 d** (insight 10 fixed). Events (events / users): practice_complete 2,623 / 231 · lesson_attempt 2,607 / 319 · lesson_complete 1,614 / 232 · test_complete 966 / 193 · game_round_complete 405 / 56 · game_complete 329 / 72 · setting_change 303 / 42 · share_result 6 / 2 · lesson_skip 3 / 3. Google flagged a spike of 246 key events on 10-23 (cause unknown).
- **Views 28 d:** lessons 1,764 · practice 1,261 · speed test 985 · keyboard guide 542 · progress 280 · falling words 146 · word attack 145 · settings 109 · blog 71 (51 users) · how-to-type-faster 22. Engagement time per user: lessons 12m 37s, practice 12m 42s, speed test 3m 42s, keyboard guide 51s.
- **Tech:** desktop 1,224 users (94.96 %), mobile 61 (4.73 %, engagement 58.57 %), tablet 4. Edge 825 (64 %), Chrome 385, Safari 43, Firefox 20.
- **GSC 1 to 28 Oct:** 16 clicks, 38 impressions, position 4.5; 15 of the clicks for "freetyper". Pages: `/` 15 / 35, `/blog` 1 / 6, all others 0 clicks. **Page indexing: 9 indexed, 14 not (1 crawled, 13 discovered);** the 9 were not listed in what I could read. Sitemap last read 10-24, 23 URLs, Success.
- **Bing 12 to 28 Oct:** 674 clicks, 32.7K impressions, CTR 2.06 %; 31 to 61 clicks a day (61 on 10-27). 240 keywords, all generic; top (impr / clicks / pos): typing lessons 5.1K / 33 / 7.4 · free typing practice 1.7K / 44 / 7.4 · free typing lessons 1.4K / 33 / 4.4. Still no coding, exam or data-entry keyword in the top 25. Best CTR: typing for beginners free 9.1 % (pos 3.7), free typing lessons for adults 5.5 % (pos 2.0).
- **Bing pages (under `www`):** typing-lessons 22.8K impr / 467 clicks / 2.05 % · typing-practice 6.6K / 146 / 2.20 % · keyboard-guide 2.3K / 46 / 2.01 % · home 496 / 10. Desktop 672 clicks; mobile 444 impr / 2 clicks. Countries (clicks): Rest of World 319, US 293, Canada 35, UK 16.
- **Retitle, preliminary (live from the evening of 10-18; formal read still 11-01 to 11-08):** my arithmetic on rounded daily figures: 12 to 18 Oct about 37 clicks and 1.79K impressions a day; 19 to 28 Oct about 41.5 and 2.01K; CTR about 2.07 % before and 2.06 % after. Clicks and impressions rose about 12 %, CTR did not move.
- **Bing AI:** 39.4K citations (17 d), about 8 cited pages a day, 482 grounding queries (top: free typing lessons 2.9K, free typing lessons for beginners 2.2K, free typing class 810). **Sitemaps:** 23 URLs, last crawl 10-27, 0 errors. **Site Explorer:** indexed 44, error 0, warning 10, excluded 2 (was 46 / 0 / 7 / 1); the warnings were not opened. The IndexNow page shows no stats.
- **Changes since 10-28:** released 10-30: favicon `removeChild` fix, IndexNow key file + script (first 2 URLs sent, HTTP 202), blog post 11 (practice schedule). All numbers above are from before these; the sitemap Google and Bing read still has 23 URLs.
- **Next check (11-06):** formal retitle CTR read; Google indexed count (9) and the new post; do chatgpt.com sessions keep growing; Bing indexed count (44) after IndexNow; AdSense result (not read by Claude).

### 2026-10-28 — Bing keywords only (not a full weekly check; Bing Search Performance, 12 to 25 Oct)
- **Bing:** 533 clicks, 25.9K impressions, CTR 2.06 %; 31 to 49 clicks a day, no upward trend. 209 keywords; read the top 75 (the rest have 5 impressions or fewer).
- **Every top-75 keyword is a generic "free typing lessons / practice / for beginners" phrase.** Biggest: typing lessons 3.6K impr / 24 clicks / pos 7.6 · free typing practice 1.6K / 39 / 7.4 · free typing lessons 1.1K / 28 / 4.6 · typing lessons free 734 / 18 / 4.2 · free online typing lessons 658 / 21 / 3.8. **No coding, data-entry, exam, job, medical or legal keyword; no language-typing keyword (e.g. Bangla); no "1/5/10 minute test" keyword.** This settles insight 11 for now.
- **Finger-chart signals:** "typewriter keyboard finger layout" 11 impr / 10 clicks, "keyboard practice chart" 22 impr (pos 3.1), "which fingers belong to home key row" 16 impr, "free printable typing lessons" 6 impr. Small, but they convert.
- **Reported by Ashiqur, not read by Claude:** Google has indexed 9 pages (2 on 10-18); AdSense re-applied 2026-10-26 09:36 with site ownership all green.
- Weak CTR on high-impression phrases: typing lessons 0.67 %, typing practice free 1.10 %, free typing practice online 0.91 %.

### 2026-10-18 — weekly check (condensed 10-30; GA4 7 d = 10-11 to 10-17; GSC 28 d to 10-16; Bing 12 to 16 Oct)
- **GA4:** 28 d 1,163 users, 13,107 events, engagement 69.5 %. 7 d sessions: bing 343, direct 80, yahoo 27, chatgpt 8, duckduckgo 7, google 2. Events (28 d, events / users): lesson_attempt 1,208 / 131 · practice_complete 1,187 / 142 · lesson_complete 784 / 94 · test_complete 453 / 94 · game_complete 189 / 37 · setting_change 138 / 24 · share_result 6 / 2. Edge 811 users, Chrome 292, Safari 29.
- **GSC:** 7 clicks, 22 impressions, only "freetyper" / "free ty"; indexed `/` and `/typing-lessons`; `/typing-practice` crawled, not indexed; sitemap 23 URLs.
- **Bing 12 to 16 Oct:** 189 clicks / 9.8K impressions, desktop only; `/typing-lessons` 99 clicks, `/typing-practice` 68, `/keyboard-guide` 18; AI citations 13.6K (256 grounding queries); Site Explorer indexed 46, error 0, warning 7, excluded 1; sitemap 23 URLs on both hosts, 0 errors.
- **URL Inspection:** `/blog/how-to-type-faster` unknown to Google; `/blog`, `/blog/good-typing-speed`, `/typing-progress` discovered not indexed; practice, guide and game pages crawled not indexed. Live check: `www` returns 200 with canonical to the bare domain; removed slugs 404.
- **Done after the reads:** key events marked, 7 dimensions + 7 metrics added, 8 indexing requests; retitle live about 22:35 local on 10-18.

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
