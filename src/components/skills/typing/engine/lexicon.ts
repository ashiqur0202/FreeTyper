/**
 * The word bank for the sentence generator. Written by hand, everyday words only, plain ASCII, lower case.
 *
 * Words are grouped by what they are (a person, an animal, food, a thing you can read...) so a verb can ask
 * for the right kind of subject and object: people eat food and read books, they do not read the lake. That
 * keeps made-up sentences sensible. Every sentence is still invented and states nothing about the real world.
 *
 * VERSION 1. Do not remove or change a word that a released generator version used; add new words in a new
 * version (see engine/index.ts).
 */

export type NounClass =
  | 'person'
  | 'animal'
  | 'food'
  | 'item'
  | 'paper'
  | 'clothing'
  | 'instrument'
  | 'vehicle'
  | 'furniture'
  | 'place'
  | 'sky'
  | 'weather'
  | 'plant'
  | 'water'
  | 'land';

const w = (s: string) => s.split(' ');

export const NOUNS: Record<NounClass, string[]> = {
  person: w(
    'boy girl man woman child baby friend teacher doctor nurse cook baker farmer pilot driver sailor singer painter writer student uncle aunt king queen guard neighbor coach clerk tailor potter artist dancer guide visitor worker captain judge poet player runner rider dad lad lass',
  ),
  animal: w(
    'dog cat bird fish horse cow pig duck frog bee ant fox bear wolf lion deer goat sheep mouse rabbit owl hen lamb seal whale snake turtle monkey puppy kitten pony camel eagle goose',
  ),
  food: w(
    'bread cake soup rice apple pear plum peach jam milk tea egg corn cheese honey pie pizza salad fruit toast butter cookie pasta carrot potato lemon orange berry sauce',
  ),
  item: w(
    'pen cup bag box ball key coin lamp clock phone camera basket bottle kite toy bell rope plate bowl fork spoon knife mirror candle brush wheel flask sled',
  ),
  paper: w('book letter map ticket paper note magazine poem story list card'),
  clothing: w('hat coat shoe scarf glove dress shirt sock jacket boot blanket'),
  instrument: w('drum flute guitar piano violin harp radio whistle'),
  vehicle: w('bicycle wagon boat train bus truck cart ship'),
  furniture: w('chair table bed door window shelf desk bench stool ladder'),
  place: w(
    'house school shop market park farm river lake hill road bridge garden kitchen street station library harbor village city beach forest field barn castle museum cafe theater playground pond',
  ),
  sky: w('sun moon star cloud sky'),
  weather: w('rain wind snow storm fog mist breeze'),
  plant: w('tree flower leaf grass bush vine'),
  water: w('sea wave stream'),
  land: w('rock sand mountain valley hill'),
};

/** Food we do not count: "the milk", never "a milk". */
export const UNCOUNTABLE = new Set(w('bread rice milk honey butter cheese soup jam corn pasta sauce fruit'));

/** One verb. `subj` and `obj` are the kinds of noun it may take; no `obj` means it needs no object. */
export interface Verb {
  base: string;
  /** he/she/it form. */
  third: string;
  past: string;
  subj: NounClass[];
  obj?: NounClass[];
}

const P: NounClass[] = ['person'];
const PA: NounClass[] = ['person', 'animal'];
const PEOPLE_GOODS: NounClass[] = ['food', 'item', 'paper', 'clothing', 'instrument', 'vehicle', 'furniture'];

