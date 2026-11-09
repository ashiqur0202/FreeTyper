/**
 * Guide content for /number-row-typing-test.
 *
 * The page runs the same `TypingSpeedTest` as the home page with `numberRow` on, so scoring is the home
 * page's: timer from the first keystroke, net WPM = correct characters / 5 / minutes, accuracy = correct /
 * typed, Backspace removes the character stepped back over. What is specific here is the text (numberRow.ts:
 * groups of 2 to 6 digits, or with symbols about half the groups carry one shifted symbol), the finger hint
 * (numberRow.ts, same fingers as the Keyboard guide) and the per-digit speed strip (DigitStrip.tsx).
 * Number row runs keep their own list on the device (`freetyper-number-row-log`) and are not added to
 * progress. No outside statistics are used: we have no checked source for typical number-row speeds, and the
 * page says so. If the text, scoring, finger hints or saving change, update this file in the same commit.
 *
 * Last real edit: 2026-11-10
 */

export const numberRowPage = {
  slug: 'number-row-typing-test',
  meta: {
    title: 'Number Row Typing Test — Practice Digits and Symbols (Free)',
    description:
      'Free number row typing test: type the digits 0 to 9, or add the shifted symbols, and get net WPM, accuracy and which digit slows you down. No signup.',
  },
  howToName: 'How to Take the Number Row Typing Test',
  faqs: [
    {
      question: 'Is this a 10-key (numeric keypad) test?',
      answer:
        'No. It uses the number row above the letters, and the keyboard picture and finger hints describe that row. The page reads the character you type, not the key, so digits from a numeric keypad produce the same characters and are counted, but the hints will not match your hands. A dedicated keypad test is not part of FreeTyper.',
    },
    {
      question: 'Why do my number row results not show in my progress?',
      answer:
        'On purpose. Digits are typed at a different speed from sentences, so mixing them in would move your best WPM, your averages and your streak in a misleading way. These runs keep their own list of the last five on this device, and there is no level ladder or certificate for them.',
    },
    {
      question: 'Do the symbols need Shift?',
      answer:
        'Yes. In "with symbols" mode the text includes the shifted keys of the number row: ! @ # $ % ^ & * ( ). Hold Shift with the hand that is not typing the number, so the keyboard picture lights the right Shift for a left-hand number and the left Shift for a right-hand one.',
    },
    {
      question: 'How are digits scored compared with letters?',
      answer:
        'The same way. Five characters count as one word, and every digit, symbol and space is one character. Net WPM is your correct characters divided by five, divided by the minutes. To turn a score into keystrokes, multiply by five: 40 WPM is 200 characters a minute.',
    },
    {
      question: 'How can I get faster at typing numbers?',
      answer:
        'Our suggestion, not a tested method: first get accuracy above 95 percent on digits only, then look at the slowest digit on your result and drill that reach. Keep your other fingers on the home row and return to it after every reach. The lessons stage "Numbers &amp; symbols" teaches the number keys in steps (1 to 5, then 6 to 0, then mixed).',
    },
    {
      question: 'Can I take the number row test on a phone?',
      answer:
        'It is built for a physical keyboard. A phone number pad is a different input, and a score from it should not be compared with a keyboard score.',
    },
  ],
  howToSteps: [
    {
      name: 'Choose digits or with symbols, and a length',
      text: 'Start with digits only. The test length buttons are the same as on the speed test.',
    },
    {
      name: 'Start typing the digits',
      text: 'The clock starts on your first keystroke. Type the groups of numbers shown, using the space bar between groups.',
    },
    {
      name: 'Watch the next key and finger',
      text: 'The next key rises on the on-screen keyboard and a line above it names the finger. For a symbol it also lights Shift on the other hand.',
    },
    {
      name: 'Read your result and your slowest digit',
      text: 'You get net WPM, accuracy and a strip showing how long each digit took, with the slowest marked.',
    },
  ],
  previewHtml: `
<h2>Number Row Typing Test — Practice Digits and Symbols</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-10">November 10, 2026</time></span>
</p>
<p>This free number row typing test has you type digits, in groups of two to six, on the row above your letters. Switch on "with symbols" to add the shifted keys, such as $, %, # and &amp;. When the time ends you get your net WPM, your accuracy and a strip that shows how long each digit from 0 to 9 took, with your slowest digit marked.</p>
<p>Below: how the text is built, which finger belongs to each number key, how the score works, and what this test does not measure.</p>
`,
  bodyHtml: `
<h2 id="how-the-number-row-test-works">How the number row test works</h2>
<p>The text is made of groups of numbers separated by single spaces, so you use the space bar as you would in normal typing. Plain groups are two to six digits long and never start with a zero. In "with symbols" mode about half of the groups carry one shifted symbol, in patterns such as $482, 15%, #3071, (92), 7&amp;41, 6*4, 2^8, @317 and 905!. Between them these patterns cover all ten shifted keys of the number row.</p>
<p>The clock starts on your first keystroke. Scoring is the same as on the <a href="/">typing speed test</a>: five characters count as one word, net WPM is your correct characters divided by five, divided by the minutes, and accuracy is correct characters divided by characters typed. Backspace works the same way too, and the full method is written on the home page.</p>

<h2 id="fingers-for-the-number-row">Which finger types which number</h2>
<p>The number row is two rows above the home row, so each digit is a reach up from where the finger rests, followed by a return. The on-screen keyboard and the line above it use the same finger assignment as our <a href="/keyboard-guide">keyboard guide</a>:</p>
<table>
<thead><tr><th>Key</th><th>Finger</th><th>Shift symbol</th><th>Shift held with</th></tr></thead>
<tbody>
<tr><td>1</td><td>left little</td><td>!</td><td>right Shift</td></tr>
<tr><td>2</td><td>left ring</td><td>@</td><td>right Shift</td></tr>
<tr><td>3</td><td>left middle</td><td>#</td><td>right Shift</td></tr>
<tr><td>4</td><td>left index</td><td>$</td><td>right Shift</td></tr>
<tr><td>5</td><td>left index</td><td>%</td><td>right Shift</td></tr>
<tr><td>6</td><td>right index</td><td>^</td><td>left Shift</td></tr>
<tr><td>7</td><td>right index</td><td>&amp;</td><td>left Shift</td></tr>
<tr><td>8</td><td>right middle</td><td>*</td><td>left Shift</td></tr>
<tr><td>9</td><td>right ring</td><td>(</td><td>left Shift</td></tr>
<tr><td>0</td><td>right little</td><td>)</td><td>left Shift</td></tr>
</tbody>
</table>
<p>If you are still learning these keys, our <a href="/typing-lessons">typing lessons</a> teach them in steps in the stage called "Numbers &amp; symbols": Numbers 1 to 5, then Numbers 6 to 0, then Numbers mixed.</p>

<h2 id="your-digits-by-speed">Your digits, by speed</h2>
<p>After each run the result shows ten small tiles, one for every digit. Each one is the average time you took to reach that key after the key before it, and the slowest digit is marked. A digit needs at least two clean presses before it is shown, and a pause of two and a half seconds or more is ignored, because that is a break and not typing speed. With symbols on, a symbol is timed under its number key, so a % counts toward 5.</p>
<p>The numbers are specific to your run and your hands. A digit that looks slow in one run can be a stumble, so look for the one that stays slow over two or three runs. That is our reading, not a tested rule.</p>

<h2 id="score-in-characters">What a score means in characters</h2>
<p>Because five characters make one word, a score converts to keystrokes by multiplying by five. This is arithmetic, not a measured figure:</p>
<table>
<thead><tr><th>Net WPM</th><th>Characters a minute</th><th>Characters in 30 seconds</th></tr></thead>
<tbody>
<tr><td>20</td><td>100</td><td>50</td></tr>
<tr><td>30</td><td>150</td><td>75</td></tr>
<tr><td>40</td><td>200</td><td>100</td></tr>
<tr><td>60</td><td>300</td><td>150</td></tr>
</tbody>
</table>

<h2 id="limits-of-this-test">Limits of this test</h2>
<ul>
<li>It measures copying digits and symbols, not entering real figures from a page or a screen, which is slower.</li>
<li>We do not give typical speeds for typing numbers. We have not found a source we can check, so there is no level ladder or average here.</li>
<li>It uses the number row. A separate numeric keypad is a different skill and is not covered.</li>
<li>It is built for a physical keyboard.</li>
</ul>

<h2 id="where-your-results-go">Where your results go</h2>
<p>The latest five number row results are saved in your own browser, on this device only, in their own list. They are not added to your progress totals, so they do not change your best WPM, your averages or your streak. There is no account, and clearing your site data erases them.</p>

<h2 id="number-row-typing-test-faq">Number row typing test FAQ</h2>
FAQ_HTML

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Scoring and rules: the same as the <a href="/">typing speed test</a>, whose guide gives the full method.</li>
<li>Finger assignment: the same as our <a href="/keyboard-guide">keyboard guide</a>.</li>
<li>No outside statistics are used on this page.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If the test behaves differently from what is described here, <a href="/contact">tell us</a>.</p>
`,
};

const withFaq = <T extends { bodyHtml: string; faqs: { question: string; answer: string }[] }>(page: T): T => ({
  ...page,
  bodyHtml: page.bodyHtml.replace(
    'FAQ_HTML',
    page.faqs.map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`).join('\n'),
  ),
});

export const numberRowContent = withFaq(numberRowPage);
