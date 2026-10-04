/**
 * The typing course: 34 lessons in 6 stages.
 *
 * The order (home row, then the rows above and below it, then Shift and
 * punctuation, numbers and symbols, then speed) is our own design and follows
 * the finger map in typingData.ts. It is not a proven method.
 *
 * Each lesson's text is generated when you start it (see lessonText.ts), using
 * only the keys unlocked so far.
 */

export type StageId = 'home' | 'top' | 'bottom' | 'shift' | 'numbers' | 'speed';

export const STAGES: { id: StageId; label: string }[] = [
  { id: 'home', label: 'Home row' },
  { id: 'top', label: 'Top row' },
  { id: 'bottom', label: 'Bottom row' },
  { id: 'shift', label: 'Shift & punctuation' },
  { id: 'numbers', label: 'Numbers & symbols' },
  { id: 'speed', label: 'Speed & accuracy' },
];

export type LessonStyle = 'drill' | 'words' | 'caps' | 'sentences' | 'numbers' | 'symbols' | 'paragraph';

export interface CourseLesson {
  id: string;
  number: number;
  stage: StageId;
  title: string;
  tip: string;
  style: LessonStyle;
  /** Keys introduced in this lesson (shown in the header). */
  newKeys: string[];
  /** Lowercase letters unlocked so far. */
  letters: string;
  /** Punctuation sprinkled into word lessons (, . ; /). */
  punct?: string;
  /** Capital-letter drills: which hand's letters get the capital. */
  caps?: 'left' | 'right';
  /** Extra characters allowed in sentences and paragraphs. */
  allowedExtra?: string;
  /** A sentence must contain one of these to be preferred. */
  focus?: string;
  digits?: string;
  symbols?: string;
  /** Number lessons: mix dates, times, prices and phone numbers. */
  mixed?: boolean;
  /** Target text length in characters. */
  length?: number;
  /** Accuracy needed to pass (defaults to PASS_ACCURACY). */
  minAccuracy?: number;
  /** Keys kept bright on the on-screen keyboard (everything else is dimmed). */
  keys: string[];
}

export const PASS_ACCURACY = 95;
/** After this many failed attempts the course offers "move on anyway". */
export const MAX_FAILED_TRIES = 3;

