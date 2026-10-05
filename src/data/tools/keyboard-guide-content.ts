/**
 * Guide content for /keyboard-guide.
 *
 * Describes `KeyboardGuide.tsx` and the finger map in `typingData.ts`
 * (`fingerMap`, `keyboardColors`, `keyboardRows`, `homeRowKeys`). If the map,
 * colours or filters change, update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-10-05
 */

export const meta = {
  title: 'Keyboard Guide — Touch Typing Finger Placement Map (Free)',
  description:
    'A colour-coded keyboard showing which finger types each key, with a home-row mode and your own key accuracy. Free, no signup, QWERTY.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Which finger types which key on a keyboard?',
    answer:
      'In standard touch typing, each finger owns a column of keys. The left little finger takes the backtick, 1, Q, A and Z. The left ring finger takes 2, W, S and X. The left middle finger takes 3, E, D and C. The left index finger takes 4, 5, R, T, F, G, V and B. The right index finger takes 6, 7, Y, U, H, J, N and M. The right middle finger takes 8, I, K and the comma. The right ring finger takes 9, O, L and the full stop. The right little finger takes 0, minus, equals, P, the brackets, backslash, semicolon, apostrophe and slash.',
  },
  {
    question: 'What is the home row on a keyboard?',
    answer:
      'The home row is the middle row of letter keys. Your left fingers rest on A, S, D and F and your right fingers on J, K, L and the semicolon. Every other key is a short reach from there, and your fingers return to it after each reach.',
  },
  {
    question: 'Why are there small bumps on the F and J keys?',
    answer:
      'The bumps are tactile markers. They let your index fingers find the home position by touch, so you can set your hands correctly without looking at the keyboard.',
  },
  {
    question: 'Which finger presses the space bar?',
    answer:
      'Either thumb. Most people favor one thumb out of habit. The guide marks the space bar in neutral grey and labels it as either thumb, because it does not belong to any of the eight finger zones.',
  },
  {
    question: 'Which fingers type the number row?',
    answer:
      'The number row follows the same columns as the letters above the home row. 1 is the left little finger, 2 the left ring, 3 the left middle, and 4 and 5 the left index. 6 and 7 are the right index, 8 the right middle, 9 the right ring, and 0 the right little finger.',
  },
  {
    question: 'How does the guide know which keys are my weak keys?',
    answer:
      'FreeTyper counts how many times you press each key and how many of those presses are correct, across the speed test, lessons, practice and the games. A key needs at least five presses to be considered. The five with the lowest accuracy are listed as your weak keys.',
  },
  {
    question: 'Do I need to use all ten fingers to type fast?',
    answer:
      'Not strictly. A research paper on 168,000 typists cites earlier work finding that people who do not use all their fingers and have no touch-typing training can still type as fast as touch typists. The analysis in the paper itself suggests that consistency matters more than any particular finger map. The map is still the most dependable way to build that consistency from scratch.',
  },
  {
    question: 'Does the keyboard guide cover Dvorak or Colemak?',
    answer:
      'No. The guide shows the standard QWERTY layout only, and it does not show modifier keys such as Shift, Enter, Tab or Backspace.',
  },
  {
    question: 'Is my key data saved or shared?',
    answer:
      'Your key statistics are stored in your own browser using local storage, on this device only. FreeTyper has no accounts and does not upload what you type. Clearing your site data erases them.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Keyboard Guide — Color-Coded Finger Placement for Touch Typing</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-05">October 5, 2026</time></span>
  <span>~6 min read</span>
</p>
<p>This keyboard guide shows the correct finger placement for each key on a standard QWERTY keyboard. Every key is coloured by the finger that owns it, the eight home-row keys carry a small dot, and you can click or hover over any key to see its finger and your own accuracy on it. It is a reference for learning touch typing and for working out why certain keys keep going wrong.</p>
<p>Below you will find how to use the guide, the full finger map in text form, what your key statistics mean, and where the guide stops being useful.</p>
`;

export const bodyHtml = `
<h2 id="how-to-use-the-keyboard-guide">How to use the keyboard guide</h2>
<ul>
<li><strong>Hover or click a key.</strong> A panel under the keyboard shows the key, the finger that types it, and, if it is a home-row key, a "home row rest position" note. The F key is selected when the page opens.</li>
<li><strong>Filter by finger.</strong> The pills at the top let you light up one finger's keys and dim the rest: left little, ring, middle and index, then right index, middle, ring and little.</li>
<li><strong>Home row only.</strong> This toggle dims everything except the eight home-row keys (and leaves the space bar lit), so you can focus on the resting position.</li>
<li><strong>Your stats.</strong> The panel also shows how many times you have pressed that key, your accuracy on it, and your error count. A key where your accuracy is under 90% gets a faint glow around it.</li>
<li><strong>Weak keys.</strong> Up to five of your least accurate keys are listed as buttons. Click one to jump to it, or follow the link to <a href="/typing-practice">adaptive practice</a>, which drills your weakest key (and its slow letter pairs) in real words.</li>
</ul>

<h2 id="which-finger-types-which-key">Which finger types which key? The full finger placement chart</h2>
<p>This is the same map the colours on the keyboard use.</p>
<table>
<thead><tr><th>Finger</th><th>Colour</th><th>Keys</th></tr></thead>
<tbody>
<tr><td>Left little</td><td>Red</td><td>\` 1 Q A Z</td></tr>
<tr><td>Left ring</td><td>Orange</td><td>2 W S X</td></tr>
<tr><td>Left middle</td><td>Yellow</td><td>3 E D C</td></tr>
<tr><td>Left index</td><td>Green</td><td>4 5 R T F G V B</td></tr>
<tr><td>Right index</td><td>Cyan</td><td>6 7 Y U H J N M</td></tr>
<tr><td>Right middle</td><td>Blue</td><td>8 I K ,</td></tr>
<tr><td>Right ring</td><td>Violet</td><td>9 O L .</td></tr>
<tr><td>Right little</td><td>Pink</td><td>0 - = P [ ] \\ ; ' /</td></tr>
<tr><td>Either thumb</td><td>Grey</td><td>Space bar</td></tr>
</tbody>
</table>
<p>This is the standard textbook assignment. The guide does not show Shift, Enter, Tab or Backspace. By the usual convention you press Shift with the little finger on the opposite hand from the letter you are capitalising, and reach for Enter and Backspace with the right little finger.</p>

<h2 id="home-row-and-the-f-and-j-bumps">The home row and the F and J bumps</h2>
<p>The home row is the middle row of letters. Your left fingers rest on A, S, D and F, your right fingers on J, K, L and the semicolon, and your thumbs on the space bar. The raised bumps on F and J are there so your index fingers can find home by touch. After every reach, return to that position: it is what keeps every other key a short, consistent distance away.</p>

<h2 id="reading-your-key-stats">Reading your key statistics</h2>
<ul>
<li><strong>Presses</strong> counts every time you have typed that key, in the speed test, lessons, practice and the games. Capital and lowercase letters count as the same key in the tests, lessons and practice.</li>
<li><strong>Accuracy</strong> is correct presses divided by all presses of that key.</li>
<li><strong>Weak keys</strong> are the five keys with the lowest accuracy, among keys you have pressed at least five times. A key you have hardly used cannot be called weak, so it will not appear until it has enough data.</li>
</ul>
<p>Use the pattern, not just the list. If your weak keys are mostly on the outer columns, such as Q, A, Z, P, the semicolon and the slash, the little fingers are the likely cause. If they are in the middle of the board, such as T, G, B, Y, H and N, it is often an index-finger reach problem. This is a pattern worth checking, not a diagnosis.</p>

<h2 id="using-the-finger-map-to-learn-touch-typing">Using the finger placement map to learn touch typing</h2>
<p>These are our recommendations, not guarantees.</p>
<ol>
<li><strong>Study the home row first.</strong> Switch on "home row only" and set your hands to match.</li>
<li><strong>Add one finger at a time.</strong> Use the filters to look at a finger's whole column, then practice those keys.</li>
<li><strong>Learn by doing.</strong> The <a href="/typing-lessons">typing lessons</a> introduce the rows in order, and the finger map is the reference to check when a key confuses you.</li>
<li><strong>Return to home after each reach.</strong> Do not let your hands drift.</li>
<li><strong>Come back with data.</strong> After some practice, return to the guide and see which keys have the lowest accuracy.</li>
</ol>

<h2 id="finger-map-and-typing-speed">Does the finger map decide how fast you type?</h2>
<p>Not by itself. In <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">a study of 168,000 online typists</a> (Dhakal, Feit, Kristensson and Oulasvirta, CHI 2018), the authors cite earlier work finding that people who do not use all their fingers, and have no touch-typing training, can still reach speeds comparable to touch typists. In their own analysis, which finger presses which key did not on its own explain why some typists were fast and others slow. Consistency in moving between awkward letter pairs mattered more.</p>
<p>That does not make the map pointless. A fixed finger for each key is the most dependable way to build consistency when you are starting out, because it removes guessing. Treat it as a starting framework, and let your own accuracy data tell you where you still need work.</p>

<h2 id="limits-of-the-keyboard-guide">Limits of the keyboard guide</h2>
<ul>
<li>QWERTY only. There is no Dvorak or Colemak view.</li>
<li>It draws the main character keys and the space bar, not Shift, Enter, Tab, Backspace or the function keys.</li>
<li>It shows the standard textbook finger assignment. Individual hands and habits vary, and this is not ergonomic or medical advice.</li>
<li>Your stats reflect typing on this device and browser only.</li>
</ul>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Your key statistics are stored in your browser's local storage on this device. There is no FreeTyper account, and what you type is not uploaded. Clearing your site data erases them. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="keyboard-guide-faq">Keyboard guide FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Finger map, colours, filters and key statistics: how the guide on this page works, as described above. The map is the standard touch-typing assignment.</li>
<li>Finger-use findings: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>The routine and the weak-key pattern notes are FreeTyper's own suggestions.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a key is mapped to a finger you disagree with, or the guide behaves differently from this page, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Set your hands on the home row',
    text: 'Switch on home row only, then rest your left fingers on A, S, D and F and your right fingers on J, K, L and the semicolon. Use the bumps on F and J to find the position by touch.',
  },
  {
    name: 'Click a key to see its finger',
    text: 'Hover over or click any key to see which finger types it and the colour of that finger zone.',
  },
  {
    name: 'Filter by one finger',
    text: 'Use the finger pills at the top to light up only one finger\'s keys and study its column.',
  },
  {
    name: 'Check your weak keys',
    text: 'After some typing, return to see your key statistics and the five keys with the lowest accuracy.',
  },
  {
    name: 'Practice the keys you miss',
    text: 'Follow the link to the adaptive tab in typing practice, which drills your weakest key in real words, then repeat.',
  },
];
