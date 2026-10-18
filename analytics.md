# FreeTyper — analytics log

Running log of traffic and search data. `freetyper.md` holds the product rules and status; this file holds the numbers over time.

## How to use this file
- **Keep it current.** Whenever any analytics, Search Console or Bing data is read, add an entry the same session, and update the status in `freetyper.md` (section 0 and 1). Both files are how a new session learns where the project stands.
- Add a new dated entry at the **top** of the log. Never edit old entries, except to fix a typo.
- Record only numbers that were read from the tool on that date. Write the source and the date range. No estimates, no rounding up.
- Use the same fields every time so entries can be compared.
- Raw exports go in `analytics/` (git-ignored). Do not commit them.
- Put what shipped between entries under "Changes since last entry", so a jump in a number can be tied to a release or an indexing request.
- No logins, no secrets. The GA4 Measurement ID is public in the page source and is fine here.

## Sources
| Tool | What it gives us | Notes |
|---|---|---|
| GA4, property "FreeTyper", `G-QC5509TVSF` | users, sessions, channels, pages, countries, events | Home cards lag a little. Key events are not set up yet. |
| Google Search Console, `https://freetyper.com/` | Google clicks, impressions, queries, indexing | Very low volume so far. |
| Bing Webmaster Tools, `https://freetyper.com/` | Bing clicks, impressions, queries, sitemaps, AI citations | Verified 2026-10-08. Data starts about 48 h after verification. |

Other properties exist under the same Google account (a different site and a "Finlytics" site). They are not FreeTyper. Check the property name before reading numbers.

## Notes for future sessions
- **Right GA4 property:** the FreeTyper one has property ID `541715664` (URL `analytics.google.com/analytics/web/#/a371062405p541715664/`). On 2026-10-10 the other two properties in the account were "Free Creator Tools" (`p533930399`) and "Finlytics" (`p513382477`). They look similar and contain other sites' numbers. Confirm the name "FreeTyper" at the top left before copying anything.
- **Access:** all three tools were read through the signed-in Chrome browser, not an API. A session needs the Chrome extension connected. Nothing was changed in any tool.
- **Lags:** GA4 Home cards trail real time a little. Search Console performance data trails by a few days, and its Page indexing report can be older still (it was 6 days old on 2026-10-10). Always note the "last update" date shown.
- **Reading tips:** Search Console's drill-down pages show 10 rows at a time, so scroll and page through the list before counting. The page-text reader returned the previous page on those drill-downs; screenshots worked.
- **Comparing entries:** use the same windows every time (GA4 last 7 and 30 days, Search Console 28 days) and the same fields, as in the first entry. The first entry's percentage changes are GA's own "vs previous period" figures, not ours.
- **Baseline to beat (2026-10-10):** GA4 920 active users in 30 days; Search Console 8 clicks and 24 impressions in 28 days, 3 pages indexed (stale report); Bing sitemap 23 URLs and 0 AI citations; key events 0.
- **Why Bing matters:** Bing, Yahoo and DuckDuckGo are the main sources, so Bing Webmaster data is the most useful search signal. Google's numbers are tiny so far, and a few clicks swing the percentages a lot. Do not read trends into Search Console until the counts are larger.
- **Still unknown:** why 3 pages were crawled but not indexed (the 3 indexed pages are `/`, `/typing-lessons`, `/typing-practice`, as reported by Ashiqur), and how Bing's own click data compares with GA's Bing sessions. These are in the open questions below.

