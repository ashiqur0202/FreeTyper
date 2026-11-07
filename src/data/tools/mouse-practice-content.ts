/**
 * Guide content for /mouse-practice.
 *
 * Describes `MousePractice.tsx`, `MouseLearn.tsx`, `drills.tsx`, `AimTrainer.tsx`,
 * `mouseData.ts` (step wording), `aimScoring.ts` (sizes, 30 seconds, scoring) and
 * `useMouseProgress.ts` (storage key `freetyper-mouse`). If the steps, their checks,
 * the aim sizes or scoring, or what is saved change, update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-11-07
 */

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Is this for a mouse or for a laptop trackpad?',
    answer:
      'Both. A browser cannot tell a laptop trackpad from a mouse, so the page asks which one you are using and changes the wording and the steps to match, for example "tap the pad" instead of "press the left button". The checks underneath are the same for both, so you pass a step the same way on either.',
  },
  {
    question: 'What does the Learn tab teach?',
    answer:
      'Seven short steps in a fixed order: move the pointer, click, double-click, right-click, drag and drop, scroll, and a final step that asks you to click, right-click and double-click in a row. Each step has its own practice box and finishes the moment you do the action. Finished steps are saved per device choice, and you can tap any step number to practise it again.',
  },
  {
    question: 'How does the Aim game score me?',
    answer:
      'A run lasts 30 seconds with one round target on screen at a time. A click on the target is a hit and moves it somewhere else. A click anywhere else in the play area is a miss. Your score is hits minus misses, never below zero. Accuracy is hits divided by all your clicks, and the average reaction time is how long a target was on screen before you hit it.',
  },
  {
    question: 'What are the target sizes?',
    answer:
      'Large is 80 pixels across, medium is 56 and small is 36. Until you pick a size the page starts on medium for a mouse and on large for a trackpad. These sizes are our own suggestion, not a researched standard, and your best score is kept separately for each size.',
  },
  {
    question: 'What do I do if a trackpad step does not work?',
    answer:
      'Laptops differ: tap-to-click, two-finger right-click and tap-to-drag can each be turned off in the laptop\'s touchpad settings. If a trackpad step is still open after about ten seconds, the page shows a reminder to check those settings. You can always press the pad down instead of tapping it, and press its bottom-right corner for a right-click.',
  },
  {
    question: 'Does it teach pinch-to-zoom or three-finger swipes?',
    answer:
      'No. Those gestures are handled by your operating system, and browsers report them inconsistently, so a web page cannot check them reliably. The page teaches moving, clicking, double-clicking, right-clicking, dragging and scrolling only.',
  },
  {
    question: 'Does it work on a phone or a touchscreen?',
    answer:
      'It still runs, but it is built for a mouse or a laptop trackpad. If you touch the page, a short note says so. Nothing is blocked.',
  },
  {
    question: 'What is saved, and is anything uploaded?',
    answer:
      'Your device choice, the steps you have finished and your best Aim score for each size are saved in your own browser, on this device only, and clearing your site data erases them. There is no account. Site visits are measured with Google Analytics, which also receives the name of a step you finished and your device choice, and after an Aim run the size, hits, accuracy and score. These are numbers and short labels only.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const meta = {
  title: 'Mouse Practice for Beginners — Free Mouse & Trackpad Exercises',
  description:
    'Free mouse and trackpad practice for beginners: guided click, double-click, right-click, drag and scroll steps, plus a 30-second aim game. No signup.',
};

export const previewHtml = `
<h2>Mouse and Trackpad Practice for Beginners</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-07">November 7, 2026</time></span>
  <span>~4 min read</span>
</p>
<p>This page lets you practise using a mouse or a laptop trackpad. The Learn tab walks you through seven short steps: moving the pointer, clicking, double-clicking, right-clicking, dragging and dropping, and scrolling, with wording for the device you pick. The Aim tab is a 30-second game where you click round targets as fast and as accurately as you can. It is free, needs no signup, and your progress stays in your browser.</p>
<p>Below you will find how each tab works, how the Aim game scores a run, what is saved, and what the page cannot teach.</p>
`;

