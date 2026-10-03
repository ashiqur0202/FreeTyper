/**
 * Guide content for /typing-lessons.
 *
 * Describes the lessons as coded in `typingData.ts` (`lessons`) and
 * `TypingLessons.tsx`. If the lesson list, unlock rule or passages change,
 * update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-03
 */

export const meta = {
  title: 'Free Typing Lessons — Learn Touch Typing Step by Step',
  description:
    'Free typing lessons: 7 steps from the home row to sentences and numbers. A live keyboard shows the next key. No signup, progress stays in your browser.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do I learn touch typing?',
    answer:
      'Rest your fingers on the home row, keep your eyes on the text instead of the keys, and let each finger reach only for its own keys. Start with the home row lesson and move on only when you can finish a lesson with at least 95 percent accuracy. Short daily sessions work better than rare long ones.',
  },
  {
    question: 'Are these typing lessons really free?',
    answer:
      'Yes. All seven lessons are free to use with no account and no email address. Your progress is stored in your own browser, not on a FreeTyper account.',
  },
  {
    question: 'How long does it take to learn touch typing?',
    answer:
      'It depends mostly on how often you practice, so no honest page can promise a number of days. A better measure than the calendar is accuracy: when you can complete a lesson at 95 percent or higher without looking at the keys, you are ready for the next one.',
  },
  {
    question: 'Where should my fingers go on the keyboard?',
    answer:
      'Your left fingers rest on A, S, D and F and your right fingers on J, K, L and the semicolon key. Both thumbs rest on the space bar. The small raised bumps on F and J let you find this position without looking. Each finger then reaches up or down from its home key.',
  },
  {
    question: 'Do I have to do the lessons in order?',
    answer:
      'Yes. Only the first lesson is open at the start. Finishing a lesson unlocks the next one, and any lesson you have already unlocked can be repeated whenever you like by clicking it.',
  },
  {
    question: 'Does a lesson check my accuracy before unlocking the next one?',
    answer:
      'No. Reaching the end of a lesson unlocks the next one, even if you made mistakes. After each run the coach note tells you whether to repeat the lesson. As a rule, if your accuracy is below 95 percent, run the same lesson again before moving on.',
  },
  {
    question: 'Do typing lessons make you faster?',
    answer:
      'They help most with accuracy and habits. In a study of 168,000 online typists, those who reported formal training were on average about 5 WPM faster than those who did not, and left slightly fewer errors uncorrected. The gap was modest, so treat lessons as the foundation and add regular practice on top.',
  },
  {
    question: 'Can I use the typing lessons on my phone?',
    answer:
      'The lessons are designed for a physical keyboard. Touch-screen typing is a different skill, so the lessons will not teach it.',
  },
  {
    question: 'Is my lesson progress saved?',
    answer:
      'Yes, in your browser on this device. Your unlocked lessons and your latest five lesson results are kept in local storage. Clearing your site data erases them, and a different browser or device starts from the first lesson.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Free Typing Lessons — Learn Touch Typing Step by Step</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-03">October 3, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>These free typing lessons teach touch typing in seven short steps. You begin on the home row, add the top and bottom rows, then move on to common words, full sentences, numbers and symbols, and a final longer passage for building speed. A live keyboard above the text shows which key comes next, and your progress is saved in your browser without an account.</p>
<p>Below you will find what each lesson covers, exactly how the lessons unlock, how to tell when you are ready to move on, and what these seven lessons do not do.</p>
`;

export const bodyHtml = `
<h2 id="what-the-seven-lessons-cover">What the seven typing lessons cover</h2>
<table>
<thead><tr><th>#</th><th>Lesson</th><th>Keys</th><th>Passage length</th></tr></thead>
<tbody>
<tr><td>1</td><td>Home Row</td><td>A S D F J K L ;</td><td>about 50 words</td></tr>
<tr><td>2</td><td>Top Row</td><td>Q W E R T Y U I O P</td><td>about 50 words</td></tr>
<tr><td>3</td><td>Bottom Row</td><td>Z X C V B N M , .</td><td>about 50 words</td></tr>
<tr><td>4</td><td>Common Words</td><td>All letters</td><td>about 100 words</td></tr>
<tr><td>5</td><td>Sentences</td><td>All letters, capitals, punctuation</td><td>about 80 words</td></tr>
<tr><td>6</td><td>Numbers &amp; Symbols</td><td>Number row, common punctuation and symbols</td><td>about 60 words</td></tr>
<tr><td>7</td><td>Speed Building</td><td>Everything, in longer prose</td><td>about 90 words</td></tr>
</tbody>
</table>
<p>Each lesson is one passage. At beginner speed a passage takes a few minutes, so a single lesson is short by design. You are expected to repeat lessons, not to run through all seven once and be finished.</p>

<h2 id="how-the-lessons-work">How the lessons work</h2>
<ul>
<li><strong>Locked in order.</strong> Only lesson 1 is open at the start. Reaching the end of a lesson unlocks the next one, and the next lesson loads straight away so you can keep typing.</li>
<li><strong>No accuracy gate.</strong> Finishing a lesson unlocks the next, even with mistakes. The coach note under the keyboard tells you whether to repeat. Treat 95% accuracy as the bar before you move on.</li>
<li><strong>Repeat any unlocked lesson.</strong> Click its name in the row at the top (not while a run is in progress). Completed lessons show a tick and locked ones show a padlock.</li>
<li><strong>A live keyboard.</strong> The next key pulses, the key you press flashes green when right and red when wrong, and keys outside the current lesson are dimmed so your eyes stay on the keys that matter.</li>
<li><strong>Same scoring as the speed test.</strong> WPM counts five characters as a word, accuracy is correct characters out of characters typed, and Backspace removes the character you step back over. The <a href="/">typing speed test guide</a> explains this in full.</li>
<li><strong>Your last five lesson runs</strong> are listed under the keyboard, newest first, with a short coach note on each.</li>
</ul>

<h2 id="how-to-learn-touch-typing-with-these-lessons">How to learn touch typing with these lessons</h2>
<p>This is the routine we suggest. It is our recommended approach, not a guarantee.</p>
<ol>
<li><strong>Set your hands first.</strong> Fingers on A S D F and J K L ;, thumbs on the space bar. Feel for the bumps on F and J.</li>
<li><strong>Look at the text, not the keys.</strong> The live keyboard is there so you do not need to look down.</li>
<li><strong>Go slowly enough to stay accurate.</strong> If you are making mistakes, slow down until the lesson feels clean. Speed is the result of control, not the other way round.</li>
<li><strong>Repeat a lesson until two runs in a row reach 95% or more</strong>, then move on.</li>
<li><strong>Do a little every day.</strong> Ten minutes daily is easier to keep up than an hour once a week.</li>
<li><strong>Finish with practice.</strong> After lesson 7, switch to <a href="/typing-practice">typing practice</a> for more text and take a <a href="/">typing speed test</a> to see where you stand.</li>
</ol>

<h2 id="which-finger-types-which-key">Which finger types which key?</h2>
<table>
<thead><tr><th>Finger</th><th>Keys</th></tr></thead>
<tbody>
<tr><td>Left little finger</td><td>1 Q A Z</td></tr>
<tr><td>Left ring finger</td><td>2 W S X</td></tr>
<tr><td>Left middle finger</td><td>3 E D C</td></tr>
<tr><td>Left index finger</td><td>4 5 R T F G V B</td></tr>
<tr><td>Right index finger</td><td>6 7 Y U H J N M</td></tr>
<tr><td>Right middle finger</td><td>8 I K ,</td></tr>
<tr><td>Right ring finger</td><td>9 O L .</td></tr>
<tr><td>Right little finger</td><td>0 P ; and the punctuation keys to the right</td></tr>
<tr><td>Both thumbs</td><td>Space bar</td></tr>
</tbody>
</table>
<p>The <a href="/keyboard-guide">keyboard guide</a> shows the same map colour-coded on a full keyboard, and lets you filter by finger.</p>

<h2 id="what-is-the-home-row">What is the home row?</h2>
<p>The home row is the middle row of letter keys. Your left fingers rest on A, S, D and F and your right fingers on J, K, L and the semicolon. From there every other key is one short reach away, and your fingers return to it after each reach. The raised bumps on F and J are there so your index fingers can find home without your eyes.</p>

<h2 id="what-lessons-do-for-your-speed">What do typing lessons actually do for your speed?</h2>
<p>Less than most lesson pages claim, and it is worth knowing. In <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">a study of 168,000 online typists</a> (Dhakal, Feit, Kristensson and Oulasvirta, CHI 2018), people who reported formal typing training were on average about 5 WPM faster than people who did not, and they left slightly fewer errors uncorrected. The effect was modest and the training was self-reported, so it does not prove that lessons cause speed.</p>
<p>The same study found that how long a key is held down is nearly the same for fast and slow typists. The authors point out that this implies most speed gains come from elsewhere, which fits what typists describe: fast typists are ahead of their fingers, reading the next word while typing the current one. Lessons support that by making finger positions automatic, so your attention is free to look ahead.</p>

<h2 id="limits-of-these-lessons">Limits of these lessons</h2>
<ul>
<li>There are seven lessons, each one short passage. This is a foundation, not a full course.</li>
<li>They teach the QWERTY layout and English text only.</li>
<li>Nothing stops you from unlocking lessons with sloppy runs, so the accuracy discipline is yours.</li>
<li>They are for a physical keyboard, not a phone.</li>
</ul>

<h2 id="your-progress-and-privacy">Your progress and privacy</h2>
<p>Which lessons you have unlocked and finished, and your latest five lesson results, are stored in your browser's local storage on this device. There is no FreeTyper account, and your typing is not uploaded. Clearing your site data resets the lessons to lesson 1. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="typing-lessons-faq">Typing lessons FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Lesson contents, unlock rule and scoring: how the lessons on this page work, as described above.</li>
<li>Training and speed figures: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>Finger map and home row: the standard touch-typing layout. The 95% accuracy bar and the repeat-until-clean routine are FreeTyper's own recommendations.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a lesson behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the lesson.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Place your fingers on the home row',
    text: 'Rest your left fingers on A, S, D and F and your right fingers on J, K, L and the semicolon, with both thumbs on the space bar.',
  },
  {
    name: 'Start with lesson 1',
    text: 'Open the Home Row lesson and type the passage while watching the text, not the keys. The live keyboard highlights the next key.',
  },
  {
    name: 'Check your accuracy',
    text: 'After the run, read your accuracy and the coach note. Repeat the lesson until two runs in a row reach at least 95 percent.',
  },
  {
    name: 'Move through the lessons in order',
    text: 'Finishing a lesson unlocks the next. Work through top row, bottom row, common words, sentences, numbers and symbols, and speed building.',
  },
  {
    name: 'Continue with practice',
    text: 'After lesson 7, use typing practice for more text and take a typing speed test to measure your progress.',
  },
];
