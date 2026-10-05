/**
 * Guide content for /typing-lessons.
 *
 * Describes the course as coded in `courseData.ts` (stages, lessons, pass
 * marks), `lessonText.ts` (how each attempt's text is built),
 * `courseProgress.ts` (unlocking and migration) and `TypingLessons.tsx`.
 * If the lesson list, pass marks or unlock rule change, update this file in
 * the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-06
 */

export const meta = {
  title: 'Free Typing Lessons — Learn Touch Typing Step by Step',
  description:
    'Free typing course: 34 lessons from the home row to numbers and symbols. A live keyboard shows the next key and 95% accuracy moves you on. No signup.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do I learn touch typing?',
    answer:
      'Rest your fingers on the home row, keep your eyes on the text instead of the keys, and let each finger reach only for its own keys. Start with lesson 1 and move on only when you pass a lesson with at least 95 percent accuracy. Short daily sessions work better than rare long ones.',
  },
  {
    question: 'Are these typing lessons really free?',
    answer:
      'Yes. All 34 lessons are free to use with no account and no email address. Your progress is stored in your own browser, not on a FreeTyper account.',
  },
  {
    question: 'How long does it take to learn touch typing?',
    answer:
      'It depends mostly on how often you practice, so no honest page can promise a number of days. A better measure than the calendar is accuracy: when you can pass a lesson at 95 percent or higher without looking at the keys, you are ready for the next one.',
  },
  {
    question: 'Where should my fingers go on the keyboard?',
    answer:
      'Your left fingers rest on A, S, D and F and your right fingers on J, K, L and the semicolon key. Both thumbs rest on the space bar. The small raised bumps on F and J let you find this position without looking. Each finger then reaches up or down from its home key.',
  },
  {
    question: 'Do I have to do the lessons in order?',
    answer:
      'Yes. Only lesson 1 is open at the start. Passing a lesson, or choosing to move on after three misses, opens the next one. Any lesson you have already opened can be repeated whenever you like.',
  },
  {
    question: 'What accuracy do I need to pass a lesson?',
    answer:
      'You need 95 percent accuracy to pass a lesson, and 98 percent in the accuracy challenge (lesson 32). If you miss, the same lesson starts again with new text. After three misses a button lets you move on anyway, so you are never stuck.',
  },
  {
    question: 'Why is the text different every time?',
    answer:
      'Each attempt is built from real words, sentences or short drills that use only the keys you have unlocked so far. A retry therefore shows new text, and you cannot pass by memorising a passage.',
  },
  {
    question: 'What happened to my progress from the old seven lessons?',
    answer:
      'If you finished lessons in the earlier seven-lesson version, those finished lessons are carried over to the matching part of the new course. For example, finishing the old home row lesson marks lessons 1 to 5 as done. Nothing you passed is lost.',
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
      'Yes, in your browser on this device. Which lessons you have passed or skipped, and your latest five lesson results, are kept in local storage. Clearing your site data erases them, and a different browser or device starts from the first lesson.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Free Typing Lessons — Learn Touch Typing Step by Step</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-06">October 6, 2026</time></span>
  <span>~7 min read</span>
</p>
<p>These free typing lessons are a course of 34 short lessons in six stages. You begin with two keys on the home row, add the rest of the home row, then the top and bottom rows, then Shift and punctuation, then numbers and symbols, and finish with speed and accuracy practice. A live keyboard above the text shows which key comes next, and your progress is saved in your browser without an account.</p>
<p>Below you will find what each stage covers, exactly how the lessons unlock and what the pass mark is, how to tell when you are ready to move on, and what the course does not do.</p>
`;

export const bodyHtml = `
<h2 id="what-the-course-covers">What the typing course covers</h2>
<table>
<thead><tr><th>Stage</th><th>Lessons</th><th>What you practise</th></tr></thead>
<tbody>
<tr><td>Home row</td><td>1–5</td><td>F J, D K, S L, A and the semicolon, then G H. Key-pair drills first, then real words.</td></tr>
<tr><td>Top row</td><td>6–10</td><td>E I, R U, T Y, O P, W Q, a pair at a time.</td></tr>
<tr><td>Bottom row</td><td>11–16</td><td>V M, C and the comma, X and the full stop, Z and the slash, B N, then every letter together.</td></tr>
<tr><td>Shift and punctuation</td><td>17–22</td><td>Capitals with each Shift key, capitals and full stops, the apostrophe, question and exclamation marks, then quotes, colon, semicolon and hyphen.</td></tr>
<tr><td>Numbers and symbols</td><td>23–28</td><td>The number row in two halves, mixed numbers (dates, times, prices, phone numbers), then ! @ # $ %, ^ &amp; * ( ) and brackets and operators.</td></tr>
<tr><td>Speed and accuracy</td><td>29–34</td><td>Common words, sentences, a short passage, an accuracy challenge, speed practice and a final passage.</td></tr>
</tbody>
</table>
<p>Every lesson shows the keys it introduces and a short note on which finger moves where. The order is our own design and follows the finger map in the <a href="/keyboard-guide">keyboard guide</a>. It is not a proven method.</p>

<h2 id="how-the-lessons-work">How the lessons work</h2>
<ul>
<li><strong>New text every attempt.</strong> The text is built when you start the lesson, from real words, sentences or short drills. It only ever uses keys you have unlocked, so you are never asked for a key you have not met. The words come from a built-in list of about 900 common English words.</li>
<li><strong>A pass mark.</strong> You pass a lesson with 95% accuracy or better. The accuracy challenge (lesson 32) needs 98%.</li>
<li><strong>If you miss it,</strong> the same lesson starts again with new text and a message tells you your score. After three misses a "move on anyway" button appears, so a hard lesson never blocks you.</li>
<li><strong>If you pass,</strong> the next lesson loads straight away so you can keep typing.</li>
<li><strong>Locked in order.</strong> Only lesson 1 is open at the start. Passing or skipping a lesson opens the next. Open lessons can be repeated at any time from the stage tabs and numbered buttons at the top, but not while a run is in progress.</li>
<li><strong>Signs on the numbered buttons.</strong> A tick means passed, a skip icon means you moved on anyway, and a padlock means locked.</li>
<li><strong>A live keyboard.</strong> The next key pulses (you can switch that off in Settings), the key you press flashes green when right and red when wrong, and keys outside the current lesson are dimmed. When a capital or a shifted symbol is next, the key and the Shift key on the opposite hand are both highlighted.</li>
<li><strong>Same scoring as the speed test.</strong> WPM counts five characters as a word, accuracy is correct characters out of characters typed, and Backspace removes the character you step back over. The <a href="/">typing speed test guide</a> explains this in full.</li>
<li><strong>Your last five lesson runs</strong> are listed under the keyboard, newest first, with a short coach note on each. The newest one is a result card; for runs of 5 seconds or longer it includes a graph of your speed, a consistency score and the keys or letter pairs that went wrong, as described in the <a href="/">typing speed test guide</a>. Every attempt also counts as a session in your <a href="/typing-progress">progress</a>.
</ul>

<h2 id="how-to-learn-touch-typing-with-these-lessons">How to learn touch typing with this course</h2>
<p>This is the routine we suggest. It is our recommended approach, not a guarantee.</p>
<ol>
<li><strong>Set your hands first.</strong> Fingers on A S D F and J K L ;, thumbs on the space bar. Feel for the bumps on F and J.</li>
<li><strong>Look at the text, not the keys.</strong> The live keyboard is there so you do not need to look down.</li>
<li><strong>Go slowly enough to pass.</strong> If you keep missing the pass mark, slow down until the lesson feels clean. Speed is the result of control, not the other way round.</li>
<li><strong>Do a little every day.</strong> Ten minutes daily is easier to keep up than an hour once a week.</li>
<li><strong>Use "move on anyway" sparingly.</strong> It is there so you do not get stuck, but a skipped lesson is one you have not mastered. Come back to it later.</li>
<li><strong>Finish with practice.</strong> After the course, switch to <a href="/typing-practice">typing practice</a> for more text and take a <a href="/">typing speed test</a> to see where you stand.</li>
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
<p>The <a href="/keyboard-guide">keyboard guide</a> shows the same map colour-coded on a full keyboard, and lets you filter by finger. For capitals and shifted symbols, press the Shift key on the opposite side from the key you are typing.</p>

<h2 id="what-is-the-home-row">What is the home row?</h2>
<p>The home row is the middle row of letter keys. Your left fingers rest on A, S, D and F, your right fingers on J, K, L and the semicolon, and your thumbs on the space bar. From there every other key is one short reach away, and your fingers return to it after each reach. The raised bumps on F and J are there so your index fingers can find home by touch.</p>

<h2 id="what-lessons-do-for-your-speed">What do typing lessons actually do for your speed?</h2>
<p>Less than most lesson pages claim, and it is worth knowing. In <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">a study of 168,000 online typists</a> (Dhakal, Feit, Kristensson and Oulasvirta, CHI 2018), people who reported formal typing training were on average about 5 WPM faster than people who did not, and they left slightly fewer errors uncorrected. The effect was modest and the training was self-reported, so it does not prove that lessons cause speed.</p>
<p>The same study found that how long a key is held down differs by only about 20 ms between fast and slow typists, while the average gap between keystrokes is about 120 ms for fast typists and over 480 ms for slow ones. The authors point out that this implies most speed gains come from elsewhere, which fits what typists describe: fast typists are ahead of their fingers, reading the next word while typing the current one. Lessons support that by making finger positions automatic, so your attention is free to look ahead.</p>

<h2 id="limits-of-the-course">Limits of the course</h2>
<ul>
<li>It teaches the QWERTY layout and English text only.</li>
<li>The order and the 95% pass mark are our own design, not a proven method.</li>
<li>Text is built from a fixed list of about 900 words and a small set of sentences and passages, so you will meet familiar words and sentences.</li>
<li>It assumes a standard keyboard with Shift keys on both sides. Other layouts may place symbols differently.</li>
<li>It is for a physical keyboard, not a phone.</li>
</ul>

<h2 id="your-progress-and-privacy">Your progress and privacy</h2>
<p>Which lessons you have passed or skipped, and your latest five lesson results, are stored in your browser's local storage on this device. There is no FreeTyper account, and your typing is not uploaded. Clearing your site data resets the course to lesson 1. Visits to the site are measured with Google Analytics, along with anonymous usage counts such as that a lesson was attempted and whether it was passed; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="typing-lessons-faq">Typing lessons FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Stages, lessons, pass marks, text generation and unlocking: how the course on this page works, as described above.</li>
<li>Training and speed figures: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>Finger map and home row: the standard touch-typing layout. The 95% pass mark, the lesson order and the practice routine are FreeTyper's own design and suggestions.</li>
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
    text: 'Open the first lesson, F and J, and type the text while watching the text, not the keys. The live keyboard highlights the next key.',
  },
  {
    name: 'Pass each lesson with 95 percent accuracy',
    text: 'Read your accuracy after each attempt. If it is below the pass mark, the lesson restarts with new text; after three misses you can choose to move on anyway.',
  },
  {
    name: 'Work through the six stages in order',
    text: 'Passing a lesson opens the next. Move from the home row to the top row, bottom row, Shift and punctuation, numbers and symbols, and finally speed and accuracy.',
  },
  {
    name: 'Continue with practice',
    text: 'After the course, use typing practice for more text and take a typing speed test to measure your progress.',
  },
];
