/**
 * Guide content for /mouse-practice-trainer ("Mouse practice"). The step-by-step page is /mouse-practice
 * ("Mouse lessons"; its guide is mouse-practice-content.ts).
 *
 * Describes `MouseTrainer.tsx` (the page: skill picker, rounds, results, weak-spot map), `practiceSkills.ts`
 * (how each of the eight skills is drawn and judged), `practiceRules.ts` (sizes, speeds, when the level moves,
 * the 3 x 3 map, what is saved) and `usePracticeStore.ts` (storage key `freetyper-mouse-practice`). Old Aim best
 * scores are read from `useMouseProgress.ts` (key `freetyper-mouse`). If a skill, a number in practiceRules.ts or
 * what is saved changes, update this file in the same commit.
 *
 * The FAQ list is the single source for the visible FAQ and the FAQPage JSON-LD.
 *
 * Last real edit: 2026-11-21 (new page)
 */

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How is Mouse practice different from Mouse lessons?',
    answer:
      'Mouse lessons teach each move step by step and open the next step when you finish one. Mouse practice has no steps: you pick a skill and keep repeating it in 30-second rounds, so your hand gets steadier. Start with the lessons if the mouse is new to you.',
  },
  {
    question: 'What are the eight skills?',
    answer:
      'Click, Double-click, Scroll, Drag, Switch, Moving, Follow and Shrinking. Each one is a short job, for example click circles, follow a moving dot, or scroll a list to find a named item. All eight are open from the start.',
  },
  {
    question: 'How long is a round, and what happens after it?',
    answer:
      'A round lasts 30 seconds. After a short break of 6 seconds the next round starts by itself, and it keeps going until you press Stop. You can press Start now to skip the wait.',
  },
  {
    question: 'How does the level change?',
    answer:
      'Each skill has its own level from 1 to 10 and starts at 2. It goes up after a round with at least 90% accuracy and enough hits, and down after a round below 65%. A round where nothing is tried stops the rounds and changes nothing. Higher levels mean smaller targets, faster targets or longer lists. These steps are our own suggestions, not a researched standard.',
  },
  {
    question: 'What does the map of squares show?',
    answer:
      'The play area is split into nine squares. Each square shows the share of your tries there that were missed or slow, once it has at least 8 tries. The square with the most trouble is named under the map. It resets when you reload the page.',
  },
  {
    question: 'What are Mixed and Today\'s 5-minute mix?',
    answer:
      'Mixed rotates through the suggested skills, one round each. Today\'s 5-minute mix is 10 rounds of 30 seconds, rotating the same way, and then it says it is done.',
  },
  {
    question: 'Why are some skills first in the list?',
    answer:
      'Skills that practise a Mouse lessons level you have already passed come first in the list, and Level 1 skills come first for everyone. The rest follow, with their names in a dimmer colour. Nothing is locked: you can try any skill at any time, and the level adjusts to you. Each button shows your current level for that skill.',
  },
  {
    question: 'What happened to the Aim tab and my best scores?',
    answer:
      'The Aim modes live here now: Click is the old Classic mode, Moving is its own skill, and Shrinking is its own skill. Your best Aim scores from before are kept and shown at the bottom of this page when you have any.',
  },
  {
    question: 'Does it work on a phone or a touchscreen?',
    answer:
      'Most skills run, but the page is built for a mouse or a laptop trackpad. Drag and Follow are the hardest to do with a finger, and Follow only tracks you while a finger is sliding on the screen.',
  },
  {
    question: 'What is saved, and is anything uploaded?',
    answer:
      'Your level for each skill, your practice minutes for today and your latest 12 rounds are saved in your own browser, on this device only, and clearing your site data erases them. There is no account. Google Analytics also receives the skill, level, hits and accuracy of a round; the privacy section on this page and the privacy policy list what.',
  },
];

const faqHtml = faqs
  .map((f) => `<h3>${f.question}</h3>\n<p>${f.answer}</p>`)
  .join('\n');

export const meta = {
  title: 'Mouse Practice Trainer — Non-Stop Click, Scroll & Aim Drills (Free)',
  description:
    'Free non-stop mouse and trackpad practice: eight skills, 30-second rounds that follow one another, a level that adjusts to you and a map of where you miss. No signup.',
};

