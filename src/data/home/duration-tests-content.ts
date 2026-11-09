/**
 * Guide content for the three test-length pages: /1-minute-typing-test,
 * /3-minute-typing-test and /5-minute-typing-test.
 *
 * Each page runs the same `TypingSpeedTest` with a different starting length
 * (`initialDuration`), so scoring is exactly the home page's: timer from the
 * first keystroke, net WPM = correct characters / 5 / minutes, accuracy =
 * correct / typed, Backspace removes the character stepped back over. The full
 * method lives on the home page guide (`typing-speed-content.ts`); these pages
 * only say what is specific to each length and link there. If scoring or the
 * test lengths change, update this file in the same commit.
 *
 * The only outside figure used is Dhakal et al., CHI 2018 (mean 51.56 WPM,
 * SD 20.2, 168,960 volunteers; top 10 % above about 78, bottom 10 % below
 * about 26), checked against the paper's results table on 2026-11-08.
 *
 * Last real edit: 2026-11-10
 */

export type DurationPage = {
  minutes: 1 | 3 | 5;
  slug: string;
  seconds: number;
  meta: { title: string; description: string };
  previewHtml: string;
  bodyHtml: string;
  faqs: { question: string; answer: string }[];
  howToSteps: { name: string; text: string }[];
  howToName: string;
};

const byline = (): string => `
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-10">November 10, 2026</time></span>
</p>`;

const sourcesHtml = (extra: string): string => `
<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Scoring and rules: how the test on this page works, the same as the <a href="/">typing speed test</a>. The full method is written there.</li>
<li>Typical-speed figures: Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
${extra}
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If the test behaves differently from what is described here, <a href="/contact">tell me</a> and I will fix the page or the test.</p>`;

