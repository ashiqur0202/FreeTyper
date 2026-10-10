# FreeTyper — analytics log

Running log of traffic and search data. `freetyper.md` holds the product rules and status; this file holds the numbers over time.

## How to use this file
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

## Log (newest first)

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
- Indexing: 3 indexed pages, 35 not indexed. Reasons were not opened yet.
- Core Web Vitals: no data. Breadcrumbs: 1 valid, 0 invalid. HTTPS: OK.

**Bing Webmaster Tools**
- Site verified. Sitemap `https://freetyper.com/sitemap.xml`: submitted and crawled 2026-10-08, status Success, 23 URLs discovered, 0 errors, 0 warnings.
- Search Performance: no data yet ("check back in 48 hours").
- AI Performance (Copilot and partners), 2026-07-10 to 2026-10-09: 0 citations, 0 cited pages. Grounding-query and page tables are empty.

**Reading**
- Bing and the engines it feeds are the main source (bing / organic is the largest first-user source, 219 active users in the last 7 days). Google sends very little so far.
- Google shows the site as mostly not indexed (3 of 38 known pages). This is the biggest open question and has not been investigated.
- AI-assistant traffic (chatgpt.com) is small but present; Bing's AI citation report is still empty.

**Changes since last entry**
- None logged. Recent releases are in `freetyper.md` (2026-10-04 to 2026-10-06: settings and GA4 events, the lesson course, adaptive practice). The 2026-10-08 Bing setup is the latest change.

**Next check**
- Bing Search Performance on or after 2026-10-11 (queries, pages, clicks, impressions).
- Search Console: open the "not indexed" reasons and request indexing for the key pages (list is in `freetyper.md`).
- GA4: confirm the custom events arrive and mark key events (steps are in `freetyper.md`).

## Open questions
- Why are 35 pages not indexed by Google? (Open Pages → "Why pages aren't indexed" and read each reason.)
- How much of the Bing traffic is new since verification, and how much was already there? Bing's own data should answer this once it starts.
