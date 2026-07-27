/**
 * Elite SEO content for /typing-progress
 * ExpandableSeoContent — body always in DOM.
 * Last editorial pass: 2026-07-27
 */

export const meta = {
  title: 'Typing Progress Tracker — WPM History, Streaks & Achievements',
  description:
    'Free typing progress tracker with WPM history, accuracy trends, weak-key heatmap, streaks, and achievements. Private local storage — no signup required.',
};

export const previewHtml = `
<h2>Typing Progress Tracker — Measure What Actually Improves</h2>
<p class="article-byline">
  <span>By <strong>FreeTyper Editorial</strong></span>
  <span>Updated <time datetime="{{UPDATED_DATETIME}}">{{UPDATED_DISPLAY}}</time></span>
  <span>Reviewed for accuracy · ~11 min read</span>
</p>
<p>A free <strong>typing progress tracker</strong> turns random practice into a feedback loop. FreeTyper stores your sessions in this browser — WPM history, accuracy, streaks, achievements, and a key-level <strong>error heatmap</strong> — without forcing an account.</p>
<p>Use the dashboard above after any <a href="/">speed test</a>, <a href="/typing-lessons">lesson</a>, or <a href="/typing-practice">practice</a> run. The guide below explains how to read the charts, fix weak keys, build streaks that stick, and avoid common measurement mistakes.</p>
<h3>How FreeTyper Progress Works</h3>
<ol>
<li><strong>Type on FreeTyper</strong> — tests, lessons, practice, and games can all write sessions.</li>
<li><strong>Open this page</strong> — see best/average WPM, streaks, recent sessions, and weak keys.</li>
<li><strong>Act on the data</strong> — drill weak keys, retest weekly, protect accuracy.</li>
<li><strong>Stay private</strong> — progress lives in localStorage on your device by design.</li>
</ol>
<blockquote><p><strong>Rule:</strong> Track trends, not single runs. One lucky 80 WPM sprint means less than a rising 4-week average at 95%+ accuracy.</p></blockquote>
<nav class="article-toc" aria-label="Table of contents">
<p>On this page</p>
<ol>
<li><a href="#why-track">Why tracking beats guessing</a></li>
<li><a href="#dashboard">Reading the dashboard</a></li>
<li><a href="#wpm-history">WPM history &amp; averages</a></li>
<li><a href="#weak-keys">Weak keys &amp; heatmap</a></li>
<li><a href="#streaks">Streaks that work</a></li>
<li><a href="#achievements">Achievements explained</a></li>
<li><a href="#privacy">Privacy &amp; local storage</a></li>
<li><a href="#weekly-review">Weekly review ritual</a></li>
<li><a href="#goals">Setting verifiable goals</a></li>
<li><a href="#common-mistakes">Tracking mistakes</a></li>
<li><a href="#plateau-data">Using data to break plateaus</a></li>
<li><a href="#who-progress">Who should track progress</a></li>
<li><a href="#progress-faq">Progress FAQ</a></li>
<li><a href="#sources-progress">Sources &amp; standards</a></li>
</ol>
</nav>
`;

