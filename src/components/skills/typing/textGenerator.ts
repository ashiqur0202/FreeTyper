/**
 * Makes typing text from rules, so a test never shows the same passage twice. Pure and seeded: the same
 * seed, level and length give the same text on every device (a challenge link rebuilds the text from them).
 *
 * VERSION 1. Do not change the word groups of a released version: a link sent today must give the same
 * text next year. A change means a new version (and `GENERATOR_VERSION` goes in the link).
 *
 * Every group is written so that any item can sit with any item of the group it is paired with, which
 * keeps the sentences sensible: people do things that any person could do, places open and close, weather
 * does weather things. The sentences are everyday and made up. They state no facts about the world.
 * Level 1 is the easiest (short common words, short sentences) and level 5 the hardest (long words,
 * commas, clauses, digits, quotation marks). ASCII only.
 */

export type TextLevel = 1 | 2 | 3 | 4 | 5;
export const GENERATOR_VERSION = 1;
export const DEFAULT_TEXT_LEVEL: TextLevel = 3;

export const TEXT_LEVELS: { level: TextLevel; name: string }[] = [
  { level: 1, name: 'Beginner' },
  { level: 2, name: 'Easy' },
  { level: 3, name: 'Standard' },
  { level: 4, name: 'Hard' },
  { level: 5, name: 'Expert' },
];

/** A level from anything (a link, saved settings): a whole number 1 to 5, else the default. */
export function normalizeLevel(value: unknown): TextLevel {
  const n = typeof value === 'string' && /^\d$/.test(value) ? Number(value) : value;
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5 ? (n as TextLevel) : DEFAULT_TEXT_LEVEL;
}

