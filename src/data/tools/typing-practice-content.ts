/**
 * Guide content for /typing-practice.
 *
 * Describes `TypingPractice.tsx`, `typingData.ts` (`practiceTexts`),
 * `useTypingProgress.ts` (`getWeakKeys`) and the practice coach in
 * `PracticeFeedback.tsx`. If categories, passage counts or the weak-key logic
 * change, update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-05
 */

export const meta = {
  title: 'Free Typing Practice — Daily Drills & Weak-Key Training',
  description:
    'Free typing practice with quotes, news, code and fun passages, plus a drill built from the keys you miss most. No signup, progress stays in your browser.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How often should I practice typing?',
    answer:
      'Short and regular beats long and rare. We suggest ten to twenty minutes on most days, which is a recommendation and not a measured rule. Stop a session when your accuracy starts to slip, because practicing while tired mostly trains mistakes.',
  },
  {
    question: 'What is the best way to practice typing?',
    answer:
      'Keep your accuracy at 95 percent or higher, keep your eyes on the text, and only speed up once your runs are clean. Rotate between categories so you are not memorizing one passage, and use the weak-key drill when the same few keys keep costing you errors.',
  },
  {
    question: 'Which practice category should I start with?',
    answer:
      'Start with quotes. They are short, written in normal prose with capital letters and punctuation, and they are the closest to everyday typing. Move to news for slightly longer passages, code if you program, and fun for longer trivia passages.',
  },
  {
    question: 'How does the weak-key drill choose its words?',
    answer:
      'FreeTyper records which letter pairs you type, like th or er, how often you get each pair wrong and how long it takes you. Pairs with at least five samples are scored, and the weakest few are drilled with 40 common English words that contain them. Speed is compared only with your own typical pair, so a slow typist is not marked weak everywhere. Until there are enough pairs, the drill uses your least accurate single keys, and with no data at all it gives you a normal passage.',
  },
  {
    question: 'Is typing practice timed?',
    answer:
      'No. A practice run ends when you finish the passage, and your WPM is worked out over the time you spent typing it. Passages are short, so one run is a noisy measure. Judge your WPM from the average of several runs, and use the timed typing speed test when you want a fixed duration.',
  },
  {
    question: 'Why is my WPM lower on the code category?',
    answer:
      'Code is full of brackets, quotes, operators and symbols that sit far from the home row, so almost everyone types it more slowly than ordinary prose. Compare code runs only with other code runs.',
  },
  {
    question: 'Why do I keep seeing the same passages?',
    answer:
      'The quotes, news, code and fun categories each hold five built-in passages, twenty in all, and the next passage is chosen at random from the category you picked. Repeats are expected. The weak-key drill is generated fresh every time, so it does not repeat in the same way.',
  },
  {
    question: 'Does typing practice count toward my progress?',
    answer:
      'Yes. Each finished run is saved to your progress history with its WPM and accuracy, and every key you press updates your key statistics. The progress page shows your history and your weakest keys.',
  },
  {
    question: 'Can I practice typing on my phone?',
    answer:
      'Practice is designed for a physical keyboard. Typing on a touch screen is a different skill, so practice here will not train it.',
  },
  {
    question: 'Is typing practice on FreeTyper free?',
    answer:
      'Yes. All categories and the weak-key drill are free, with no account and no email address needed.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Free Typing Practice — Quotes, News, Code and Weak-Key Drills</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-05">October 5, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>This free typing practice page gives you a short passage to type, scores it when you finish, and immediately loads the next one so you can keep going. You choose the kind of text: quotes, news-style passages, code snippets or fun facts. A fifth option, weak keys, builds a drill from the letter pairs and keys you are slowest or least accurate on.</p>
<p>Below is how practice works here, what each category contains, exactly how the weak-key drill picks its words, and how to practice in a way that improves your accuracy as well as your speed.</p>
`;

export const bodyHtml = `
<h2 id="how-typing-practice-works">How typing practice works here</h2>
<ul>
<li><strong>Pick a category</strong> with the pills at the top: quotes, news, code, fun or weak keys. They are locked while a run is in progress.</li>
<li><strong>Type the passage.</strong> Practice is not timed. The run ends when you reach the end of the passage, and your WPM is measured over the time you took.</li>
<li><strong>Mistakes do not stop you.</strong> A wrong key is marked and you carry on, or press Backspace to step back. Scoring works exactly as in the <a href="/">typing speed test</a>: five characters make a word, and Backspace removes the character you step back over.</li>
<li><strong>The next passage loads straight away</strong> so you can type again with no extra click. While a run is in progress, small buttons let you swap to a different passage or restart.</li>
<li><strong>Your last five runs</strong> are listed under the keyboard, newest first, each with a short coach note.</li>
</ul>

<h2 id="practice-categories">The five practice categories</h2>
<table>
<thead><tr><th>Category</th><th>What it contains</th><th>Passage length</th></tr></thead>
<tbody>
<tr><td>Quotes</td><td>Five short quotations, with capital letters and punctuation</td><td>about 12–31 words</td></tr>
<tr><td>News</td><td>Five news-style passages on technology, space, climate, health and privacy</td><td>about 24–30 words</td></tr>
<tr><td>Code</td><td>Five snippets: a React component, Python, TypeScript, SQL and CSS</td><td>about 23–30 words</td></tr>
<tr><td>Fun</td><td>Five trivia passages, such as facts about octopuses, honey and keyboard history</td><td>about 36–41 words</td></tr>
<tr><td>Weak keys</td><td>A 40-word drill generated from your own pair and key data</td><td>40 words</td></tr>
</tbody>
</table>
<p>That is twenty built-in passages in the first four categories, and the next one is picked at random from the category you chose. You will see repeats, and that is a limit of the current text library, not a bug. Because the passages are short, a single run is a noisy measure of speed; average several runs before you draw conclusions.</p>

<h2 id="how-weak-key-drills-work">How the weak-key drill works</h2>
<ol>
<li><strong>Every letter that follows another letter is recorded as a pair.</strong> Typing "the" records "th" and "he". For each pair FreeTyper keeps how many times you typed it, how many of those were wrong, and the time between the two keystrokes. Spaces, digits and punctuation are not recorded as pairs, and capital and lowercase letters count as the same.</li>
<li><strong>Only clean timings count.</strong> A time is kept only when the key was right and came within about two seconds of the previous key. A pause, or the key right after a Backspace, adds an error or a sample but no timing.</li>
<li><strong>Each pair gets a score.</strong> It is four times your recent error rate, plus how much slower the pair is than your own median pair (nothing is added if it is typical or faster). So a pair you miss 10% of the time scores 0.4, and one that takes twice your typical time scores 1.0. Recent typing weighs more than old typing, so a pair you have fixed drops out. A pair needs at least five samples and a score of 0.3 to be listed.</li>
<li><strong>The drill uses real words.</strong> FreeTyper picks 40 words from a list of about 890 common English words. Each weak pair is guaranteed its own words first, and the rest are chosen at random, with words holding more or weaker pairs more likely. A pair that almost no word contains gets a short repeated chunk instead. The same word never appears twice in a row.</li>
<li><strong>Fallbacks.</strong> If there are not enough pairs yet, the drill uses your five least accurate single keys (at least five presses each) and says so above the text. With no data at all you get a normal passage.</li>
</ol>
<p>The pairs and their timings stay in this browser, are never sent to a server, and are cleared when you reset progress on the <a href="/typing-progress">progress page</a>, which also lists your weakest pairs. The method is our own and is not a validated training program. It finds pairs you are slow or error-prone on and gives you words that contain them. Use the <a href="/keyboard-guide">keyboard guide</a> if a pair keeps failing and you are not sure which fingers type it.</p>

<h2 id="the-letter-row">The letter row</h2>
<p>Under the category tabs is a row of 26 boxes, one per letter. Each box is coloured from your own typing history, so it shows at a glance which keys are solid and which are not:</p>
<table>
<thead><tr><th>Colour</th><th>Label</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Green</td><td>good</td><td>score below 0.15</td></tr>
<tr><td>Gold</td><td>okay</td><td>0.15 to 0.3</td></tr>
<tr><td>Orange</td><td>weak</td><td>0.3 to 0.6</td></tr>
<tr><td>Red</td><td>weakest</td><td>0.6 or more</td></tr>
<tr><td>Grey</td><td>not enough data</td><td>fewer than 10 presses</td></tr>
</tbody>
</table>
<p>The score is four times the key's error rate, plus how much slower you are into that letter than into your typical letter. The speed part comes from the letter-pair timings described above (the average time of the pairs that end in the letter) and is left out until enough pairs have timings. A key you hit accurately but slowly can therefore show as weak, which accuracy alone would miss. The short bar at the bottom of each box is longer for a cleaner, faster key, so the row still works if you cannot tell the colours apart. Hover or focus a box for its accuracy, average time and number of presses.</p>
<p>Click a letter to drill it: you get 40 real words that contain that letter, with extra weight on words holding one of your weak pairs that end in it. The same letter keeps being drilled after each run until you pick another letter, choose another tab, or press "drill my weakest instead". Letters are locked while a run is in progress. Only letters a to z are shown; digits and punctuation are counted in your key statistics but have no box yet.</p>

<h2 id="practice-vs-lessons-vs-speed-test">Practice, lessons or speed test: which should you use?</h2>
<ul>
<li><a href="/typing-lessons">Lessons</a> teach the keyboard in order, from the home row up. Use them if you are learning to touch type.</li>
<li><strong>Practice</strong> is free choice with real text. Use it once you know the keys and want volume, or to work on weak keys.</li>
<li>The <a href="/">speed test</a> is for measuring. It runs for a fixed time and gives you net and gross WPM, so use it to check progress, not to train.</li>
</ul>

<h2 id="how-to-practice-typing-effectively">How to practice typing effectively</h2>
<p>These are our recommendations, not measured guarantees.</p>
<ol>
<li><strong>Accuracy before speed.</strong> The coach flags any run below 95% and tells you to slow down until it is clean. In a <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">study of 168,000 typists</a> (Dhakal et al., CHI 2018), slower typists left more errors uncorrected, which the authors suggest could mean they are less able to notice their mistakes. Noticing and fixing errors is part of the skill.</li>
<li><strong>Keep your eyes on the text.</strong> If you keep glancing down, go back to the <a href="/typing-lessons">lessons</a> for a while.</li>
<li><strong>Do a few clean runs, then add speed.</strong> The coach starts suggesting more speed once you string together clean runs.</li>
<li><strong>Rotate categories.</strong> Start with quotes, then mix in news and code. Do not compare WPM across categories: code is slower than prose for nearly everyone.</li>
<li><strong>Bring in the weak-key drill when you are accurate overall.</strong> Once you have at least three logged runs and your latest run is 95% or better, practice offers a "drill weak keys" button.</li>
<li><strong>Keep sessions short and regular.</strong> Ten to twenty minutes on most days, and stop when accuracy starts to slip.</li>
</ol>

<h2 id="limits-of-typing-practice">Limits of this practice tool</h2>
<ul>
<li>Twenty fixed passages in four categories, so repeats are normal.</li>
<li>Passages are short, and runs are untimed, so WPM from a single run is rough.</li>
<li>English text and the QWERTY layout only.</li>
<li>The weak-key drill targets letters and letter pairs, not fingers, and needs a few hundred keystrokes before the pair data says anything useful. The letter row covers a to z only.</li>
<li>For a physical keyboard, not a phone.</li>
</ul>

<h2 id="your-progress-and-privacy">Your progress and privacy</h2>
<p>Your last five practice runs, your session history and your key statistics are stored in your browser's local storage on this device. There is no FreeTyper account, and your typing is not uploaded. Clearing your site data erases the history, and a different browser or device starts empty. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="typing-practice-faq">Typing practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Categories, passage counts, scoring and the weak-key drill: how this page's tool works, as described above.</li>
<li>Error-noticing finding: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>The 95% accuracy bar, the session length and the rotation advice are FreeTyper's own recommendations.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If practice behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the tool.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose a category',
    text: 'Pick quotes, news, code, fun or weak keys with the pills at the top of the practice page.',
  },
  {
    name: 'Type the passage',
    text: 'Start typing. Practice is not timed, and the run ends when you reach the end of the passage. Press Backspace to correct a mistake.',
  },
  {
    name: 'Read your result and coach note',
    text: 'Check your WPM, accuracy and the coach note. If accuracy is below 95 percent, slow down on the next passage.',
  },
  {
    name: 'Keep going with the next passage',
    text: 'The next passage loads automatically, so you can keep typing. Rotate categories so you do not memorize one passage.',
  },
  {
    name: 'Drill your weak keys',
    text: 'Once you have a few clean runs, choose weak keys to practice words built from the letters you miss most.',
  },
];
