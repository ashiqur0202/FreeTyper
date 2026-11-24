/**
 * Guide content for /typing-practice.
 *
 * Describes `TypingPractice.tsx`, `typingData.ts` (`practiceTexts`),
 * `useTypingProgress.ts`, `letterStats.ts`, `pairStats.ts`, `pairDrill.ts` and the practice coach in
 * `PracticeFeedback.tsx`. If categories, passage counts or the adaptive logic
 * change, update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * The adaptive tab is described from `AdaptivePractice.tsx` and `smartEngine.ts` (shared with Smart lessons).
 * If a number in the adaptive sections changes in `smartEngine.ts`, change it here in the same commit.
 *
 * Last real edit: 2026-11-24 (the adaptive tab: keys unlock by skill, a session plan, a 30 minute daily goal)
 */

export const meta = {
  title: 'Free Typing Practice Online — Quotes, Code & Weak-Key Drills',
  description:
    'Free typing practice exercises online: quotes, news, code and fun passages, plus an adaptive plan that opens keys as you get good at them and drills the ones you miss most. No signup.',
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
      'Keep your accuracy at 95 percent or higher, keep your eyes on the text, and only speed up once your runs are clean. Rotate between categories so you are not memorizing one passage, and let the adaptive tab handle the keys that keep costing you errors.',
  },
  {
    question: 'Which practice category should I start with?',
    answer:
      'Stay on the adaptive tab, which is the default. It starts with six home-row keys, opens the next key when you are good at the ones you have, and spends most of each session on the keys that cost you the most errors. Switch to quotes for normal prose with capital letters and punctuation, news for slightly longer passages, code if you program, and fun for longer trivia passages.',
  },
  {
    question: 'How does adaptive practice choose what to drill?',
    answer:
      'Each key you have open gets a score from 0 to 1 that counts accuracy most and speed less, judged against your own median speed. A session is four short segments. Most of the text goes to up to three keys to fix (new keys first, then the lowest scores), some to keys that are almost there, and a few strong keys are repeated for review. After every segment the scores, the plan and the difficulty are recalculated. A new key opens when every open key has been typed at least 6 times and scores 0.7 or more. All of this stays in your browser.',
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
      'The quotes, news, code and fun categories each hold five built-in passages, twenty in all. The passages are fixed, but the next one is chosen to suit you: the choice favours passages with your focus keys, about as long as your level fills (one, two or three lines) and about as hard as your text difficulty, and it avoids the last eight shown. Repeats are still expected with so few passages. The adaptive tab is generated fresh every time, so it does not repeat in the same way.',
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
      'Yes. All categories and adaptive practice are free, with no account and no email address needed.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Free Typing Practice — Adaptive Drills, Quotes, News and Code</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-24">November 24, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>This free typing practice page gives you a short passage to type, scores it when you finish, and immediately loads the next one so you can keep going. You choose the kind of text: quotes, news-style passages, code snippets or fun facts. The first tab, adaptive, is the default: it builds each drill from the keys and letter pairs you are slowest or least accurate on.</p>
<p>Below is how practice works here, what each category contains, exactly how adaptive practice decides what to drill, and how to practice in a way that improves your accuracy as well as your speed.</p>
`;

export const bodyHtml = `
<h2 id="how-typing-practice-works">How typing practice works here</h2>
<ul>
<li><strong>Pick a category</strong> with the tabs at the top: adaptive (the default), quotes, news, code or fun. They are locked while a run is in progress.</li>
<li><strong>Type the passage.</strong> Practice is not timed. The run ends when you reach the end of the passage, and your WPM is measured over the time you took.</li>
<li><strong>Mistakes do not stop you.</strong> A wrong key is marked and you carry on, or press Backspace to step back. Scoring works exactly as in the <a href="/">typing speed test</a>: five characters make a word, and Backspace removes the character you step back over.</li>
<li><strong>The next passage loads straight away</strong> so you can type again with no extra click. While a run is in progress, small buttons let you swap to a different passage or restart.</li>
<li><strong>Your last five runs</strong> are listed under the keyboard as rows, newest first. Click a row to open its full result card, which includes a short coach note.</li>
</ul>

<h2 id="practice-categories">The five practice tabs</h2>
<table>
<thead><tr><th>Tab</th><th>What it contains</th><th>Passage length</th></tr></thead>
<tbody>
<tr><td>Adaptive</td><td>Four segments per session, built from the keys you have open and your own scores</td><td>1 to 3 lines per segment, by level</td></tr>
<tr><td>Quotes</td><td>Five short quotations, with capital letters and punctuation</td><td>about 12–31 words</td></tr>
<tr><td>News</td><td>Five news-style passages on technology, space, climate, health and privacy</td><td>about 24–30 words</td></tr>
<tr><td>Code</td><td>Five snippets: a React component, Python, TypeScript, SQL and CSS</td><td>about 23–30 words</td></tr>
<tr><td>Fun</td><td>Five trivia passages, such as facts about octopuses, honey and keyboard history</td><td>about 36–41 words</td></tr>
</tbody>
</table>
<p>That is twenty built-in passages in the quotes, news, code and fun tabs, and the next one is chosen for you from the category you picked. Each passage gets a weight: higher when it contains the keys your adaptive practice is working on (up to three), when its length is close to what your level fills (about one line for Beginner, two for Intermediate, three for Advanced), and when its difficulty (our own estimate from word length, capitals, punctuation, digits and code symbols, on the same 1 to 10 scale as your text difficulty) is close to yours; passages that use keys you have not opened yet are slightly less likely, and the last eight shown are strongly avoided. The pick is still random, weighted by that score. Under the text a short line says why it was picked. Your scores come only from the adaptive tab and Smart lessons, so these tabs read your progress but do not change it. You will still see repeats, and that is a limit of the current text library, not a bug. Because the passages are short, a single run is a noisy measure of speed; average several runs before you draw conclusions.</p>

<h2 id="how-adaptive-practice-works">How adaptive practice works</h2>
<ol>
<li><strong>Keys unlock by skill.</strong> You start with six home-row keys (F J D K S L). The keys then open in this order: A E G H I O R T U N M C B W Y P V Q X Z. The next key opens when every open key has been typed at least 6 times and scores 0.7 or more. Locked keys show a padlock in the row at the top. A line above the row shows Beginner, Intermediate and Advanced with a dot where you are (6 to 11 open keys, 12 to 19, 20 to 26: our own labels), and to the right the keys the session is working on now and the keys kept for review. These are the same keys as in <a href="/typing-lessons">Smart lessons</a>: a key you open in one place is open in the other.</li>
<li><strong>A score for every key.</strong> It runs from 0 to 1. Accuracy counts most (it is cubed) and speed less, and speed is judged against your own median time per key, not a fixed number, so slow and fast typists both get a fair list.</li>
<li><strong>A plan, not one key.</strong> Each session is four segments. A segment fills about one line of text for Beginner, two lines for Intermediate and three for Advanced, so the text grows with you (how many letters that is depends on the width of your screen). The text favours up to three keys to fix: keys with fewer than 6 presses first, then the lowest scores. Keys that score 0.65 to 0.8 get extra weight as "almost there", and two strong keys you have not typed for the longest are added for review so they do not slip. The words come from the same list of about 890 common English words, using only open keys, with made-up letter groups filling in while few keys are open.</li>
<li><strong>It re-plans during the session.</strong> After every segment the scores are updated and the plan is rebuilt, so a key you just fixed leaves the focus list and the next one steps in. The fold under the keyboard, "How this session adapted", lists every change in words.</li>
<li><strong>Difficulty follows you.</strong> It runs from 1 to 10 and moves by at most one step away from where the session started: up after a segment of 95% accuracy or better at a decent speed, down under 88%. Higher steps mean longer words, then capitals (from step 5), then commas and full stops (from step 6).</li>
<li><strong>Click a key to make it the focus.</strong> Clicking an open key in the row puts it first in the plan until you click it again. Keys never unlock in the middle of a session, only at its end.</li>
<li><strong>Daily practice goal.</strong> The ring at the top counts today's minutes from every typing page toward a goal of 30 minutes.</li>
</ol>
<h3>Letter pairs</h3>
<p>Every letter that follows another letter is recorded as a pair. Typing "the" records "th" and "he". For each pair FreeTyper keeps how many times you typed it, how many were wrong, and the time between the two keystrokes. Spaces, digits and punctuation are not recorded as pairs, and capital and lowercase letters count as the same. A time is kept only when the key was right and came within about two seconds of the previous key, so a pause, or the key right after a Backspace, adds an error or a sample but no timing.</p>
<p>A pair's score is four times your recent error rate plus how much slower it is than your own median pair (nothing is added if it is typical or faster). A pair you miss 10% of the time scores 0.4, and one that takes twice your typical time scores 1.0. Recent typing weighs more than old typing, so a pair you have fixed drops out. A pair needs at least five samples and a score of 0.3 to be listed, and the weakest five are shown on the <a href="/typing-progress">progress page</a>.</p>
<p>The keys and pairs, with their timings, stay in this browser, are never sent to a server, and are cleared when you reset progress. Typing in any tab feeds the letter row and the weak-pairs list on the progress page, including quotes, news, code, the speed test and the lessons. The key scores that drive the adaptive tab come only from the adaptive tab and Smart lessons. The games count key presses but not timing. The method is our own and is not a validated training program. Use the <a href="/keyboard-guide">keyboard guide</a> if a key keeps failing and you are not sure which finger types it.</p>

<h2 id="the-letter-row">The letter row</h2>
<p>On the quotes, news, code and fun tabs, under the category tabs, is a row of 26 boxes, one per letter. (The adaptive tab has its own row at the top, with locked keys and a score bar under each open key.) Each box is coloured from your own typing history, so it shows at a glance which keys are solid and which are not:</p>
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
<p>The score is four times the key's error rate, plus how much slower you are into that letter than into your typical letter. The speed part comes from the letter-pair timings described above (the average time of the pairs that end in the letter) and is left out until enough pairs have timings. A key you hit accurately but slowly can therefore show as weak, which accuracy alone would miss. The short bar at the bottom of each box is longer for a cleaner, faster key, so the row still works if you cannot tell the colours apart. Hover or focus a box for its accuracy, average time and number of presses. The ring and arrow mark the key being drilled right now, and the small question mark next to the "good" count opens a legend with these colours.</p>
<p>Click a letter to open the adaptive tab with that key as the focus (if the key is already open there). Letters are locked while a run is in progress. Only letters a to z are shown; digits and punctuation are counted in your key statistics but have no box yet.</p>

<h2 id="the-result-card">The result card</h2>
<p>Click a run in the list under the keyboard to open its result card. It shows your WPM, accuracy and time, and how they compare with the run before it. For runs of 5 seconds or longer it adds the speed graph, a consistency score and a "weak spots" line; the <a href="/#the-speed-graph-and-weak-spots">typing speed test guide</a> explains those once for all the tools. What is specific to practice: the "drill these" button under the weak spots switches to the adaptive tab, and the curve is kept only for your latest five practice runs. The "share" button works as described in the <a href="/#share-your-result-as-a-picture">speed test guide</a>.</p>

<h2 id="practice-vs-lessons-vs-speed-test">Practice, lessons or speed test: which should you use?</h2>
<ul>
<li><a href="/typing-lessons">Lessons</a> teach the keyboard in order, from the home row up. Use them if you are learning to touch type.</li>
<li><strong>Practice</strong> is free choice with real text. Use it once you know the keys and want volume. The adaptive tab works on your weak keys.</li>
<li>The <a href="/">speed test</a> is for measuring. It runs for a fixed time and gives you net and gross WPM, so use it to check progress, not to train.</li>
</ul>

<h2 id="how-to-practice-typing-effectively">How to practice typing effectively</h2>
<p>These are our recommendations, not measured guarantees.</p>
<ol>
<li><strong>Accuracy before speed.</strong> The coach flags any run below 95% and tells you to slow down until it is clean. In a <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">study of 168,000 typists</a> (Dhakal et al., CHI 2018), slower typists left more errors uncorrected, which the authors suggest could mean they are less able to notice their mistakes. Noticing and fixing errors is part of the skill.</li>
<li><strong>Keep your eyes on the text.</strong> If you keep glancing down, go back to the <a href="/typing-lessons">lessons</a> for a while.</li>
<li><strong>Do a few clean runs, then add speed.</strong> The coach starts suggesting more speed once you string together clean runs.</li>
<li><strong>Rotate categories.</strong> Start with quotes, then mix in news and code. Do not compare WPM across categories: code is slower than prose for nearly everyone.</li>
<li><strong>Stay on adaptive when you are accurate overall.</strong> It is the default tab. After three logged runs with 95% accuracy or better, the result card also offers an "adaptive practice" button if you have switched to another tab.</li>
<li><strong>Keep sessions short and regular.</strong> Ten to twenty minutes on most days, and stop when accuracy starts to slip.</li>
</ol>

<h2 id="limits-of-typing-practice">Limits of this practice tool</h2>
<ul>
<li>Twenty fixed passages in the quotes, news, code and fun tabs, so repeats are normal.</li>
<li>Passages are short, and runs are untimed, so WPM from a single run is rough.</li>
<li>English text and the QWERTY layout only.</li>
<li>Adaptive practice targets letters, not fingers, and covers a to z only: digits and symbols do not unlock yet. Its numbers (6 presses, a score of 0.7, one to three lines per segment, four segments a session) are our own starting values and have not been tested on learners.</li>
<li>For a physical keyboard, not a phone.</li>
</ul>

<h2 id="your-progress-and-privacy">Your progress and privacy</h2>
<p>Your last five practice runs, your session history and your key statistics are stored in your browser's local storage on this device. There is no FreeTyper account, and your typing is not uploaded. Clearing your site data erases the history, and a different browser or device starts empty. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="typing-practice-faq">Typing practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Tabs, passage counts, scoring, adaptive practice and the letter row: how this page's tool works, as described above.</li>
<li>Error-noticing finding: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>The 95% accuracy bar, the session length and the rotation advice are FreeTyper's own recommendations.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If practice behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the tool.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose a tab',
    text: 'Stay on adaptive, or pick quotes, news, code or fun with the tabs at the top of the practice page.',
  },
  {
    name: 'Type the passage',
    text: 'Start typing. Practice is not timed, and the run ends when you reach the end of the passage. Press Backspace to correct a mistake.',
  },
  {
    name: 'Read your result and coach note',
    text: 'Click your latest run in the list under the keyboard to see your WPM, accuracy and the coach note. If accuracy is below 95 percent, slow down on the next passage.',
  },
  {
    name: 'Keep going with the next passage',
    text: 'The next passage loads automatically, so you can keep typing. Rotate categories so you do not memorize one passage.',
  },
  {
    name: 'Let adaptive practice drill your weak keys',
    text: 'Keep typing on the adaptive tab. It plans each session from your scores, drills the keys that cost you the most errors and opens the next key when the ones you have are good. Click an open key in the row to make it the focus.',
  },
];
