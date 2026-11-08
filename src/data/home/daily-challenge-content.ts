/**
 * Guide content for /daily-typing-challenge.
 *
 * Describes `dailyChallenge.ts` (passage choice, storage, streak), `DailyPanel.tsx`
 * and the `daily` mode of `TypingSpeedTest.tsx`. Scoring is the home page's
 * (see `typing-speed-content.ts`). If the passage rule, the streak rule, the
 * length or the reset time change, update this file in the same commit.
 *
 * Facts used here come from the code: a UTC date key, a seeded shuffle of the
 * 16 non-code practice passages, about 300 words, a fixed 60 seconds, a streak
 * counting days with a run at 90 % accuracy or better, data kept only in
 * localStorage. No outside figures are used.
 *
 * Last real edit: 2026-11-08
 */

export const dailyMeta = {
  title: 'Daily Typing Challenge — Same Text for Everyone, Free',
  description:
    'A free daily typing challenge: one 60-second test with the same text for everyone each day, a streak counter and your best score of the day. No signup.',
};

const byline = `
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-08">November 8, 2026</time></span>
</p>`;

export const dailyPreviewHtml = `
<h2>Daily Typing Challenge — One Text, Everyone, Every Day</h2>${byline}
<p>This is a 60-second typing test with a fixed passage that changes once a day. Everyone who opens this page on the same day gets the same text, so a score of 70 WPM today means the same thing to anyone else who typed it. Your streak and your best score of the day are kept on this device.</p>
<p>Below: how the daily passage is chosen, what counts toward the streak, and what is and is not stored.</p>
`;

export const dailyBodyHtml = `
<h2 id="how-the-daily-challenge-works">How the daily challenge works</h2>
<p>The test is the same one as on the <a href="/">home page</a>, set to 60 seconds and to sentences, and you cannot change either while you are on this page. The timer starts on your first keystroke. Net WPM is your correct characters divided by five, divided by the minutes, and accuracy is correct characters out of characters typed. The full method is in the <a href="/">typing speed test guide</a>, and the <a href="/1-minute-typing-test">1 minute test page</a> explains what a single minute can and cannot show.</p>
<p>When the minute ends, the result card appears below the keyboard, the same passage is ready again, and you can run it as often as you like.</p>

<h2 id="how-the-passage-is-chosen">How the daily passage is chosen</h2>
<p>The page takes today's date in UTC, such as 2026-11-08, and uses it as the seed for a small random-number generator. That generator puts the 16 prose passages from our practice texts (the quotes, news and fun facts, not the code snippets) into an order, and the page joins them until there are about 300 words. Because the seed is only the date, every browser builds the same text for the same day, with no server involved. At 300 words the passage is longer than anyone can finish in a minute.</p>
<p>The new passage appears at 00:00 UTC. If you leave the page open across that moment, the next run you start uses the new day's text. There are only 16 passages, so the same passage can come up on different days; what changes is the order, and so what you start with. If the text feels too easy or too hard, that is a limit of the current pool.</p>

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
    text: 'When time runs out, read your net WPM, accuracy and graph under the keyboard. A run at 90% accuracy or better counts toward your streak.',
  },
  {
    name: 'Share or try again',
    text: 'Use the share button to send a picture of the result, or type the same passage again to beat your best score of the day.',
  },
];
