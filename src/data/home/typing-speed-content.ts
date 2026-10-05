/**
 * Guide content for the Home page (/) typing speed test.
 *
 * Everything here describes how the tool in `TypingSpeedTest.tsx` and
 * `useTypingEngine.ts` actually behaves. If scoring, durations, text modes or
 * rank bands change in code, update this file in the same commit.
 *
 * Rendered through ExpandableSeoContent + `.blog-article` styles.
 * The FAQ list below is the single source for both the visible FAQ and the
 * FAQPage JSON-LD, so they cannot drift apart.
 *
 * Last real edit: 2026-10-06
 */

export const meta = {
  title: 'Free Typing Speed Test — Check Your WPM & Accuracy Online',
  description:
    'Free typing speed test with net WPM, gross WPM and accuracy. 15 seconds to 30 minutes, words, sentences or code. No signup, results stay in your browser.',
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How is typing speed calculated?',
    answer:
      'Typing speed is measured in words per minute (WPM), where a word is defined as five characters, including spaces and punctuation. FreeTyper reports net WPM as correct characters divided by five, divided by minutes. It also shows gross WPM, which counts every character you typed, and accuracy, which is correct characters divided by all characters typed.',
  },
  {
    question: 'What is the difference between net WPM and gross WPM?',
    answer:
      'Gross WPM counts every character you typed, right or wrong. Net WPM counts only the correct ones. Net is the stricter number and the one most employers and typing courses use, so it is the large score in the result. The gap between the two shows how much speed your mistakes are costing you.',
  },
  {
    question: 'Does Backspace affect my typing test score?',
    answer:
      'Yes, but not in the way you might expect. When you press Backspace, the character you step back over is removed from the tally, so a mistake you fix no longer counts as an error. The time you spent fixing it still ran on the clock, so correcting costs you speed instead of accuracy. This means the accuracy shown reflects the text left on screen at the end of the run.',
  },
  {
    question: 'How long should a typing test be?',
    answer:
      'One minute is the practical minimum for a stable number. Runs of 15 or 30 seconds are heavily influenced by the first few words and by how warmed up you are. Three to five minutes shows how your speed and accuracy hold up as you tire. Whatever length you pick, compare it only with runs of the same length and the same text mode.',
  },
  {
    question: 'What is the average typing speed?',
    answer:
      'In the largest keyboard study we know of, 168,000 online volunteers averaged about 52 WPM. Those volunteers chose to take a typing test, so the average for people in general is probably somewhat lower. On FreeTyper, 40 to 59 WPM is labelled average.',
  },
  {
    question: 'Is 60 WPM a good typing speed?',
    answer:
      'Yes. In a study of 168,000 online volunteers, the average was about 52 WPM and the fastest tenth typed above roughly 78 WPM, so 60 WPM sits above that average and below the fast group. FreeTyper labels 60 to 79 WPM as skilled. Accuracy matters as much as the number: 60 WPM at 98 percent is better than 70 WPM at 90 percent.',
  },
  {
    question: 'What accuracy should I aim for?',
    answer:
      'Aim for 95 percent or higher before you try to go faster. FreeTyper tells you to hold accuracy below 95 percent and calls a run below 88 percent not a real score, because errors either have to be fixed, which costs time, or left in, which costs quality. Speed usually rises on its own once your accuracy is stable.',
  },
  {
    question: 'Why do my scores change from one test to the next?',
    answer:
      'Text difficulty, how warmed up you are, tiredness, and plain luck with which words appear all move the result. A swing of a few WPM between runs is normal. Take three runs at the same length and in the same text mode, and treat the middle value as your score.',
  },
  {
    question: 'Are my typing test results saved or shared?',
    answer:
      'Your latest results and your progress history are saved in your own browser using local storage. FreeTyper has no accounts and does not upload what you type or your scores. Clearing your site data deletes the history, and a different browser or device starts empty. Visits to the site are measured with Google Analytics, as described in the privacy policy.',
  },
  {
    question: 'Can I take the typing test on my phone?',
    answer:
      'The test is built for a physical keyboard. You can open it on a phone, but typing on a touch screen is a different skill, and a score from it should not be compared with a keyboard score.',
  },
  {
    question: 'How can I improve my typing speed?',
    answer:
      'Get your accuracy above 95 percent first, learn which finger belongs to which key, and practice a little every day instead of in rare long sessions. FreeTyper has step by step typing lessons, practice texts that target the keys you miss most, and a keyboard guide that shows finger placement.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const previewHtml = `
<h2>Free Typing Speed Test — Check Your WPM and Accuracy Online</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-10-06">October 6, 2026</time></span>
  <span>~9 min read</span>
</p>
<p>This free typing speed test measures how fast and how accurately you type on your own keyboard. The timer starts on your first keystroke. When it ends you get your <strong>net WPM</strong>, <strong>accuracy</strong>, <strong>gross WPM</strong>, a count of correct and incorrect characters, a plain-language rank, and, for runs of 5 seconds or longer, a graph of your speed, a consistency score and your weak spots. There is no account to create, nothing to install, and your results stay in your browser.</p>
<p>This page explains exactly how those numbers are calculated, so you can judge whether to trust them, what counts as a good typing speed, and how to get a reading that is repeatable instead of a lucky or unlucky single run.</p>
`;

export const bodyHtml = `
<h2 id="how-the-typing-test-works">How the typing speed test works</h2>
<ul>
<li><strong>Choose a length.</strong> The presets are 15 seconds, 30 seconds, 1, 2, 3, 5, 10, 15 and 30 minutes. A custom option accepts anything from 1 to 120 minutes.</li>
<li><strong>Choose a text type.</strong> <em>Words</em> shows common short English words in random order. <em>Sentences</em> shows quotes and short passages with capital letters and punctuation. <em>Code</em> shows programming snippets full of brackets and symbols.</li>
<li><strong>Type.</strong> The clock starts on your first keystroke, not when the page loads. Every character has to match exactly: letter case, punctuation and spaces all count.</li>
<li><strong>Mistakes do not stop you.</strong> A wrong key is marked and the cursor moves on. Backspace steps back if you want to fix it.</li>
<li><strong>Keep going.</strong> When the time runs out, your result appears under the keyboard and a fresh text loads straight away, so you can run another test without clicking anything.</li>
</ul>

<h2 id="how-wpm-and-accuracy-are-calculated">How WPM and accuracy are calculated</h2>
<p>Typing tests count in <a href="https://en.wikipedia.org/wiki/Words_per_minute" rel="noopener" target="_blank">words per minute</a>, but a "word" here is not a dictionary word. It is a fixed five characters, spaces and punctuation included. That keeps a run full of long words from scoring differently from a run full of short ones.</p>
<ul>
<li><strong>Net WPM</strong> = (correct characters ÷ 5) ÷ minutes</li>
<li><strong>Gross WPM</strong> = (all typed characters ÷ 5) ÷ minutes</li>
<li><strong>Accuracy</strong> = correct characters ÷ all typed characters × 100</li>
</ul>
<p>A worked example: you type for 60 seconds and finish with 290 characters on screen, 270 of them correct and 20 wrong.</p>
<table>
<thead><tr><th>Measure</th><th>Calculation</th><th>Result</th></tr></thead>
<tbody>
<tr><td>Gross WPM</td><td>290 ÷ 5 ÷ 1 minute</td><td>58</td></tr>
<tr><td>Net WPM</td><td>270 ÷ 5 ÷ 1 minute</td><td>54</td></tr>
<tr><td>Accuracy</td><td>270 ÷ 290</td><td>93%</td></tr>
</tbody>
</table>
<p>The big number in your result is net WPM. The gap between gross and net tells you what your mistakes cost: here, 4 WPM.</p>

<h3>What Backspace does to your score</h3>
<p>When you press Backspace, the character you step back over is removed from the tally, whether it was right or wrong. A mistake you fix stops counting as an error, but the seconds you spent fixing it were still on the clock. In this test, correcting costs you speed rather than accuracy.</p>
<p>It also means the accuracy figure describes the text left on screen at the end of the run. A tool that logged every slip, including the ones you corrected, would report a lower accuracy for the same run. If you are rehearsing for an employer's test, find out how that test scores corrections.</p>

<h2 id="what-your-result-means">What your result means</h2>
<p>FreeTyper puts a label on your net WPM so the number is easier to read. These labels are our own shorthand, not an official standard or a certificate.</p>
<table>
<thead><tr><th>Net WPM</th><th>Label</th></tr></thead>
<tbody>
<tr><td>Under 40</td><td>Beginner</td></tr>
<tr><td>40–59</td><td>Average</td></tr>
<tr><td>60–79</td><td>Skilled</td></tr>
<tr><td>80–99</td><td>Pro</td></tr>
<tr><td>100 and above</td><td>Elite</td></tr>
</tbody>
</table>
<p>Read accuracy before you read speed. Below 95%, the test tells you to hold accuracy before chasing speed. Below 88%, it calls the run "not a real score," because that WPM was bought with errors that would have to be fixed or would end up in your work.</p>

<h2 id="the-speed-graph-and-weak-spots">The speed graph, consistency and weak spots</h2>
<p>Runs of 5 seconds or longer also get a graph under the headline numbers, and the result card adds a consistency score and a short list of weak spots.</p>
<ul>
<li><strong>The gold line is your speed over time</strong>: the WPM of your correct keystrokes, smoothed over about five seconds (three on runs under 20 seconds). The dashed grey line is your raw speed, which counts every key you pressed, smoothed over about three seconds. A wide gap between the two means mistakes are costing you speed.</li>
<li><strong>Red dots mark seconds with mistakes</strong>, a larger dot for two or more in the same second. Your fastest point is labelled, and a ring marks where the run ended. Hover or touch the graph, or use the arrow keys, to read one moment.</li>
<li><strong>It counts keystrokes, not the final text.</strong> A mistake you later corrected with Backspace still appears on the graph, while your net WPM and accuracy above use the rules described earlier. The two will not always agree exactly, and that is expected.</li>
<li><strong>Consistency</strong> is 100 minus how much your per-second speed varied, measured as the standard deviation divided by the average, in percent, between your first and last key. Steady typing scores high; bursts and stalls score low. It is our own measure, so do not compare it with numbers from other sites.</li>
<li><strong>Weak spots</strong> lists up to four things from this run: keys you got wrong at least twice, and letter pairs that took at least 1.5 times your median pair for the run and at least 120 ms. Pairs are only judged once five different pairs were each typed twice with a clean timing. The "drill these" button opens the adaptive tab on the <a href="/typing-practice">practice page</a>.</li>
</ul>
<p>Only your latest five runs in each tool keep their graph, in your browser; the long progress history stores just the totals. Runs saved before this feature, and runs under 5 seconds, show the card without a graph. A very long run is reduced to at most 120 points on the graph.</p>

<h2 id="what-is-a-good-typing-speed">What is a good typing speed, and what is the average?</h2>
<p>The average typing speed depends on who you ask and how they were measured. The most useful reference we know of is a large academic study, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a> (Dhakal, Feit, Kristensson and Oulasvirta, CHI 2018). It recorded 168,000 volunteers copying sentences on a keyboard. Its reported figures:</p>
<ul>
<li>The average speed was <strong>51.56 WPM</strong> (standard deviation 20.2).</li>
<li>The fastest 10% typed above roughly <strong>78 WPM</strong>; the slowest 10% typed below roughly <strong>26 WPM</strong>.</li>
<li>The average uncorrected error rate was about <strong>1.2%</strong>, and the authors note that faster typists generally make fewer errors.</li>
</ul>
<p>Two cautions. These were volunteers who chose to take an online typing test, so the sample probably leans faster than people in general. And the task was copying sentences, which is easier than composing your own text. Treat the numbers as a map, not a target: in the 50s you are typical for that group, in the 70s you are comfortably fast, and past 80 you are in its top tenth.</p>
<p>For a job, the right number is the one in the posting. Ask whether the test scores net or gross WPM, whether corrections count, and what accuracy minimum applies. A run here is a rehearsal for that conversation, not a replacement for it.</p>

<h2 id="how-to-get-a-score-you-can-trust">How to get a score you can trust</h2>
<ol>
<li><strong>Run at least one minute.</strong> Fifteen and thirty seconds are dominated by your first few words.</li>
<li><strong>Take three runs and use the middle one.</strong> Same length, same text type, same keyboard.</li>
<li><strong>Compare like with like.</strong> Words mode usually reads higher than sentences, and code mode reads lower than both, because symbols are slow for everyone.</li>
<li><strong>Expect repeats.</strong> Passages come from a built-in set, so after many runs you may meet text you have seen before. That can flatter a score slightly, so switch text type now and then.</li>
<li><strong>Use the history.</strong> Your last five runs are listed under the test, and each result shows how it compares with the run before it.</li>
</ol>

<h2 id="words-sentences-or-code">Words, sentences or code: which text type should you use?</h2>
<ul>
<li><strong>Words</strong> is the best measure of raw finger speed. There is no punctuation and no capital letters to slow you down, and it is the cleanest way to track change over weeks.</li>
<li><strong>Sentences</strong> is the closest to real writing, with capitals, commas and full stops. Use it when you want to know your everyday typing speed.</li>
<li><strong>Code</strong> is for programmers. Expect a lower WPM than in the other two. It tells you how comfortable you are with brackets, operators and quotes.</li>
</ul>

<h2 id="how-to-type-faster-after-the-test">How to type faster after the test</h2>
<ol>
<li><strong>Fix accuracy first.</strong> If you are under 95%, slow down until your runs are clean. Faster typists make fewer errors, not more, so speed follows control.</li>
<li><strong>Learn where each finger belongs.</strong> The <a href="/keyboard-guide">keyboard guide</a> colours every key by finger, and the <a href="/typing-lessons">typing lessons</a> take you from the home row outwards in order.</li>
<li><strong>Practice a little every day.</strong> Ten or twenty minutes daily is easier to keep up than a long session now and then. <a href="/typing-practice">Typing practice</a> offers quotes, news-style text, code and fun passages.</li>
<li><strong>Train the keys you miss.</strong> FreeTyper records which keys you get wrong. The <a href="/typing-progress">progress page</a> shows them, and practice can build a drill around them.</li>
<li><strong>Re-test every week or two</strong> under the same conditions, and compare the middle of three runs with the previous week's.</li>
</ol>

<h2 id="privacy-and-your-results">Your results and privacy</h2>
<p>Your latest results, the speed graph of your latest five runs, and your progress history are stored in your browser's local storage on this device. FreeTyper has no accounts and does not upload what you type or your scores. Clearing your site data erases the history, and a different browser or device starts from zero. Visits to the site are measured with Google Analytics; the <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="limits-of-this-test">Limits of this test</h2>
<ul>
<li>It is not a certificate. An employer or school may require its own test.</li>
<li>Timing comes from your browser, so a very busy computer can shift a result slightly.</li>
<li>The text is a built-in set, which will not match your own emails, essays or code.</li>
<li>It is designed for a physical keyboard; touch-screen typing is a different skill.</li>
</ul>

<h2 id="typing-test-faq">Typing speed test FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Five characters per word: the long-standing convention described in the <a href="https://en.wikipedia.org/wiki/Words_per_minute" rel="noopener" target="_blank">Words per minute</a> article.</li>
<li>Speed and error figures in "What is a good typing speed?": Dhakal, Feit, Kristensson and Oulasvirta, <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>, CHI 2018.</li>
<li>Scoring, Backspace behaviour, labels and accuracy thresholds: how this site's own test works, as written above. The labels are FreeTyper's shorthand.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a number here looks wrong or a score behaves oddly, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose a length and a text type',
    text: 'Pick a duration from 15 seconds to 30 minutes, or enter a custom time, then choose words, sentences or code.',
  },
  {
    name: 'Start typing',
    text: 'Type the text shown. The timer starts on your first keystroke, and every character must match exactly, including capitals, punctuation and spaces.',
  },
  {
    name: 'Fix mistakes or keep going',
    text: 'Press Backspace to step back and correct a mistake, or carry on. A corrected mistake no longer counts as an error, but the time spent fixing it still counts.',
  },
  {
    name: 'Read your result',
    text: 'When time runs out, read your net WPM, accuracy, gross WPM, correct and incorrect characters, rank, the speed graph, consistency and weak spots under the keyboard.',
  },
  {
    name: 'Repeat three times',
    text: 'Take three runs with the same length and text type and use the middle score as your baseline.',
  },
];
