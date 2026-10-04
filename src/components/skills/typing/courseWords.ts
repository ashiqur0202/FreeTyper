/**
 * Text banks for the typing course (see courseData.ts / lessonText.ts).
 * Everything here is original or plain common English. Words are lowercase a–z only.
 */

const RAW_WORDS = `
a as ad ads add adds all alas ask asks dad dads fad fads fall falls flask flasks flak lad lads lass sad sass salad salads alfalfa
gas gash gag gags gal gals lag lags sag sags flag flags glad hag hall halls half hash has had shall slash flash dash lash ash
she he see seed seeds feel feels fled flies fish hid hike hiked kid kids lid lids idle ideas jade jail jig gel ale age aged ages
life file files field fields desk desks side sides lie lies like likes hide hides skied skid slide slides jelly leg legs less lake
led lead leads dead deal deals dealt heal heals hill hills hell kill kills skill skills still stall stalls shell shells silk sell
sells self said sad sale sales sash easy ease eagle eggs elf else ill idea if is it its in
ride rides rid red read reads real rush rule rules ruler user users sure surf hurt hurry fur furs fuss full fur run runs rug rugs
hug hugs jug jugs jug lug lugs sulk sulks skull dull dust duke uses used usual rural rural
the that this they then them there their these those thing things think thought three through tie ties tide tire tired title
tilt tall tale tales talk talks task tasks tea team teams tell tells test tests text try tries tray trays true truly type types
yes yet yard yards year years yell yells yellow your you young youth
for from first found four fire fires form forms free fresh friend friends full fun funny future
of off often old on once one only open or order other our out over own oak oil
pay page pages paid paper part party past path peace people pen pencil piece place plan plane plant play point poor power
press price pretty pull push put pop pot port post pool pit pie pig
with was what when where which while who why will wish with without woman women word words work works world would write
wrote wall walk walks wait waits want wants warm water way ways week weeks well went west wet wind window wide wife wild win
quick quiet quite quit queen quest question quote quotes quiz quarter quality quilt quad quack
very value voice visit visits view views village vote vowel van vast vary
move moves much music must make made many may me more most mother my man map mark market match matter mean means meet
meets mind mile miles milk mine minute minutes miss mix month months moon morning mouse mouth
come comes call calls can car care case catch cause change changes child children city class clean clear close cloud coat
cold color come cook cool copy corner count country course cover cry cut cup
exit expect example excuse exercise extra excellent explain express box fix fixed mix next six text
zero zone zoo size lazy maze gaze freeze zip
big back bad bag ball band bank base be beat bed been before began begin behind below best better between bird bit black
blue boat body book born both bottom boy bread break bring brother brown build burn busy but buy by
and an any are as at about above across add after again against ago air all almost along already also always am among animal
another answer around ask away
no not now new name near need never news night nine none north nose note nothing notice number
dog door down draw dream dress drink drive drop dry during
each ear early earth east eat end enough even evening ever every eye
face fact fall family far farm fast father feet fell few fill find fine finger finish fish five floor fly follow food foot
force forest forget forward free full
game garden gave get girl give glass go gold gone good got grass great green ground group grow guess
hair hand happen happy hard has hat have he head hear heard heart heat heavy help her here high him his hold hole home hope
horse hot hour house how however human hundred hurry
ice idea important inch inside instead into island
job join joy jump just keep key kind king knew know
lady land large last late laugh learn least leave left letter light line list listen little live long look lost lot loud love low
main may maybe men middle might money more morning
object ocean off often oh okay once only open orange order
paint pair perhaps person pick picture plain plenty pocket poem prepare present problem promise proud
rain raise ran rather reach ready reason remember rest result rich right ring river road rock room round row
safe same sand save saw say school science sea second seem sent serve set seven several shape share sharp ship shoe short
should show shut sick sign simple since sing sister sit sky sleep slow small smile snow soft soil some something sometimes song
soon sound south space speak special spend spoke spring square stand star start state stay step stone stop store story street
strong study such sudden summer sun supper sure surprise sweet swim system
table take taken teach ten than thank thick thin third though thousand together told tomorrow tone too took top touch toward
town travel tree turn twelve twenty two
under understand until upon use usual valley various visit wake wash watch wave weather welcome whole whose wide wonder wood
wrong yesterday yet
keyboard learning practice typing finger fingers speed accuracy lesson lessons screen mouse paper desk chair
`;

/** Unique, lowercase a–z words only. */
export const COURSE_WORDS: string[] = Array.from(
  new Set(
    RAW_WORDS.split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => /^[a-z]+$/.test(w)),
  ),
);

