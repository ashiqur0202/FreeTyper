/**
 * Guide content for /typing-game-falling-words.
 *
 * Describes `FallingWordsGame.tsx` and the tier table, scoring and word lists
 * in `gameData.ts` (`fallingWordsTiers`, `scoringRules`, `wordPools`,
 * `getWordDifficulty`). If tiers, speeds, scoring or word lists change, update
 * this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-03
 */

export const meta = {
  title: 'Falling Words Typing Game — Free Speed Training (No Signup)',
  description:
    'Free falling words typing game: type each word before it hits the bottom. 10 tiers, 3 lives, a personal high score and your last five runs. No signup.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play the falling words typing game?',
    answer:
      'Words fall from the top of the play area. Type a word in the box underneath, and when what you typed matches a falling word exactly, the word is cleared and the box empties. If a word reaches the bottom you lose one of your three lives. The game ends when you have no lives left.',
  },
  {
    question: 'How is the score calculated?',
    answer:
      'Each cleared word scores by its length: 10 points for words of up to four letters, 25 points for five or six letters, and 50 points for seven letters or more. There are no combo multipliers in this game.',
  },
  {
    question: 'How do I move up a tier?',
    answer:
      'Tiers rise as you clear more words in a single run. You need 10 cleared words for tier 2, 20 for tier 3, 36 for tier 4, 48 for tier 5, 75 for tier 6, 90 for tier 7, 126 for tier 8, 144 for tier 9 and 180 for tier 10. Each tier falls faster and shows more words at once.',
  },
  {
    question: 'Does a typing mistake cost me a life?',
    answer:
      'No. Only a word reaching the bottom costs a life. A wrong key does not count against you in the game. It does mean nothing highlights until you press Backspace, so mistakes cost you time rather than lives.',
  },
  {
    question: 'What does the accuracy number mean in this game?',
    answer:
      'It is the share of words you cleared out of all the words you cleared or dropped. It is not a keystroke accuracy like the one in the typing speed test, because mistyped letters are not counted. Only the words themselves are scored.',
  },
  {
    question: 'How is WPM calculated in falling words?',
    answer:
      'WPM is the total letters of the words you cleared, divided by five, divided by the minutes since the game started. Spaces are not typed, and time spent waiting for the first word counts, so it can read a little lower than your speed test result.',
  },
  {
    question: 'Does the game run at the same speed on every screen?',
    answer:
      'Yes. Fall speed is scaled by real elapsed time, so the game plays the same on a 60 Hz screen as on a 120 or 144 Hz one.',
  },
  {
    question: 'Does the game count toward my typing progress?',
    answer:
      'Partly. Each run is added to your session list and total typing time, and the letters of the words you clear are counted as correct key presses. Games are left out of your best WPM, best accuracy and the speed and accuracy achievements.',
  },
  {
    question: 'Is the falling words game good for improving typing speed?',
    answer:
      'It trains fast reading and quick recall of common words under time pressure, and it is a break from passages. It does not train capital letters, punctuation or long text, so use it alongside typing practice and the typing speed test.',
  },
  {
    question: 'Is my high score saved?',
    answer:
      'Yes, in your own browser using local storage, along with your last five runs. There is no account, nothing is uploaded, and clearing your site data erases them.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Falling Words Typing Game — Type Each Word Before It Lands</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-03">October 3, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>Falling Words is a free typing game. Words drop from the top of the play area and you type each one in the box below before it reaches the bottom. You have three lives, and the game gets faster and busier across ten tiers. It scores you by word length, tracks your WPM and personal best, and keeps your last five runs.</p>
<p>Below is exactly how the game works: the scoring, the tier table with how fast words fall, what the accuracy and WPM numbers mean, and where the game is a good fit for typing practice and where it is not.</p>
`;

export const bodyHtml = `
<h2 id="how-to-play-falling-words">How to play Falling Words</h2>
<ol>
<li><strong>Press start.</strong> The first word appears at the top and begins to fall.</li>
<li><strong>Type a falling word</strong> in the box under the play area. Case does not matter.</li>
<li><strong>Match it exactly.</strong> When what you have typed equals a falling word, it bursts, you score, and the box clears so you can type the next word straight away.</li>
<li><strong>Watch the bottom.</strong> If a word reaches the bottom before you finish it, you lose a heart. You have three.</li>
<li><strong>The game ends</strong> when the last heart is gone. There is no pause, and the game starts again when you press start.</li>
</ol>
<p>As you type, the part of a falling word that matches your input turns gold. If what you have typed matches no falling word, nothing highlights, and you need to press Backspace to correct it. A wrong letter never costs a life by itself, but it costs time, and time is what the falling words take from you.</p>

<h2 id="scoring">How scoring works</h2>
<table>
<thead><tr><th>Word length</th><th>Points</th></tr></thead>
<tbody>
<tr><td>Up to 4 letters</td><td>10</td></tr>
<tr><td>5 or 6 letters</td><td>25</td></tr>
<tr><td>7 letters or more</td><td>50</td></tr>
</tbody>
</table>
<p>Points depend on the length of the word you actually cleared. This game has no combo multiplier. Your best score is saved in your browser, and the start screen shows it.</p>

<h2 id="tiers-and-speed">The ten tiers: speed, word types and how to reach them</h2>
<table>
<thead><tr><th>Tier</th><th>Word list</th><th>Words on screen</th><th>Time to fall</th><th>Total words cleared to reach it</th></tr></thead>
<tbody>
<tr><td>1</td><td>3-letter words</td><td>up to 2</td><td>about 3.2 s</td><td>start</td></tr>
<tr><td>2</td><td>3-letter words</td><td>up to 3</td><td>about 2.3 s</td><td>10</td></tr>
<tr><td>3</td><td>3- and 5-letter words</td><td>up to 3</td><td>about 1.8 s</td><td>20</td></tr>
<tr><td>4</td><td>3- and 5-letter words</td><td>up to 3</td><td>about 1.4 s</td><td>36</td></tr>
<tr><td>5</td><td>5-letter words</td><td>up to 4</td><td>about 1.2 s</td><td>48</td></tr>
<tr><td>6</td><td>5-letter words</td><td>up to 4</td><td>about 1.1 s</td><td>75</td></tr>
<tr><td>7</td><td>5-letter and long words</td><td>up to 4</td><td>about 0.9 s</td><td>90</td></tr>
<tr><td>8</td><td>5-letter and long words</td><td>up to 5</td><td>about 0.8 s</td><td>126</td></tr>
<tr><td>9</td><td>Long words (5–10 letters)</td><td>up to 5</td><td>about 0.7 s</td><td>144</td></tr>
<tr><td>10</td><td>Long words (5–10 letters)</td><td>up to 6</td><td>about 0.6 s</td><td>180</td></tr>
</tbody>
</table>
<p>The times are how long a word takes to fall the full height of the play area. They are worked out from the game's speed settings and are approximate. The difficulty ramps up steeply: by tier 7 a word of seven letters or more falls in under a second, which is far beyond most typists. Do not read a low tier as failure. Reaching tier 4 or 5 already means clearing dozens of words at speed.</p>
<p>New words appear roughly every 1.5 seconds at the start and about every 0.9 seconds at the top tiers, as long as there is room on screen. The words come from three built-in lists of lowercase English words: 60 three-letter words, 80 five-letter words and 258 longer words of 5 to 10 letters. Points follow the length of the word you clear, so a five-letter word from the long list still scores 25.</p>

<h2 id="what-wpm-and-accuracy-mean-here">What WPM and accuracy mean in this game</h2>
<ul>
<li><strong>WPM</strong> is the total letters of the words you cleared, divided by five, divided by the minutes since the game began. Spaces are not typed, and the wait for the first word counts, so it can be a little lower than your <a href="/">typing speed test</a> score.</li>
<li><strong>Accuracy</strong> is words cleared divided by words cleared plus words dropped. It is <em>not</em> keystroke accuracy, because mistyped letters are not counted in this game. A run that clears 40 words and drops 10 shows 80%, however many typos you made along the way.</li>
<li><strong>Hits and misses</strong> on the result card are the same two numbers: words cleared and words dropped.</li>
</ul>

<h2 id="how-falling-words-helps-your-typing">How Falling Words helps your typing, and where it does not</h2>
<p>It is good at a few things. It trains you to read a word and begin typing it quickly, and it rewards you for finishing words cleanly instead of fixing them later, because there is no time to. It is also a break from typing passages.</p>
<p>It does not train capital letters, punctuation, numbers or long text, and because accuracy here ignores typos, it will not tell you how clean your typing is. Use it as a warm-up or a change of pace next to <a href="/typing-practice">typing practice</a>, the <a href="/typing-lessons">lessons</a> and the speed test, not as your only training.</p>

<h2 id="your-results-and-data">Your results and data</h2>
<ul>
<li><strong>High score:</strong> your best points total, saved in your browser.</li>
<li><strong>Your last five runs</strong> are listed under the start button, newest first, with score, WPM, words cleared and dropped, accuracy, tier reached and a short coach note.</li>
<li><strong>Progress page:</strong> each run is saved as a game session and adds to your typing time. The letters of words you clear are counted as correct key presses, but typos are not recorded as errors, so the games make your key accuracy look slightly better than the tests do. Games are excluded from your best WPM, best accuracy and the speed and accuracy achievements. See the <a href="/typing-progress">progress tracker guide</a>.</li>
<li><strong>Privacy:</strong> everything is stored in your browser's local storage. There is no FreeTyper account and nothing you type is uploaded. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</li>
</ul>

<h2 id="limits-of-falling-words">Limits of this game</h2>
<ul>
<li>English words only, from three built-in lists (60, 80 and 258 words), so repeats are normal.</li>
<li>No pause button, and no way to set the starting tier.</li>
<li>Accuracy ignores typos, and WPM includes the wait for the first word.</li>
<li>The steepest tiers are very hard, and few runs will reach them.</li>
<li>Built for a physical keyboard.</li>
</ul>

<h2 id="falling-words-faq">Falling Words FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>All rules, scoring, tier thresholds, speeds and word lists: how the game on this page works, as described above. Fall times are approximate and derived from the game's speed settings.</li>
<li>WPM uses the five-characters-per-word convention described in the <a href="https://en.wikipedia.org/wiki/Words_per_minute" rel="noopener" target="_blank">Words per minute</a> article.</li>
<li>The advice on using the game alongside other practice is FreeTyper's own opinion.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If the game behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the game.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Start the game',
    text: 'Press start. Words begin falling from the top of the play area, and you have three lives.',
  },
  {
    name: 'Type a falling word',
    text: 'Type any falling word in the box under the play area. The matching part turns gold as you type.',
  },
  {
    name: 'Clear it exactly',
    text: 'When your input equals a falling word, it bursts, you score points and the box clears for the next word. Use Backspace to fix a mistake.',
  },
  {
    name: 'Keep words from reaching the bottom',
    text: 'A word that reaches the bottom costs one life. The game ends when all three lives are gone.',
  },
  {
    name: 'Climb the tiers and beat your score',
    text: 'Clear more words to move up the ten tiers, then compare your score, WPM and tier with your last five runs.',
  },
];