const oneMinute: DurationPage = {
  minutes: 1,
  slug: '1-minute-typing-test',
  seconds: 60,
  meta: {
    title: '1 Minute Typing Test — Free WPM Check, No Signup',
    description:
      'Take a free 1 minute typing test: the timer starts on your first key, and you get net WPM, accuracy and a speed graph. Nothing to install, no signup.',
  },
  howToName: 'How to Take a 1 Minute Typing Test',
  faqs: [
    {
      question: 'How many words do I need to type in a 1 minute typing test?',
      answer:
        'There is no number to reach. Your score is words per minute, where a word is five typed characters, so it is whatever you manage in the 60 seconds. The passage is long enough that even a very fast typist, about 300 words a minute, would not run out.',
    },
    {
      question: 'Is a 1 minute typing test accurate?',
      answer:
        'It is a quick check, not a precise measure. In a short run one slow stretch or one lucky stretch counts for more, so two runs can differ noticeably. Take three and read the middle one, or use the 3 minute test for a steadier number.',
    },
    {
      question: 'When does the 60 seconds start?',
      answer:
        'On your first keystroke, not when the page loads. You can read the text first, then start typing.',
    },
    {
      question: 'Can I fix mistakes during the test?',
      answer:
        'Yes. Backspace removes the character you step back over from the count, so a corrected mistake stops being an error, but the time spent fixing it still counts. The home page guide explains this in full.',
    },
    {
      question: 'Is my 1 minute score saved?',
      answer:
        'Only in your own browser. The latest five test results are kept on this device, and the totals feed your progress page. There is no account, and clearing your site data erases them.',
    },
  ],
  howToSteps: [
    {
      name: 'Click the text and read the first words',
      text: 'The test is set to 1 minute. Nothing runs until you type.',
    },
    {
      name: 'Start typing',
      text: 'The 60 seconds begin on your first keystroke. Type the text as shown, and use Backspace to fix a mistake.',
    },
    {
      name: 'Read your result',
      text: 'When the time ends you get net WPM, accuracy, a speed graph and the weak spots from the run.',
    },
    {
      name: 'Repeat twice and compare',
      text: 'One short run is noisy. Take two or three runs and look at the middle score.',
    },
  ],
  previewHtml: `
<h2>1 Minute Typing Test — Check Your WPM in 60 Seconds</h2>${byline()}
<p>This is a free 1 minute typing test. Press a key to start the 60 seconds, type the text, and you get your net words per minute, your accuracy and a graph of your speed through the minute. It is the fastest way to see roughly where you stand.</p>
<p>Below: what a single minute can and cannot tell you, what typical scores look like, and when a longer test gives a better answer.</p>
`,
  bodyHtml: `
<h2 id="how-the-1-minute-test-works">How this 1 minute test works</h2>
<p>The clock starts on your first keystroke and stops at 60 seconds. Net WPM is your correct characters divided by five, divided by the minutes; at one minute that is simply your correct characters divided by five. Accuracy is correct characters out of all characters typed. You can switch the text between words, sentences and code above the passage. The same rules apply on every length, and the <a href="/">typing speed test guide</a> explains them, including what Backspace does to your score.</p>

<h2 id="what-one-minute-shows">What one minute shows, and what it does not</h2>
<p>A minute is long enough to show your usual speed on a text you have not seen. It is short enough that one stumble, a slow start or a lucky run of easy words moves the number. That is plain arithmetic, not a measured figure. Our suggestion is to take three runs and trust the middle one, and to compare scores only on the same text type.</p>
<p>The speed graph under your result shows where the minute went. A dip in the gold line is a hard stretch; a wide gap to the dashed grey line means mistakes were costing you time.</p>

<h2 id="typical-scores">What typical scores look like</h2>
<p>In a study of 168,960 volunteers copying sentences (Dhakal and colleagues, CHI 2018), the mean was 51.56 WPM with a standard deviation of 20.2. The fastest tenth were above about 78 WPM and the slowest tenth below about 26. The volunteers chose to take part and the task was short sentences, so treat these as a reference point, not a target. Our post on <a href="/blog/good-typing-speed">what a good typing speed is</a> goes through the numbers and their limits.</p>

<h2 id="score-in-characters">What a 1 minute score means in characters</h2>
<p>Because the test is exactly one minute, your net WPM is your correct characters divided by five, nothing more. That makes it easy to turn a score into keystrokes. The table is plain arithmetic from the scoring rule, not data from users.</p>
<table>
<thead><tr><th>Net WPM</th><th>Correct characters in 60 seconds</th><th>About how many keys a second</th></tr></thead>
<tbody>
<tr><td>20</td><td>100</td><td>1.7</td></tr>
<tr><td>40</td><td>200</td><td>3.3</td></tr>
<tr><td>60</td><td>300</td><td>5</td></tr>
<tr><td>80</td><td>400</td><td>6.7</td></tr>
<tr><td>100</td><td>500</td><td>8.3</td></tr>
</tbody>
</table>
<p>Spaces and punctuation count as characters, so a "word" here is five characters, not a dictionary word. A typist who makes ten extra mistakes loses those keystrokes from the total, which is why accuracy and speed are shown together.</p>

<h2 id="getting-a-reliable-1-minute-score">Getting a more reliable 1 minute score</h2>
<p>These are our suggestions, not a tested method.</p>
<ol>
<li><strong>Use the same text type each time.</strong> Sentences contain capital letters and punctuation, code is full of symbols, and plain words are easiest, so the same typist scores differently on each. Compare like with like.</li>
<li><strong>Take three runs and read the middle one.</strong> One lucky or unlucky minute is easy to get.</li>
<li><strong>Check accuracy before speed.</strong> Our coach note says "hold accuracy" below 95%. That cut-off is our own, and a fast run with many mistakes says little about your typing.</li>
<li><strong>Test at a similar time of day,</strong> sitting the same way, if you are tracking progress over weeks.</li>
</ol>

<h2 id="1-minute-versus-other-lengths">1 minute compared with shorter and longer tests</h2>
<p>The test can also run for 15 or 30 seconds, or 2, 3, 5 and more minutes. Shorter runs finish faster but a single stumble weighs even more; longer runs smooth the noise but ask for more focus and rest. One minute is a common middle ground for a quick check. For a number you plan to track, a longer run is usually steadier, which follows from averaging over more keystrokes; we have not measured it.</p>

<h2 id="when-to-use-a-longer-test">When to use a longer test</h2>
<ul>
<li>You want a steadier number: use the <a href="/3-minute-typing-test">3 minute test</a>.</li>
<li>You want to see how your speed holds up as you tire: use the <a href="/5-minute-typing-test">5 minute test</a>.</li>
<li>You want to improve rather than measure: use <a href="/typing-practice">typing practice</a>, which works on your weakest keys and letter pairs.</li>
</ul>

<h2 id="limits-of-the-1-minute-test">Limits of this test</h2>
<ul>
<li>It measures copying text. Composing your own sentences is usually slower.</li>
<li>The certificate picture is a keepsake, not an official qualification, and employer or exam tests have their own rules.</li>
<li>It is built for a physical keyboard.</li>
</ul>

<h2 id="1-minute-typing-test-faq">1 minute typing test FAQ</h2>
FAQ_HTML
${sourcesHtml('')}
`,
};