type Item = readonly [text: string, level: TextLevel];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded random source. */
function rng(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PERSON: Item[] = [
  ['The boy', 1], ['The girl', 1], ['My friend', 1], ['The cook', 1], ['The man', 1], ['The woman', 1], ['A child', 1], ['The pilot', 1], ['My uncle', 1], ['My aunt', 1], ['The nurse', 1], ['The baker', 1], ['The monk', 1], ['My dad', 1], ['My mom', 1], ['The judge', 1], ['The vet', 1], ['The clerk', 1], ['My son', 1], ['My sister', 1], ['My brother', 1], ['The guard', 1], ['The chef', 1], ['The poet', 1], ['The guest', 1], ['The twins', 1], ['The coach', 1], ['The singer', 1], ['The artist', 1], ['The cop', 1],
  ['The little girl', 2], ['My best friend', 2], ['The young cook', 2], ['Our teacher', 2], ['The old man', 2], ['The tall boy', 2], ['A kind woman', 2], ['The new student', 2], ['My cousin', 2], ['The farmer', 2], ['The mayor', 2], ['A happy child', 2], ['The shy girl', 2], ['The painter', 2], ['Our driver', 2], ['The tailor', 2], ['The barista', 2], ['The designer', 2],
  ['The old baker', 3], ['A young teacher', 3], ['My next-door neighbor', 3], ['The friendly pilot', 3], ['Our football coach', 3], ['The tired nurse', 3], ['The new librarian', 3], ['A curious student', 3], ['The bus driver', 3], ['My grandmother', 3], ['The village doctor', 3], ['A talented painter', 3], ['The night watchman', 3], ['My eldest sister', 3], ['The delivery driver', 3], ['The software developer', 3], ['The remote worker', 3], ['The flight attendant', 3], ['The electrician', 3],
  ['The head gardener', 4], ['A group of travelers', 4], ['The new manager', 4], ['Several volunteers', 4], ['An experienced guide', 4], ['The local photographer', 4], ['My younger brother', 4], ['A retired engineer', 4], ['The assistant principal', 4], ['A pair of cyclists', 4], ['The data analyst', 4], ['The marketing manager', 4], ['The graduate student', 4], ['The sound engineer', 4], ['The freelance writer', 4],
  ['The visiting professor', 5], ['A team of researchers', 5], ['The recently appointed director', 5], ['Several enthusiastic volunteers', 5], ['An independent bookseller', 5], ['The festival organizers', 5], ['A delegation of engineers', 5], ['The customer support team', 5], ['A group of exchange students', 5], ['The emergency room nurse', 5], ['The project coordinator', 5],
];
const FIRST_PERSON = ['I', 'We', 'They'];

const ACTION: Item[] = [
  ['ran to the park', 1], ['sat by the door', 1], ['went home', 1], ['read a short book', 1], ['waited for the bus', 1], ['sang a song', 1], ['walked to school', 1], ['opened the window', 1], ['made some tea', 1], ['ate a red apple', 1], ['looked at the sky', 1], ['drank cold water', 1], ['ate lunch', 1], ['took a nap', 1], ['wore a hat', 1], ['rode a bike', 1], ['fed the cat', 1], ['lit a candle', 1], ['went to bed', 1], ['played a game', 1], ['wrote a note', 1], ['took a long walk', 1], ['swam in the lake', 1], ['drew a big star', 1], ['planted a seed', 1], ['kicked a ball', 1], ['found a key', 1], ['fixed the car', 1], ['lost a glove', 1], ['cut a cake', 1], ['told a joke', 1], ['made a new friend', 1], ['wrote a list', 1], ['sat on the grass', 1], ['heard a loud noise', 1], ['took a bus', 1], ['saw a big bird', 1], ['ran up the hill', 1], ['jumped over a log', 1], ['dug a hole', 1], ['baked a pie', 1], ['sang to the baby', 1], ['washed the dishes', 1], ['sat in the sun', 1], ['closed the door', 1], ['got a new job', 1],
  ['walked to the market', 2], ['waited at the bus stop', 2], ['opened the old gate', 2], ['found a quiet seat', 2], ['cooked a warm meal', 2], ['read the morning news', 2], ['painted a small chair', 2], ['washed the big window', 2], ['carried a heavy box', 2], ['fed the birds', 2], ['learned a new song', 2], ['baked a loaf of bread', 2], ['climbed the steep hill', 2], ['watered the garden', 2], ['wrote a long letter', 2], ['bought fresh fruit', 2], ['closed the shop early', 2], ['waited for the soup to cool', 2], ['charged the phone', 2], ['answered an email', 2], ['ordered a coffee', 2], ['took a photo', 2], ['sent a short message', 2], ['booked a ticket online', 2],
  ['carried a heavy bag across the bridge', 3], ['waited patiently at the station', 3], ['painted the fence a bright blue', 3], ['found a quiet table near the window', 3], ['checked the schedule twice before leaving', 3], ['walked slowly along the river', 3], ['cleaned the whole kitchen before dinner', 3], ['repaired the broken bicycle', 3], ['packed a small lunch for the trip', 3], ['borrowed a book from the library', 3], ['followed the narrow path through the woods', 3], ['stopped to rest under a tall oak tree', 3], ['tried a new recipe from an old cookbook', 3], ['listened to the radio for an hour', 3], ['wandered through the quiet streets', 3], ['tied the boat to the wooden post', 3],
  ['joined the video call a few minutes early', 3], ['updated the shared document', 3], ['scanned the ticket at the gate', 3], ['booked a table for six online', 3], ['charged the laptop before leaving', 3], ['replied to a long email', 3], ['listened to a podcast on the way home', 3], ['saved the file twice just in case', 3], ['took a photo of the old clock tower', 3],
  ['organized the shelves by color and size', 4], ['spent the entire afternoon repairing the old radio', 4], ['walked home through the crowded market', 4], ['prepared a simple dinner for the whole family', 4], ['carefully reviewed every page of the report', 4], ['planted 12 small trees along the road', 4], ['walked 4 miles before the sun went down', 4], ['searched every shelf for the missing notebook', 4], ['spent the whole morning writing letters to old friends', 4], ['explained the plan to everyone in the room', 4], ['gathered 30 chairs for the evening concert', 4], ['arranged fresh flowers on every table', 4],
  ['organized the files into clearly named folders', 4], ['spent the afternoon answering emails from customers', 4], ['downloaded the map so it would work without a signal', 4], ['prepared a short presentation for the team', 4], ['backed up every photo on the old laptop', 4], ['compared three different routes before choosing one', 4],
  ['reorganized the storage room before the inspection began', 5], ['examined each document with remarkable patience', 5], ['coordinated the schedule for the entire weekend', 5], ['rehearsed the opening speech until it sounded natural', 5], ['negotiated a fair arrangement between the two neighbors', 5], ['sorted 250 letters into neat bundles by street', 5], ['reviewed the complete budget line by line', 5], ['described the long journey in remarkable detail', 5], ['answered every question with calm confidence', 5], ['arranged an unexpected surprise for 40 guests', 5],
  ['reviewed the proposal and sent detailed comments to the whole team', 5], ['scheduled a video call for 9:30 with colleagues in three time zones', 5], ['updated the password on all 14 accounts', 5], ['rebuilt the weekly schedule around the new deadline', 5],
];
const TIME: Item[] = [
  ['This morning', 2], ['After lunch', 2], ['On Monday', 2], ['Last night', 2], ['Before dinner', 2], ['On Friday', 2], ['At noon', 2], ['After school', 2],
  ['On Saturday afternoon', 3], ['Early in the morning', 3], ['Late in the evening', 3], ['Just before sunrise', 3], ['On a cold winter morning', 3], ['Late on Sunday night', 3], ['During the lunch break', 3], ['After the weekly meeting', 3],
  ['At 7:30 on Tuesday', 4], ['Just after the rain stopped', 4], ['Before the shops opened', 4], ['Once the sun had set', 4], ['At 6 p.m. on Thursday', 4],
  ['At exactly 8:15 on Wednesday morning', 5], ['By the time the guests arrived', 5], ['On the evening of March 14th', 5], ['Shortly after 9 o\'clock on a rainy Sunday', 5],
];
const PLACE: Item[] = [['at the corner cafe', 3], ['near the old bridge', 3], ['behind the library', 3], ['by the river', 3], ['in the town square', 3], ['outside the station', 3], ['in the waiting room', 3], ['beside the old clock tower', 4], ['at the far end of the garden', 4], ['at the airport gate', 4]];
const DETAIL: Item[] = [['while the radio played softly', 4], ['as the evening light faded', 4], ['while rain tapped on the roof', 4], ['and nobody seemed to mind', 4], ['as the church bells rang', 4], ['while the street grew quiet', 4], ['while the kettle boiled', 4], ['as the video call loaded', 4], ['as a cool breeze moved through the trees', 5], ['while the whole neighborhood slowly woke up', 5], ['while the new update installed', 5]];
const SAY: Item[] = [['We should leave soon', 1], ['It is a lovely day', 1], ['Let us begin', 1], ['Let us try that again', 2], ['Please keep the door open', 3], ['We still have plenty of time', 3], ['I will be there at 9:30', 4], ['That was easier than I expected', 4], ['I think we can finish before 6 o\'clock', 5]];
const SAID = ['said', 'replied', 'whispered', 'called'];
const ITEM: Item[] = [['a red hat', 1], ['a blue cup', 1], ['a big map', 1], ['a new pen', 1], ['a small box', 1], ['a green bag', 1], ['a gold ring', 1], ['a long rope', 1], ['a red kite', 1], ['a black pen', 1], ['a big drum', 1], ['a warm coat', 2], ['a paper map', 2], ['a red umbrella', 2], ['an old watch', 2], ['a new notebook', 2], ['a small camera', 2], ['a phone charger', 2], ['a travel mug', 2], ['a pair of headphones', 2], ['a laptop bag', 2], ['a wooden toolbox', 3], ['a leather backpack', 3], ['an antique compass', 3], ['a portable speaker', 3], ['a reusable water bottle', 3], ['a spare power bank', 3], ['a collection of postcards', 4], ['a surprisingly heavy parcel', 4], ['a lightweight laptop', 4], ['a small tablet with a cracked screen', 4], ['an exceptionally detailed map of the region', 5], ['a beautifully illustrated field guide', 5], ['a rechargeable battery pack for the camera', 5]];
const ITEM_VERB = ['bought', 'found', 'carried', 'wanted'];
const IT_ADJ: Item[] = [['quiet', 1], ['warm', 1], ['cold', 1], ['busy', 1], ['calm', 1], ['bright', 1], ['peaceful', 3], ['unusually mild', 4], ['surprisingly crowded', 5]];
const IT_PART = ['morning', 'afternoon', 'evening', 'night'];
const IT_PLACE: Item[] = [['village', 1], ['town', 1], ['city', 1], ['valley', 2], ['harbor town', 3], ['small mountain village', 4], ['coastal town', 4]];

const NATURE: { s: Item[]; p: Item[] }[] = [
  { s: [['The sun', 1], ['The moon', 1], ['The winter sun', 2], ['The pale moon', 3]], p: [['rose early today', 1], ['set behind the hills', 2], ['looked bright over the hills', 2], ['hung low above the rooftops', 4], ['climbed slowly above the eastern ridge', 5]] },
  { s: [['The wind', 1], ['The rain', 1], ['A small cloud', 2], ['A thin layer of fog', 3], ['The summer rain', 3], ['A gentle breeze', 3], ['The northern wind', 3]], p: [['came late today', 1], ['grew stronger toward evening', 2], ['faded after sunset', 2], ['stayed for the whole afternoon', 2], ['came and went all morning', 3], ['settled over the hills before sunset', 4], ['drifted across the valley until nightfall', 5]] },
  { s: [['The river', 1], ['The sea', 1], ['The lake', 1], ['The mountain lake', 2], ['The quiet river', 3], ['The wide harbor', 3]], p: [['was calm and clear', 1], ['was cold this morning', 1], ['moved slowly', 2], ['looked silver in the morning light', 3], ['stayed still until the wind came back', 4], ['reflected every cloud in the evening sky', 5]] },
  { s: [['The old tree', 2], ['The tall hill', 2], ['The pine trees', 2], ['The tall mountains', 3], ['The ancient forest', 4], ['The distant mountains', 4]], p: [['stood quiet in the snow', 2], ['looked green after the rain', 2], ['waited in the soft light', 3], ['changed color as the seasons turned', 4], ['seemed to glow in the last light of the day', 5]] },
];
const TOWN: { s: Item[]; p: Item[] } = {
  s: [['The market', 1], ['The library', 1], ['The bakery', 1], ['The park', 1], ['The gym', 1], ['The old cafe', 2], ['The station', 2], ['The school', 2], ['The post office', 2], ['The flower shop', 2], ['The coffee shop', 2], ['The town square', 3], ['The corner shop', 3], ['The hardware store', 3], ['The bookstore', 3], ['The co-working space', 4]],
  p: [['opened early today', 1], ['was open all day', 1], ['was clean and bright', 1], ['was full of people', 1], ['was closed today', 1], ['was busy all morning', 2], ['was quiet at noon', 2], ['looked cheerful in the sun', 2], ['closed a little earlier than usual', 3], ['looked bright in the evening light', 3], ['was almost empty after dinner', 3], ['was crowded on Saturday', 3], ['stayed crowded until the last bus left', 4], ['felt unusually quiet for a Saturday afternoon', 5]],
};
const VEHICLE: Item[] = [['bus', 1], ['train', 1], ['bike', 1], ['taxi', 2], ['ferry', 2], ['tram', 3]];
const COMPARE: Item[] = [['faster than', 2], ['slower than', 2], ['cheaper than', 2], ['quieter than', 3], ['more crowded than', 3], ['more comfortable than', 3], ['considerably more expensive than', 4], ['noticeably more reliable than', 5]];

const MORNING = /morning|sunrise|breakfast|noon/i;
const EVENING = /evening|sunset|sun had set|sun went down|night|dinner|lamp|p.m./i;

/** Items for a level: this level and the one below it (level 1 only its own). */
function pool(list: Item[], level: TextLevel, spread = 1): Item[] {
  const lo = Math.max(1, level - spread);
  return list.filter((x) => x[1] <= level && x[1] >= lo);
}
function pick<T>(r: () => number, list: readonly T[]): T {
  return list[Math.floor(r() * list.length)];
}
function lcFirst(s: string): string {
  return /^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}
function ucFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function aAn(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}
/** A time phrase that contradicts the rest of the sentence ("this morning" and "the evening concert"). */
function clash(time: string, rest: string): boolean {
  if (!time) return false;
  if (/rain/i.test(time) && /rain/i.test(rest)) return true;
  if (MORNING.test(time) && EVENING.test(rest)) return true;
  if (EVENING.test(time) && MORNING.test(rest)) return true;
  return false;
}

function oneSentence(r: () => number, level: TextLevel, used: Record<string, true>): string {
  const fresh = (list: Item[], key: string): string => {
    for (let i = 0; i < 8; i++) {
      const x = pick(r, list);
      if (!used[key + x[0]]) {
        used[key + x[0]] = true;
        return x[0];
      }
    }
    return pick(r, list)[0];
  };
  const kind = r();
  if (kind < 0.18) {
    const g = pick(r, NATURE);
    const sp = pool(g.s, level);
    const pp = pool(g.p, level);
    if (sp.length && pp.length) return `${ucFirst(fresh(sp, 'n'))} ${fresh(pp, 'np')}.`;
  } else if (kind < 0.27) {
    const tp = pool(TOWN.s, level);
    const tq = pool(TOWN.p, level);
    if (tp.length && tq.length) return `${ucFirst(fresh(tp, 't'))} ${fresh(tq, 'tp')}.`;
  } else if (kind < 0.34) {
    const person = r() < 0.15 ? pick(r, FIRST_PERSON) : fresh(pool(PERSON, level), 'p');
    return `${person} ${pick(r, ITEM_VERB)} ${fresh(pool(ITEM, level, 2), 'i')}.`;
  } else if (kind < 0.41) {
    const adj = fresh(pool(IT_ADJ, level, 2), 'ja');
    return `It was ${aAn(adj)} ${adj} ${pick(r, IT_PART)} in the ${fresh(pool(IT_PLACE, level, 2), 'jp')}.`;
  } else if (level >= 2 && kind < 0.47) {
    const vs = pool(VEHICLE, level, 3);
    const cs = pool(COMPARE, level, 2);
    if (vs.length > 1 && cs.length) {
      const a = pick(r, vs)[0];
      let b = pick(r, vs)[0];
      for (let i = 0; i < 6 && b === a; i++) b = pick(r, vs)[0];
      if (a !== b) return `The ${a} was ${fresh(cs, 'c')} the ${b}.`;
    }
  } else if (level >= 2 && kind < 0.54) {
    return `"${fresh(pool(SAY, level, 2), 's')}," ${pick(r, SAID)} ${lcFirst(fresh(pool(PERSON, level, 2), 'p'))}.`;
  }
  const person = r() < 0.12 ? pick(r, FIRST_PERSON) : fresh(pool(PERSON, level), 'p');
  const action = fresh(pool(ACTION, level), 'a');
  const action2 = level >= 2 && r() < 0.22 ? fresh(pool(ACTION, level), 'a') : '';
  const timeList = pool(TIME, level);
  let time = level >= 2 && timeList.length && r() < 0.5 ? fresh(timeList, 'ti') : '';
  const placeList = pool(PLACE, level);
  const place =
    level >= 3 &&
    !action2 &&
    placeList.length &&
    r() < 0.35 &&
    !/ (to|at|near|along|across|through|by|from|under) /.test(` ${action.split(' ').slice(-4).join(' ')} `)
      ? ` ${pick(r, placeList)[0]}`
      : '';
  const detailList = pool(DETAIL, level);
  const detail = level >= 4 && detailList.length && r() < (level === 4 ? 0.45 : 0.6) ? `, ${pick(r, detailList)[0]}` : '';
  if (clash(time, `${action} ${action2} ${place} ${detail}`)) time = '';
  const body = `${action}${action2 ? ` and ${action2}` : ''}${place}${detail}.`;
  return time ? `${time}, ${lcFirst(person)} ${body}` : `${person} ${body}`;
}

/** About `words` words of everyday sentences for a seed and a level. */
export function generateSentences(seed: string, level: TextLevel, words: number): string {
  const r = rng(`freetyper-gen${GENERATOR_VERSION}|s|${seed}|${level}`);
  const used: Record<string, true> = {};
  const out: string[] = [];
  const seen = new Set<string>();
  let n = 0;
  while (n < words) {
    // Never the same sentence twice in one passage (the small level 1 pool can come close).
    let s = oneSentence(r, level, used);
    for (let tries = 0; tries < 30 && seen.has(s); tries++) s = oneSentence(r, level, used);
    seen.add(s);
    out.push(s);
    n += s.split(/\s+/).length;
  }
  return out.join(' ');
}

const WORDS: Record<TextLevel, string[]> = {
  1: 'a an and any app are bad bag bed big bit box boy bus but can cap car cat cup cut day dog dry eat egg end eye far fat few fit fun get got gum hat hot ice job key kid leg lip log map men mud net new nut old one pen pet pie pot red run sad sat sea see she shy sit sky sun tab tea ten the tip toy try two use van web wet win yes you zoo bike book cake chat cold door farm fish food game gift hand home jump lamp lake link milk moon nest park rain road rock ship shoe snow song star swim tree walk warm wind'.split(' '),
  2: 'about after again alone apple bakery basket battery beach bench blue bread bridge bring brown build candle carry catch chair charger clean clock cloud coast color cover dance dream drink early earth email fence field fresh friend front fruit garden glass green group happy heart house juice kitchen laptop laugh light lunch market music night online paint paper party pencil phone photo plant quiet river round screen shine simple small smile sound spoon story street sugar sweet table thank train video water window winter yellow young'.split(' '),
  3: 'afternoon airport balance bicycle blanket borrow breakfast brother calendar careful channel chicken circle comfort corner country crowded delight dinner distance double download engine evening explore factory fashion flavor forest freedom gather general golden harbor holiday internet journey keyboard ladder letter library listen machine mirror morning mountain narrow nobody notebook orange password patient picture pillow planet pocket podcast pretend problem question quickly rabbit remember season silver station stomach summer teacher thunder travel village wander whisper wonder'.split(' '),
  4: 'absolutely adventure agreement amazing announce application apartment appreciate arrangement attention beautiful celebrate challenge character collection community complicated conversation courage creative curious decision delicate different discover education electric emergency energetic entrance excellent experience explanation favorite fortunate generous gradually headphones hospital imagine important impossible improve information interesting invitation laboratory literature marvelous mysterious neighborhood notification opportunity ordinary organize patience performance permanent possibility practical remarkable restaurant satisfied smartphone subscription technology temperature tomorrow transport understand unexpected valuable vegetable wonderful'.split(' '),
  5: 'accessibility accommodate accomplishment acknowledge administration anticipation appropriately authentication authenticity bureaucracy characteristic circumstance collaboration communication comprehensive concentration consequently constitutional contemporary controversial coordination cybersecurity deliberately demonstration determination development disappointment distinguished enthusiastic environmental establishment extraordinary fascinating fundamental governmental imagination independence infrastructure intellectual investigation manufacturing misunderstanding organization participation particularly philosophical psychological qualification questionnaire recommendation relationship representative responsibility revolutionary significantly sophisticated spontaneous sustainability synchronization technological thoroughly troubleshooting unconditional understanding unfortunately vocabulary'.split(' '),
};

/** `count` random words for a level: mostly that level, some from the one below, none repeated within 12 words. */
export function generateWords(seed: string, level: TextLevel, count: number): string {
  const r = rng(`freetyper-gen${GENERATOR_VERSION}|w|${seed}|${level}`);
  const out: string[] = [];
  while (out.length < count) {
    const lv = (level > 1 && r() < 0.3 ? level - 1 : level) as TextLevel;
    const list = WORDS[lv];
    const w = list[Math.floor(r() * list.length)];
    if (!out.slice(-12).includes(w)) out.push(w);
  }
  return out.join(' ');
}