/** Pairs written with a slash, for the slash-key lesson. */
export const SLASH_PAIRS = [
  'and/or', 'yes/no', 'on/off', 'his/her', 'up/down', 'in/out', 'read/write', 'start/stop', 'win/lose', 'over/under',
  'night/day', 'left/right', 'buy/sell', 'open/close', 'push/pull', 'true/false',
];

/**
 * Sentences with capitals and punctuation. The lesson generator picks the ones
 * whose characters are all unlocked for that lesson.
 */
export const COURSE_SENTENCES: string[] = [
  // capitals + full stops only
  'The cat sat on the warm step.',
  'Birds sing early in the morning.',
  'She reads a book every night.',
  'We walked to the river after lunch.',
  'My brother plays the guitar well.',
  'The train leaves at noon.',
  'A small boat crossed the lake.',
  'Maria baked bread for the whole street.',
  'The old clock still keeps good time.',
  'Our teacher writes on the board.',
  'Snow covered the hills overnight.',
  'Daniel painted the fence green.',
  'The market opens before sunrise.',
  'Every garden needs patience.',
  'Paper boats float for a while.',
  'Tomorrow will be a quiet day.',
  'Lena found a shell on the beach.',
  'The bus stops near the library.',
  'Warm soup is good on a cold day.',
  'Peter fixed the window on Sunday.',
  // commas
  'When it rains, we stay inside and read.',
  'Slowly, the sun climbed above the roofs.',
  'She packed a pen, a notebook, and a map.',
  'After dinner, we walked along the water.',
  'Yes, the shop is open until late.',
  'First, check the door; then, turn off the light.',
  // apostrophes
  `I don't know the answer yet.`,
  `It's a quiet town, but people are kind.`,
  `She can't find her keys.`,
  `We'll meet at the station at noon.`,
  `They're late again, aren't they.`,
  `You're welcome to join us.`,
  `That's the best bread I've had.`,
  `Don't forget to drink water, Sam.`,
  // question marks
  'What time does the class start?',
  'Did you finish the book?',
  'Where are my glasses?',
  'How are you today?',
  'Which road leads to the river?',
  'Can we practise a little longer?',
  // exclamation marks
  'That was a great game!',
  'Watch out for the step!',
  'Please be careful!',
  'What a bright morning!',
  'Well done, Priya!',
  // quotes
  'She said, "Let us begin."',
  'He whispered, "Be quiet."',
  'The sign read "Open all day."',
  `"Keep going," Tom said, "you are almost there."`,
  // colon, semicolon, hyphen
  'Remember this: practice makes progress.',
  'Bring three things: a pen, a notebook, and water.',
  'The shop was closed; we tried the next one.',
  'I like tea; she prefers coffee.',
  'It was a well-known, long-awaited result.',
  'A two-minute break helps; so does a glass of water.',
  'The plan is simple: type slowly, then type well.',
  'Her mother-in-law grows tomatoes; they taste sweet.',
];

/** Longer passages for the last stage. Plain English, original. */
export const COURSE_PARAGRAPHS: string[] = [
  'Good typing is quiet and steady. Your hands rest on the home row, your eyes stay on the text, and each finger reaches for its own keys. When a mistake slips in, fix it and carry on; hurrying only makes the next mistake easier.',
  'On a calm morning, the village woke slowly. The baker opened his shop at 6:30, a few children walked to school, and an old man watered the plants by his door. By noon, the street was busy, and the smell of fresh bread was everywhere.',
  'Learning a skill takes many small sessions. Ten minutes today, ten minutes tomorrow: it adds up. Keep your pace comfortable, notice where you slip, and practise those keys first. Progress is rarely smooth, but it is real.',
  'The library was almost empty on Tuesday. Maya found a table by the window, opened her notebook, and began to write. Outside, rain tapped on the glass; inside, the only sound was the soft click of keys and the turning of pages.',
  'A tidy desk helps you type well. Sit back in the chair, keep your elbows close, and let your wrists stay straight. Look at the screen, not the keys. If your hands feel tired, stop for a minute and stretch.',
  'Rivers begin as tiny streams high in the hills. They join, grow, and slowly cut valleys through stone. After many miles, they reach the sea, carrying with them the rain of a hundred mountains.',
  'Before you start a test, take a breath. Place your fingers on the home row and read the first few words. Start slowly; speed comes from a clean rhythm. Afterward, look at your accuracy first, then at your speed.',
  'Every Friday, the market sells fruit, bread, and flowers. Grandma buys 12 apples, a loaf of rye bread, and a bunch of daisies; she always says, "Fresh is best." Then we walk home, talking the whole way.',
];