## Weekly routine (run once a week, same day, ask Claude: "run the weekly analytics")
All three tools are read in the signed-in Chrome, nothing is changed. Take about 20 minutes. Use these exact windows so entries compare.
1. **GA4** (property `FreeTyper`, check the name top left). Home: last 7 days cards (new/returning users, countries, pages, channels, first-user source, sessions by source). Reports snapshot: last 28 days (users, engagement time, top pages, sources). Events report (`r=top-events`, both pages of the table): event count and users per event, key events. Tech details (`r=user-technology-detail`): browser, engagement rate. Direct URLs to the Events and Tech reports work when typed into the navigate call; Home deep links do not always switch page, so use the left Reports icon.
2. **Search Console**: Performance 28 days (clicks, impressions, CTR, position, queries, pages); Pages (indexed count, "Last update" date, open "View data about indexed pages" and the "Crawled" list); Sitemaps (last read, discovered).
3. **Bing Webmaster** (dismiss the Copilot popup with "Not now"): Search Performance (set 7 D / 30 D; keywords, pages, device, country via `&activeTab=` `keywords|pages|devices|countries`), AI Performance (`aiperformance`, grounding queries and pages), Sitemaps, Site Explorer (crawl counts: indexed, error, warning, excluded).
4. Write a dated entry at the **top** of the log with the same fields as the 2026-10-18 entry, add "Changes since last entry" (releases, indexing requests), update `freetyper.md` section 0, and commit on the docs branch.
5. Watch-list each week: key events (still 0?), Google indexed count (2 on 2026-10-18), Bing clicks vs GA bing/organic sessions, mobile share, www vs non-www host in Bing URLs, anything changed on the "Next check" list.

## Log (newest first)

### 2026-10-18 — weekly check (GA4, Search Console, Bing; all read this day in Chrome)

Windows: GA4 last 7 days = 2026-10-11 to 10-17 and last 28 days = 09-20 to 10-17. Search Console 28 days = 09-19 to 10-16 ("last update 3.5 hours ago"); Page indexing "Last update 10/12/26". Bing Search Performance and AI Performance only show **12 to 16 Oct** (5 days of data, whatever range is selected). Numbers marked "GA %" are GA's own vs-previous-period figures.

**GA4 (FreeTyper), last 7 days (11 to 17 Oct)**
- New users 302 (GA +2.0 %), returning users 63 (GA +6.0 %). Last entry (3 to 9 Oct): 293 new, 63 returning. Key events: 0.
- Sessions by channel: Organic Search 415, Direct 80, AI Assistant 8.
- Sessions by source / medium: bing / organic 343, (direct) 80, yahoo / organic 27, in.search.yahoo.com 15, chatgpt.com 8, duckduckgo 7, google / organic 2.
- First-user source (active users): bing / organic 209, (direct) 69, yahoo / organic 16, in.search.yahoo.com 14, chatgpt.com 7, duckduckgo 5, ph.search.yahoo.com 2.
- Countries (active users): United States 98, India 73, Singapore 36, Canada 17, United Kingdom 12, Philippines 10, Pakistan 10. (Last entry: India 93, US 74, so the US overtook India this week; Singapore went from 11 to 36.)
- Views by page: Lessons 379, Practice 295, Speed test 224, Keyboard guide 129, Progress 78, Falling Words 39, Word Attack 31.
- Daily active users, read by eye from the Home chart (about ±3): up and down between about 40 and 78, with the last point about 55. Still a plateau with a high of about 78. Not a new step up.

