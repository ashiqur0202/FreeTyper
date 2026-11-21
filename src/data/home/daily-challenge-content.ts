/**
 * Guide content for /daily-typing-challenge.
 *
 * Describes `dailyChallenge.ts` (passage choice, storage, streak), `DailyPanel.tsx`
 * and the `daily` mode of `TypingSpeedTest.tsx`. Scoring is the home page's
 * (see `typing-speed-content.ts`). If the passage rule, the streak rule, the
 * length or the reset time change, update this file in the same commit.
 *
 * Facts used here come from the code: a UTC date key, a seeded shuffle of the
 * sentences generated from the date (textGenerator, standard level), about 300 words, a fixed 60 seconds, a streak
 * counting days with a run at 90 % accuracy or better, data kept only in
 * localStorage. No outside figures are used.
 *
 * Last real edit: 2026-11-21 (added: when the text changes in each time zone, three worked streak examples, comparing with a friend; two FAQs). Earlier: 2026-11-20 (the daily text is generated from the date, no fixed passages)
 */

export const dailyMeta = {
  title: 'Daily Typing Challenge — Same Text for Everyone, Free',
  description:
    'A free daily typing challenge: one 60-second test with the same text for everyone each day, a streak counter and your best score of the day. No signup.',
};

const byline = `
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-21">November 21, 2026</time></span>
</p>`;

export const dailyPreviewHtml = `
<h2>Daily Typing Challenge — One Text, Everyone, Every Day</h2>${byline}
<p>This is a 60-second typing test with a text that is the same for everyone and changes once a day. Everyone who opens this page on the same day gets the same text, so a score of 70 WPM today means the same thing to anyone else who typed it. Your streak and your best score of the day are kept on this device.</p>
<p>Below: how the daily passage is chosen, what counts toward the streak, and what is and is not stored.</p>
`;

export const dailyBodyHtml = `
<h2 id="how-the-daily-challenge-works">How the daily challenge works</h2>
<p>The test is the same one as on the <a href="/">home page</a>, set to 60 seconds and to sentences, and you cannot change either while you are on this page. The timer starts on your first keystroke. Net WPM is your correct characters divided by five, divided by the minutes, and accuracy is correct characters out of characters typed. The full method is in the <a href="/">typing speed test guide</a>, and the <a href="/1-minute-typing-test">1 minute test page</a> explains what a single minute can and cannot show.</p>
<p>When the minute ends, a small box over the text shows your result. Press Test again (or Enter) to run the same passage again as often as you like. Your run is in the performances list under the keyboard; click it to open the full result.</p>

<h2 id="how-the-passage-is-chosen">How the daily passage is chosen</h2>
<p>The page takes today's date in UTC, such as 2026-11-08, and uses it as the seed for a small random-number generator. The generator is the one the speed test uses for sentences: it puts made-up everyday sentences together by rules from groups of words, at the standard difficulty, until there are about 300 words. Because the seed is only the date, every browser builds the same text for the same day, with no server involved and no fixed list of passages. At 300 words the passage is longer than anyone can finish in a minute.</p>
<p>The new text appears at 00:00 UTC. If you leave the page open across that moment, the next run you start uses the new day's text. Each day's text is newly made, so it does not come from a short list that repeats. The daily test always uses the standard difficulty, so scores stay comparable from day to day; the difficulty menu of the speed test does not apply here.</p>

<h2 id="streak-and-best-score">Streak and best score</h2>
<ul>
<li><strong>A day counts</strong> when you finish at least one 60-second run with 90% accuracy or better. This is our own rule, chosen so that mashing keys does not extend a streak; it is not a standard.</li>
<li><strong>The streak</strong> is the number of days in a row that counted, ending today. If you have not run today yet, it shows yesterday's chain, so you do not lose it until the day is over.</li>
<li><strong>Today's best</strong> is your highest net WPM among today's counted runs. A run below 90% accuracy is still saved in your results, but it does not set the best or count for the streak.</li>
</ul>

<h2 id="what-is-stored">What is stored, and what is not</h2>
<p>The streak, your best score for each of the last 60 days and the number of runs are kept in your browser's local storage on this device. There are no accounts and no leaderboard: nothing is uploaded and no one else can see your score, unless you use the share button to turn a result into a picture and send it yourself. Clearing your site data, or opening the page in another browser or on another device, starts the streak from zero. The result card for a daily run is labelled "daily" with the date, and the share picture says "Daily challenge" with the day.</p>

<h2 id="using-it-well">Using it well</h2>
<p>These are suggestions, not measured results. Because the text is the same for everyone each day, it is a fair way to compare yourself with a friend: send them the share picture and ask them to type the same day's passage. For your own progress, look at the trend over several days instead of one score, since one run swings with how awake you are. If you are still learning the keys, the <a href="/typing-lessons">typing lessons</a> and <a href="/typing-practice">adaptive practice</a> will move your speed more than repeating this test.</p>

<h2 id="when-the-text-changes-where-you-live">When the text changes where you live</h2>
<p>The challenge day follows UTC, not your local clock, so the new text appears at 00:00 UTC. That is a different local time in different places:</p>
<table>
<thead><tr><th>Place (in northern winter)</th><th>UTC offset</th><th>The new text appears at</th></tr></thead>
<tbody>
<tr><td>Dhaka</td><td>UTC+6</td><td>06:00, the same date</td></tr>
<tr><td>Delhi</td><td>UTC+5:30</td><td>05:30, the same date</td></tr>
<tr><td>London</td><td>UTC+0</td><td>00:00, the same date</td></tr>
<tr><td>New York</td><td>UTC&minus;5</td><td>19:00 the evening before</td></tr>
<tr><td>Los Angeles</td><td>UTC&minus;8</td><td>16:00 the afternoon before</td></tr>
</tbody>
</table>
<p>The London, New York and Los Angeles rows move by one hour in summer because of daylight-saving time. A run belongs to the UTC date on which you start it. So west of London, an evening run can already belong to tomorrow's challenge day and count for that day's streak, and east of UTC, an early-morning run before 00:00 UTC still belongs to the previous date.</p>

<h2 id="reading-your-streak">Reading your streak: three examples</h2>
<p>The streak is the number of UTC days in a row with a counted run (90% accuracy or better), ending today. If today has no counted run yet, it shows the chain that ended yesterday. Worked from that rule:</p>
<ul>
<li>You counted on Monday, Tuesday and Wednesday. After your Wednesday run the streak is <strong>3</strong>, and on Thursday morning, before a run, it still shows <strong>3</strong>.</li>
<li>You then skip Thursday completely. On Friday, before any run, yesterday has no counted run, so the streak shows <strong>0</strong>. A counted run on Friday makes it <strong>1</strong>.</li>
<li>You run on Thursday but reach only 85% accuracy. The run is saved in your results, but the day does not count, so it is the same as skipping it.</li>
</ul>

<h2 id="comparing-with-a-friend">Comparing with a friend</h2>
<p>The passage depends only on the UTC date, so you and a friend get the same text on the same UTC day without sending anything, and you can compare net WPM and accuracy directly. Two cautions that follow from the rules: near 00:00 UTC one of you may already be on the next day's text, and the daily test always uses the Standard text level and 60 seconds, so only compare daily runs with daily runs. For a comparison on a text and length you choose, finish any regular speed test and use its Challenge a friend button: the link rebuilds that run's text for your friend. The daily challenge itself cannot be shared that way.</p>

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Scoring and rules: how the test works, the same as the <a href="/">typing speed test</a>.</li>
<li>Passage choice, streak rule and storage: described from the page's own code. There are no outside statistics on this page.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If the challenge behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the test.</p>`;

