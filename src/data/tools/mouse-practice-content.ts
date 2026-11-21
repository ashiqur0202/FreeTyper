/**
 * Guide content for /mouse-practice ("Mouse lessons"). The non-stop practice page is /mouse-practice-trainer
 * (its own guide: mouse-practice-trainer-content.ts).
 *
 * Describes `MousePractice.tsx`, `MouseLevels.tsx` (the horizontal path: four ranks in a row, a row of drills,
 * each drill opening when the one before is finished), `course.tsx` (the four levels and their wording),
 * `drills.tsx`, `drills2.tsx`, `drills3.tsx`, `drills4.tsx`, `AimTrainer.tsx` (now only inside the Shrinking
 * targets drill), `mouseData.ts`, `levelRules.ts` (unlocking, ranks and every pass mark), `aimScoring.ts` and
 * `useMouseProgress.ts` (storage key `freetyper-mouse`). If a drill, a pass mark or what is saved changes,
 * update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-11-21 (lessons became a step-by-step path; the Aim tab moved to the Mouse practice page)
 */

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Is this for a mouse or for a laptop trackpad?',
    answer:
      'Both. A browser cannot tell a laptop trackpad from a mouse, so the page asks which one you are using and changes the wording and the steps to match, for example "tap the pad" instead of "press the left button". The checks underneath are the same for both, so you pass a step the same way on either.',
  },
  {
    question: 'What do Mouse lessons teach?',
    answer:
      'A path of four levels, Beginner, Comfortable, Skilled and Mastery, with a practice box for every drill. Level 1 starts with moving the pointer and clicking; Level 4 is timed challenges. A drill finishes the moment you pass it, and that opens the next one.',
  },
  {
    question: 'How do the levels unlock?',
    answer:
      'Level 1 is open from the start. Inside a level, each drill opens when you have finished the one before it. Each later level opens when you have passed every drill in the one before it, and passing a level gives you a rank: Beginner, Comfortable, Skilled or Master. The pass marks are our own suggestions, not a research standard.',
  },
  {
    question: 'Where did the Aim tab go?',
    answer:
      'Aim now lives on its own page, Mouse practice, as part of non-stop practice with more skills. Your best Aim scores are kept and shown there. The Shrinking targets drill in Level 4 here still uses the same scoring.',
  },
  {
    question: 'How are the two timed drills scored?',
    answer:
      'The shrinking-target drill runs 30 seconds: a click on the target is a hit, a click anywhere else in the play area is a miss, and the score is hits minus misses, never below zero. The gauntlet takes away the wrong actions from the right ones. Both need 15 or more to pass.',
  },
  {
    question: 'What do I do if a trackpad step does not work?',
    answer:
      'Tap-to-click, two-finger right-click and tap-to-drag can each be turned off in the touchpad settings of your laptop, so check those first. You can always press the pad down instead of tapping it.',
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
      'Your device choice, finished drills and best Aim scores are saved in your own browser, on this device only, and clearing your site data erases them. There is no account. Google Analytics also receives short labels and numbers about drills and Aim runs; the privacy section on this page and the privacy policy list what.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const meta = {
  title: 'Mouse Practice for Beginners — Free Mouse & Trackpad Exercises',
  description:
    'Free mouse and trackpad lessons from beginner to mastery: four levels of drills that open one step at a time, with ranks. No signup.',
};

export const previewHtml = `
<h2>Mouse and Trackpad Practice for Beginners</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-21">November 21, 2026</time></span>
  <span>~4 min read</span>
</p>
<p>This page teaches you to use a mouse or a laptop trackpad, from your first click to timed challenges. It is a path of four levels, Beginner, Comfortable, Skilled and Mastery, with wording for the device you pick. You work through one drill at a time: finishing a drill opens the next, each level opens when you pass the one before it, and passing gives you a rank. It is free, needs no signup, and your progress stays in your browser. When you want non-stop practice instead of lessons, the <a href="/mouse-practice-trainer">Mouse practice</a> page has rounds you can repeat for as long as you like.</p>
<p>Below you will find how the path works, what each drill asks of you, how the timed drills score, what is saved, and what the page cannot teach.</p>
`;

