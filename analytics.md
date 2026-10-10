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

## Log (newest first)

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
