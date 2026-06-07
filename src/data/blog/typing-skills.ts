export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-type-faster',
    title: 'How to Type Faster: Complete Guide',
    excerpt: 'Learn the proven techniques to increase your typing speed from beginner to 100+ WPM with structured practice.',
    date: '2025-06-01',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '8 min',
  },
  {
    slug: 'average-typing-speed',
    title: 'Average Typing Speed by Age and Profession (2026)',
    excerpt: 'How fast does the average person type? We break down typing speeds by age group, profession, and experience level.',
    date: '2025-05-28',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '6 min',
  },
  {
    slug: 'touch-typing-guide',
    title: 'Touch Typing: The Ultimate Guide',
    excerpt: 'Master touch typing — the skill of typing without looking at the keyboard. Step-by-step instructions and practice tips.',
    date: '2025-05-25',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '10 min',
  },
  {
    slug: 'wpm-test-guide',
    title: 'WPM Test: How to Measure and Improve',
    excerpt: 'Everything you need to know about WPM testing — how it works, what counts as a good score, and how to improve.',
    date: '2025-05-22',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '7 min',
  },
  {
    slug: 'typing-games-improve-speed',
    title: 'Typing Games: Fun Ways to Improve Speed',
    excerpt: 'Discover how typing games can make practice enjoyable while building real muscle memory and speed.',
    date: '2025-05-18',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '5 min',
  },
  {
    slug: 'ergonomic-typing',
    title: 'Ergonomic Typing: Prevent RSI',
    excerpt: 'Protect your hands and wrists with proper typing posture, keyboard placement, and regular breaks.',
    date: '2025-05-15',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '6 min',
  },
  {
    slug: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts Everyone Should Know',
    excerpt: 'Save hours every week with these essential keyboard shortcuts for Windows, Mac, and browsers.',
    date: '2025-05-10',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '7 min',
  },
  {
    slug: 'best-typing-software',
    title: 'Best Typing Software and Tools for 2026',
    excerpt: 'Compare the top typing tutors and tools available today, including free options and what makes each one unique.',
    date: '2025-05-05',
    author: 'FreeTyper Team',
    category: 'typing-skills',
    readTime: '9 min',
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
