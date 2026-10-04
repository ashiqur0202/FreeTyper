export const productivityArticles: Record<string, string> = {
  'mechanical-vs-membrane-keyboards': `<p>We could not find solid evidence that mechanical keyboards are faster or more accurate than membrane keyboards, or the reverse. Many web pages claim otherwise and quote studies, but the ones we tried to trace did not lead to a paper we could open, so we do not repeat them. What laboratory studies have measured, in controlled experiments, is something narrower and more useful: <strong>how much force a key needs to register a press</strong>. Keys needing about 1 newton produced noticeably more finger force and muscle activity than keys needing under half a newton. So choose a keyboard by its actuation force, feel and comfort, not by the word "mechanical".</p>

<h2 id="what-the-difference-is">What the difference is</h2>
<p>In a mechanical keyboard every key has its own switch under it. In a membrane keyboard the keys press down on a rubber or silicone layer over a set of contacts. That describes the mechanism. It does not tell you how a keyboard feels: mechanical switches come with very different force, travel and sound, and membrane boards vary too. This is why the category label predicts little.</p>

<h2 id="what-the-research-tested">What the research actually tested</h2>
<p>Two controlled laboratory studies are worth knowing. Both varied the force a key needs to register a press (the "make force", also called actuation force), and both measured muscle activity in the fingers with electromyography.</p>
<ul>
<li><strong>Rempel and colleagues (1997).</strong> Ten experienced typists typed on three keyboards with make forces of 0.34, 0.47 and 1.02 newtons. There were no differences between the 0.34 and 0.47 N keyboards. Moving from 0.47 to 1.02 N raised applied fingertip force by about 40% and finger flexor muscle activity by about 20%. The authors suggested that keyswitches of 0.47 N or less should be considered over ones of 1.02 N, to keep the load on forearm tendons and muscles down. See the <a href="https://pubmed.ncbi.nlm.nih.gov/9336104/" rel="noopener" target="_blank">abstract</a>.</li>
<li><strong>Gerard and colleagues (1999).</strong> Twenty-four female transcriptionists used their own keyboard (an audible click, 0.72 N) and three identical-design keyboards with no click and make forces of 0.28, 0.56 and 0.83 N, for 15 minutes each and then for seven workdays. Typing force and muscle activity were highest on the 0.83 N keyboard, and discomfort there was about 36% higher at the fingers, 40% higher in the lower arm and 39% higher overall. The lowest muscle activity was on the 0.28 N and the 0.72 N clicking keyboards. Seventeen of the 24 preferred the 0.72 N keyboard, four the 0.28 N one and three the 0.56 N one. See the <a href="https://pubmed.ncbi.nlm.nih.gov/10635542/" rel="noopener" target="_blank">abstract</a>.</li>
</ul>
<p>Read these results carefully. The samples were small, the tasks were short laboratory sessions, the keyboards were designs from the 1990s, and the outcome was muscle effort and comfort, not typing speed. Neither study compared "mechanical" with "membrane" as categories. What they support is modest: very stiff keys cost your fingers more, and preferences differ from person to person.</p>

<h2 id="what-that-means-for-choosing">What that means for choosing a keyboard</h2>
<p>Switch and keyboard specifications are often given in grams-force (gf) or centinewtons rather than newtons. Our own conversions of the figures above:</p>
<table>
<thead><tr><th>Make force</th><th>Roughly in gf</th><th>Where it appeared</th></tr></thead>
<tbody>
<tr><td>0.28 N</td><td>29</td><td>Gerard: among the lowest muscle activity</td></tr>
<tr><td>0.34 N</td><td>35</td><td>Rempel: no difference from 0.47 N</td></tr>
<tr><td>0.47 N</td><td>48</td><td>Rempel: the suggested upper limit</td></tr>
<tr><td>0.72 N</td><td>73</td><td>Gerard: lowest EMG (with audible click) and the most preferred</td></tr>
<tr><td>0.83 N</td><td>85</td><td>Gerard: highest force, EMG and discomfort</td></tr>
<tr><td>1.02 N</td><td>104</td><td>Rempel: about 40% more fingertip force than 0.47 N</td></tr>
</tbody>
</table>
<p>Two readings of that table are fair. Very stiff keys, from roughly 85 to 105 gf, were the costly ones. And lighter was not always better in people's own judgement, since most transcriptionists preferred the middle-high 0.72 N board with an audible click. So aim for moderate force and a feel you like, and check the number on the spec sheet when it is published.</p>

<h2 id="overlapping-keypresses">One hardware detail that may matter for fast typists</h2>
<p>In the typing study <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a> (Dhakal, Feit, Kristensson and Oulasvirta, CHI 2018), most fast typists pressed the next key before releasing the previous one for 40 to 70% of their keystrokes. The paper notes that a keyboard that correctly senses any number of simultaneous presses is said to have "n-key rollover". It is our inference, not something the paper tested, that a keyboard which drops or misreads overlapping presses could hurt a fast typist. If you type quickly, check the rollover specification. This applies to both mechanical and membrane boards.</p>

<h2 id="how-to-choose">How to choose, practically</h2>
<p>These are our suggestions:</p>
<ol>
<li><strong>Try before you commit.</strong> If you can, type on it in a shop, or buy from a seller with an easy return policy. Feel is personal.</li>
<li><strong>Look at actuation force, travel and noise,</strong> not just the type. Noise matters in shared spaces.</li>
<li><strong>Consider your budget and layout,</strong> and whether you need a numeric keypad.</li>
<li><strong>Give yourself time to adjust.</strong> A new keyboard usually feels slower at first.</li>
<li><strong>Test it fairly.</strong> Take three runs of the same length and text type on the <a href="/">FreeTyper speed test</a> on each keyboard, on different days, and compare the middle result and your accuracy, not a single run.</li>
</ol>

<h2 id="setup-matters-more">Setup matters more than the keyboard type</h2>
<p>OSHA's <a href="https://www.osha.gov/etools/computer-workstations/components/keyboards" rel="noopener" target="_blank">keyboard guidance</a> focuses on height, distance and wrist position, not on switch type: elbows near keyboard height, wrists straight, keyboard directly in front of you. A well-placed ordinary keyboard beats a poorly placed premium one. Our <a href="/blog/fix-typing-posture-and-avoid-wrist-pain">posture and wrist pain guide</a> covers the setup.</p>

<h2 id="what-to-be-sceptical-of">What to be sceptical of</h2>
<ul>
<li><strong>"Mechanical keyboards add X WPM."</strong> We found no study we could open that shows this.</li>
<li><strong>Studies with oddly specific numbers and no citation.</strong> If a page does not name the journal, authors and year, treat it as unverified.</li>
<li><strong>A new keyboard as a fix for slow typing.</strong> Technique and accuracy matter far more. See <a href="/blog/how-to-type-faster">how to type faster</a> and <a href="/blog/improve-typing-accuracy">how to improve typing accuracy</a>.</li>
</ul>

<h2 id="sources">Sources</h2>
<ul class="article-sources">
<li>Rempel D, Serina E, Klinenberg E, Martin BJ, Armstrong TJ, Foulke JA, et al. <a href="https://pubmed.ncbi.nlm.nih.gov/9336104/" rel="noopener" target="_blank">The effect of keyboard keyswitch make force on applied force and finger flexor muscle activity</a>. 1997.</li>
<li>Gerard MJ, Armstrong TJ, Franzblau A, Martin BJ, Rempel DM. <a href="https://pubmed.ncbi.nlm.nih.gov/10635542/" rel="noopener" target="_blank">The effects of keyswitch stiffness on typing force, finger electromyography, and subjective discomfort</a>. 1999.</li>
<li>Dhakal V, Feit AM, Kristensson PO, Oulasvirta A. <a href="https://userinterfaces.aalto.fi/136Mkeystrokes/" rel="noopener" target="_blank">Observations on Typing from 136 Million Keystrokes</a>. CHI 2018.</li>
<li>OSHA, <a href="https://www.osha.gov/etools/computer-workstations/components/keyboards" rel="noopener" target="_blank">Computer Workstations eTool: Keyboards</a>.</li>
<li>The conversions to grams-force, the rollover inference and the buying checklist are our own.</li>
</ul>
<p class="article-note">Written by <a href="/about#author">Ashiqur Rahman</a>. Figures attributed to a source were checked against that source. If you spot something wrong, <a href="/contact">tell me</a> and I will correct it.</p>
`,

  'fix-typing-posture-and-avoid-wrist-pain': `<p>Set your desk so your elbows sit near keyboard height and close to your body, your wrists stay straight, your feet are supported and the top of your screen is no higher than your eyes. Then change position now and then and take short breaks. Those are the main points of the US Occupational Safety and Health Administration's computer workstation guidance, and they are a sound way to set up for long typing sessions.</p>

<p>What the research does <em>not</em> show is that typing, by itself, reliably causes wrist injuries. The best systematic reviews describe the evidence as limited or insufficient. This guide therefore treats good posture as sensible prevention, not as a guarantee, and says plainly where the evidence stops.</p>

<p class="article-note">This is general information, not medical advice. If you have pain, numbness or tingling that does not go away, see a doctor or physiotherapist.</p>

<h2 id="what-good-typing-posture-looks-like">What good typing posture looks like</h2>
<p>OSHA's <a href="https://www.osha.gov/etools/computer-workstations/checklists/evaluation" rel="noopener" target="_blank">workstation checklist</a> and its <a href="https://www.osha.gov/etools/computer-workstations/components/keyboards" rel="noopener" target="_blank">keyboard guidance</a> describe a neutral seated position. In plain terms:</p>
<ul>
<li><strong>Elbows</strong> about the same height as the keyboard, hanging comfortably at your sides and close to your body, not reaching forward or out.</li>
<li><strong>Wrists and hands</strong> straight and in line with your forearms. They should not bend up, down or sideways while you type.</li>
<li><strong>Shoulders</strong> relaxed, not hunched up toward your ears.</li>
<li><strong>Thighs</strong> roughly parallel to the floor, with room under the desk.</li>
<li><strong>Feet</strong> flat on the floor or on a stable footrest.</li>
<li><strong>Back</strong> supported by the chair, including the curve of the lower back.</li>
<li><strong>Screen</strong> with its top at or below eye level, at a distance where you can read without leaning or bending your neck.</li>
</ul>

<h2 id="set-up-your-desk-in-five-minutes">Set up your desk in five minutes</h2>
<ol>
<li><strong>Start with the chair.</strong> Adjust the height until your feet rest flat (use a footrest if the desk is too high for that) and your thighs are about level. Sit back so the chair supports your lower back.</li>
<li><strong>Bring the keyboard to your elbows, not your elbows to the keyboard.</strong> With your upper arms relaxed at your sides, your forearms should run roughly parallel to the floor and your hands should reach the keys without lifting your shoulders. If the desk is too high, raise the chair and use a footrest.</li>
<li><strong>Place the keyboard directly in front of you,</strong> close enough that your elbows can stay near your body.</li>
<li><strong>Check your wrists.</strong> A keyboard that is too low tends to bend the wrists upward, and one that is too high pushes the shoulders up. Adjust height until your wrists look straight in a side view.</li>
<li><strong>Look at the keyboard feet.</strong> OSHA says the tilt may need to be raised or lowered to keep wrists straight, and that you should not use the feet if they increase bending of the wrist.</li>
<li><strong>Set the screen last.</strong> The top edge at or below eye level, straight in front of you.</li>
</ol>

<h2 id="wrist-rests-and-floating-hands">Wrist rests and floating hands</h2>
<p>OSHA's <a href="https://www.osha.gov/etools/computer-workstations/components/wrist-palm-support" rel="noopener" target="_blank">guidance on wrist and palm supports</a> is more specific than most advice online:</p>
<ul>
<li>A rest is for keeping wrists straight and reducing contact pressure, not for anchoring your hands while you type.</li>
<li>While typing, your hands should move freely and stay above the rest.</li>
<li>When you pause, the pad should contact the heel or palm of your hand, not the wrist itself.</li>
<li>Choose a rest that is fairly soft and rounded, at least about 1.5 inches (3.8 cm) deep, and avoid resting your wrists on hard or sharp edges.</li>
</ul>
<p>In practice: let your hands float while you type, and rest them on the pad between bursts.</p>

<h2 id="technique-habits-worth-trying">Technique habits worth trying</h2>
<p>These are common-sense suggestions rather than findings from the studies below:</p>
<ul>
<li><strong>Reach with your fingers.</strong> Starting from the home row, let each finger move to its own keys instead of twisting the whole hand. The <a href="/keyboard-guide">keyboard guide</a> shows which finger owns which key.</li>
<li><strong>Relax between sentences.</strong> If your shoulders, forearms or fingers feel tight, pause and loosen them before you carry on.</li>
<li><strong>Stop when accuracy slips.</strong> A run of errors is often a sign of tiredness. On FreeTyper we suggest short sessions, such as 10 to 20 minutes, and stopping when your accuracy starts to fall.</li>
</ul>

<h2 id="what-the-research-says">Does typing actually cause wrist problems?</h2>
<p>Less clearly than the internet suggests. Two systematic reviews, which search and weigh all the studies they can find, give the most useful picture.</p>
<ul>
<li><strong>Carpal tunnel syndrome.</strong> A 2008 review by Thomsen, Gerr and Atroshi in <em>BMC Musculoskeletal Disorders</em> found eight epidemiological studies of computer work and carpal tunnel syndrome. All eight had at least one limitation, such as imprecise measurement, low statistical power or possible bias. The authors concluded that there is <strong>insufficient epidemiological evidence that computer work causes carpal tunnel syndrome</strong>. They also noted that pressure measurements under typical computer use were below levels considered harmful, although one study found that actual mouse use raised the pressure to potentially harmful levels, and the long-term effects of such pressure are not known.</li>
<li><strong>Other neck and arm conditions.</strong> A 2010 review by Waersted, Hanvold and Veiersted covered 22 studies. It found <strong>limited</strong> evidence linking computer work, mouse time and keyboard time to wrist tendonitis, and linking mouse time to forearm disorders. For keyboard time and tension neck syndrome the evidence was insufficient. None of the evidence was rated moderate or strong.</li>
</ul>
<p>Read these results carefully. They do not say typing is safe. They say the studies done so far are not good enough to show either way. That is a reason to keep a sensible setup and watch your body, and also a reason to be sceptical of anyone who claims one gadget or one stretch will prevent injury.</p>

<h2 id="breaks-and-variety">Breaks and variety</h2>
<p>OSHA's checklist asks whether you can alternate between sitting and standing, and whether your computer tasks are organised so that you can vary keyboard work with other activities or take micro-breaks. In the pages we checked, OSHA does not give a fixed break interval, and we will not invent one. A practical approach is to pick a rhythm you will actually keep: stand up when you finish a task, look away from the screen, and shake out your hands.</p>

<h2 id="symptoms-and-when-to-get-help">Symptoms and when to get help</h2>
<p>The UK's National Health Service describes <a href="https://www.nhs.uk/conditions/carpal-tunnel-syndrome/" rel="noopener" target="_blank">carpal tunnel syndrome</a> as pressure on a nerve in the wrist. Symptoms include pain or aching in the fingers, hand or arm, numb hands, tingling or pins and needles, a weak thumb or difficulty gripping, and symptoms that are usually worse at night. The NHS lists repeated wrist bending or hard gripping at work or in hobbies among the risk factors, alongside others such as pregnancy, arthritis, diabetes, a family history and a previous wrist injury. Its page names vibrating tools as an example and does not single out keyboard use.</p>
<p>The NHS page on <a href="https://www.nhs.uk/conditions/repetitive-strain-injury-rsi/" rel="noopener" target="_blank">repetitive strain injury</a> describes pain that may burn, ache or throb, stiffness, weakness, tingling or numbness, cramps and swelling, caused by repeated use of a body part. For both conditions it advises seeing a GP if symptoms are not going away or are getting worse. For carpal tunnel syndrome, its self-help advice includes wearing a wrist splint at night for up to six weeks, cutting down on activities that may be causing it, and hand exercises. If you notice symptoms, get them checked rather than diagnosing yourself from a web page, including this one.</p>

<h2 id="what-this-article-cannot-tell-you">What this article cannot tell you</h2>
<ul>
<li>It cannot diagnose anything or replace a clinician.</li>
<li>It cannot tell you which keyboard, chair or exercise is best for you. The research does not support strong claims about specific products.</li>
<li>Bodies differ. Treat the numbers and positions above as a starting point and adjust to what feels comfortable and neutral for you.</li>
</ul>
<p>When you are ready to practice, set up your desk first, then try the <a href="/typing-lessons">typing lessons</a> or a short <a href="/typing-practice">practice</a> run.</p>

<h2 id="sources">Sources</h2>
<ul class="article-sources">
<li>OSHA, <a href="https://www.osha.gov/etools/computer-workstations/components/keyboards" rel="noopener" target="_blank">Computer Workstations eTool: Keyboards</a>.</li>
<li>OSHA, <a href="https://www.osha.gov/etools/computer-workstations/components/wrist-palm-support" rel="noopener" target="_blank">Computer Workstations eTool: Wrist/Palm Supports</a>.</li>
<li>OSHA, <a href="https://www.osha.gov/etools/computer-workstations/checklists/evaluation" rel="noopener" target="_blank">Computer Workstations eTool: Evaluation checklist</a>.</li>
<li>Thomsen JF, Gerr F, Atroshi I. <a href="https://pubmed.ncbi.nlm.nih.gov/18838001/" rel="noopener" target="_blank">Carpal tunnel syndrome and the use of computer mouse and keyboard: a systematic review</a>. BMC Musculoskeletal Disorders, 2008.</li>
<li>Waersted M, Hanvold TN, Veiersted KB. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2874766/" rel="noopener" target="_blank">Computer work and musculoskeletal disorders of the neck and upper extremity: a systematic review</a>. BMC Musculoskeletal Disorders, 2010.</li>
<li>NHS, <a href="https://www.nhs.uk/conditions/carpal-tunnel-syndrome/" rel="noopener" target="_blank">Carpal tunnel syndrome</a> and <a href="https://www.nhs.uk/conditions/repetitive-strain-injury-rsi/" rel="noopener" target="_blank">Repetitive strain injury</a>.</li>
</ul>
<p class="article-note">Written by <a href="/about#author">Ashiqur Rahman</a>. Every claim above that is attributed to a source was checked against that source. If you spot something wrong, <a href="/contact">tell me</a> and I will correct it.</p>
`,
};