export const bodyHtml = `
<h2 id="how-mouse-lessons-work">How Mouse lessons work: four levels</h2>
<p>First choose <strong>Mouse</strong> or <strong>Trackpad</strong> at the top of the tool. The page cannot detect which one you have, because a laptop trackpad looks like a mouse to a web page, so the choice is yours and it is remembered. It changes the instructions only: with a mouse you press the left button, with a trackpad you press or tap the pad.</p>
<p>The four ranks run along the top of the tool and the drills of the level you are on run in a row beneath them, with the instruction above one practice box. A drill is open when you have finished the one before it; the rest show a padlock. <strong>Level 1, Beginner</strong> has seven steps:</p>
<ol>
<li><strong>Move the pointer</strong> onto three glowing circles in turn. No click is needed.</li>
<li><strong>Click</strong> the circle once.</li>
<li><strong>Double-click</strong> the circle. A single click does not count; the box says to go again, quicker.</li>
<li><strong>Right-click</strong> inside the box. The browser's usual right-click menu is blocked inside that box only, so you will see no menu there; everywhere else on the page it works as normal.</li>
<li><strong>Drag and drop</strong> the card into the dashed box. Letting go anywhere else sends the card back.</li>
<li><strong>Scroll</strong> down the list. The step finishes once you have moved a good way down it.</li>
<li><strong>Put it together:</strong> three prompts in a row, in the order click, right-click, double-click.</li>
</ol>
<p>A drill finishes the moment you do the action, and its circle in the row turns into a tick and opens the next one. Finished drills are saved for each device choice, and you can click any finished drill in the row to practise it again.</p>

<h2 id="levels-two-to-four">Levels 2 to 4: comfortable, skilled, mastery</h2>
<p>Each level opens when you have passed every drill in the one before. All pass marks below are our own suggestions.</p>
<ul>
<li><strong>Level 2, Comfortable</strong> trains accuracy and control: click ten small circles (36 pixels) with at least 80% of your clicks hitting; drag a card onto a small dashed circle three times; press and hold a circle for one second; select a highlighted sentence by dragging across it or clicking it three times quickly; and scroll a long list to find Item 47 and click it.</li>
<li><strong>Level 3, Skilled</strong> trains speed and smooth movement: click a drifting circle eight times; move the pointer along a narrow path from a start dot to an end dot while staying inside the path at least 85% of the time; make five double-clicks within 20 seconds of your first click; right-click a circle three times and choose the named item from a menu; and drag four numbered cards into their slots.</li>
<li><strong>Level 4, Mastery</strong> is timed: a 60-second gauntlet where the circle asks for a click, a double-click, a right-click or a drag and you score the right actions minus the wrong ones (15 or more to pass); a 30-second shrinking-target run (score 15 or more); and 20 tiny circles (24 pixels) with at least 90% of your clicks hitting.</li>
</ul>
<p>If you miss a pass mark, the drill shows your result and a Try again button, and nothing is saved as finished until you pass. A locked level shows what you need to open it. Passing Level 1, 2, 3 or 4 gives you the rank Beginner, Comfortable, Skilled or Master, shown at the top of the tool. Progress is saved for Mouse and for Trackpad separately, and the pass marks are the same for both, so a rank means the same on either. Levels 3 and 4 may simply feel harder on a trackpad.</p>

<h2 id="mouse-versus-trackpad">Mouse versus trackpad</h2>
<p>The instructions differ where the hardware does. For a right-click, a mouse has a right button; a trackpad usually uses a two-finger tap or the bottom-right corner of the pad. For dragging, a trackpad needs you to press and hold while sliding, or to use tap-to-drag if your laptop has it. For scrolling, a mouse has a wheel and a trackpad uses two fingers sliding up or down.</p>
<p>Laptops are set up differently, and tap-to-click, two-finger right-click and tap-to-drag can each be switched off in the touchpad settings. If a trackpad step is still open after about ten seconds, the page reminds you to check those settings. It does not name menus for particular laptops or systems.</p>

<h2 id="how-the-timed-drills-score">How the timed drills score</h2>
<p>Two Level 4 drills are timed. The <strong>shrinking-target drill</strong> lasts 30 seconds with one round target on screen at a time that gets 4 pixels smaller with every hit, from 80 down to 24 pixels. A click on the target is a <strong>hit</strong> and the target jumps to a new place; a click anywhere else in the play area is a <strong>miss</strong>. Your score is hits minus misses and never goes below zero, and you need 15 or more to pass. The <strong>gauntlet</strong> lasts 60 seconds and scores the right actions minus the wrong ones, also with 15 or more to pass. Accuracy and average reaction time are shown after the shrinking-target run, and your best score is saved on this device.</p>
<p>The old Aim tab, with its Classic, Moving and Shrinking modes, now lives on the <a href="/mouse-practice-trainer">Mouse practice</a> page, which also has more skills. Your saved best Aim scores are shown there.</p>

<h2 id="what-this-page-cannot-teach">What this page cannot teach</h2>
<ul>
<li>Pinch-to-zoom and three or four-finger swipes. Your operating system handles them and browsers report them inconsistently, so the page does not check them.</li>
<li>Settings that belong to your laptop or system, such as pointer speed or which gestures are turned on.</li>
<li>Anything for people who cannot use a pointing device. This page needs one.</li>
<li>Touchscreens. It still runs, but it is built for a mouse or a laptop trackpad.</li>
</ul>
<p>The page does not claim that using it will make you faster or more accurate. The scores are only a way to see your own results change over time on this device.</p>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Your device choice, the drills you have finished and your best Aim scores are stored in your browser's local storage on this device. There is no FreeTyper account. Clearing your site data erases them. Visits to the site are measured with Google Analytics, which also receives the name of a drill you finished, your device choice and the level, when you pass a level, and after an Aim run the mode, size, hits, accuracy and score: numbers and short labels only. The <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="mouse-lessons-faq">Mouse lessons FAQ</h2>
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
    text: 'Work through move, click, double-click, right-click, drag and drop, scroll and the final mixed step. Each one finishes as soon as you do the action, and that opens the next.',
  },
  {
    name: 'Pass a level to open the next',
    text: 'Levels 2, 3 and 4 train accuracy, speed and timed challenges. Each opens when you pass every drill in the level before, and passing earns a rank.',
  },
  {
    name: 'Practise a drill again',
    text: 'Click any finished drill in the row above the practice box to go back to it.',
  },
  {
    name: 'Keep going on Mouse practice',
    text: 'When you pass a level, open the Mouse practice page for non-stop rounds of the skills you have learned.',
  },
];