export const VERBS: Verb[] = [
  // with an object
  { base: 'eat', third: 'eats', past: 'ate', subj: PA, obj: ['food'] },
  { base: 'cook', third: 'cooks', past: 'cooked', subj: P, obj: ['food'] },
  { base: 'bake', third: 'bakes', past: 'baked', subj: P, obj: ['food'] },
  { base: 'serve', third: 'serves', past: 'served', subj: P, obj: ['food'] },
  { base: 'taste', third: 'tastes', past: 'tasted', subj: PA, obj: ['food'] },
  { base: 'buy', third: 'buys', past: 'bought', subj: P, obj: PEOPLE_GOODS },
  { base: 'sell', third: 'sells', past: 'sold', subj: P, obj: PEOPLE_GOODS },
  { base: 'share', third: 'shares', past: 'shared', subj: P, obj: ['food', 'item', 'paper'] },
  { base: 'find', third: 'finds', past: 'found', subj: P, obj: ['item', 'paper', 'clothing', 'food'] },
  { base: 'lose', third: 'loses', past: 'lost', subj: P, obj: ['item', 'paper', 'clothing'] },
  { base: 'hold', third: 'holds', past: 'held', subj: P, obj: ['item', 'paper', 'food'] },
  { base: 'drop', third: 'drops', past: 'dropped', subj: P, obj: ['item', 'paper', 'food'] },
  { base: 'carry', third: 'carries', past: 'carried', subj: P, obj: ['item', 'paper', 'food', 'clothing'] },
  { base: 'bring', third: 'brings', past: 'brought', subj: P, obj: ['item', 'paper', 'food', 'clothing'] },
  { base: 'take', third: 'takes', past: 'took', subj: P, obj: ['item', 'paper', 'food', 'clothing'] },
  { base: 'open', third: 'opens', past: 'opened', subj: P, obj: ['item', 'paper', 'furniture'] },
  { base: 'fix', third: 'fixes', past: 'fixed', subj: P, obj: ['item', 'furniture', 'vehicle', 'instrument'] },
  { base: 'wash', third: 'washes', past: 'washed', subj: P, obj: ['item', 'clothing', 'vehicle'] },
  { base: 'clean', third: 'cleans', past: 'cleaned', subj: P, obj: ['item', 'furniture', 'place'] },
  { base: 'paint', third: 'paints', past: 'painted', subj: P, obj: ['item', 'furniture', 'place', 'vehicle'] },
  { base: 'build', third: 'builds', past: 'built', subj: P, obj: ['item', 'furniture', 'place', 'vehicle'] },
  { base: 'read', third: 'reads', past: 'read', subj: P, obj: ['paper'] },
  { base: 'write', third: 'writes', past: 'wrote', subj: P, obj: ['paper'] },
  { base: 'wear', third: 'wears', past: 'wore', subj: P, obj: ['clothing'] },
  { base: 'play', third: 'plays', past: 'played', subj: P, obj: ['instrument'] },
  { base: 'ride', third: 'rides', past: 'rode', subj: P, obj: ['vehicle'] },
  { base: 'visit', third: 'visits', past: 'visited', subj: P, obj: ['place', 'person'] },
  { base: 'leave', third: 'leaves', past: 'left', subj: P, obj: ['place'] },
  { base: 'reach', third: 'reaches', past: 'reached', subj: P, obj: ['place'] },
  { base: 'enter', third: 'enters', past: 'entered', subj: P, obj: ['place'] },
  { base: 'help', third: 'helps', past: 'helped', subj: P, obj: ['person'] },
  { base: 'greet', third: 'greets', past: 'greeted', subj: P, obj: ['person'] },
  { base: 'thank', third: 'thanks', past: 'thanked', subj: P, obj: ['person'] },
  { base: 'call', third: 'calls', past: 'called', subj: P, obj: ['person'] },
  { base: 'meet', third: 'meets', past: 'met', subj: P, obj: ['person'] },
  { base: 'ask', third: 'asks', past: 'asked', subj: P, obj: ['person'] },
  { base: 'follow', third: 'follows', past: 'followed', subj: PA, obj: ['person'] },
  { base: 'feed', third: 'feeds', past: 'fed', subj: P, obj: ['animal'] },
  { base: 'watch', third: 'watches', past: 'watched', subj: P, obj: ['animal', 'sky', 'person'] },
  { base: 'see', third: 'sees', past: 'saw', subj: PA, obj: ['animal', 'sky', 'person', 'place'] },
  { base: 'like', third: 'likes', past: 'liked', subj: P, obj: ['food', 'item', 'animal', 'instrument', 'place', 'plant'] },
  { base: 'want', third: 'wants', past: 'wanted', subj: P, obj: ['food', 'item', 'clothing', 'instrument', 'paper'] },
  { base: 'need', third: 'needs', past: 'needed', subj: P, obj: ['food', 'item', 'clothing', 'paper', 'vehicle'] },
  // no object
  { base: 'walk', third: 'walks', past: 'walked', subj: PA },
  { base: 'run', third: 'runs', past: 'ran', subj: PA },
  { base: 'jump', third: 'jumps', past: 'jumped', subj: PA },
  { base: 'swim', third: 'swims', past: 'swam', subj: PA },
  { base: 'dance', third: 'dances', past: 'danced', subj: P },
  { base: 'sleep', third: 'sleeps', past: 'slept', subj: PA },
  { base: 'rest', third: 'rests', past: 'rested', subj: PA },
  { base: 'wait', third: 'waits', past: 'waited', subj: PA },
  { base: 'smile', third: 'smiles', past: 'smiled', subj: P },
  { base: 'laugh', third: 'laughs', past: 'laughed', subj: P },
  { base: 'sing', third: 'sings', past: 'sang', subj: P },
  { base: 'work', third: 'works', past: 'worked', subj: P },
  { base: 'study', third: 'studies', past: 'studied', subj: P },
  { base: 'sit', third: 'sits', past: 'sat', subj: PA },
  { base: 'stand', third: 'stands', past: 'stood', subj: PA },
  { base: 'listen', third: 'listens', past: 'listened', subj: P },
  { base: 'shine', third: 'shines', past: 'shone', subj: ['sky'] },
  { base: 'rise', third: 'rises', past: 'rose', subj: ['sky'] },
  { base: 'glow', third: 'glows', past: 'glowed', subj: ['sky'] },
  { base: 'drift', third: 'drifts', past: 'drifted', subj: ['sky', 'weather'] },
  { base: 'fall', third: 'falls', past: 'fell', subj: ['weather', 'plant'] },
  { base: 'blow', third: 'blows', past: 'blew', subj: ['weather'] },
  { base: 'grow', third: 'grows', past: 'grew', subj: ['plant'] },
  { base: 'sway', third: 'sways', past: 'swayed', subj: ['plant'] },
  { base: 'flow', third: 'flows', past: 'flowed', subj: ['water'] },
  { base: 'roll', third: 'rolls', past: 'rolled', subj: ['land'] },
];