/** Shifted character -> the key it lives on. */
const SHIFTED: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`',
};

type Draft = Omit<CourseLesson, 'keys' | 'id' | 'number'>;

/** Which keys (and whether Shift) a lesson needs, for the on-screen keyboard focus. */
function focusKeys(l: Draft): string[] {
  const keys = new Set<string>(l.letters.split(''));
  let needsShift = Boolean(l.caps) || l.style === 'sentences' || l.style === 'paragraph';
  const add = (chars: string) => {
    for (const ch of chars) {
      if (SHIFTED[ch]) {
        keys.add(SHIFTED[ch]);
        needsShift = true;
      } else if (/[A-Z]/.test(ch)) {
        keys.add(ch.toLowerCase());
        needsShift = true;
      } else if (ch !== ' ') {
        keys.add(ch);
      }
    }
  };
  add(l.punct ?? '');
  add(l.allowedExtra ?? '');
  add(l.digits ?? '');
  add(l.symbols ?? '');
  if (needsShift) {
    keys.add('shift-l');
    keys.add('shift-r');
  }
  keys.add('space');
  return [...keys];
}

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const ALL_DIGITS = '1234567890';
const ALL_PUNCT = ".,'?!\":;-";

const drafts: Draft[] = [
  // ── Stage 1: home row ──
  { stage: 'home', title: 'F and J', style: 'drill', newKeys: ['f', 'j'], letters: 'fj',
    tip: 'Rest your left index finger on F and your right index finger on J. The small bumps help you find them. Press each key with its own index finger and come back to the bump.' },
  { stage: 'home', title: 'D and K', style: 'drill', newKeys: ['d', 'k'], letters: 'fjdk',
    tip: 'The left middle finger types D and the right middle finger types K. Keep your index fingers resting on F and J.' },
  { stage: 'home', title: 'S and L', style: 'drill', newKeys: ['s', 'l'], letters: 'fjdksl',
    tip: 'The ring fingers: left ring on S, right ring on L. Keep the other fingers on their home keys.' },
  { stage: 'home', title: 'A and ;', style: 'words', newKeys: ['a', ';'], letters: 'asdfjkl', punct: ';',
    tip: 'The little fingers: left little on A, right little on the semicolon. All eight home-row keys are now in play: A S D F and J K L ;' },
  { stage: 'home', title: 'G and H', style: 'words', newKeys: ['g', 'h'], letters: 'asdfghjkl',
    tip: 'The index fingers stretch one key inwards: left index to G, right index to H. Return to F and J each time.' },
  // ── Stage 2: top row ──
  { stage: 'top', title: 'E and I', style: 'words', newKeys: ['e', 'i'], letters: 'asdfghjklei',
    tip: 'Reach up with the middle fingers: left middle to E, right middle to I. Come back to D and K.' },
  { stage: 'top', title: 'R and U', style: 'words', newKeys: ['r', 'u'], letters: 'asdfghjkleiru',
    tip: 'The index fingers reach up: left index to R, right index to U. Return to F and J.' },
  { stage: 'top', title: 'T and Y', style: 'words', newKeys: ['t', 'y'], letters: 'asdfghjkleiruty',
    tip: 'The index fingers reach up and inwards: left index to T, right index to Y.' },
  { stage: 'top', title: 'O and P', style: 'words', newKeys: ['o', 'p'], letters: 'asdfghjkleirutyop',
    tip: 'The right ring finger reaches up to O and the right little finger to P. Return to L and the semicolon.' },
  { stage: 'top', title: 'W and Q', style: 'words', newKeys: ['w', 'q'], letters: 'asdfghjkleirutyopwq',
    tip: 'The left ring finger reaches up to W and the left little finger to Q. Return to S and A.' },
  // ── Stage 3: bottom row ──
  { stage: 'bottom', title: 'V and M', style: 'words', newKeys: ['v', 'm'], letters: 'asdfghjkleirutyopwqvm',
    tip: 'The index fingers reach down: left index to V, right index to M.' },
  { stage: 'bottom', title: 'C and comma', style: 'words', newKeys: ['c', ','], letters: 'asdfghjkleirutyopwqvmc', punct: ',',
    tip: 'The left middle finger reaches down to C and the right middle finger types the comma.' },
  { stage: 'bottom', title: 'X and full stop', style: 'words', newKeys: ['x', '.'], letters: 'asdfghjkleirutyopwqvmcx', punct: '.',
    tip: 'The left ring finger reaches down to X and the right ring finger types the full stop.' },
  { stage: 'bottom', title: 'Z and slash', style: 'words', newKeys: ['z', '/'], letters: 'asdfghjkleirutyopwqvmcxz', punct: '/',
    tip: 'The left little finger reaches down to Z and the right little finger types the slash.' },
  { stage: 'bottom', title: 'B and N', style: 'words', newKeys: ['b', 'n'], letters: ALL_LETTERS,
    tip: 'The index fingers reach down and inwards: left index to B, right index to N.' },
  { stage: 'bottom', title: 'All letters', style: 'words', newKeys: [], letters: ALL_LETTERS, punct: ',.;', length: 300,
    tip: 'Every letter is unlocked. Keep your eyes on the text and let your fingers return to the home row after each reach.' },
  // ── Stage 4: Shift and punctuation ──
  { stage: 'shift', title: 'Capitals: right Shift', style: 'caps', newKeys: ['Shift'], letters: ALL_LETTERS, caps: 'left',
    tip: 'Hold the right Shift with your right little finger to capitalise a letter typed by your left hand, then let go.' },
  { stage: 'shift', title: 'Capitals: left Shift', style: 'caps', newKeys: ['Shift'], letters: ALL_LETTERS, caps: 'right',
    tip: 'Hold the left Shift with your left little finger to capitalise a letter typed by your right hand, then let go.' },
  { stage: 'shift', title: 'Capitals and full stops', style: 'sentences', newKeys: ['.'], letters: ALL_LETTERS, allowedExtra: '.', focus: '.',
    tip: 'Use the Shift key on the opposite side from the letter you are capitalising. End each sentence with a full stop.' },
  { stage: 'shift', title: 'Apostrophe', style: 'sentences', newKeys: ["'"], letters: ALL_LETTERS, allowedExtra: ".,'", focus: "'",
    tip: 'The apostrophe sits next to the semicolon. Use your right little finger.' },
  { stage: 'shift', title: 'Question and exclamation marks', style: 'sentences', newKeys: ['?', '!'], letters: ALL_LETTERS, allowedExtra: ".,'?!", focus: '?!',
    tip: 'The question mark is Shift plus slash. The exclamation mark is Shift plus 1: the 1 key is typed by your left little finger, so hold the right Shift.' },
  { stage: 'shift', title: 'Quotes, colon, semicolon, hyphen', style: 'sentences', newKeys: ['"', ':', ';', '-'], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT, focus: '":;-',
    tip: 'Quotes are Shift plus the apostrophe key and the colon is Shift plus the semicolon key. The hyphen is the key to the left of equals; use your right little finger.' },
  // ── Stage 5: numbers and symbols ──
  { stage: 'numbers', title: 'Numbers 1 to 5', style: 'numbers', newKeys: ['1', '2', '3', '4', '5'], letters: ALL_LETTERS, digits: '12345',
    tip: 'Left hand: little finger 1, ring 2, middle 3, index 4 and 5. Reach up from the home row with the matching finger, then return.' },
  { stage: 'numbers', title: 'Numbers 6 to 0', style: 'numbers', newKeys: ['6', '7', '8', '9', '0'], letters: ALL_LETTERS, digits: ALL_DIGITS,
    tip: 'Right hand: index finger 6 and 7, middle 8, ring 9, little 0.' },
  { stage: 'numbers', title: 'Numbers mixed', style: 'numbers', newKeys: [], letters: ALL_LETTERS, digits: ALL_DIGITS, mixed: true, allowedExtra: '.:-', length: 280,
    tip: 'Dates, times, prices and phone numbers mixed together. Stay close to the home row between reaches.' },
  { stage: 'numbers', title: 'Symbols ! @ # $ %', style: 'symbols', newKeys: ['!', '@', '#', '$', '%'], letters: ALL_LETTERS, digits: ALL_DIGITS, symbols: '!@#$%',
    tip: 'These are Shift plus 1 to 5. The left hand types those number keys, so hold the right Shift.' },
  { stage: 'numbers', title: 'Symbols ^ & * ( )', style: 'symbols', newKeys: ['^', '&', '*', '(', ')'], letters: ALL_LETTERS, digits: ALL_DIGITS, symbols: '^&*()',
    tip: 'These are Shift plus 6 to 0. The right hand types those number keys, so hold the left Shift.' },
  { stage: 'numbers', title: 'Brackets and operators', style: 'symbols', newKeys: ['[', ']', '{', '}', '+', '=', '_', '|', '<', '>'], letters: ALL_LETTERS, digits: ALL_DIGITS, symbols: '[]{}+=_|<>/-',
    tip: 'Brackets and the backslash sit to the right of P; plus, equals and underscore are on the number row; angle brackets are Shift plus comma and full stop. Take it slowly.' },
  // ── Stage 6: speed and accuracy ──
  { stage: 'speed', title: 'Common words', style: 'words', newKeys: [], letters: ALL_LETTERS, length: 320,
    tip: 'Common words at a steady pace. Accuracy first; speed follows a clean rhythm.' },
  { stage: 'speed', title: 'Sentences', style: 'sentences', newKeys: [], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT, length: 320,
    tip: 'Full sentences with capitals and punctuation. Look ahead to the next word while you type the current one.' },
  { stage: 'speed', title: 'A short passage', style: 'paragraph', newKeys: [], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT + ALL_DIGITS, length: 150,
    tip: 'A short paragraph of ordinary prose. Keep your eyes on the text and your breathing relaxed.' },
  { stage: 'speed', title: 'Accuracy challenge', style: 'paragraph', newKeys: [], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT + ALL_DIGITS, length: 150, minAccuracy: 98,
    tip: 'This one needs 98% accuracy. Slow down and fix mistakes as you notice them.' },
  { stage: 'speed', title: 'Speed practice', style: 'paragraph', newKeys: [], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT + ALL_DIGITS, length: 420,
    tip: 'A longer passage. Find a rhythm you can hold, and do not let one mistake break it.' },
  { stage: 'speed', title: 'Final passage', style: 'paragraph', newKeys: [], letters: ALL_LETTERS, allowedExtra: ALL_PUNCT + ALL_DIGITS, length: 480,
    tip: 'The last lesson: a long passage with everything you have learned. Repeat it whenever you like to see how far you have come.' },
];

export const courseLessons: CourseLesson[] = drafts.map((d, i) => ({
  ...d,
  id: `lesson-${i + 1}`,
  number: i + 1,
  keys: focusKeys(d),
}));

export function lessonById(id: string): CourseLesson | undefined {
  return courseLessons.find((l) => l.id === id);
}

export function minAccuracyFor(l: CourseLesson): number {
  return l.minAccuracy ?? PASS_ACCURACY;
}