export const bodyHtml = `
<h2 id="why-track">Why Typing Progress Tracking Beats Guessing</h2>
<p>Most people “feel” faster after a good day and slower after a tired evening. Feelings are noisy. A progress tracker answers three practical questions:</p>
<ul>
<li><strong>Am I improving over weeks?</strong> (trend, not mood)</li>
<li><strong>What specifically is broken?</strong> (weak keys, accuracy leaks)</li>
<li><strong>Is my practice plan working?</strong> (sessions + outcomes)</li>
</ul>
<p>Without measurement, practice becomes random motion. With measurement — especially privacy-friendly local tracking — you can run the same loop athletes use: train → measure → adjust.</p>
<p>FreeTyper’s progress page is the measurement hub for the whole product: speed tests for baselines, lessons for form, practice for volume, and this dashboard for truth.</p>

<h2 id="dashboard">Reading the FreeTyper Progress Dashboard</h2>
<table>
<thead><tr><th>Metric</th><th>What it means</th><th>How to use it</th></tr></thead>
<tbody>
<tr><td>Sessions</td><td>How many completed runs are stored</td><td>Volume signal — consistency over hero days</td></tr>
<tr><td>Best WPM</td><td>Peak recorded speed</td><td>Motivation ceiling, not your daily truth</td></tr>
<tr><td>Best accuracy</td><td>Peak cleanliness</td><td>Protect this while raising average WPM</td></tr>
<tr><td>Avg WPM (recent)</td><td>Mean of recent history bars</td><td>Primary improvement signal</td></tr>
<tr><td>Streak</td><td>Consecutive practice days</td><td>Habit engine — restart without shame if broken</td></tr>
<tr><td>Time typed</td><td>Total recorded duration</td><td>Dose check for under/over training</td></tr>
<tr><td>Words typed</td><td>Approx. correct output volume</td><td>Long-term workload estimate</td></tr>
</tbody>
</table>
<p>Empty dashboard? Complete any FreeTyper typing activity first. Progress only appears after real sessions in this browser profile.</p>

<h2 id="wpm-history">WPM History Charts: How to Read Trends</h2>
<p>The history chart shows recent session WPM left-to-right (older → newer). Spikes and dips are normal. What matters is the <strong>slope over 2–4 weeks</strong> under similar conditions.</p>
<h3>Good trend patterns</h3>
<ul>
<li>Average WPM rising slowly while accuracy stays ≥95%</li>
<li>Fewer wild swings as form stabilizes</li>
<li>Longer-duration tests catching up to short-sprint scores</li>
</ul>
<h3>Warning patterns</h3>
<ul>
<li>Peak WPM up, average flat, accuracy down → speed chasing</li>
<li>Big variance session-to-session → inconsistent warm-up or fatigue</li>
<li>Only short tests improving → endurance gap; practice longer passages</li>
</ul>
<p class="article-note"><strong>Compare like with like:</strong> a 15-second sprint and a 3-minute test are different sports. Prefer weekly FreeTyper speed tests at the same duration when judging progress.</p>
<p>For population context, read <a href="/blog/average-typing-speed">average typing speed</a> and <a href="/blog/good-typing-speed">what is a good typing speed</a>.</p>

<h2 id="weak-keys">Weak Keys, Heatmap &amp; Targeted Fixes</h2>
<p>Speed is often limited by a handful of keys — not “overall talent.” FreeTyper tracks per-key correctness across sessions and surfaces:</p>
<ul>
<li><strong>Weakest keys list</strong> — lowest accuracy keys with enough sample size</li>
<li><strong>Error heatmap</strong> — keyboard colored by error rate (needs a few presses to paint)</li>
</ul>
<p><strong>High-leverage loop:</strong></p>
<ol>
<li>Identify top 3–5 weak keys on this page.</li>
<li>Open <a href="/typing-practice">weak-keys practice</a> and drill 8–10 minutes at high accuracy.</li>
<li>Confirm finger ownership on the <a href="/keyboard-guide">keyboard guide</a>.</li>
<li>Retest in 7 days; weak keys should improve before peak WPM does.</li>
</ol>
<p>If a key stays red on the heatmap, you are likely using the wrong finger, looking down, or rushing past a hesitant digraph. Slow is part of the fix.</p>

<h2 id="streaks">Building Streaks That Actually Help</h2>
<p>Streaks are habit tools, not moral scores. A 7-day streak of 15 focused minutes beats a 30-day streak of distracted 2-minute taps.</p>
<ul>
<li><strong>Minimum viable day:</strong> one intentional FreeTyper session (lesson, practice, or test).</li>
<li><strong>Missed a day:</strong> restart without drama. Guilt does not type for you.</li>
<li><strong>Travel / new browser:</strong> local progress does not sync — streaks are device/browser-local.</li>
</ul>
<p>Pair streaks with a calendar cue (same time daily). Motor learning loves routine more than intensity.</p>

<h2 id="achievements">Achievements — What They Mean</h2>
<p>FreeTyper achievements unlock for milestones such as first session, WPM thresholds, accuracy bands, streaks, and total session counts. They are motivational markers, not employer certificates.</p>
<p>Use them as checkpoints:</p>
<ul>
<li>Early speed badges → foundations working</li>
<li>Accuracy badges → form clean enough to push pace</li>
<li>Session count badges → habit installed</li>
<li>Long streak badges → consistency proven</li>
</ul>
<p>Chasing achievements by spamming low-quality runs can pollute your averages. Prefer clean practice.</p>

<h2 id="privacy">Privacy-First Progress (Local Storage)</h2>
<p>FreeTyper is intentionally <strong>no-login</strong>. Progress is stored in your browser’s localStorage for this site. Benefits:</p>
<ul>
<li>No account wall to start measuring</li>
<li>No cloud profile required for weak-key analytics</li>
<li>You can reset everything from the progress page</li>
</ul>
<p><strong>Tradeoffs to understand:</strong></p>
<ul>
<li>Clearing site data wipes history</li>
<li>Another browser/device starts fresh</li>
<li>Private/incognito modes may not keep long-term history</li>
</ul>
<p>That tradeoff is the product philosophy: private measurement over surveillance accounts. If you need multi-device sync later, that would be a separate product choice — today FreeTyper optimizes for local privacy.</p>

<h2 id="weekly-review">A 10-Minute Weekly Progress Review</h2>
<table>
<thead><tr><th>Step</th><th>Action</th><th>Decision</th></tr></thead>
<tbody>
<tr><td>1</td><td>Open progress; note avg WPM &amp; accuracy trend</td><td>Improving / flat / worse</td></tr>
<tr><td>2</td><td>List top weak keys</td><td>Drill plan for next week</td></tr>
<tr><td>3</td><td>Take one standardized <a href="/">speed test</a></td><td>Same duration as last week</td></tr>
<tr><td>4</td><td>Choose focus</td><td>Lessons (form), practice (volume), or endurance tests</td></tr>
<tr><td>5</td><td>Schedule 5 short sessions</td><td>15–20 minutes, not marathons</td></tr>
</tbody>
</table>
<p>This review is how intermediate typists break plateaus: data first, ego second. Technique depth: <a href="/blog/how-to-type-faster">how to type faster</a>. Job targets: <a href="/blog/typing-speed-for-work">typing speed for work</a>.</p>

<h2 id="goals">Setting Goals From Your Dashboard</h2>
<p>Pick goals that the dashboard can verify:</p>
<ul>
<li><strong>Accuracy goal:</strong> hold ≥95% for two weeks of practice sessions</li>
<li><strong>Average WPM goal:</strong> raise recent average by +5 WPM in 30 days</li>
<li><strong>Weak-key goal:</strong> lift three weak keys above 90% accuracy</li>
<li><strong>Habit goal:</strong> 5 practice days per week for a month</li>
</ul>
<p>Avoid “hit 100 WPM tomorrow” if your average is 45. Stretch goals should be uncomfortable and measurable — not fantasy.</p>

<h2 id="common-mistakes">Progress Tracking Mistakes</h2>
<ol>
<li>Judging skill from one session</li>
<li>Changing test length every run and comparing apples to oranges</li>
<li>Ignoring accuracy while celebrating peak WPM</li>
<li>Never opening weak keys / heatmap</li>
<li>Practicing only what already feels easy</li>
<li>Resetting progress after a bad week (deletes the learning signal)</li>
<li>Expecting cloud sync on a no-login tool</li>
<li>Skipping weekly standardized tests</li>
</ol>

<h2 id="plateau-data">Using Progress Data to Break a Plateau</h2>
<p>When the chart looks flat for two weeks, do not grind harder blindly. Interrogate the dashboard:</p>
<table>
<thead><tr><th>Dashboard signal</th><th>Interpretation</th><th>Next training block</th></tr></thead>
<tbody>
<tr><td>Avg WPM flat, accuracy &lt;95%</td><td>Form leak</td><td>Lessons + slow practice; no speed intervals</td></tr>
<tr><td>Avg WPM flat, accuracy high</td><td>Under-challenged</td><td>Slightly faster intervals + harder categories</td></tr>
<tr><td>Sprint high, long tests low</td><td>Endurance gap</td><td>2–5 min tests and longer practice passages</td></tr>
<tr><td>Same 2–3 keys always weak</td><td>Specific bottleneck</td><td>Weak-key mode + finger map review</td></tr>
<tr><td>Huge day-to-day swings</td><td>Inconsistent conditions</td><td>Fixed warm-up + same test duration weekly</td></tr>
</tbody>
</table>
<p>Then run a focused 10–14 day plan and re-check the same metrics. Progress tracking only pays off when it changes behavior — otherwise it is a museum of numbers.</p>
<p>Supporting guides: <a href="/blog/how-to-type-faster">how to type faster</a> · <a href="/blog/how-many-words-per-minute">WPM targets by situation</a>.</p>

<h2 id="who-progress">Who Should Use a Typing Progress Tracker</h2>
<ul>
<li><strong>Beginners</strong> — prove that lessons are working before chasing internet speed scores.</li>
<li><strong>Intermediate typists (40–70 WPM)</strong> — weak-key analytics are usually the unlock.</li>
<li><strong>Job applicants</strong> — document readiness with accuracy + timed test history, not vibes.</li>
<li><strong>Students</strong> — short daily sessions add up; streaks make the habit visible.</li>
<li><strong>Developers</strong> — compare code-mode sessions vs prose to see symbol gaps.</li>
<li><strong>Coaches / parents</strong> — review the chart weekly with the learner; keep goals small.</li>
</ul>
<p>If you never look at data, FreeTyper still works as a toolset — but you will improve slower than someone who closes the loop.</p>

<h2 id="session-quality-log">What a “Good” Session Looks Like in History</h2>
<p>Not every bar on the chart should be a personal record. Healthy history includes:</p>
<ul>
<li>Warm-up sessions slightly below peak</li>
<li>Accuracy-first drills that look “slow” but clean</li>
<li>Occasional harder modes (news/code) that dip WPM while teaching new patterns</li>
<li>One standardized weekly test for comparison</li>
</ul>
<p>If every session is an all-out sprint, you will inflate ego metrics and stall real skill. The progress page makes that pattern obvious — use it as a coach, not a slot machine.</p>

<h2 id="metrics-deep-dive">Deep Dive: Best vs Average vs Last Session</h2>
<p>Three numbers people confuse constantly:</p>
<ul>
<li><strong>Best WPM</strong> — your highest stored peak. Useful for motivation, dangerous as a self-identity. One perfect text on a perfect day is not your working speed.</li>
<li><strong>Recent average WPM</strong> — closer to what you can expect on a normal day. This is the number to move over months.</li>
<li><strong>Last session</strong> — highly sensitive to sleep, stress, keyboard, and category. Never make career decisions from one bar.</li>
</ul>
<p>Pair every speed number with accuracy. A 70 WPM average at 92% accuracy is usually less “job ready” than 60 WPM at 98%, especially for admin, legal, or medical contexts. FreeTyper shows both so you do not optimize the wrong axis.</p>
<p>When reporting progress to yourself weekly, write one sentence: “Average X WPM at Y% accuracy; weak keys A, B, C; plan = …” That sentence is more valuable than screenshots of a single PR.</p>

<h2 id="tool-loop">How Progress Connects to Every FreeTyper Tool</h2>
<table>
<thead><tr><th>Tool</th><th>What it writes / reveals</th><th>What you do next on Progress</th></tr></thead>
<tbody>
<tr><td><a href="/">Speed test</a></td><td>Timed WPM + accuracy baseline</td><td>Compare weekly bars; keep duration constant</td></tr>
<tr><td><a href="/typing-lessons">Lessons</a></td><td>Form-focused sessions</td><td>Expect temporary WPM dips while accuracy rises</td></tr>
<tr><td><a href="/typing-practice">Practice</a></td><td>Category + weak-key volume</td><td>Watch weak-key list shrink over time</td></tr>
<tr><td><a href="/keyboard-guide">Keyboard guide</a></td><td>Finger ownership (no session required)</td><td>Map red heatmap keys to correct fingers</td></tr>
<tr><td>This progress page</td><td>Aggregation + achievements</td><td>Decide next week’s constraint to attack</td></tr>
</tbody>
</table>
<p>Think of FreeTyper as a training system, not isolated mini-apps. Progress is the scoreboard that makes the system coherent.</p>

<h2 id="motivation">Motivation Without Burnout</h2>
<p>Trackers can backfire if they become shame dashboards. Rules that keep FreeTyper progress healthy:</p>
<ul>
<li>Celebrate process metrics (sessions completed, weak keys trained) as much as outcome metrics (WPM).</li>
<li>Allow recovery days; streaks are helpers, not handcuffs.</li>
<li>Hide the page for a day if you are spiral-refreshing after a bad run — go practice calmly instead.</li>
<li>Reset only when you truly want a clean experiment, not as emotional punishment.</li>
</ul>
<p>Sustainable typing improvement is months-long. The dashboard’s job is to keep you honest and curious, not anxious.</p>

<h2 id="thirty-day">A 30-Day Progress Experiment</h2>
<p>If you want a simple, closed-loop plan that uses this page properly:</p>
<ol>
<li><strong>Day 1:</strong> Baseline speed test (note duration). Screenshot is optional; writing the numbers is enough.</li>
<li><strong>Days 2–6:</strong> 15 minutes practice or lessons daily; ignore peak WPM obsession.</li>
<li><strong>Day 7:</strong> Progress review + same-duration retest.</li>
<li><strong>Days 8–13:</strong> Weak-key focus if accuracy &lt;95% on problem keys; otherwise push slightly harder text.</li>
<li><strong>Day 14:</strong> Mid-point review — is average rising? Adjust.</li>
<li><strong>Days 15–27:</strong> Maintain the winning pattern; add one longer test weekly.</li>
<li><strong>Day 30:</strong> Final same-duration test; compare average, accuracy, weak keys, streak.</li>
</ol>
<p>At day 30 you will know whether the system works for you — because the dashboard holds the receipts. That is elite use of a free typing progress tracker: not staring at charts, but closing the loop for a month. If results are flat, change one variable only (duration, weak-key focus, or lesson time) and run another two weeks — multi-variable chaos makes the chart unreadable.</p>

<h2 id="progress-faq">Typing Progress FAQ</h2>
<h3>Is the FreeTyper progress tracker free?</h3>
<p>Yes. Tracking is free and works without an account.</p>
<h3>Where is my progress stored?</h3>
<p>In your browser’s localStorage for freetyper.com on this device/profile. It is not uploaded to a FreeTyper account because there is no login.</p>
<h3>Why is my progress empty?</h3>
<p>No completed sessions are stored yet, you cleared site data, or you are on a different browser/device than where you practiced.</p>
<h3>Do games and lessons count toward progress?</h3>
<p>Sessions that complete through FreeTyper’s typing tools and write session data appear in history. Use tests and practice for the cleanest trend lines.</p>
<h3>How is average WPM calculated on this page?</h3>
<p>The dashboard average uses recent session history shown in the chart (up to the latest batch of sessions), not only your single best run.</p>
<h3>What makes a key “weak”?</h3>
<p>Keys with enough presses and lower accuracy than your other keys. FreeTyper ranks them so you can drill the real bottleneck.</p>
<h3>Can I export or sync progress?</h3>
<p>Not in the current no-login product. Privacy-local storage is the default. Reset is available if you want a clean slate.</p>
<h3>Will resetting delete everything?</h3>
<p>Yes — sessions, key stats, streaks, and achievement unlock timestamps stored locally are cleared.</p>
<h3>How often should I check progress?</h3>
<p>Glance after sessions; do a deeper review weekly. Obsessive daily judgment of noisy data can hurt motivation.</p>
<h3>Why did my WPM drop even though I practiced?</h3>
<p>Technique changes, harder text modes, fatigue, or stricter accuracy focus can lower short-term WPM while building better long-term skill. Watch multi-week averages.</p>
<h3>Should I care more about best WPM or average WPM?</h3>
<p>Average (and accuracy) for real improvement. Best WPM is a highlight reel.</p>
<h3>How do achievements unlock?</h3>
<p>Automatically when conditions are met after sessions (speed, accuracy, streak, session count thresholds).</p>

<h2 id="sources-progress">Sources &amp; Editorial Standards</h2>
<ul class="article-sources">
<li><strong>Feedback loops in skill learning:</strong> Deliberate practice frameworks emphasize measurable goals and targeted weak-point training — applied here as WPM/accuracy tracking + weak-key drills.</li>
<li><strong>Distributed practice:</strong> Short frequent sessions outperform rare marathons for motor skills; FreeTyper recommends 15–20 minute days.</li>
<li><strong>WPM definition:</strong> FreeTyper scoring uses the common 5-characters-per-word unit; see the home <a href="/">typing speed test</a> methodology and <a href="https://en.wikipedia.org/wiki/Words_per_minute" rel="noopener noreferrer" target="_blank">Wikipedia: Words per minute</a>.</li>
<li><strong>Privacy model:</strong> Local-first progress is a product decision for FreeTyper’s no-signup design — documented here so users understand sync limits.</li>
</ul>
<p class="article-note"><strong>Corrections:</strong> Use the <a href="/contact">contact</a> page. Last editorial update: <time datetime="{{UPDATED_DATETIME}}">{{UPDATED_DISPLAY}}</time>.</p>

<h2 id="start-tracking">Start Tracking — Then Train Smarter</h2>
<p>If the dashboard is empty, take a test now. If it is full, pick one weak key and one weekly goal. Progress is not a vanity wall — it is a compass.</p>
<p><strong>Next steps:</strong></p>
<ul>
<li>Run a baseline <a href="/">typing speed test</a>.</li>
<li>Train form with <a href="/typing-lessons">typing lessons</a>.</li>
<li>Volume + weak keys via <a href="/typing-practice">typing practice</a>.</li>
<li>Confirm finger ownership on the <a href="/keyboard-guide">keyboard guide</a>.</li>
<li>Return here weekly and adjust the plan.</li>
</ul>
<p>What gets measured in private still gets improved — without selling your identity for a chart. FreeTyper progress is free, local, and ready whenever you type.</p>
`;

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Is the FreeTyper progress tracker free?',
    answer:
      'Yes. Typing progress tracking is free and works without creating an account.',
  },
  {
    question: 'Where is my typing progress stored?',
    answer:
      'In your browser’s localStorage for this site on the current device and browser profile. FreeTyper does not require a cloud login.',
  },
  {
    question: 'Why is my progress page empty?',
    answer:
      'You have no completed sessions yet, site data was cleared, or you are using a different browser or device than where you practiced.',
  },
  {
    question: 'How should I read WPM history?',
    answer:
      'Focus on multi-week trends and recent averages under similar test durations. Single spikes or dips are normal and less meaningful than the slope over time.',
  },
  {
    question: 'What are weak keys in FreeTyper?',
    answer:
      'Keys with enough sample presses and lower accuracy than your other keys. Drill them in weak-keys practice mode and re-check the heatmap after a week.',
  },
  {
    question: 'Does resetting progress delete everything?',
    answer:
      'Yes. Confirming reset clears local sessions, key stats, streaks, and achievement unlock data stored in this browser.',
  },
  {
    question: 'Can I sync progress across devices?',
    answer:
      'Not in the current no-login design. Each browser profile keeps its own local history for privacy.',
  },
  {
    question: 'Should I care more about best WPM or average WPM?',
    answer:
      'Average WPM and accuracy better reflect real skill. Best WPM is a peak highlight and can mislead if accuracy is poor.',
  },
  {
    question: 'How often should I review my typing progress?',
    answer:
      'Glance after sessions and do a deeper review weekly: check averages, weak keys, run one standardized speed test, then set the next week’s focus.',
  },
  {
    question: 'Why did my WPM drop after practicing more?',
    answer:
      'Technique changes, harder text, fatigue, or prioritizing accuracy can lower short-term WPM while building better long-term skill. Watch multi-week averages.',
  },
  {
    question: 'Do achievements affect my scores?',
    answer:
      'No. Achievements are motivational unlocks for milestones like speed, accuracy, streaks, and session counts. They do not change WPM calculations.',
  },
  {
    question: 'Which FreeTyper tools write to progress?',
    answer:
      'Completed sessions from FreeTyper typing tools (such as speed tests, lessons, and practice) that save session data appear in your history on this page.',
  },
];

export const howToSteps: { name: string; text: string }[] = [
  {
    name: 'Complete a FreeTyper typing session',
    text: 'Take a speed test, lesson, or practice run so FreeTyper can store a session in this browser.',
  },
  {
    name: 'Open the progress tracker',
    text: 'Visit the typing progress page to view WPM history, accuracy, streaks, and weak keys.',
  },
  {
    name: 'Review weak keys and the error heatmap',
    text: 'Identify low-accuracy keys and plan drills that target those constraints.',
  },
  {
    name: 'Train with practice or lessons',
    text: 'Use weak-key practice and structured lessons to fix the bottlenecks the dashboard revealed.',
  },
  {
    name: 'Retest weekly under the same conditions',
    text: 'Run a standardized speed test at the same duration each week and compare averages, not single spikes.',
  },
];
