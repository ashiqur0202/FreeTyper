/**
 * Guide content for /typing-game-word-attack.
 *
 * Describes `WordAttackGame.tsx` and the round table, scoring and word lists in
 * `gameData.ts` (`wordAttackRounds`, `scoringRules`, `wordPools`,
 * `getWordDifficulty`). If rounds, timers, scoring or word lists change, update
 * this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-03
 */

export const meta = {
  title: 'Word Attack Typing Game — Combos, Rounds & Free Speed Drills',
  description:
    'Free Word Attack typing game: 8 rounds, one timed word at a time, combo multipliers up to x3, a high score and your last five games. No signup.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play the Word Attack typing game?',
    answer:
      'One word appears at a time and you type it before its timer runs out. The word completes the moment your input matches it, with no need to press Enter. The game has eight rounds, each with more words, harder words and a shorter timer per word.',
  },
  {
    question: 'How does the combo multiplier work?',
    answer:
      'Each word you clear in a row adds to your combo. Words one and two score normally, words three to five score x1.5, six to eight score x2, nine to eleven score x2.5, and twelve or more in a row score x3. The combo carries from one round into the next.',
  },
  {
    question: 'What happens if I run out of time on a word?',
    answer:
      'The word counts as missed, your combo resets to zero and the next word appears with a fresh timer. Missing a word never ends the game, because the game always runs through all eight rounds.',
  },
  {
    question: 'Does a typo break my combo?',
    answer:
      'No. Only running out of time on a word resets the combo. A wrong letter turns red and the input box turns red, and you fix it with Backspace while the timer keeps running, so a typo costs time rather than the combo itself.',
  },
  {
    question: 'How is the score calculated?',
    answer:
      'Each cleared word is worth points by its length: 10 for up to four letters, 25 for five or six letters and 50 for seven letters or more. That value is multiplied by your current combo multiplier and rounded.',
  },
  {
    question: 'How many rounds are there and how long is each?',
    answer:
      'There are eight rounds with five to ten words each. Every word has its own timer, from six seconds in round one to four and a half seconds in round eight, so a round lasts at most 30 to 45 seconds. Between rounds there is a get-ready screen and a round-complete screen with no timer.',
  },
  {
    question: 'What do accuracy and WPM mean in Word Attack?',
    answer:
      'Accuracy is the share of words you cleared out of all the words you cleared or ran out of time on. It is not keystroke accuracy, because typos are not counted. WPM is the total letters of the words you cleared, divided by five, divided by the minutes you spent actually playing. Time on the get-ready and round-complete screens is not counted.',
  },
  {
    question: 'Is my result saved if I stop partway through?',
    answer:
      'Yes. A result is saved at the end of every round. If you stop after round three, those three rounds are in your latest results and your progress. The round you were in when you left is not saved.',
  },
  {
    question: 'Does Word Attack count toward my typing progress?',
    answer:
      'Partly. Each finished round is saved as its own game session, so a full game adds up to eight sessions, and the letters of the words you clear are counted as correct key presses. Games are left out of your best WPM, best accuracy and the speed and accuracy achievements.',
  },
  {
    question: 'Is Word Attack good for improving typing speed?',
    answer:
      'It trains starting a word immediately and finishing it under a deadline, which helps with burst speed. It does not train capital letters, punctuation or long text, and its accuracy ignores typos, so use it with typing practice and the typing speed test.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Word Attack Typing Game — Eight Timed Rounds, One Word at a Time</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-03">October 3, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>Word Attack is a free typing game built around speed under a deadline. One word appears at a time, you have a few seconds to type it, and every word you clear in a row builds a combo multiplier. There are eight rounds, each harder than the last, and your score, WPM and last five games are saved in your browser.</p>
<p>Below is exactly how the game works: the round table, how the combo multiplier is calculated, what happens when a timer runs out, what the accuracy and WPM numbers mean, and where the game helps your typing and where it does not.</p>
`;

export const bodyHtml = `
<h2 id="how-to-play-word-attack">How to play Word Attack</h2>
<ol>
<li><strong>Press start.</strong> A get-ready screen shows the round number, how many words it has, the word type and the seconds you get per word. Press go when you are ready; there is no timer on this screen.</li>
<li><strong>Type the word you see.</strong> It is shown in large letters, and the letters you have typed turn gold when they are right and red when they are wrong. Case does not matter.</li>
<li><strong>It completes itself.</strong> The moment your input matches the word, it scores and the next word appears. You do not press Enter.</li>
<li><strong>Beat the clock.</strong> Each word has its own countdown, shown in seconds. When it goes under one second it turns red. If it hits zero the word is missed and the next one starts.</li>
<li><strong>Finish the round,</strong> then press next round. After round eight the game returns to the start screen with your result.</li>
</ol>
<p>If what you have typed no longer matches the start of the word, the input box turns red. Press Backspace to fix it. The timer keeps running while you do, which is the real cost of a typo.</p>

<h2 id="the-eight-rounds">The eight rounds</h2>
<table>
<thead><tr><th>Round</th><th>Words</th><th>Seconds per word</th><th>Longest possible round</th><th>Word list</th></tr></thead>
<tbody>
<tr><td>1</td><td>5</td><td>6</td><td>30 s</td><td>3-letter words</td></tr>
<tr><td>2</td><td>6</td><td>5</td><td>30 s</td><td>3-letter words</td></tr>
<tr><td>3</td><td>6</td><td>5</td><td>30 s</td><td>3- and 5-letter words</td></tr>
<tr><td>4</td><td>7</td><td>5</td><td>35 s</td><td>5-letter words</td></tr>
<tr><td>5</td><td>7</td><td>5</td><td>35 s</td><td>5-letter words</td></tr>
<tr><td>6</td><td>8</td><td>5</td><td>40 s</td><td>5-letter and long words</td></tr>
<tr><td>7</td><td>8</td><td>5</td><td>40 s</td><td>Long words (5–10 letters)</td></tr>
<tr><td>8</td><td>10</td><td>4.5</td><td>45 s</td><td>Long words (5–10 letters)</td></tr>
</tbody>
</table>
<p>Every word gets a fresh timer, so a slow word does not eat into the next. The words come from three built-in lists of lowercase English words: 60 three-letter words, 80 five-letter words and 258 longer words of 5 to 10 letters. On the get-ready screen these lists are labelled easy, medium and hard. A round is short, and the time pressure comes from the per-word timer rather than the length.</p>

<h2 id="scoring-and-combos">Scoring and the combo multiplier</h2>
<p>A cleared word is worth points by its length, then multiplied by your combo.</p>
<table>
<thead><tr><th>Word length</th><th>Base points</th></tr></thead>
<tbody>
<tr><td>Up to 4 letters</td><td>10</td></tr>
<tr><td>5 or 6 letters</td><td>25</td></tr>
<tr><td>7 letters or more</td><td>50</td></tr>
</tbody>
</table>
<table>
<thead><tr><th>Words cleared in a row</th><th>Multiplier</th></tr></thead>
<tbody>
<tr><td>1–2</td><td>x1</td></tr>
<tr><td>3–5</td><td>x1.5</td></tr>
<tr><td>6–8</td><td>x2</td></tr>
<tr><td>9–11</td><td>x2.5</td></tr>
<tr><td>12 or more</td><td>x3</td></tr>
</tbody>
</table>
<p>Points are rounded to a whole number. For example, a 7-letter word at a combo of 6 scores 50 × 2 = 100. The combo carries from one round into the next, so a long streak across rounds is where the big scores come from.</p>
<p>Only running out of time on a word resets the combo. A typo does not, so it is usually better to fix a typo quickly and keep the streak alive than to give up on the word.</p>

<h2 id="what-accuracy-and-wpm-mean">What accuracy and WPM mean in this game</h2>
<ul>
<li><strong>Accuracy</strong> is words cleared divided by words cleared plus words that ran out of time. It is <em>not</em> keystroke accuracy: mistyped letters are not counted.</li>
<li><strong>WPM</strong> is the total letters of the words you cleared, divided by five, divided by the minutes you spent playing. Time on the get-ready and round-complete screens is not counted, but the time spent on words you missed is.</li>
<li><strong>Hits and misses</strong> in your results are the same two counts: words cleared and words that timed out.</li>
</ul>

<h2 id="how-word-attack-helps-your-typing">How Word Attack helps your typing, and where it does not</h2>
<p>It is good for starting a word the instant you see it, for finishing under a deadline, and for keeping a rhythm without stopping to second-guess. The combo rewards steady, clean clearing over occasional bursts.</p>
<p>It does not train capital letters, punctuation, numbers or long passages, and since accuracy ignores typos it will not show you how clean your typing is. Treat it as a short, focused change of pace alongside <a href="/typing-practice">typing practice</a>, the <a href="/typing-lessons">lessons</a> and the <a href="/">typing speed test</a>.</p>

<h2 id="your-results-and-data">Your results and data</h2>
<ul>
<li><strong>Saved every round.</strong> A result is written at the end of each round, so stopping after round three still keeps those three rounds. The round you were in when you left is not saved.</li>
<li><strong>High score:</strong> your best points total, shown on the start screen and kept in your browser.</li>
<li><strong>Your last five games</strong> are listed under the start button, newest first, with score, WPM, words cleared and missed, accuracy, rounds played and a short coach note. The latest result also shows your best combo. One game appears as one entry that updates as you finish rounds.</li>
<li><strong>Progress page:</strong> each finished round is saved as its own game session, so one full game adds up to eight sessions. The letters of the words you clear are counted as correct key presses, but typos are not recorded as errors. Games are excluded from your best WPM, best accuracy and the speed and accuracy achievements. See the <a href="/typing-progress">progress tracker guide</a>.</li>
<li><strong>Privacy:</strong> everything is stored in your browser's local storage. There is no FreeTyper account and nothing you type is uploaded. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</li>
</ul>

<h2 id="limits-of-word-attack">Limits of this game</h2>
<ul>
<li>English words only, from three built-in lists (60, 80 and 258 words), so repeats are normal.</li>
<li>No pause during a round, and you cannot choose a starting round.</li>
<li>Accuracy ignores typos.</li>
<li>The game cannot be lost: it always runs through all eight rounds, and misses only lower your score and reset your combo.</li>
<li>Built for a physical keyboard.</li>
</ul>

<h2 id="word-attack-faq">Word Attack FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>All rounds, timers, scoring, multipliers and word lists: how the game on this page works, as described above.</li>
<li>WPM uses the five-characters-per-word convention described in the <a href="https://en.wikipedia.org/wiki/Words_per_minute" rel="noopener" target="_blank">Words per minute</a> article.</li>
<li>The advice on using the game alongside other practice is FreeTyper's own opinion.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If the game behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the game.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Start the game and read the round screen',
    text: 'Press start. The get-ready screen shows the round, the number of words and the seconds you get per word. Press go when you are ready.',
  },
  {
    name: 'Type the word shown',
    text: 'Type the word before its timer ends. It completes as soon as your input matches, with no Enter key needed. Use Backspace to fix a typo.',
  },
  {
    name: 'Build a combo',
    text: 'Clear words in a row to raise your multiplier up to x3. Running out of time on a word resets the combo.',
  },
  {
    name: 'Finish the round and continue',
    text: 'After the last word, press next round. The combo carries into the next round.',
  },
  {
    name: 'Complete all eight rounds',
    text: 'After round eight the game returns to the start screen with your score, WPM and accuracy, so you can compare with your last five games.',
  },
];
