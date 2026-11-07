/**
 * Guide content for /mouse-practice.
 *
 * Describes `MousePractice.tsx`, `MouseLevels.tsx`, `course.tsx` (the four levels and their wording),
 * `drills.tsx`, `drills2.tsx`, `drills3.tsx`, `drills4.tsx`, `AimTrainer.tsx`, `mouseData.ts`,
 * `levelRules.ts` (unlocking, ranks and every pass mark), `aimScoring.ts` and `useMouseProgress.ts`
 * (storage key `freetyper-mouse`). If a drill, a pass mark, an Aim mode or what is saved changes,
 * update this file in the same commit.
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
      'It is a ladder of four levels, from Beginner to Mastery, with a practice box for every drill. Level 1 has seven short steps: move the pointer, click, double-click, right-click, drag and drop, scroll, and a mixed step. Level 2 trains accuracy and control, Level 3 speed and smooth movement, and Level 4 is a set of timed challenges. A drill finishes the moment you pass it, and finished drills are saved per device choice.',
  },
  {
    question: 'How do the levels unlock?',
    answer:
      'Level 1 is open from the start. Each later level opens when you have passed every drill in the one before it, and a locked level shows what you need to open it. Passing a level gives you a rank: Beginner, Comfortable, Skilled or Master. Some drills have a pass mark, such as 80% accuracy on the small targets, and if you miss it you see your result and can try again. The pass marks are our own suggestions, not a research standard.',
  },
  {
    question: 'What are the Moving and Shrinking modes on the Aim tab?',
    answer:
      'Classic keeps the target still. Moving makes the target drift across the play area, and it opens when you reach Level 3. Shrinking makes the target 4 pixels smaller with every hit, from 80 pixels down to 24, and it opens when you reach Level 4. Best scores are kept separately for each mode and size.',
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
      'Your device choice, the drills you have finished and your best Aim score for each mode and size are saved in your own browser, on this device only, and clearing your site data erases them. There is no account. Site visits are measured with Google Analytics, which also receives the name of a drill you finished, your device choice and the level, when you pass a level, and after an Aim run the mode, size, hits, accuracy and score. These are numbers and short labels only.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const meta = {
  title: 'Mouse Practice for Beginners — Free Mouse & Trackpad Exercises',
  description:
    'Free mouse and trackpad practice from beginner to mastery: four levels of drills, ranks, and a 30-second aim game. No signup.',
};

export const previewHtml = `
<h2>Mouse and Trackpad Practice for Beginners</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-07">November 7, 2026</time></span>
  <span>~4 min read</span>
</p>
<p>This page lets you practise using a mouse or a laptop trackpad, from your first click to timed challenges. The Learn tab is a ladder of four levels, Beginner, Comfortable, Skilled and Mastery, with wording for the device you pick. Each level opens when you pass the one before it, and passing gives you a rank. The Aim tab is a 30-second game where you click round targets as fast and as accurately as you can. It is free, needs no signup, and your progress stays in your browser.</p>
<p>Below you will find how the levels work, what each drill asks of you, how the Aim game scores a run, what is saved, and what the page cannot teach.</p>
`;

export const bodyHtml = `
<h2 id="how-the-learn-tab-works">How the Learn tab works: four levels</h2>
<p>First choose <strong>Mouse</strong> or <strong>Trackpad</strong> at the top of the tool. The page cannot detect which one you have, because a laptop trackpad looks like a mouse to a web page, so the choice is yours and it is remembered. It changes the instructions only: with a mouse you press the left button, with a trackpad you press or tap the pad.</p>
<p>The Learn tab shows one drill at a time, with the instruction above a practice box. <strong>Level 1, Beginner</strong> has seven steps:</p>
<ol>
<li><strong>Move the pointer</strong> onto three glowing circles in turn. No click is needed.</li>
<li><strong>Click</strong> the circle once.</li>
<li><strong>Double-click</strong> the circle. A single click does not count; the box says to go again, quicker.</li>
<li><strong>Right-click</strong> inside the box. The browser's usual right-click menu is blocked inside that box only, so you will see no menu there; everywhere else on the page it works as normal.</li>
<li><strong>Drag and drop</strong> the card into the dashed box. Letting go anywhere else sends the card back.</li>
<li><strong>Scroll</strong> down the list. The step finishes once you have moved a good way down it.</li>
<li><strong>Put it together:</strong> three prompts in a row, in the order click, right-click, double-click.</li>
</ol>
<p>A drill finishes the moment you do the action, and the numbered dots fill in. They are saved for each device choice, and you can tap any dot to practise that drill again.</p>

<h2 id="levels-two-to-four">Levels 2 to 4: comfortable, skilled, mastery</h2>
<p>Each level opens when you have passed every drill in the one before. All pass marks below are our own suggestions.</p>
<ul>
<li><strong>Level 2, Comfortable</strong> trains accuracy and control: click ten small circles (36 pixels) with at least 80% of your clicks hitting; drag a card onto a small dashed circle three times; press and hold a circle for one second; select a highlighted sentence by dragging across it; and scroll a long list to find Item 47 and click it.</li>
<li><strong>Level 3, Skilled</strong> trains speed and smooth movement: click a drifting circle eight times; move the pointer along a narrow path from a start dot to an end dot while staying inside the path at least 85% of the time; make five double-clicks within 20 seconds of your first click; right-click a circle three times and choose the named item from a menu; and drag four numbered cards into their slots.</li>
<li><strong>Level 4, Mastery</strong> is timed: a 60-second gauntlet where the circle asks for a click, a double-click, a right-click or a drag and you score the right actions minus the wrong ones (15 or more to pass); a 30-second shrinking-target run (score 15 or more); and 20 tiny circles (24 pixels) with at least 90% of your clicks hitting.</li>
</ul>
<p>If you miss a pass mark, the drill shows your result and a Try again button, and nothing is saved as finished until you pass. A locked level shows what you need to open it. Passing Level 1, 2, 3 or 4 gives you the rank Beginner, Comfortable, Skilled or Master, shown at the top of the tab. Progress is saved for Mouse and for Trackpad separately, and the pass marks are the same for both, so a rank means the same on either. Levels 3 and 4 may simply feel harder on a trackpad.</p>

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
<p>The three sizes are large (80 pixels across), medium (56) and small (36). Until you choose, a mouse starts on medium and a trackpad on large. These sizes are our own suggestion, not a researched standard.</p>
<p>The Aim tab has three modes. <strong>Classic</strong> keeps the target still. <strong>Moving</strong> makes it drift across the play area and opens when you reach Level 3. <strong>Shrinking</strong> makes it 4 pixels smaller with every hit, from 80 down to 24 pixels, and opens when you reach Level 4. Your best score is saved for each mode and size.</p>

<h2 id="what-this-page-cannot-teach">What this page cannot teach</h2>
<ul>
<li>Pinch-to-zoom and three or four-finger swipes. Your operating system handles them and browsers report them inconsistently, so the page does not check them.</li>
<li>Settings that belong to your laptop or system, such as pointer speed or which gestures are turned on.</li>
<li>Anything for people who cannot use a pointing device. This page needs one.</li>
<li>Touchscreens. It still runs, but it is built for a mouse or a laptop trackpad.</li>
</ul>
<p>The page does not claim that using it will make you faster or more accurate. The Aim numbers are only a way to see your own scores change over time on this device.</p>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Your device choice, the drills you have finished and your best Aim scores are stored in your browser's local storage on this device. There is no FreeTyper account. Clearing your site data erases them. Visits to the site are measured with Google Analytics, which also receives the name of a drill you finished, your device choice and the level, when you pass a level, and after an Aim run the mode, size, hits, accuracy and score: numbers and short labels only. The <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="mouse-practice-faq">Mouse practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>Levels, drills, checks, scoring and what is saved: how the tool on this page works, as described above.</li>
<li>The wording of each step, the target sizes, every pass mark, the level order and the ten-second reminder are FreeTyper's own suggestions, not taken from a study or a standard.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a step behaves differently from this page, or does not work on your trackpad, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Choose mouse or trackpad',
    text: 'Pick Mouse or Trackpad at the top of the tool. The page cannot tell them apart, so this changes the wording of each step to match your device.',
  },
  {
    name: 'Start with Level 1',
    text: 'Work through move, click, double-click, right-click, drag and drop, scroll and the final mixed step. Each one finishes as soon as you do the action.',
  },
  {
    name: 'Pass a level to open the next',
    text: 'Levels 2, 3 and 4 train accuracy, speed and timed challenges. Each opens when you pass every drill in the level before, and passing earns a rank.',
  },
  {
    name: 'Practise a drill again',
    text: 'Tap any numbered dot above the practice box to go back to that drill.',
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