const threeMinute: DurationPage = {
  minutes: 3,
  slug: '3-minute-typing-test',
  seconds: 180,
  meta: {
    title: '3 Minute Typing Test — Free WPM and Accuracy Check',
    description:
      'Take a free 3 minute typing test: a steadier WPM than a single minute, with a speed graph and consistency score so you can see if you slow down. No signup.',
  },
  howToName: 'How to Take a 3 Minute Typing Test',
  faqs: [
    {
      question: 'Why take a 3 minute typing test instead of 1 minute?',
      answer:
        'Over three minutes a slow start or one lucky stretch counts for less, so the score is usually steadier. It also gives the speed graph and consistency score more to show. The cost is that you need to keep focus for longer.',
    },
    {
      question: 'Is my WPM lower on a longer test?',
      answer:
        'It can be, if you tire or rush and make more mistakes, but it does not have to be. We do not have a measured figure for it. The speed graph shows whether your gold line sank over the three minutes; if it did, you have found something to work on.',
    },
    {
      question: 'What is the consistency score?',
      answer:
        'It is 100 minus how much your per-second speed varied, as the standard deviation divided by the average, in percent. Steady typing scores high, bursts and stalls score low. It is our own measure, so do not compare it with numbers from other sites.',
    },
    {
      question: 'Do I get the same text every time?',
      answer:
        'No. A new passage is built each time you start a test, and the passage is long enough for about 300 words a minute.',
    },
    {
      question: 'Are my 3 minute results saved?',
      answer:
        'Only in your own browser: the latest five test results and your progress totals. There is no account, and clearing your site data erases them.',
    },
  ],
  howToSteps: [
    {
      name: 'Choose the 3 minute length',
      text: 'This page opens with 3 minutes selected. You can change the length above the text at any time.',
    },
    {
      name: 'Type the text',
      text: 'The three minutes start on your first keystroke. Use Backspace to fix mistakes and keep a steady pace.',
    },
    {
      name: 'Read the graph and consistency',
      text: 'Check whether your speed line stayed level or fell, and which keys and letter pairs cost you time.',
    },
    {
      name: 'Compare with your earlier runs',
      text: 'Each result shows how it compares with your previous run. Repeat on another day and compare like with like.',
    },
  ],
  previewHtml: `
<h2>3 Minute Typing Test — A Steadier WPM Check</h2>${byline()}
<p>This is a free 3 minute typing test. The timer starts on your first key. When it ends you get net WPM, accuracy, a speed graph and a consistency score, which show whether you kept your pace or slowed down.</p>
<p>Below: why three minutes tells you more than one, how to read the graph, and what the study numbers can and cannot say about a run this long.</p>
`,
  bodyHtml: `
<h2 id="how-the-3-minute-test-works">How this 3 minute test works</h2>
<p>The 180 seconds start on your first keystroke. Net WPM is correct characters divided by five, divided by three. Accuracy is correct characters out of characters typed, and Backspace removes the character you step back over. The full method is in the <a href="/">typing speed test guide</a>; it is the same on every length.</p>

<h2 id="why-three-minutes">Why three minutes</h2>
<p>A longer run averages out a slow first few seconds and one-off stumbles, so repeat scores should sit closer together than they do over one minute. That follows from how averages work; we have not measured it on FreeTyper. Three minutes is also long enough for the graph and the consistency score to mean something, which a 1 minute run only just allows.</p>

<h2 id="reading-the-graph">Reading the graph over three minutes</h2>
<ul>
<li><strong>A level gold line</strong> means you held your pace.</li>
<li><strong>A line that falls</strong> means you slowed. That can be tiredness, tension or rushing into mistakes; the red dots show if mistakes bunched up in the same stretch.</li>
<li><strong>A high consistency score</strong> means steady typing. Because it is our own measure, use it only to compare your own runs.</li>
</ul>
<p>How the graph, consistency and weak spots are calculated is written out in the <a href="/">home page guide</a>.</p>

<h2 id="what-the-study-numbers-mean-here">What the study numbers mean here</h2>
<p>The figures people quote come from Dhakal and colleagues (CHI 2018): 168,960 volunteers, mean 51.56 WPM, standard deviation 20.2. They copied short sentences, not a three-minute passage, so use them as a rough reference, not a target for this length. See <a href="/blog/good-typing-speed">what a good typing speed is</a> for the detail.</p>

<h2 id="three-minutes-in-characters">What a 3 minute score means in characters</h2>
<p>Net WPM is correct characters divided by five, divided by three minutes. This is arithmetic from the rule, not user data.</p>
<table>
<thead><tr><th>Net WPM</th><th>Correct characters in 3 minutes</th><th>Words (5 characters each)</th></tr></thead>
<tbody>
<tr><td>20</td><td>300</td><td>60</td></tr>
<tr><td>40</td><td>600</td><td>120</td></tr>
<tr><td>60</td><td>900</td><td>180</td></tr>
<tr><td>80</td><td>1,200</td><td>240</td></tr>
</tbody>
</table>

<h2 id="why-your-line-might-fall">Why your speed line might fall</h2>
<p>If the gold line sinks across the three minutes, the test cannot say why, but there are a few usual suspects, which are possible readings and not findings: you started faster than you can hold, you tensed up, or mistakes began to pile up and slowed you down. The red dots and the gap to the dashed grey line help tell them apart: dots clustered late point to mistakes, and a steady fall with few dots points to pace or fatigue. Our post on <a href="/blog/improve-typing-accuracy">improving typing accuracy</a> goes through what the research says about errors.</p>

<h2 id="using-the-3-minute-test-to-improve">Using it to improve</h2>
<p>Our suggestion, not a measured method: take one 3 minute test a few times a week at a similar time of day, read the graph, then spend practice time on the keys and pairs it flags. <a href="/typing-practice">Typing practice</a> has an adaptive tab for that, and our post on <a href="/blog/how-to-type-faster">how to type faster</a> covers what the research does and does not support.</p>

<h2 id="limits-of-the-3-minute-test">Limits of this test</h2>
<ul>
<li>It measures copying text, not writing your own.</li>
<li>The certificate picture is a keepsake, not an official qualification, and employer or exam tests set their own rules.</li>
<li>It is built for a physical keyboard.</li>
</ul>

<h2 id="3-minute-typing-test-faq">3 minute typing test FAQ</h2>
FAQ_HTML
${sourcesHtml('')}
`,
};