export const dailyFaqs = [
  {
    question: 'Is the daily typing challenge the same for everyone?',
    answer:
      'Yes. The passage is built from the UTC date, so everyone who opens the page on the same day gets the same text. It changes at 00:00 UTC.',
  },
  {
    question: 'How long is the daily challenge?',
    answer:
      'It is a fixed 60-second test. The timer starts on your first keystroke, and you cannot change the length or the text type on this page.',
  },
  {
    question: 'What counts toward the daily streak?',
    answer:
      'A day counts when you finish at least one run with 90% accuracy or better. The streak is the number of days in a row that counted, ending today.',
  },
  {
    question: 'Is there a leaderboard or an account?',
    answer:
      'No. Your streak and best scores are stored only in your browser on this device, and nothing is uploaded. Use the share button to send a result as a picture.',
  },
  {
    question: 'When does the daily text change in my time zone?',
    answer:
      'At 00:00 UTC. That is 06:00 in Dhaka, 05:30 in Delhi, 00:00 in London in winter, and 19:00 the evening before in New York in winter. The table on this page lists more places.',
  },
  {
    question: 'Does a late-evening run count for today or tomorrow?',
    answer:
      'For the UTC date on which you start it. West of London that can be tomorrow in the evening, and east of UTC a run before 00:00 UTC still belongs to the previous date.',
  },
  {
    question: 'Can I run the daily challenge more than once?',
    answer:
      'Yes. The same passage is ready again after each run, and the page keeps your best counted score for the day.',
  },
];

export const dailyHowToName = 'How to Take the Daily Typing Challenge';

export const dailyHowToSteps = [
  {
    name: 'Open the page',
    text: "Open the daily challenge. Today's passage is already in place, the same one everyone gets today.",
  },
  {
    name: 'Start typing',
    text: 'The 60-second timer starts on your first keystroke. Type the text as it appears.',
  },
  {
    name: 'Read your result',
    text: 'When time runs out, click your latest run in the performances list under the keyboard to read your net WPM, accuracy and graph. A run at 90% accuracy or better counts toward your streak.',
  },
  {
    name: 'Share or try again',
    text: 'Use the share button to send a picture of the result, or type the same passage again to beat your best score of the day.',
  },
];