**GA4, last 28 days (20 Sep to 17 Oct)**
- Active users 1,163 (events report) / 1,159 (browser report; GA's own two reports differ by 4). New users 1,152. Event count 13,107. Average engagement time per active user 9m 53s. Engagement rate 69.53 %. Engaged sessions 1,182. Key events 0.
- Views and bounce rate: Lessons 1.3K views / 21.9 %, Practice 1.1K / 17.4 %, Speed test 951 / 15.5 %, Keyboard guide 518 / 13.9 %, Progress 254 / 2.8 %, Falling Words 140 / 5.4 %, Word Attack 132 / 2.1 %.
- Sessions by source: bing / organic 1.3K, (direct) 176, yahoo / organic 95, in.search.yahoo.com 42, chatgpt.com 32, duckduckgo 23, google / organic 16.
- Cities (active users): Singapore 58, Chennai 21, Hyderabad 21, Delhi 20, Ashburn 18, Bengaluru 18, Mumbai 14.
- Browsers (active users, engagement rate, engagement time): Edge 811 (69.97 %), 72.87 %, 11m 19s; Chrome 292 (25.19 %), 61.96 %, 7m 17s; Safari 29, 45.45 %, 1m 33s; Firefox 14; Samsung Internet 4. Device category (desktop vs mobile) was **not** re-read this week.
- Events (28 days, total users 1,163): page_view 4,599 · session_start 1,702 · user_engagement 1,308 · lesson_attempt 1,208 events / 131 users (11.26 %) · practice_complete 1,187 / 142 (12.21 %) · first_visit 1,152 · lesson_complete 784 / 94 (8.08 %) · test_complete 453 / 94 (8.08 %) · game_complete 189 / 37 (3.18 %) · game_round_complete 186 / 23 · scroll 183 / 150 · setting_change 138 / 24 · click 6 · share_result 6 / 2 users · form_start 3 · form_submit 2 · lesson_skip 1 / 1 user. Shares overlap, so they cannot be added. A rough read: at most about 142 of 1,163 users (12 %) completed one of the practice events in 28 days; the 4–9 Oct window in the 10-10 entry (about 1 in 5 starting a core action) used a different, shorter window, so the two are not directly comparable.
- GA's AI insights again flag 23 Sep (page_view 200 vs an expected 20; Edge, US and India up). Cause still unknown.

**Google Search Console**
- Performance, 28 days: **7 clicks, 22 impressions**, CTR 31.8 %, average position 4.5. Last entry (2026-09-09 to 10-06): 8 clicks, 24 impressions. Flat; counts are too small to read a trend.
- Queries: `freetyper` 6 clicks / 13 impressions; `free ty` 0 / 1. No generic queries at all now (last time `touch typing diagram` and `keyboard finger chart` showed).
- Pages table (top): `https://freetyper.com/` 7 clicks / 22 impressions, two `/#...` fragment URLs from the home guide (0 clicks, 13 impressions each), `/typing-lessons` 0 / 6, `/typing-practice` 0 / 3. I did not scroll the rest.
- **Indexing: 2 indexed, 21 not indexed** (was 3 indexed, 35 not indexed; report last updated 10/12/26). The 13 old 404 posts no longer count as known pages. Indexed list: **`/` (last crawled 2026-09-18) and `/typing-lessons` (2026-10-05)**. **`/typing-practice` is now under "Crawled - currently not indexed"** (last crawled 2026-10-12), together with `/typing-game-word-attack`, `/keyboard-guide` and `/typing-game-falling-words` (all 2026-09-06). That is 4 crawled-not-indexed and **17 "Discovered - currently not indexed"** (I did not open that list). Whether `/typing-practice` dropped out of the index or was never in it is not known: Ashiqur reported it indexed on 10-10, and the index chart shows a drop at about 10/5 from about 37 to about 23 known pages, which is the old 404s being removed. The cause of Google's choice is not given.
- Sitemaps: `/sitemap.xml` submitted 2026-10-05, last read **2026-10-14**, Success, 23 discovered. (No 2026-10-08 resubmission shows; the submit date is 10-05.)

**Bing Webmaster Tools**
- **Search Performance has data now, but only for 12 to 16 Oct:** 189 clicks, 9.8K impressions, CTR 1.94 %. Per day clicks 46 / 39 / 31 / 33 / 40, impressions 2.3K / 2K / 1.8K / 1.9K / 1.8K. Desktop 9.6K impressions / 189 clicks; mobile 148 impressions / 0 clicks.
- Countries (impressions / clicks): Rest of World 5.3K / 105, United States 3.5K / 66, United Kingdom 443 / 3, Canada 299 / 11, China 44 / 0, Germany 33 / 2, Japan 22, Italy 11 / 1, Spain 9, Brazil 6 / 1, France 4.
- Pages (impressions / clicks / average position): `www.freetyper.com/typing-lessons` 5.7K / 99 / 6.02, `/typing-practice` 2.9K / 68 / 7.31, `/keyboard-guide` 788 / 18 / 6.07, `/` 200 / 2 / 6.87, `/blog/how-many-words-per-minute` 8 / 0 (a removed post), one blog post 1 / 0. **Bing lists most pages on the `www.` host.**
- Keywords: 99 in total, top 25 read. Top by impressions: `free typing practice` 898 / 23 clicks / position 7.04; `typing lessons` 697 / 9 / 7.95; `free typing lessons` 353 / 12 / 4.91; `free online typing lessons` 325 / 4 / 4.05; `typing practice free` 287 / 5 / 8.82; `typing lessons free` 279 / 5 / 4.33; `free typing lessons for beginners` 229 / 1 / 4.40; `typing for beginners` 140 / 1; `typing learning free` 131 / 4; `free typing lessons online` 107 / 2. Best CTR among the larger ones: `free typing lessons for adults` 43 impressions / 4 clicks / position 2.00. **No coding or exam-typing keyword in the top 25**, so the coding-track and exam-page questions are still open (the other 74 keywords were not read).
- **AI Performance (Copilot and partners), 12 to 16 Oct: 13.6K citations** (2.7K / 3.1K / 2.9K / 2.6K / 2.4K per day), average cited pages 10. The 10-10 reading was 0. Cited pages: `www.freetyper.com/` 6.2K, `/typing-lessons` 4.6K, `/typing-practice` 1.6K, `/keyboard-guide` 1.0K, `/blog/typing-speed-test` 15 (a removed post), one blog post 4. 256 grounding queries; top: `free typing lessons for beginners` 896, `free typing lessons` 667, `free typing class` 387, `free typing speed test` 356, `learn to type free` 262, `free online typing lessons` 262, `writing speed` 179, `keyboard hand placement` 142, `wpm counter` 90. Bing labels this "a sample of overall activity". A citation is not a click: GA shows only 8 AI-assistant sessions in 7 days.
- Sitemaps: `https://freetyper.com/sitemap.xml` submitted 10/8, crawled 10/15, Success, 23 URLs; `https://www.freetyper.com/sitemap.xml` discovered 7/2, crawled 10/12, Success, 23 URLs. Two sitemaps, 0 errors, 0 warnings, 46 URLs discovered in total (the same 23 on two hosts).
- Site Explorer: crawl information **Indexed 46, Error 0, Warning 7, Excluded 1**; folder information (last 6 months) 54 URLs, 806 clicks, 53.5K impressions. This does not match the 5-day Search Performance figure above, so I have not compared them. Not read: what the 7 warnings and 1 excluded URL are.

**Site check (live, 2026-10-18, curl)**
- `https://www.freetyper.com/` and `/typing-lessons` both return **200** (no redirect to `freetyper.com`), so the site answers on two hosts. The `www` page's canonical tag points to `https://freetyper.com/typing-lessons`, so the duplicate is handled by canonical, not by a redirect. `http://` redirects (302) to `https://`. The removed slugs `/blog/typing-speed-test` and `/blog/how-many-words-per-minute` return 404.

**Reading and suggestions (suggestions, not findings)**
1. Bing is now the clearest signal: about 38 clicks a day over 12 to 16 Oct, mostly desktop, for "free typing lessons / practice" queries at positions 4 to 9. GA shows bing / organic at 343 sessions in 7 days (about 49 a day). Same order of size; I did not reconcile them.
2. Bing's clicks come mostly from the pages that are already the biggest in GA (lessons, practice, keyboard guide), so the traffic is driven by those three pages. Better titles and descriptions for them are the cheapest lever for click-through: the larger queries sit at 1.2 to 3.4 % CTR at positions 4 to 8 (a suggestion, not tested).
3. Bing is serving and citing the `www.` host. Canonical points the right way, but a 301 from `www` to the apex would remove the doubt and merge the data. This is a config change at Cloudflare or Coolify, to decide.
4. Google is the weak side: 2 pages indexed, `/typing-practice` crawled and not indexed, 4 clicks from branded searches only. Do not expect traffic from Google until that changes.
5. Key events are still 0 after 2+ weeks. This is the first thing to do in GA4.
6. Removed blog posts are still being shown or cited by Bing (`how-many-words-per-minute`, `typing-speed-test`). Small numbers, but redirecting them to the nearest live post is now worth deciding.

**Changes since last entry (2026-10-10)**
- No site release since 2026-10-06. Docs only. Sitemap submitted to Search Console on 2026-10-05 and read by Google on 10-14; Bing sitemap read 10-15.

**Next check (2026-10-25)**
- Did Bing Search Performance start showing more than 5 days? Do clicks stay near 30 to 45 a day?
- Search Console: does `/typing-practice` return to Indexed; the 17 "Discovered" URLs; request indexing for the pages in `freetyper.md` §8 (Ashiqur).
- GA4: key events registered? Read device category (mobile share) again.
- Open the 7 Bing warnings and 1 excluded URL in Site Explorer.

### 2026-10-10 — trend check: growth has levelled off (GA4 Home chart, active users per day)

Values are read by eye from GA4's Home chart (about ±3), so treat them as approximate. Dates are 2026.
- **Early Sep:** about 7 to 8 active users a day (to 13 Sep).
- **14 to 24 Sep: the step up.** 15, then 30 (20 Sep), then about 50 (22 to 24 Sep) and about 55 on 25 Sep.
- **25 Sep to 9 Oct: a plateau, not a climb.** Weekdays mostly 40 to 68 a day. Weekend dips: about 29 on Sun 27 Sep and about 30 on Sat 3 Oct. Highest points about 68 on 6 and 7 Oct, then about 57 on 8 to 9 Oct.
- **Last 7 days vs the 7 before** (GA Home cards): new users 293, up only 2.8 %; returning users 63, up 21.2 %.
- **Event count is not a growth measure here.** It jumps on 5 Oct because the custom events were released on 4 Oct, so it counts more event types than before.
- **Cause unknown.** We have not identified what changed on or around 14 to 24 Sep. Hypotheses only: Bing started ranking the site for the queries it now gets; the plateau is how many people search those queries.

### 2026-10-10 — deep dive: engagement, events, devices, browsers (GA4, window 2026-09-12 to 2026-10-09 unless noted)

**Engagement**
- 909 active users, 903 new, 865 engaged sessions, engagement rate 68.6 %, average engagement time 6m 41s per active user. Page views per user, 4.05 (4–9 Oct).
- Bounce rate by page: Lessons 23.3 %, Practice 17.4 %, Speed test 17.5 %, Keyboard guide 13.7 %, Progress 3.0 %, Falling Words 8.0 %, Word Attack 1.3 %.
- Views (28 days): Lessons 915, Practice 838, Speed test 777, Keyboard guide 415, Progress 179, Falling Words 104, Word Attack 103.

**Events (only tracked since the 2026-10-04 release, so the 4–9 Oct window is the fair one: 281 users)**
| Event | Users | Share of 281 | Events | Per user |
|---|---|---|---|---|
| practice_complete | 69 | 24.6 % | 406 | 5.9 |
| lesson_attempt | 56 | 19.9 % | 420 | 7.5 |
| test_complete | 41 | 14.6 % | 215 | 5.2 |
| lesson_complete | 39 | 13.9 % | 267 | 6.9 |
| game_complete | 20 | 7.1 % | 50 | 2.5 |
| setting_change | 12 | 4.3 % | 59 | 4.9 |
The shares overlap (one person can do several), so they cannot be added up. We do not know the share of users who did at least one core action.

**Devices and browsers**
- Desktop 884 users (97.3 %), 6m 51s engagement; mobile 23 (2.5 %), 41.7 % engagement rate, 59s; tablet 2.
- Edge 641 (70.5 %), 7m 36s; Chrome 221 (24.3 %), 5m 12s; Safari 29, 45 % engagement rate; Firefox 9; Samsung Internet 4.

**Sources (28 days, sessions)**: bing / organic 924, direct 120, yahoo / organic 68, in.search.yahoo.com 28, chatgpt.com 27, google / organic 20, duckduckgo 19. Session starts in total: 1,259. Google organic is about 1.6 % of sessions; Bing plus Yahoo plus DuckDuckGo is about 82 %.

**Places**: Singapore 25, Ashburn 19, Chennai 18, Delhi 17, Hyderabad 15, Mumbai 13, Bengaluru 12 (top cities, 28 days). Bangladesh: 18 users, 9m 05s engagement. India is the top country over 7 days (93).

**Unverified / watch**
- GA's own insight flags 23 Sep: page_view events at 200 vs an expected 19, and Edge events up from 20 to 184 week on week. We do not know the cause. Ashburn is a large data-centre location, so some traffic could be non-human; the long engagement times point to real people, but this is not checked.
- Not read yet: Bing queries (still "check back in 48 hours" on 2026-10-10), landing-page engagement, cohort retention, per-source trends, Core Web Vitals (no data).

**Site check (live, 2026-10-10)**: each page checked has a unique title (41–65 characters), a description, a canonical link, one H1, JSON-LD and roughly 1,700–2,600 words. No basic technical SEO gap showed up.

**Reading and suggestions (suggestions, not findings)**
1. People who start use the site deeply (5 to 7 actions each, 6+ minutes), but only about 1 in 5 start a core action. The product works for those who try it; the gap is getting visitors to start.
2. The audience is a desktop, Edge and Bing audience. The assumption in `freetyper.md` that "many visitors are probably on phones" is not supported (2.5 % mobile). Mobile may be low partly because the page is hard to use on a phone, so it is a cause and an effect that we cannot separate.
3. About 4 of 5 sessions come through Bing. That is the main risk and the main lever.
4. Returning use is small (63 returning vs 293 new users in the last 7 days).

### 2026-10-10 — first entry (read by hand in the browser)

**GA4 (FreeTyper)**
- Last 30 days: 920 active users (+543.4 % vs previous period), 914 new users, 8.3K events, 0 key events.
- Last 7 days: 293 new users, 63 returning users.
- Sessions by channel (last 7 days): Organic Search 392, Direct 51, AI Assistant 8, Unassigned 4.
- First-user source (last 7 days): bing / organic 219, (direct) 40, yahoo / organic 20, in.search.yahoo.com / referral 11, chatgpt.com / ai-assistant 7, duckduckgo / organic 4, uk.search.yahoo.com / referral 2.
- Countries by active users (last 7 days): India 93, United States 74, Philippines 20, Canada 19, Singapore 11, Bangladesh 10, United Kingdom 9.
- Top pages by views (last 7 days): Typing Lessons 324, Typing Practice 324, Typing Speed Test 254, Keyboard Guide 160, Typing Progress Tracker 72, Word Attack 33, Falling Words 33.
- GA flagged a spike on 2026-09-22: 56 sessions against a forecast of 4 to 52.

**Google Search Console**
- Performance, 2026-09-09 to 2026-10-06 (28 days): 8 clicks, 24 impressions, CTR 33.3 %, average position 18.5.
- Overview chart, from 2026-07-07: 15 total web search clicks.
- Queries (28 days): `freetyper` 6 clicks / 12 impressions / position 4.7. Four queries with 0 clicks: `touch typing diagram` (3 impressions, position 56.0), `keyboard finger chart`, `free ty`, `keyboard fingers chart` (1 impression each, positions 68 to 73).
- Indexing: 3 indexed pages, 35 not indexed. **The Page indexing report says "Last update 10/4/26", so it is 6 days old and predates the 2026-10-08 sitemap work.** I did not open the indexed list; Ashiqur reported on 2026-10-10 that the 3 indexed pages are `/`, `/typing-lessons` and `/typing-practice` (not verified by me).
  - **Crawled – currently not indexed (3):** `/typing-game-word-attack`, `/keyboard-guide`, `/typing-game-falling-words`, all last crawled 2026-09-06. Google gives no reason; the cause is unknown.
  - **Discovered – currently not indexed (32):** last crawled "N/A", so Google has found the URLs but never fetched them. I read 29 of the 32 (the first row of each page was scrolled out of view): `/blog`, 23 blog slugs, `/contact`, `/disclaimer`, `/privacy`, `/terms`, `/typing-progress`.
  - **Checked against the live site on 2026-10-10 (HTTP status):** of the 23 blog slugs, 10 return 200 (`10-bad-typing-habits`, `data-entry-typing-test`, `fix-typing-posture-and-avoid-wrist-pain`, `good-typing-speed`, `how-to-type-faster`, `improve-typing-accuracy`, `mechanical-vs-membrane-keyboards`, `muscle-memory-and-touch-typing`, `touch-typing-for-beginners`, `typing-speed-for-programmers`) and 13 return **404**: `3-minute-typing-test-vs-5-minute-typing-test`, `5-minute-typing-test`, `average-typing-speed`, `best-free-typing-games`, `best-keyboards-for-fast-typing`, `how-many-words-per-minute`, `how-to-learn-touch-typing-as-an-adult`, `one-minute-typing-test`, `type-numbers-and-symbols-without-looking`, `typing-accuracy-test`, `typing-practice`, `typing-speed-for-work`, `typing-speed-test`. These match the old posts removed in the blog cut from 25 to 10 (see `freetyper.md`). The live `sitemap.xml` lists 23 URLs and none of the 404 slugs.
- Core Web Vitals: no data. Breadcrumbs: 1 valid, 0 invalid. HTTPS: OK.

**Bing Webmaster Tools**
- Site verified. Sitemap `https://freetyper.com/sitemap.xml`: submitted and crawled 2026-10-08, status Success, 23 URLs discovered, 0 errors, 0 warnings.
- Search Performance: no data yet ("check back in 48 hours").
- AI Performance (Copilot and partners), 2026-07-10 to 2026-10-09: 0 citations, 0 cited pages. Grounding-query and page tables are empty.

**Reading**
- Bing and the engines it feeds are the main source (bing / organic is the largest first-user source, 219 active users in the last 7 days). Google sends very little so far.
- **Google indexing: the "35 not indexed" headline overstates the problem.** At least 13 of those URLs are old blog posts that now return 404 on purpose, so they should not be indexed. That leaves about 22 real URLs, which is close to the 23 in the sitemap (the 3 indexed pages are among them).
- **Two different issues remain, both on Google's side and both unexplained:**
  1. The 3 pages that Google crawled and chose not to index (`/keyboard-guide` and the two game pages). We do not know why, so we should not guess. Content quality, duplication or a low-priority signal are possibilities, not findings.
  2. About 19 live URLs (blog posts, `/typing-progress`, legal pages) that Google has found but never fetched. For a new site this usually means Google has not got to them yet. This is the usual cause but I did not confirm it for this site.
- The 13 dead slugs are still "known" to Google, which is why they appear. A 404 is the right answer for removed pages. Redirecting them to related live posts is an option, but it is a content decision, not a fix for an error.
- Per Ashiqur, the 3 indexed pages are `/`, `/typing-lessons` and `/typing-practice`. That fits what I saw: none of them was in either not-indexed list. These are also three of the four most-viewed pages in GA4 (Typing Lessons 324, Typing Practice 324, home speed test 254 views in 7 days; GA lists the home page as "Typing Speed Test"), though views come mostly from Bing, so this is a coincidence of which pages matter, not evidence about why Google indexed them.
- That leaves `/keyboard-guide`, `/typing-progress`, the two game pages, `/blog`, the 10 live blog posts and the legal pages (`/about` was not in any list I read) as the pages Google has not indexed.
- AI-assistant traffic (chatgpt.com) is small but present; Bing's AI citation report is still empty.

**Changes since last entry**
- None logged. Recent releases are in `freetyper.md` (2026-10-04 to 2026-10-06: settings and GA4 events, the lesson course, adaptive practice). The 2026-10-08 Bing setup is the latest change.

**Next check**
- Bing Search Performance on or after 2026-10-11 (queries, pages, clicks, impressions).
- Search Console: wait for the Page indexing report to refresh (it showed 2026-10-04 on 2026-10-10), open the "Indexed" list to confirm the 3 pages Ashiqur reported, and request indexing for the key pages (list is in `freetyper.md`). Use URL Inspection on `/keyboard-guide` for Google's own status on that page.
- GA4: confirm the custom events arrive and mark key events (steps are in `freetyper.md`).

## Open questions
- Why did Google crawl `/keyboard-guide`, `/typing-game-word-attack` and `/typing-game-falling-words` on 2026-09-06 and not index them? Google gives no reason in the report; URL Inspection may add detail.
- Do the 13 removed blog slugs need redirects, or is a 404 fine? (Content decision; nothing is broken today.)
- How much of the Bing traffic is new since verification, and how much was already there? Bing's own data should answer this once it starts.