const fiveMinute: DurationPage = {
  minutes: 5,
  slug: '5-minute-typing-test',
  seconds: 300,
  meta: {
    title: '5 Minute Typing Test — Free, Shows How Your Speed Holds Up',
    description:
      'Take a free 5 minute typing test to see your WPM and whether your speed and accuracy hold over a longer run. Speed graph and consistency score, no signup.',
  },
  howToName: 'How to Take a 5 Minute Typing Test',
  faqs: [
    {
      question: 'Who uses a 5 minute typing test?',
      answer:
        'Some people use it to see how their speed holds up over a longer run. Employers and exams that test typing set their own lengths and rules, so check theirs. Our post on data entry typing tests explains how those tests are scored.',
    },
    {
      question: 'Is this a typing certificate?',
      answer:
        'Not an official one. After a run of at least 30 seconds with at least 90% accuracy you can download a certificate picture, but it is a keepsake: the test is timed in your browser and not independently verified. If you need a certificate for an employer, ask them which test they accept.',
    },
    {
      question: 'Should I warm up first?',
      answer:
        'It can help to type a short passage in practice first. That is our suggestion, not something we have measured. Sit properly, with your wrists in a neutral position; our post on posture and wrist pain covers what is known about that.',
    },
    {
      question: 'What if I get tired halfway through?',
      answer:
        'Finish the run anyway and look at the graph. A falling speed line, or mistakes bunching in the last minutes, shows where you tire. That is useful information, not a failed test.',
    },
    {
      question: 'Are my 5 minute results saved?',
      answer:
        'Only in your own browser: the latest five test results and your progress totals. There is no account, and clearing your site data erases them.',
    },
  ],
  howToSteps: [
    {
      name: 'Settle in',
      text: 'Sit with your wrists in a neutral position. This page opens with 5 minutes selected.',
    },
    {
      name: 'Start typing',
      text: 'The five minutes begin on your first keystroke. Use Backspace to fix mistakes and keep an even pace.',
    },
    {
      name: 'Read the graph',
      text: 'Look for a line that holds level, or one that falls in the last minutes, and for clusters of mistakes.',
    },
    {
      name: 'Take a break',
      text: 'Rest your hands before another long run, and compare results only with other 5 minute runs.',
    },
  ],
  previewHtml: `
<h2>5 Minute Typing Test — Speed Over a Longer Run</h2>${byline()}
<p>This is a free 5 minute typing test. The timer starts on your first key. You get net WPM, accuracy, a speed graph and a consistency score, so you can see whether your speed and accuracy hold for the whole five minutes or fade.</p>
<p>Below: what a longer run shows, how to prepare, and what this test is not.</p>
`,
  bodyHtml: `
<h2 id="how-the-5-minute-test-works">How this 5 minute test works</h2>
<p>The 300 seconds start on your first keystroke. Net WPM is correct characters divided by five, divided by five minutes; accuracy and the Backspace rule are the same as on every length and are written out in the <a href="/">typing speed test guide</a>.</p>

<h2 id="what-five-minutes-shows">What five minutes shows</h2>
<p>The longest of our three preset lengths shows how your speed and accuracy hold, not only how fast you can go for a minute. If your gold line starts high and sinks, or mistakes cluster in the last minutes, you are starting too hard, tiring, or losing focus. We read the graph this way as a reasonable interpretation; the test cannot tell you which cause it is.</p>

<h2 id="five-minutes-in-characters">What a 5 minute score means in characters</h2>
<p>Net WPM is correct characters divided by five, divided by five minutes. The table is arithmetic from the rule, not user data.</p>
<table>
<thead><tr><th>Net WPM</th><th>Correct characters in 5 minutes</th><th>Words (5 characters each)</th></tr></thead>
<tbody>
<tr><td>20</td><td>500</td><td>100</td></tr>
<tr><td>40</td><td>1,000</td><td>200</td></tr>
<tr><td>60</td><td>1,500</td><td>300</td></tr>
<tr><td>80</td><td>2,000</td><td>400</td></tr>
</tbody>
</table>
<p>A mistake you fix costs the time you spent fixing it, and the character you step back over is removed from the count. Over five minutes those small costs add up, which is one reason the same typist can score differently on a short and a long test.</p>

<h2 id="pacing-a-five-minute-run">Pacing a five minute run</h2>
<p>These are our suggestions, not a tested method.</p>
<ul>
<li><strong>Find a pace you could hold for the full time.</strong> If the first minute feels like a sprint, the last ones will probably be slower.</li>
<li><strong>Do not stop to re-read.</strong> Look slightly ahead of the character you are typing; the text scrolls with you.</li>
<li><strong>Fix mistakes only when they are close.</strong> A long chain of Backspaces costs more time than one early correction.</li>
<li><strong>Compare the start and the end of the graph.</strong> If the gold line at the end sits well below the start, your next goal is holding pace, not top speed.</li>
</ul>

<h2 id="preparing-for-a-long-run">Preparing for a long run</h2>
<ul>
<li><strong>Sit well.</strong> A relaxed, neutral wrist position matters more over five minutes; see <a href="/blog/fix-typing-posture-and-avoid-wrist-pain">posture and wrist pain</a>.</li>
<li><strong>Warm up</strong> with a short passage in <a href="/typing-practice">typing practice</a> if you like. This is our suggestion.</li>
<li><strong>Start at a pace you can hold.</strong> Rushing early and fixing mistakes late costs time.</li>
<li><strong>Rest afterwards,</strong> and avoid back-to-back long runs.</li>
</ul>

<h2 id="five-minutes-and-job-tests">Five minutes and job or exam tests</h2>
<p>Employer and exam typing tests choose their own length, text and scoring, so a result here will not match them exactly. Our post on <a href="/blog/data-entry-typing-test">data entry typing tests</a> explains how such tests are scored and how to prepare. This page is practice. Its certificate picture is a keepsake, not an official qualification.</p>

<h2 id="typical-scores-over-five-minutes">Typical scores</h2>
<p>The study people usually quote, Dhakal and colleagues (CHI 2018, 168,960 volunteers, mean 51.56 WPM, standard deviation 20.2), used short copied sentences, not five-minute passages. Use it as a rough reference only. See <a href="/blog/good-typing-speed">what a good typing speed is</a>.</p>

<h2 id="limits-of-the-5-minute-test">Limits of this test</h2>
<ul>
<li>It measures copying text, not writing your own.</li>
<li>The certificate picture is a keepsake, not an official qualification.</li>
<li>It is built for a physical keyboard.</li>
</ul>

<h2 id="5-minute-typing-test-faq">5 minute typing test FAQ</h2>
FAQ_HTML
${sourcesHtml('<li>Posture and data-entry advice: our own posts, linked above, which list their sources.</li>')}
`,
};

const withFaq = (page: DurationPage): DurationPage => ({
  ...page,
  bodyHtml: page.bodyHtml.replace(
    'FAQ_HTML',
    page.faqs.map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`).join('\n'),
  ),
});

export const durationPages: DurationPage[] = [oneMinute, threeMinute, fiveMinute].map(withFaq);

export function getDurationPage(minutes: 1 | 3 | 5): DurationPage {
  return durationPages.find((p) => p.minutes === minutes) as DurationPage;
}