export const bodyHtml = `
<h2 id="how-the-learn-tab-works">How the Learn tab works</h2>
<p>First choose <strong>Mouse</strong> or <strong>Trackpad</strong> at the top of the tool. The page cannot detect which one you have, because a laptop trackpad looks like a mouse to a web page, so the choice is yours and it is remembered. It changes the instructions only: with a mouse you press the left button, with a trackpad you press or tap the pad.</p>
<p>The Learn tab shows one step at a time, with the instruction above a practice box:</p>
<ol>
<li><strong>Move the pointer</strong> onto three glowing circles in turn. No click is needed.</li>
<li><strong>Click</strong> the circle once.</li>
<li><strong>Double-click</strong> the circle. A single click does not count; the box says to go again, quicker.</li>
<li><strong>Right-click</strong> inside the box. The browser's usual right-click menu is blocked inside that box only, so you will see no menu there; everywhere else on the page it works as normal.</li>
<li><strong>Drag and drop</strong> the card into the dashed box. Letting go anywhere else sends the card back.</li>
<li><strong>Scroll</strong> down the list. The step finishes once you have moved a good way down it.</li>
<li><strong>Put it together:</strong> three prompts in a row, in the order click, right-click, double-click.</li>
</ol>
<p>A step finishes the moment you do the action, and the numbered dots at the top fill in. They are saved for each device choice, and you can tap any dot to practise that step again.</p>

<h2 id="mouse-versus-trackpad">Mouse versus trackpad</h2>
<p>The instructions differ where the hardware does. For a right-click, a mouse has a right button; a trackpad usually uses a two-finger tap or the bottom-right corner of the pad. For dragging, a trackpad needs you to press and hold while sliding, or to use tap-to-drag if your laptop has it. For scrolling, a mouse has a wheel and a trackpad uses two fingers sliding up or down.</p>
<p>Laptops are set up differently, and tap-to-click, two-finger right-click and tap-to-drag can each be switched off in the touchpad settings. If a trackpad step is still open after about ten seconds, the page reminds you to check those settings. It does not name menus for particular laptops or systems.</p>

<h2 id="how-the-aim-game-scores">How the Aim game scores a run</h2>
<p>Choose a target size, then press Start. A run lasts 30 seconds. One round target is on screen at a time:</p>
<ul>
<li>A click on the target is a <strong>hit</strong> and the target jumps to a new place.</li>
<li>A click anywhere else in the play area is a <strong>miss</strong>.</li>
<li><strong>Score</strong> is hits minus misses, and never goes below zero.</li>
<li><strong>Accuracy</strong> is hits divided by all your clicks, as a whole percent. With no clicks it shows 0.</li>
<li><strong>Average reaction</strong> is the time from a target appearing to you hitting it, in milliseconds.</li>
</ul>
<p>The three sizes are large (80 pixels across), medium (56) and small (36). Until you choose, a mouse starts on medium and a trackpad on large. These sizes are our own suggestion, not a researched standard. Your best score is saved for each size.</p>

<h2 id="what-this-page-cannot-teach">What this page cannot teach</h2>
<ul>
<li>Pinch-to-zoom and three or four-finger swipes. Your operating system handles them and browsers report them inconsistently, so the page does not check them.</li>
<li>Settings that belong to your laptop or system, such as pointer speed or which gestures are turned on.</li>
<li>Anything for people who cannot use a pointing device. This page needs one.</li>
<li>Touchscreens. It still runs, but it is built for a mouse or a laptop trackpad.</li>
</ul>
<p>The page does not claim that using it will make you faster or more accurate. The Aim numbers are only a way to see your own scores change over time on this device.</p>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Your device choice, the steps you have finished and your best Aim scores are stored in your browser's local storage on this device. There is no FreeTyper account. Clearing your site data erases them. Visits to the site are measured with Google Analytics, which also receives the name of a step you finished and your device choice, and after an Aim run the size, hits, accuracy and score: numbers and short labels only. The <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="mouse-practice-faq">Mouse practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Steps, checks, scoring and what is saved: how the tool on this page works, as described above.</li>
<li>The wording of each step, the target sizes and the ten-second reminder are FreeTyper's own suggestions, not taken from a study or a standard.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a step behaves differently from this page, or does not work on your trackpad, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose mouse or trackpad',
    text: 'Pick Mouse or Trackpad at the top of the tool. The page cannot tell them apart, so this changes the wording of each step to match your device.',
  },
  {
    name: 'Follow the Learn steps',
    text: 'Work through move, click, double-click, right-click, drag and drop, scroll and the final mixed step. Each one finishes as soon as you do the action.',
  },
  {
    name: 'Practise a step again',
    text: 'Tap any numbered dot above the practice box to go back to that step.',
  },
  {
    name: 'Try the Aim game',
    text: 'Open the Aim tab, choose a target size and press Start. Click each target for 30 seconds; a click that misses costs a point.',
  },
  {
    name: 'Beat your best',
    text: 'Your best score for each size is saved in your browser. Run again and compare your score, accuracy and reaction time.',
  },
];
