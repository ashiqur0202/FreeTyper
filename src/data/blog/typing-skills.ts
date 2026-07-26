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
    title: 'How to Type Faster: 15 Proven Techniques to Increase Your WPM',
    excerpt: 'Practical, proven techniques to increase your typing speed — from touch typing fundamentals to daily practice plans. Learn how to go from 45 WPM to 75 WPM in 60 days.',
    date: '2026-06-08',
    author: 'FreeTyper Team',
    category: 'Typing Speed',
    readTime: '18 min',
  },
  {
    slug: 'good-typing-speed',
    title: 'What Is a Good Typing Speed? WPM Benchmarks by Age and Profession',
    excerpt: 'Exact WPM benchmarks by skill level, age group, and profession — so you know where you actually stand, what to aim for, and whether your typing speed is holding you back.',
    date: '2026-06-09',
    author: 'FreeTyper Team',
    category: 'Typing Speed',
    readTime: '16 min',
  },
  {
    slug: 'average-typing-speed',
    title: 'Average Typing Speed: Statistics and How You Compare',
    excerpt: 'The real data on average typing speed — by global population, age, generation, skill level, and profession. See where most people land and exactly where you stand.',
    date: '2026-06-10',
    author: 'FreeTyper Team',
    category: 'Typing Speed',
    readTime: '17 min',
  },
  {
    slug: 'how-many-words-per-minute',
    title: 'How Many Words Per Minute Should You Type?',
    excerpt: 'Specific WPM targets by role, age, goal, and situation — students, office workers, writers, programmers, data entry, customer service, and transcription. Stop guessing your target.',
    date: '2026-06-11',
    author: 'FreeTyper Team',
    category: 'Typing Speed',
    readTime: '15 min',
  },
  {
    slug: 'typing-speed-for-work',
    title: 'What Is a Good Typing Speed for Work?',
    excerpt: 'The actual WPM benchmarks employers use across industries — minimum, competitive, and elite tiers for administrative, data entry, legal, medical, customer service, and tech roles.',
    date: '2026-06-12',
    author: 'FreeTyper Team',
    category: 'Typing Speed',
    readTime: '17 min',
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
