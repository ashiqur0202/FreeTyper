export interface PracticeText {
  id: string;
  category: 'quotes' | 'news' | 'code' | 'fun';
  title: string;
  text: string;
}

export const practiceTexts: PracticeText[] = [
  // Quotes
  {
    id: 'q1',
    category: 'quotes',
    title: 'Steve Jobs',
    text: 'Your time is limited, so do not waste it living someone else\'s life. Do not be trapped by dogma, which is living with the results of other people\'s thinking.',
  },
  {
    id: 'q2',
    category: 'quotes',
    title: 'Albert Einstein',
    text: 'In the middle of difficulty lies opportunity. Life is like riding a bicycle. To keep your balance, you must keep moving.',
  },
  {
    id: 'q3',
    category: 'quotes',
    title: 'Maya Angelou',
    text: 'People will forget what you said, people will forget what you did, but people will never forget how you made them feel.',
  },
  {
    id: 'q4',
    category: 'quotes',
    title: 'Marcus Aurelius',
    text: 'The happiness of your life depends upon the quality of your thoughts. Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
  },
  {
    id: 'q5',
    category: 'quotes',
    title: 'Linus Torvalds',
    text: 'Talk is cheap. Show me the code. I am a big believer in getting the fundamentals right and building on top of a solid foundation.',
  },
  // News
  {
    id: 'n1',
    category: 'news',
    title: 'Tech Industry',
    text: 'Major technology companies announced new artificial intelligence features at their annual developer conference, focusing on improved natural language processing and real-time code generation capabilities.',
  },
  {
    id: 'n2',
    category: 'news',
    title: 'Space Exploration',
    text: 'The space agency confirmed the successful launch of its latest mars rover mission, equipped with advanced sensors designed to search for signs of ancient microbial life beneath the planet surface.',
  },
  {
    id: 'n3',
    category: 'news',
    title: 'Climate Science',
    text: 'Researchers published new findings on ocean temperature patterns, revealing that deep water currents are shifting at rates faster than previously predicted by climate models.',
  },
  {
    id: 'n4',
    category: 'news',
    title: 'Health Innovation',
    text: 'A breakthrough in gene therapy shows promise for treating rare blood disorders, with clinical trials demonstrating significant improvement in patient outcomes over a twelve month period.',
  },
  {
    id: 'n5',
    category: 'news',
    title: 'Digital Privacy',
    text: 'New data protection regulations take effect across several nations this quarter, requiring companies to implement stronger encryption standards and provide users with greater control over personal information.',
  },
  // Code
  {
    id: 'c1',
    category: 'code',
    title: 'React Component',
    text: 'function Counter() { const [count, setCount] = useState(0); return ( <div> <p>You clicked {count} times</p> <button onClick={() => setCount(count + 1)}>Click me</button> </div> ); }',
  },
  {
    id: 'c2',
    category: 'code',
    title: 'Python Function',
    text: 'def fibonacci(n): if n <= 1: return n return fibonacci(n - 1) + fibonacci(n - 2) result = [fibonacci(i) for i in range(10)] print(result)',
  },
  {
    id: 'c3',
    category: 'code',
    title: 'TypeScript Interface',
    text: 'interface User { id: number; name: string; email: string; role: "admin" | "user"; } function greet(user: User): string { return `Hello, ${user.name}!`; }',
  },
  {
    id: 'c4',
    category: 'code',
    title: 'SQL Query',
    text: 'SELECT users.name, COUNT(orders.id) as total_orders FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE orders.created_at >= "2025-01-01" GROUP BY users.name ORDER BY total_orders DESC LIMIT 10;',
  },
  {
    id: 'c5',
    category: 'code',
    title: 'CSS Grid Layout',
    text: '.container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 2rem; } .card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); }',
  },
  // Fun
  {
    id: 'f1',
    category: 'fun',
    title: 'Octopus Hearts',
    text: 'An octopus has three hearts. Two branchial hearts pump blood to the gills, while the systemic heart pumps oxygenated blood to the rest of the body. When an octopus swims, the systemic heart stops beating, which is why they prefer crawling.',
  },
  {
    id: 'f2',
    category: 'fun',
    title: 'Honey Never Spoils',
    text: 'Archaeologists have found pots of honey in ancient Egyptian tombs that are over three thousand years old and still perfectly edible. The low moisture content and acidic pH create an inhospitable environment for bacteria and microorganisms.',
  },
  {
    id: 'f3',
    category: 'fun',
    title: 'Keyboard History',
    text: 'The QWERTY keyboard layout was designed in 1873 by Christopher Latham Sholes. It was created to prevent typewriter jams by separating commonly used letter pairs. Despite more efficient layouts like Dvorak existing, QWERTY remains the standard worldwide.',
  },
  {
    id: 'f4',
    category: 'fun',
    title: 'Typing Speed Records',
    text: 'The fastest typing speed ever recorded was 216 words per minute by Stella Pajunas in 1946 on an electric typewriter. On a modern keyboard, Barbara Blackburn reached 212 words per minute using a Dvorak keyboard layout in 2005.',
  },
  {
    id: 'f5',
    category: 'fun',
    title: 'Banana DNA',
    text: 'Humans share approximately sixty percent of their DNA with bananas. This surprising fact highlights how all living organisms share a common ancestor from billions of years ago, and many basic cellular processes remain remarkably similar across species.',
  },
];

