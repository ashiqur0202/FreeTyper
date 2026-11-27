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
 * The practice screen is described from `AdaptivePractice.tsx` and `smartEngine.ts` (shared with Smart lessons); its tabs are the text types in `engine/sources.ts`.
 * If a number in the adaptive sections changes in `smartEngine.ts`, change it here in the same commit.
 *
 * Also describes the text engine (`engine/`): the checked quotes and facts libraries (`engine/library/`), the code generator
 * (`engine/code.ts`) and the sentence and word generators. If the library size or a rule changes, change it here in the same commit.
 *
 * Last real edit: 2026-11-27 (the tabs became text types: Mixed, Sentences, Quotes, Facts, Code, Custom; all adaptive)
 */

export const meta = {
  title: 'Free Typing Practice Online — Quotes, Code & Weak-Key Drills',
  description:
    'Free typing practice exercises online: checked quotes and facts, generated code, plus an adaptive plan that opens keys as you get good at them and drills the ones you miss most. No signup.',
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
      'Keep your accuracy at 95 percent or higher, keep your eyes on the text, and only speed up once your runs are clean. Rotate between kinds of text so you are not memorizing one passage, and let the adaptive plan handle the keys that keep costing you errors.',
  },
  {
    question: 'Which kind of text should I start with?',
    answer:
      'Start on Sentences, which is the default: they are built from the keys you have open, while quotes, facts and code use the whole alphabet and are harder at first. Every kind of text on this page is adaptive: the plan starts with one key, opens the next key when you are good at the ones you have, and spends most of each session on the keys that cost you the most errors. The tabs only change what the text looks like. Pick Sentences for plain practice text, Quotes for real sentences from classic books, Facts for short true statements, Code if you program, or Custom to type text you paste yourself.',
  },
  {
    question: 'How does adaptive practice choose what to drill?',
    answer:
      'Each key you have open gets a score from 0 to 1 that counts accuracy most and speed less, judged against your own median speed. Every finished text is calculated at once. Most of the text goes to up to three keys to fix (new keys first, then the lowest scores), some to keys that are almost there, and a few strong keys are repeated for review. Right after each text the scores, the plan and the difficulty are recalculated, and the next text is made from them. A new key opens when your open keys have been typed enough and their average score is high enough, with no single key far behind (see the list below). All of this stays in your browser.',
  },
  {
    question: 'Is typing practice timed?',
    answer:
      'No. A practice run ends when you finish the passage, and your WPM is worked out over the time you spent typing it. Passages are short, so one run is a noisy measure. Judge your WPM from the average of several runs, and use the timed typing speed test when you want a fixed duration.',
  },
  {
    question: 'Why is my WPM lower on the code tab?',
    answer:
      'Code is full of brackets, quotes, operators and symbols that sit far from the home row, so almost everyone types it more slowly than ordinary prose. Compare code runs only with other code runs.',
  },
  {
    question: 'Why do I keep seeing the same passages?',
    answer:
      'The quotes tab holds 36 quotes and the facts tab 55 facts, all checked against their sources. The next one is chosen to suit you: the choice favours texts with your focus keys, about as long as your level fills (one, two or three lines, by joining two or three when one is short) and about as hard as your text difficulty, and it avoids the last twelve shown. You will still see repeats. The Code and Sentences tabs are generated fresh every time, and the Custom tab repeats the text you pasted until you change it.',
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
<h2>Free Typing Practice — Adaptive Drills, Quotes, Facts, Code and Your Own Text</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-27">November 27, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>This free typing practice page gives you a short passage to type, scores it when you finish, and immediately loads the next one so you can keep going. You choose the kind of text with the tabs: a mix of everything, plain sentences, quotes from classic books, short true facts, generated code snippets, or your own pasted text. Whatever you pick, the plan behind it is the same adaptive one: it favours the keys you are slowest or least accurate on and opens new keys as you get good at the ones you have.</p>
<p>Below is how practice works here, what each kind of text contains, exactly how adaptive practice decides what to drill, and how to practice in a way that improves your accuracy as well as your speed.</p>
`;

export const bodyHtml = `
<h2 id="how-typing-practice-works">How typing practice works here</h2>
<ul>
<li><strong>Pick a kind of text</strong> with the tabs at the top of the box: Mixed, Sentences (the default), Quotes, Facts, Code or Custom. They are locked while a run is in progress, and your last choice is remembered in this browser.</li>
<li><strong>Type the passage.</strong> Practice is not timed. The run ends when you reach the end of the passage, and your WPM is measured over the time you took.</li>
<li><strong>Mistakes do not stop you.</strong> A wrong key is marked and you carry on, or press Backspace to step back. Scoring works exactly as in the <a href="/">typing speed test</a>: five characters make a word, and Backspace removes the character you step back over.</li>
<li><strong>The next passage loads straight away</strong> so you can type again with no extra click. While a run is in progress, small buttons let you swap to a different passage or restart.</li>
<li><strong>Your last five runs</strong> are listed under the keyboard as rows, newest first. Click a row to open its full result card, which includes a short coach note.</li>
</ul>

<h2 id="practice-categories">The six text types</h2>
<table>
<thead><tr><th>Tab</th><th>What it contains</th><th>Length</th></tr></thead>
<tbody>
<tr><td>Mixed</td><td>One of the four kinds below for each text, never the same kind twice in a row; code comes up less often than the others</td><td>as the kind chosen</td></tr>
<tr><td>Sentences</td><td>Words and made-up everyday sentences built from the keys you have open and your own scores, one text at a time, recalculated after each</td><td>1 to 3 lines, by level</td></tr>
<tr><td>Quotes</td><td>36 quotations, each an exact sentence or two from a public-domain book or document</td><td>about 40 to 220 characters each; two or three are joined for longer levels</td></tr>
<tr><td>Facts</td><td>55 short facts in our own words, each checked against a Wikipedia article</td><td>about 35 to 130 characters each; two or three are joined for longer levels</td></tr>
<tr><td>Code</td><td>Short snippets in JavaScript, Python, SQL, CSS and HTML, generated from templates; a row under the tabs lets you pick one language or leave it on Any</td><td>1 to 3 lines, by level</td></tr>
<tr><td>Custom</td><td>Your own text, pasted into a box (up to 5,000 characters). Curly quotes and long dashes are made plain, line breaks become spaces and characters a keyboard cannot type are dropped. We do not check it, and it repeats until you press "Change text". A long text shows three lines at a time and scrolls as you type, keeping the line you are on as the second one</td><td>as pasted</td></tr>
</tbody>
</table>
<p>Quotes and facts are chosen for you from the kind you picked (or by Mixed). Each text gets a weight: higher when it contains the keys your adaptive practice is working on (up to three), when its length is close to what your level fills (about one line for Beginner, two for Intermediate, three for Advanced), and when its difficulty (our own estimate from word length, capitals, punctuation, digits and code symbols, on the same 1 to 10 scale as your text difficulty) is close to yours; texts that use keys you have not opened yet are slightly less likely, and the last twelve shown are strongly avoided. The pick is still random, weighted by that score. When one text is much shorter than your level asks for, two or three are joined. Under the text a short line says why it was picked and where it comes from. Every kind is typed on the same adaptive screen, so each finished text moves your keys, your difficulty and your level in the same way, whichever tab it came from.</p>
<h3>Where the quotes and facts come from</h3>
<p>Each quote is an exact, word-for-word piece of a public-domain text. It was checked by machine against the full text on Project Gutenberg (only curly quotes and long dashes were changed to plain ASCII). The authors and works are Marcus Aurelius (Meditations, translated by George Long), Jane Austen (Pride and Prejudice), Lewis Carroll (Alice's Adventures in Wonderland and Through the Looking-Glass), Arthur Conan Doyle (The Adventures of Sherlock Holmes and The Hound of the Baskervilles), Henry David Thoreau (Walden), Ralph Waldo Emerson (Essays, First Series), Sun Tzu (The Art of War, translated by Lionel Giles), Herman Melville (Moby-Dick), Charles Dickens (Great Expectations, A Christmas Carol and A Tale of Two Cities), Mark Twain (The Adventures of Tom Sawyer), Oscar Wilde (The Picture of Dorian Gray), Mary Shelley (Frankenstein), Kenneth Grahame (The Wind in the Willows), Walt Whitman (Leaves of Grass), the Declaration of Independence, William Shakespeare (Hamlet) and Aesop (Three Hundred Aesop's Fables, translated by George Fyler Townsend). Famous lines that could not be found word for word in a source we opened are not included, because many popular quotes are misattributed or reworded.</p>
<p>Each fact is a short sentence in our own words, and the Wikipedia article it was checked against is named under the text (Wikipedia text is licensed CC BY-SA 4.0; the facts are re-worded statements). A fact is only included when the article contains a phrase that says the same thing. We checked them on November 24, 2026. Facts about the world can change, so tell us if one is out of date.</p>
<p>Code is generated, not copied: names and numbers are filled into templates, so no two snippets are the same. JavaScript and Python snippets are run through the real parsers in our tests to make sure they are valid. They are one line each, because the typing area has no Enter key.</p>

<h2 id="how-adaptive-practice-works">How adaptive practice works</h2>
<ol>
<li><strong>Keys unlock by skill.</strong> You start with one key (F). The keys open from easy to hard, one at a time, in this order: F J D A S L (the home row), E, K G H (the rest of the home row), then I R U T N O C M W, and last the far and rare keys B Y P V X Q Z. The next key opens when each open key has been typed enough times (5 presses for the first keys, up to 8 for the last) and the average score of your open keys is high enough (about 0.67 early, up to 0.77 late), with no single key more than 0.10 below the bar (about 0.50 early, up to 0.60 late). Easy keys ask for less and the far keys for more. Locked keys show a padlock in the row at the top. A line above the row shows Beginner, Intermediate and Advanced with a dot where you are (1 to 11 open keys, 12 to 19, 20 to 26: our own labels), and to the right the keys the session is working on now and the keys kept for review. These are the same keys as in <a href="/typing-lessons">Smart lessons</a>: a key you open in one place is open in the other.</li>
<li><strong>A score for every key.</strong> It runs from 0 to 1. Accuracy counts most (it is cubed) and speed less, and speed is judged against your own median time per key, not a fixed number, so slow and fast typists both get a fair list.</li>
<li><strong>A plan, not one key.</strong> Every text is one round. A text fills about one line of text for Beginner, two lines for Intermediate and three for Advanced, so the text grows with you (how many letters that is depends on the width of your screen). The text favours up to three keys to fix: keys with fewer than 6 presses first, then the lowest scores. Keys that score 0.65 to 0.8 get extra weight as "almost there", and two strong keys you have not typed for the longest are added for review so they do not slip. The text uses your open keys. While you have five or fewer open, the next two keys in the order are previewed in about 30 percent of the letters, so the text is not all one letter. Previewed keys are drawn with a dashed outline in the key row, do not count toward unlocking and never show as weak. The first rounds are short (about 12, 24 and 36 letters with one, two and three keys open). Beginner texts are words (real words from a bank of about 1,200 when enough fit, made-up letter groups while few keys are open). At Intermediate about half of the texts, and at Advanced most, are made-up everyday sentences when your open keys can make them, such as a person doing something with a thing in a place. The sentences are invented and say nothing about the real world; the grammar follows rules (people eat food and read books), and capitals start from difficulty 5, commas from 6 and questions from 7.</li>
<li><strong>It re-plans after every text.</strong> The moment you finish a text the scores are updated and the plan is rebuilt, so a key you just fixed leaves the focus list and the next one steps in, and the next text appears. The fold under the keyboard, "How the last text adapted", lists every change in words.</li>
<li><strong>Difficulty follows you.</strong> It runs from 1 to 10 and moves by at most one step per text: up after a text of 95% accuracy or better at a decent speed, down under 88%. Higher steps mean longer words, then capitals (from step 5), then commas and full stops (from step 6). Beginner texts stop at step 4 and Intermediate at step 7, so a typist who does well on a few keys gets longer words, not capitals and commas, until they reach the next level.</li>
<li><strong>Click a key to make it the focus.</strong> Clicking an open key in the row puts it first in the plan until you click it again. A key can open the moment you finish a text.</li>
<li><strong>Daily practice goal.</strong> The ring at the top counts today's minutes from every typing page toward a goal of 30 minutes.</li>
</ol>
<h3>Letter pairs</h3>
<p>Every letter that follows another letter is recorded as a pair. Typing "the" records "th" and "he". For each pair FreeTyper keeps how many times you typed it, how many were wrong, and the time between the two keystrokes. Spaces, digits and punctuation are not recorded as pairs, and capital and lowercase letters count as the same. A time is kept only when the key was right and came within about two seconds of the previous key, so a pause, or the key right after a Backspace, adds an error or a sample but no timing.</p>
<p>A pair's score is four times your recent error rate plus how much slower it is than your own median pair (nothing is added if it is typical or faster). A pair you miss 10% of the time scores 0.4, and one that takes twice your typical time scores 1.0. Recent typing weighs more than old typing, so a pair you have fixed drops out. A pair needs at least five samples and a score of 0.3 to be listed, and the weakest five are shown on the <a href="/typing-progress">progress page</a>.</p>
<p>The keys and pairs, with their timings, stay in this browser, are never sent to a server, and are cleared when you reset progress. Typing in any tab feeds the weak-pairs list on the progress page, including the speed test and the lessons. The key scores that drive the plan come from every tab on this page and from Smart lessons. The games count key presses but not timing. The method is our own and is not a validated training program. Use the <a href="/keyboard-guide">keyboard guide</a> if a key keeps failing and you are not sure which finger types it.</p>

<h2 id="the-letter-row">The letter row</h2>
<p>At the top of the box, on every tab, is a row of 26 boxes, one per letter, with locked keys shown with a padlock and a score bar under each open key. The bar is coloured from the key's score, so it shows at a glance which keys are solid and which are not:</p>
<table>
<thead><tr><th>Colour</th><th>Label</th><th>Key score</th></tr></thead>
<tbody>
<tr><td>Green</td><td>good</td><td>0.8 or more</td></tr>
<tr><td>Gold</td><td>okay</td><td>0.65 to 0.8</td></tr>
<tr><td>Orange</td><td>weak</td><td>0.5 to 0.65</td></tr>
<tr><td>Red</td><td>weakest</td><td>below 0.5</td></tr>
<tr><td>Empty bar</td><td>new key</td><td>not typed yet</td></tr>
</tbody>
</table>
<p>The score is the same 0 to 1 key score described above (accuracy counts most, speed less, judged against your own typing). A key you hit accurately but slowly can therefore show as weak. The bar is longer for a cleaner, faster key, so the row still works if you cannot tell the colours apart. Hover or focus a box for its accuracy, average time and number of presses. A gold ring marks the keys the current text works on, an underline marks keys kept for review, and an arrow up or down shows how a key moved with your last text.</p>
<p>Click an open letter to make it the focus of the next texts, and click it again to let the plan choose. Letters are locked while a run is in progress. Only letters a to z are shown; digits and punctuation are counted in your key statistics but have no box yet.</p>

<h2 id="the-result-card">The result card</h2>
<p>Click a run in the list under the keyboard to open its result card. It shows your WPM, accuracy and time, and how they compare with the run before it. For runs of 5 seconds or longer it adds the speed graph, a consistency score and a "weak spots" line; the <a href="/#the-speed-graph-and-weak-spots">typing speed test guide</a> explains those once for all the tools. What is specific to practice: the curve is kept only for your latest five practice runs. The "share" button works as described in the <a href="/#share-your-result-as-a-picture">speed test guide</a>.</p>

<h2 id="practice-vs-lessons-vs-speed-test">Practice, lessons or speed test: which should you use?</h2>
<ul>
<li><a href="/typing-lessons">Lessons</a> teach the keyboard in order, from the home row up. Use them if you are learning to touch type.</li>
<li><strong>Practice</strong> is free choice with real text. Use it once you know the keys and want volume. Every tab works on your weak keys.</li>
<li>The <a href="/">speed test</a> is for measuring. It runs for a fixed time and gives you net and gross WPM, so use it to check progress, not to train.</li>
</ul>

<h2 id="how-to-practice-typing-effectively">How to practice typing effectively</h2>
<p>These are our recommendations, not measured guarantees.</p>
<ol>
<li><strong>Accuracy before speed.</strong> The coach flags any run below 95% and tells you to slow down until it is clean. In a <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">study of 168,000 typists</a> (Dhakal et al., CHI 2018), slower typists left more errors uncorrected, which the authors suggest could mean they are less able to notice their mistakes. Noticing and fixing errors is part of the skill.</li>
<li><strong>Keep your eyes on the text.</strong> If you keep glancing down, go back to the <a href="/typing-lessons">lessons</a> for a while.</li>
<li><strong>Do a few clean runs, then add speed.</strong> The coach starts suggesting more speed once you string together clean runs.</li>
<li><strong>Rotate kinds of text.</strong> Mixed does it for you, or start with quotes and then mix in facts and code. Do not compare WPM across kinds: code is slower than prose for nearly everyone.</li>
<li><strong>Use Custom for what you really type.</strong> Paste a paragraph from your own work or study. We cannot check it or pick it for you, but your keys and speed still count toward your level.</li>
<li><strong>Keep sessions short and regular.</strong> Ten to twenty minutes on most days, and stop when accuracy starts to slip.</li>
</ol>

<h2 id="limits-of-typing-practice">Limits of this practice tool</h2>
<ul>
<li>The quotes and facts libraries are small (36 quotes, 55 facts), so repeats are normal. The quotes come from old books, so some wording and spelling is dated.</li>
<li>Passages are short, and runs are untimed, so WPM from a single run is rough.</li>
<li>English text and the QWERTY layout only. Custom text is cleaned to plain keyboard characters, so accented letters and emoji are dropped.</li>
<li>Adaptive practice targets letters, not fingers, and covers a to z only: digits and symbols do not unlock yet. Its numbers (6 presses, a score of 0.7, one to three lines per text) are our own starting values and have not been tested on learners.</li>
<li>For a physical keyboard, not a phone.</li>
</ul>

<h2 id="your-progress-and-privacy">Your progress and privacy</h2>
<p>Your last five practice runs, your session history and your key statistics are stored in your browser's local storage on this device. There is no FreeTyper account, and your typing is not uploaded. Clearing your site data erases the history, and a different browser or device starts empty. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="typing-practice-faq">Typing practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Text types, passage counts, scoring, adaptive practice and the letter row: how this page's tool works, as described above.</li>
<li>Error-noticing finding: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>The 95% accuracy bar, the session length and the rotation advice are FreeTyper's own recommendations.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If practice behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the tool.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose a kind of text',
    text: 'Stay on Sentences, or pick Mixed, Quotes, Facts, Code or Custom with the tabs at the top of the practice box.',
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
    text: 'The next passage loads automatically, so you can keep typing. Rotate kinds of text so you do not memorize one passage.',
  },
  {
    name: 'Let adaptive practice drill your weak keys',
    text: 'Keep typing on any tab. The plan recalculates after every text from your scores, drills the keys that cost you the most errors and opens the next key when the ones you have are good. Click an open key in the row to make it the focus.',
  },
];