/**
 * `for` lists the kinds of noun an adjective suits. `axis` groups adjectives that say the same kind of thing
 * (size, temperature, colour...): two of the same axis are never used together ("big small", "hot cold").
 */
export interface Adjective {
  word: string;
  for: NounClass[];
  axis?: string;
}

const THINGS: NounClass[] = ['item', 'paper', 'clothing', 'instrument', 'vehicle', 'furniture'];
const ALIVE: NounClass[] = ['person', 'animal'];

const adj = (words: string, forClasses: NounClass[], axis?: string): Adjective[] =>
  w(words).map((word) => ({ word, for: forClasses, axis }));

export const ADJECTIVES: Adjective[] = [
  ...adj('big small', [...ALIVE, ...THINGS, 'plant', 'place', 'sky', 'water', 'land'], 'size'),
  ...adj('tall short', ['person', 'plant'], 'size'),
  ...adj('long wide narrow', [...THINGS, 'place', 'water', 'land'], 'size'),
  ...adj('old new', [...ALIVE, ...THINGS, 'place', 'plant'], 'age'),
  ...adj('young', ALIVE, 'age'),
  ...adj('quiet', [...ALIVE, 'place', 'weather', 'water'], 'noise'),
  ...adj('bright', ['sky', ...THINGS, 'place'], 'light'),
  ...adj('dark', ['weather', 'place', 'plant'], 'light'),
  ...adj('clean', [...THINGS, 'place', 'food'], 'clean'),
  ...adj('red blue green brown yellow white black', [...THINGS, 'animal', 'plant', 'food'], 'colour'),
  ...adj('soft', [...THINGS, 'animal', 'weather'], 'touch'),
  ...adj('hard', ['item', 'furniture', 'vehicle', 'land', 'food'], 'touch'),
  ...adj('heavy', THINGS, 'weight'),
  ...adj('warm cool', [...THINGS, 'sky', 'weather', 'water', 'food', 'place'], 'temperature'),
  ...adj('hot cold', ['food', 'water', 'weather'], 'temperature'),
  ...adj('plain simple useful shiny broken', THINGS),
  ...adj('kind gentle tired happy hungry proud brave shy clever calm friendly glad sad', ALIVE),
  ...adj('sweet fresh sour crisp ripe tasty', ['food'], 'taste'),
  ...adj('busy empty crowded peaceful sunny', ['place']),
];

/** Ways of doing something, for people and animals. */
export const ADVERBS = w('slowly quickly quietly carefully happily gently softly proudly calmly eagerly daily often always sometimes soon today');

/** Words for where. A place noun goes after "the"; which word fits depends on the place (on the road, in the kitchen). */
export const PLACE_PREPOSITIONS = w('in at near by behind beside');

const INDOORS = w('house school shop kitchen library cafe museum barn castle theater');
const OUTDOORS = w('garden park field farm forest village city playground market harbor');
const WATERSIDE = w('river lake pond beach');
const ROADSIDE = w('road street bridge hill station');

/** The words that read naturally before this place. */
export function prepositionsFor(place: string): string[] {
  if (INDOORS.includes(place)) return w('in at near by behind beside');
  if (OUTDOORS.includes(place)) return w('in at near by beside');
  if (WATERSIDE.includes(place)) return w('at near by beside');
  if (ROADSIDE.includes(place)) return w('on at near by beside');
  return w('near by beside');
}

export const TIME_PHRASES = ['every day', 'every morning', 'every evening', 'after lunch', 'before dinner', 'at noon', 'at night', 'in the morning', 'in the evening'];

/** Words that start a noun phrase. `a` becomes `an` before a vowel. */
export const DETERMINERS = ['the', 'a', 'my', 'our', 'this', 'that'];

export const SUBJECT_PRONOUNS_THIRD = ['he', 'she'];
export const SUBJECT_PRONOUNS_PLURAL = ['we', 'they', 'you'];