// Finger mapping: key -> { finger: 0-3, hand: 'left'|'right' }
// Finger: 0=pinky, 1=ring, 2=middle, 3=index
export const fingerMap: Record<string, { finger: number; hand: 'left' | 'right' }> = {
  // Left hand
  'q': { finger: 0, hand: 'left' },
  'a': { finger: 0, hand: 'left' },
  'z': { finger: 0, hand: 'left' },
  '1': { finger: 0, hand: 'left' },
  'w': { finger: 1, hand: 'left' },
  's': { finger: 1, hand: 'left' },
  'x': { finger: 1, hand: 'left' },
  '2': { finger: 1, hand: 'left' },
  'e': { finger: 2, hand: 'left' },
  'd': { finger: 2, hand: 'left' },
  'c': { finger: 2, hand: 'left' },
  '3': { finger: 2, hand: 'left' },
  'r': { finger: 3, hand: 'left' },
  'f': { finger: 3, hand: 'left' },
  'v': { finger: 3, hand: 'left' },
  '4': { finger: 3, hand: 'left' },
  't': { finger: 3, hand: 'left' },
  'g': { finger: 3, hand: 'left' },
  'b': { finger: 3, hand: 'left' },
  '5': { finger: 3, hand: 'left' },
  // Right hand
  'p': { finger: 0, hand: 'right' },
  ';': { finger: 0, hand: 'right' },
  '/': { finger: 0, hand: 'right' },
  '0': { finger: 0, hand: 'right' },
  '-': { finger: 0, hand: 'right' },
  'o': { finger: 1, hand: 'right' },
  'l': { finger: 1, hand: 'right' },
  '.': { finger: 1, hand: 'right' },
  '9': { finger: 1, hand: 'right' },
  'i': { finger: 2, hand: 'right' },
  'k': { finger: 2, hand: 'right' },
  ',': { finger: 2, hand: 'right' },
  '8': { finger: 2, hand: 'right' },
  'u': { finger: 3, hand: 'right' },
  'j': { finger: 3, hand: 'right' },
  'm': { finger: 3, hand: 'right' },
  '7': { finger: 3, hand: 'right' },
  'y': { finger: 3, hand: 'right' },
  'h': { finger: 3, hand: 'right' },
  'n': { finger: 3, hand: 'right' },
  '6': { finger: 3, hand: 'right' },
  // Punctuation and edge keys — standard touch-typing assignment
  '`': { finger: 0, hand: 'left' },
  '=': { finger: 0, hand: 'right' },
  '[': { finger: 0, hand: 'right' },
  ']': { finger: 0, hand: 'right' },
  '\\': { finger: 0, hand: 'right' },
  "'": { finger: 0, hand: 'right' },
  // Space has no entry: it is typed with either thumb, not a finger zone.
};

// Keyboard colors per finger zone
export const keyboardColors: Record<string, string> = {
  'left-pinky': '#ef4444',   // red-500
  'left-ring': '#f97316',    // orange-500
  'left-middle': '#eab308',  // yellow-500
  'left-index': '#22c55e',   // green-500
  'right-index': '#06b6d4',  // cyan-500
  'right-middle': '#3b82f6', // blue-500
  'right-ring': '#8b5cf6',   // violet-500
  'right-pinky': '#ec4899',  // pink-500
};

export function getKeyFinger(key: string): { finger: number; hand: 'left' | 'right' } | undefined {
  return fingerMap[key.toLowerCase()];
}

export function getKeyColor(key: string): string {
  const mapping = fingerMap[key.toLowerCase()];
  if (!mapping) return '#4b5563'; // gray-600
  return keyboardColors[`${mapping.hand}-${['pinky', 'ring', 'middle', 'index'][mapping.finger]}`];
}

// Keyboard layout for rendering
export const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

export const homeRowKeys = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