export const previewHtml = `
<h2>Mouse Practice Trainer: Non-Stop Drills</h2>
<p class="article-byline">
  <span>By <a href="/about#author"><strong>Ashiqur Rahman</strong></a></span>
  <span>Last updated <time datetime="2026-11-21">November 21, 2026</time></span>
  <span>~4 min read</span>
</p>
<p>This page is for repeating mouse skills until your hand is fast and steady. Pick one of eight skills, such as clicking circles, double-clicking, scrolling a list to find an item, dragging, or following a moving dot, and press Start. Rounds last 30 seconds and keep coming until you stop. The level adjusts to how you do, and a map of nine squares shows where on the screen you miss or are slow. It is free, needs no signup, and your progress stays in your browser.</p>
<p>New to the mouse? The <a href="/mouse-practice">Mouse lessons</a> page teaches each move step by step. Below you will find how each skill works, how the level changes, what the map shows, what is saved, and what this page cannot do.</p>
`;

export const bodyHtml = `
<h2 id="how-a-round-works">How a round works</h2>
<p>Choose a skill, or <strong>Mixed</strong>, and press <strong>Start</strong>. A round lasts <strong>30 seconds</strong>. Above the play area you see the time left, your hits, your accuracy and your average speed for the round. When the time is up, a short result appears, and after a 6-second break the next round starts by itself. Press <strong>Stop</strong> to rest, or <strong>Start now</strong> to skip the wait. If a whole round passes with nothing tried (no click, drag or follow), the page assumes you have left, stops the rounds and saves nothing, so an unattended page does not keep running. A line at the bottom of the tool shows your practice minutes for today against a goal of 10 minutes, which is our own suggestion.</p>
<p>In Click, Double-click, Moving and Shrinking, a click on empty play area counts as a miss. Accuracy is hits divided by all your tries, as a whole percent. Average speed is the time from a target appearing to you hitting it, in milliseconds.</p>

<h2 id="the-eight-skills">The eight skills</h2>
<ul>
<li><strong>Click:</strong> click each circle. A new one appears at once. The circle is about 61 pixels across at level 1 and about 16 at level 10.</li>
<li><strong>Double-click:</strong> two quick clicks on a circle, within half a second of each other. One click alone does not count, and counts as a miss when the second click does not come. The circle goes from about 67 down to 22 pixels.</li>
<li><strong>Scroll:</strong> the bar at the top names an item, for example "Item 31". Scroll the list to find it and click it. Lists have 52 rows at level 1 up to 160 rows at level 10, and the rows get shorter, from 44 down to 24 pixels. The next item is always chosen far from where you are, so you have to scroll again.</li>
<li><strong>Drag:</strong> drag the ball into the dashed ring and let go inside it. Letting go outside sends the ball back and counts as a miss. The ring is about twice the width of the ball, and the ball goes from about 43 down to 18 pixels.</li>
<li><strong>Switch:</strong> four circles stay on screen and one glows. Click the glowing one, and another lights up at once. Clicking a dark one is a miss. The circles go from about 53 down to 21 pixels.</li>
<li><strong>Moving:</strong> a target drifts across the play area and bounces off the edges. Click it before it gets away. It goes from about 64 down to 23 pixels and from 80 up to 260 pixels a second.</li>
<li><strong>Follow:</strong> keep your pointer inside a moving dot. Instead of hits, the round counts the seconds you stay on the dot, and accuracy is the share of time on it. The first 1.5 seconds are a free grace period to find the dot. The dot goes from about 75 down to 25 pixels and from 95 up to 320 pixels a second.</li>
<li><strong>Shrinking:</strong> a large target of 72 pixels shrinks while you aim at it. Click it before it vanishes; one that vanishes is a miss. It lasts about 2.4 seconds at level 1 and 0.9 seconds at level 10.</li>
</ul>

<h2 id="how-the-level-changes">How the level changes</h2>
<p>Every skill has its own level from 1 to 10, and a new skill starts at level 2. After each round:</p>
<ul>
<li>The level goes <strong>up by one</strong> when accuracy is 90% or higher and you made enough hits: 8 for Click, Switch, Moving and Shrinking, 6 for Double-click and Drag, 4 for Scroll. Follow needs no minimum, because it counts time.</li>
<li>The level goes <strong>down by one</strong> when accuracy is below 65%.</li>
<li>Otherwise it stays the same.</li>
</ul>
<p>The result shows what happened and, if there was an earlier round of the same skill saved on this device, whether you did better or worse than it. These marks and steps are our own suggestions, not taken from a study or a standard.</p>

<h2 id="the-weak-spot-map">The weak-spot map</h2>
<p>The play area is split into three rows and three columns. For every try, the page notes which square the target was in and whether the try was missed or slow. A hit counts as <strong>slow</strong> when it took more than 1.6 times your average hit time so far in that round, once you have three earlier hits. In Follow, about ten samples a second are taken, and a sample off the dot counts as trouble. Each square then shows the percent of its tries that were missed or slow, once it has at least 8 tries, and darker means more trouble. The square with the highest share is named under the map. The map covers this visit only and starts again when you reload the page.</p>

<h2 id="suggested-skills-and-mixes">Suggested skills and mixes</h2>
<p>Nothing on this page is locked. Skills that practise a level you have passed on the <a href="/mouse-practice">Mouse lessons</a> page come first in the list, and the Level 1 skills (Click, Double-click and Scroll) come first for everyone. Skills for levels you have not passed yet follow with their names in a dimmer colour, and you can try them whenever you like. Each button shows your current level for that skill, for example Lv 3.</p>
<p><strong>Mixed</strong> goes through the marked skills in turn, one round each. <strong>Today's 5-minute mix</strong> does the same for 10 rounds of 30 seconds and then says it is done.</p>

<h2 id="your-old-aim-scores">Your old Aim scores</h2>
<p>The page used to have an Aim tab with Classic, Moving and Shrinking modes. Those modes are skills here now. If you saved best Aim scores before, they are still stored in your browser and are listed at the bottom of the tool, by mode and size.</p>

<h2 id="what-this-page-cannot-do">What this page cannot do</h2>
<ul>
<li>It does not claim that practising here will make you faster or more accurate at anything else. The numbers are only a way to see your own results change over time on this device.</li>
<li>It cannot see your pointer speed, your trackpad settings or which gestures your laptop has turned on.</li>
<li>It is built for a mouse or a laptop trackpad. On a touchscreen most skills still run, but Drag and Follow are hard to do with a finger.</li>
<li>It is not for people who cannot use a pointing device.</li>
</ul>

<h2 id="your-data-and-privacy">Your data and privacy</h2>
<p>Your level for each skill, today's practice time and your latest 12 rounds are stored in your browser's local storage on this device. There is no FreeTyper account, and clearing your site data erases them. Visits to the site are measured with Google Analytics, which also receives, for each round, the skill, the level and, when it ends, the hits and accuracy: numbers and short labels only. The <a href="/privacy">privacy policy</a> has the details.</p>

<h2 id="mouse-practice-faq">Mouse practice FAQ</h2>
${faqHtml}

<h2 id="sources-and-method">Sources and method</h2>
<ul class="article-sources">
<li>The skills, rounds, levels, the map and what is saved: how the tool on this page works, as described above.</li>
<li>The round length, the sizes and speeds at each level, the level steps and accuracy marks, the minimum hits and the 10-minute goal are FreeTyper's own suggestions, not taken from a study or a standard.</li>
</ul>
<p class="article-note">Written and maintained by <a href="/about#author">Ashiqur Rahman</a>. If a skill behaves differently from this page, <a href="/contact">tell me</a> and I will check it.</p>
`;

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Pick a skill',
    text: 'Choose Click, Double-click, Scroll, Drag, Switch, Moving, Follow or Shrinking. The first ones in the list match the Mouse lessons levels you have passed. Choose Mixed for a bit of each.',
  },
  {
    name: 'Press Start',
    text: 'A round lasts 30 seconds. Follow the instruction above the play area and watch your hits, accuracy and speed.',
  },
  {
    name: 'Keep going',
    text: 'After a 6-second break the next round starts by itself. Press Stop when you want to rest.',
  },
  {
    name: 'Read the result',
    text: 'After each round you see your result, whether the level went up or down, and a map of the nine squares that shows where you miss most.',
  },
  {
    name: 'Reach your daily minutes',
    text: 'The bar at the bottom counts practice minutes for today toward a 10-minute goal. Today\'s 5-minute mix is 10 short rounds across your suggested skills.',
  },
];
