/**
 * Quotes for the Practice "quotes" tab. Every quote is an exact, word-for-word piece of a public-domain text:
 * it was checked by machine against the full text of the book or document on Project Gutenberg (Gutenberg
 * ebook number in `gutenberg`) on 2026-11-24, after changing only curly quotes and long dashes to plain ASCII.
 * Where a translator is named, the translation is in the public domain too. Misattributed or reworded "famous
 * quotes" are deliberately left out: if a line cannot be found in a source we opened, it is not here.
 *
 * Add a quote only after checking it the same way, and keep it ASCII.
 */

export interface Quote {
  id: string;
  text: string;
  author: string;
  work: string;
  /** Translator or edition, when it matters. */
  note?: string;
  /** Project Gutenberg ebook number of the text it was checked against. */
  gutenberg: number;
  checked: string;
}

export const QUOTES: Quote[] = [
  { id: "q001", text: "Look within; within is the fountain of all good.", author: "Marcus Aurelius", work: "Meditations", note: "tr. George Long", gutenberg: 2680, checked: '2026-11-24' },
  { id: "q002", text: "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.", author: "Jane Austen", work: "Pride and Prejudice", gutenberg: 1342, checked: '2026-11-24' },
  { id: "q003", text: "Vanity and pride are different things, though the words are often used synonymously.", author: "Jane Austen", work: "Pride and Prejudice", gutenberg: 1342, checked: '2026-11-24' },
  { id: "q004", text: "I declare, after all, there is no enjoyment like reading!", author: "Jane Austen", work: "Pride and Prejudice", gutenberg: 1342, checked: '2026-11-24' },
  { id: "q005", text: "A lady's imagination is very rapid; it jumps from admiration to love, from love to matrimony, in a moment.", author: "Jane Austen", work: "Pride and Prejudice", gutenberg: 1342, checked: '2026-11-24' },
  { id: "q006", text: "\"Begin at the beginning,\" the King said gravely, \"and go on till you come to the end: then stop.\"", author: "Lewis Carroll", work: "Alice's Adventures in Wonderland", gutenberg: 11, checked: '2026-11-24' },
  { id: "q007", text: "Why, sometimes I've believed as many as six impossible things before breakfast.", author: "Lewis Carroll", work: "Through the Looking-Glass", gutenberg: 12, checked: '2026-11-24' },
  { id: "q008", text: "Now, here, you see, it takes all the running you can do, to keep in the same place.", author: "Lewis Carroll", work: "Through the Looking-Glass", gutenberg: 12, checked: '2026-11-24' },
  { id: "q009", text: "It is a capital mistake to theorise before one has data.", author: "Arthur Conan Doyle", work: "The Adventures of Sherlock Holmes", gutenberg: 1661, checked: '2026-11-24' },
  { id: "q010", text: "\"There is nothing more deceptive than an obvious fact,\" he answered, laughing.", author: "Arthur Conan Doyle", work: "The Adventures of Sherlock Holmes", gutenberg: 1661, checked: '2026-11-24' },
  { id: "q011", text: "The world is full of obvious things which nobody by any chance ever observes.", author: "Arthur Conan Doyle", work: "The Hound of the Baskervilles", gutenberg: 2852, checked: '2026-11-24' },
  { id: "q012", text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q013", text: "The mass of men lead lives of quiet desperation.", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q014", text: "Time is but the stream I go a-fishing in.", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q015", text: "I learned this, at least, by my experiment; that if one advances confidently in the direction of his dreams, and endeavors to live the life which he has imagined, he will meet with a success unexpected in common hours.", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q016", text: "Why should we be in such desperate haste to succeed, and in such desperate enterprises?", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q017", text: "Rather than love, than money, than fame, give me truth.", author: "Henry David Thoreau", work: "Walden", gutenberg: 205, checked: '2026-11-24' },
  { id: "q018", text: "A foolish consistency is the hobgoblin of little minds, adored by little statesmen and philosophers and divines.", author: "Ralph Waldo Emerson", work: "Essays, First Series", gutenberg: 2944, checked: '2026-11-24' },
  { id: "q019", text: "Trust thyself: every heart vibrates to that iron string.", author: "Ralph Waldo Emerson", work: "Essays, First Series", gutenberg: 2944, checked: '2026-11-24' },
  { id: "q020", text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson", work: "Essays, First Series", gutenberg: 2944, checked: '2026-11-24' },
  { id: "q021", text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson", work: "Essays, First Series", gutenberg: 2944, checked: '2026-11-24' },
  { id: "q022", text: "Let your plans be dark and impenetrable as night, and when you move, fall like a thunderbolt.", author: "Sun Tzu", work: "The Art of War", note: "tr. Lionel Giles", gutenberg: 132, checked: '2026-11-24' },
  { id: "q023", text: "Hence to fight and conquer in all your battles is not supreme excellence; supreme excellence consists in breaking the enemy's resistance without fighting.", author: "Sun Tzu", work: "The Art of War", note: "tr. Lionel Giles", gutenberg: 132, checked: '2026-11-24' },
  { id: "q024", text: "It is not down in any map; true places never are.", author: "Herman Melville", work: "Moby-Dick", gutenberg: 2701, checked: '2026-11-24' },
  { id: "q025", text: "Take nothing on its looks; take everything on evidence.", author: "Charles Dickens", work: "Great Expectations", gutenberg: 1400, checked: '2026-11-24' },
  { id: "q026", text: "I will honour Christmas in my heart, and try to keep it all the year.", author: "Charles Dickens", work: "A Christmas Carol", gutenberg: 46, checked: '2026-11-24' },
  { id: "q027", text: "It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to than I have ever known.", author: "Charles Dickens", work: "A Tale of Two Cities", gutenberg: 98, checked: '2026-11-24' },
  { id: "q028", text: "Work consists of whatever a body is obliged to do, and that Play consists of whatever a body is not obliged to do.", author: "Mark Twain", work: "The Adventures of Tom Sawyer", gutenberg: 74, checked: '2026-11-24' },
  { id: "q029", text: "The only way to get rid of a temptation is to yield to it.", author: "Oscar Wilde", work: "The Picture of Dorian Gray", gutenberg: 174, checked: '2026-11-24' },
  { id: "q030", text: "Nothing is so painful to the human mind as a great and sudden change.", author: "Mary Shelley", work: "Frankenstein", gutenberg: 84, checked: '2026-11-24' },
  { id: "q031", text: "Believe me, my young friend, there is nothing - absolute nothing - half so much worth doing as simply messing about in boats.", author: "Kenneth Grahame", work: "The Wind in the Willows", gutenberg: 289, checked: '2026-11-24' },
  { id: "q032", text: "I celebrate myself, and sing myself, And what I assume you shall assume, For every atom belonging to me as good belongs to you.", author: "Walt Whitman", work: "Leaves of Grass", gutenberg: 1322, checked: '2026-11-24' },
  { id: "q033", text: "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty, and the pursuit of Happiness.", author: "Thomas Jefferson and others", work: "The Declaration of Independence", gutenberg: 1, checked: '2026-11-24' },
  { id: "q034", text: "This above all: to thine own self be true; And it must follow, as the night the day, Thou canst not then be false to any man.", author: "William Shakespeare", work: "Hamlet", gutenberg: 1524, checked: '2026-11-24' },
  { id: "q035", text: "Therefore, since brevity is the soul of wit, And tediousness the limbs and outward flourishes, I will be brief.", author: "William Shakespeare", work: "Hamlet", gutenberg: 1524, checked: '2026-11-24' },
  { id: "q036", text: "The Tortoise never for a moment stopped, but went on with a slow but steady pace straight to the end of the course.", author: "Aesop", work: "The Hare and the Tortoise", note: "Three Hundred Aesop's Fables, tr. George Fyler Townsend", gutenberg: 21, checked: '2026-11-24' },
];
