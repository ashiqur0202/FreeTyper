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
- Indexing: 3 indexed pages, 35 not indexed. **The Page indexing report says "Last update 10/4/26", so it is 6 days old and predates the 2026-10-08 sitemap work.** The 3 indexed URLs were not opened.
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
- Not yet seen: whether `/typing-lessons` and `/typing-practice`, which are in the sitemap, are among the 3 indexed pages. They were not in either not-indexed list I read, but 3 rows of the discovered list were out of view.
- AI-assistant traffic (chatgpt.com) is small but present; Bing's AI citation report is still empty.

**Changes since last entry**
- None logged. Recent releases are in `freetyper.md` (2026-10-04 to 2026-10-06: settings and GA4 events, the lesson course, adaptive practice). The 2026-10-08 Bing setup is the latest change.

**Next check**
- Bing Search Performance on or after 2026-10-11 (queries, pages, clicks, impressions).
- Search Console: wait for the Page indexing report to refresh (it showed 2026-10-04 on 2026-10-10), open the "Indexed" list to see which 3 pages are in, and request indexing for the key pages (list is in `freetyper.md`). Use URL Inspection on `/keyboard-guide` for Google's own status on that page.
- GA4: confirm the custom events arrive and mark key events (steps are in `freetyper.md`).

## Open questions
- Why did Google crawl `/keyboard-guide`, `/typing-game-word-attack` and `/typing-game-falling-words` on 2026-09-06 and not index them? Google gives no reason in the report; URL Inspection may add detail.
- Do the 13 removed blog slugs need redirects, or is a 404 fine? (Content decision; nothing is broken today.)
- How much of the Bing traffic is new since verification, and how much was already there? Bing's own data should answer this once it starts.
