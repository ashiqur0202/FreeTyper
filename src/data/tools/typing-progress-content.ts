/**
 * Guide content for /typing-progress.
 *
 * Describes `TypingProgress.tsx`, `KeyboardHeatmap.tsx` and
 * `useTypingProgress.ts` (storage key `freetyper-progress`, achievements,
 * streak, best scores, key statistics). If any of those change, update this
 * file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-03
 */

export const meta = {
  title: 'Typing Progress Tracker — WPM History, Streaks & Achievements',
  description:
    'A private typing progress tracker: WPM history, accuracy, streaks, an error heatmap of your keys and 14 achievements. Stored in your browser, no signup.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do I track my typing progress?',
    answer:
      'Take typing tests, lessons or practice runs on FreeTyper and each finished run is saved automatically. The progress page then shows your best WPM and accuracy, a chart of your recent sessions, your streak, your weakest keys, an error heatmap and your achievements. There is nothing to set up and no account to create.',
  },
  {
    question: 'Where is my typing progress stored?',
    answer:
      'In your own browser, using local storage on the device you are using. FreeTyper has no accounts and does not upload your results. It also means your history does not follow you to another browser or device, and clearing your site data deletes it.',
  },
  {
    question: 'What does the WPM history chart show?',
    answer:
      'One bar for each of your last 30 saved sessions, oldest on the left and newest on the right, with the tallest bar setting the scale. The average shown beside the chart covers those same sessions. The chart includes every saved session type, so compare like with like: a code practice run and a word-list speed test are not the same difficulty.',
  },
  {
    question: 'How is my typing streak counted?',
    answer:
      'A streak is the number of consecutive calendar days, in your local time, on which you finished at least one session. Finishing a session on the next day extends it, and missing a full day resets it to one the next time you practice. The page also shows your best streak.',
  },
  {
    question: 'What do the colours on the error heatmap mean?',
    answer:
      'Each key is coloured by its error rate once you have pressed it at least three times. Green means clean, with an error rate of 5 percent or less. Gold means mild, above 5 percent. Orange means elevated, above 10 percent. Red means high, above 15 percent. Keys with too little data stay grey.',
  },
  {
    question: 'How are weak keys chosen?',
    answer:
      'FreeTyper counts how many times you press each key and how many presses are correct. Keys with at least five presses are ranked by accuracy, and the five with the lowest accuracy are shown as your weakest keys, each with its accuracy.',
  },
  {
    question: 'Do the achievements prove how fast I type?',
    answer:
      'No. Speed and accuracy achievements are unlocked by your best single run in the speed test, lessons or practice, and some of those passages are short. A lucky run can unlock a badge, so treat achievements as motivation, not as a certificate. Streak and session achievements count days and finished sessions.',
  },
  {
    question: 'Do the typing games count toward my best score?',
    answer:
      'Game runs appear in your session list and add to your typing time, but they are left out of your best WPM and best accuracy, and so out of the speed and accuracy achievements. The WPM chart and the average do include them.',
  },
  {
    question: 'Can I delete my progress?',
    answer:
      'Yes. Use the reset button at the bottom of the progress page and confirm. It clears your sessions, best scores, streak, key statistics and achievements. Your unlocked lessons and the latest-five lists under each tool are stored separately and are not cleared by it.',
  },
  {
    question: 'Can I move my progress to another device?',
    answer:
      'Not at the moment. Progress lives in one browser on one device, and there is no export or account sync.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Typing Progress Tracker — WPM History, Streaks and Achievements</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-03">October 3, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>This typing progress tracker turns the runs you finish on FreeTyper into a picture of how you are improving: your best WPM and accuracy, a chart of recent sessions, your practice streak, the keys you get wrong most often, and 14 achievements. It works with no account, and everything is stored privately in your browser.</p>
<p>Below is what each part of the page measures, how it is calculated, where its limits are, and how to use the numbers to improve instead of just collecting them.</p>
`;

export const bodyHtml = `
<h2 id="what-the-progress-page-shows">What the progress page shows</h2>
<ul>
<li><strong>Six headline numbers:</strong> sessions, best WPM, best accuracy, average WPM, current streak and total typing time.</li>
<li><strong>A WPM history chart</strong> of your last 30 sessions.</li>
<li><strong>Your weakest keys</strong>, each with its accuracy.</li>
<li><strong>Recent sessions:</strong> your last eight, with type, date, duration, WPM and accuracy.</li>
<li><strong>An error heatmap</strong> of the whole keyboard.</li>
<li><strong>Achievements:</strong> 14 badges, with the date each one was unlocked.</li>
</ul>
<p>Until you have finished a run, the page shows an empty state with links to the <a href="/">speed test</a>, the <a href="/typing-lessons">lessons</a> and <a href="/typing-practice">practice</a>.</p>

<h2 id="how-the-numbers-are-calculated">How the numbers are calculated</h2>
<table>
<thead><tr><th>Number</th><th>How it is worked out</th></tr></thead>
<tbody>
<tr><td>Sessions</td><td>Every finished run saved on this device, from the speed test, lessons, practice and the games</td></tr>
<tr><td>Best WPM / best accuracy</td><td>The highest single value from speed tests, lessons and practice. Games are left out.</td></tr>
<tr><td>Average WPM / accuracy</td><td>The mean of your last 30 saved sessions, games included</td></tr>
<tr><td>Streak</td><td>Consecutive local calendar days with at least one finished session</td></tr>
<tr><td>Time</td><td>The sum of the durations of all saved sessions</td></tr>
<tr><td>Words typed</td><td>Correct characters divided by five, added up over all sessions</td></tr>
</tbody>
</table>
<p>WPM and accuracy follow the same rules as the speed test: five characters make a word, and Backspace removes the character you step back over. The <a href="/">typing speed test guide</a> explains this in full.</p>

<h3>Things worth knowing about these numbers</h3>
<ul>
<li><strong>Best WPM can come from a very short run.</strong> Lessons and practice passages are short, so one lucky passage can set a best that a longer test would not confirm. For a number you can trust, use the average of several runs of the same length.</li>
<li><strong>The chart mixes session types.</strong> Code, quotes, lessons and games are not equally hard. A dip may just mean you practiced something harder.</li>
<li><strong>Word Attack adds one session per round,</strong> so a full game adds up to eight sessions to your count. Falling Words adds one session per game.</li>
<li><strong>The games only add correct key presses.</strong> The letters of the words you clear are counted as correct, but typos are not recorded as errors, so game play makes your key accuracy look slightly better than the tests and practice do.</li>
<li><strong>The average covers only the last 30 sessions,</strong> so it moves as you improve instead of being dragged down by your first attempts.</li>
</ul>

<h2 id="how-to-read-the-wpm-chart">How to read the WPM history chart</h2>
<p>Each bar is one session, oldest on the left. The tallest bar sets the scale, so the chart shows shape, not absolute speed: hover a bar for its exact WPM and date. Look for the trend across ten or more bars, not for any single bar. A slow upward drift with some noise is what real improvement usually looks like.</p>

<h2 id="the-error-heatmap-and-weak-keys">The error heatmap and weak keys</h2>
<p>The heatmap colours every key by how often you get it wrong, once you have pressed it at least three times:</p>
<table>
<thead><tr><th>Colour</th><th>Label</th><th>Error rate</th></tr></thead>
<tbody>
<tr><td>Green</td><td>Clean</td><td>5% or less</td></tr>
<tr><td>Gold</td><td>Mild</td><td>above 5%</td></tr>
<tr><td>Orange</td><td>Elevated</td><td>above 10%</td></tr>
<tr><td>Red</td><td>High errors</td><td>above 15%</td></tr>
<tr><td>Grey</td><td>No data</td><td>fewer than 3 presses</td></tr>
</tbody>
</table>
<p>The weakest-keys list is stricter. It only considers keys you have pressed at least five times, ranks them by accuracy, and shows the five lowest. Each bar is green at 90% accuracy or above, gold from 75%, and red below that. Hover any key on the heatmap to see its accuracy and press count.</p>
<p>If one key is stubbornly red, check which finger owns it in the <a href="/keyboard-guide">keyboard guide</a>, then use the weak-key drill in <a href="/typing-practice">typing practice</a>.</p>

<h2 id="streaks">How streaks work</h2>
<p>Finishing at least one session on a calendar day, in your local time, keeps your streak going. Finishing one on the day after your last session extends it. Missing a whole day resets it to one the next time you practice. Your best streak is kept separately. The streak counts days, not minutes, so a single short run is enough to keep it alive.</p>

<h2 id="achievements">The 14 achievements</h2>
<table>
<thead><tr><th>Group</th><th>Achievements</th></tr></thead>
<tbody>
<tr><td>Speed (best WPM)</td><td>Getting Started 30 · Typist 50 · Speed Demon 70 · Blazing Fast 100 · Keyboard Warrior 120</td></tr>
<tr><td>Accuracy (best accuracy)</td><td>Sharp Shooter 95% · Perfect Aim 99%</td></tr>
<tr><td>Streak</td><td>Consistent 3 days · Dedicated 7 days · Unstoppable 30 days</td></tr>
<tr><td>Sessions</td><td>Regular 10 · Committed 50 · Typing Master 100, plus First Steps for your first session</td></tr>
</tbody>
</table>
<p>Speed and accuracy badges are based on your best single run, so a lucky short passage can unlock one. Read them as motivation, not as proof of your typing speed.</p>

<h2 id="how-to-use-your-progress-data">How to use your progress data to improve</h2>
<p>These are our recommendations, not guarantees.</p>
<ol>
<li><strong>Watch accuracy before speed.</strong> If your average accuracy sits below 95%, that is the number to fix first.</li>
<li><strong>Compare like with like.</strong> Judge speed from runs of the same length and type, not from the whole chart.</li>
<li><strong>Look at the heatmap weekly,</strong> then drill the red and orange keys.</li>
<li><strong>Use the streak as a habit tool.</strong> Ten minutes on most days is easier to sustain than long, rare sessions.</li>
<li><strong>Re-test periodically</strong> with the same speed test settings to see real change.</li>
</ol>

<h2 id="limits-of-the-progress-tracker">Limits of the progress tracker</h2>
<ul>
<li>Data lives in one browser on one device. There is no sync, export or import.</li>
<li>Clearing your site data, or using private browsing, erases or hides your history.</li>
<li>Best scores can come from short runs, and the chart mixes session types.</li>
<li>Key statistics are counted per key, not per finger or letter pair.</li>
</ul>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Everything on this page is computed in your browser from data kept in local storage under the name <code>freetyper-progress</code>. There is no FreeTyper account and nothing you type is uploaded. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details. The reset button at the bottom of the page deletes the progress data after you confirm.</p>

<h2 id="typing-progress-faq">Typing progress FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>All calculations, thresholds, colours and achievements: how the tracker on this page works, as described above.</li>
<li>WPM and accuracy rules: see the <a href="/">typing speed test guide</a>.</li>
<li>The routine and the use-your-data advice are FreeTyper's own suggestions.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a number on the progress page does not behave as described here, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Finish a typing run',
    text: 'Complete a speed test, a lesson or a practice passage. Each finished run is saved to your progress automatically.',
  },
  {
    name: 'Open the progress page',
    text: 'Visit the progress page to see your best WPM and accuracy, your streak and your total typing time.',
  },
  {
    name: 'Read the WPM history chart',
    text: 'Look at the trend across your last 30 sessions rather than any single bar, and compare runs of the same type.',
  },
  {
    name: 'Check the heatmap and weakest keys',
    text: 'Find the red and orange keys on the error heatmap and note your five weakest keys.',
  },
  {
    name: 'Drill your weak keys and come back',
    text: 'Use typing practice to drill the weak keys, then return a week later to see how the numbers moved.',
  },
];
