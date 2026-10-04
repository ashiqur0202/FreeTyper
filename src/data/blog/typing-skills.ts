export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** First published (ISO date). */
  date: string;
  /** Last substantive rewrite (ISO date), if the post was rewritten after publishing. */
  updated?: string;
  author: string;
  category: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-type-faster',
    title: 'How to Type Faster: What the Research Supports',
    excerpt: 'What fast typists actually do differently, six habits backed by a 168,960-person study, what to treat with caution, and a four-week practice plan you can try. Sourced, with no promised gains.',
    date: '2026-06-08',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '8 min',
  },
  {
    slug: 'good-typing-speed',
    title: 'What Is a Good Typing Speed? What Large-Scale Data Shows',
    excerpt: 'What 168,960 typists actually scored, how to read your own WPM, what jobs usually ask for, and why accuracy matters as much as speed. Every figure is sourced.',
    date: '2026-06-09',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '7 min',
  },
  {
    slug: 'improve-typing-accuracy',
    title: 'How to Improve Typing Accuracy: What 168,960 Typists Show',
    excerpt: 'What accuracy numbers really measure, how typical mistakes are, what the research says about errors, and a practical routine. Every figure is sourced.',
    date: '2026-07-27',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '7 min',
  },
  {
    slug: 'touch-typing-for-beginners',
    title: 'Touch Typing for Beginners: A Realistic Plan',
    excerpt: 'What touch typing is, whether you need it, a step-by-step path using the free lessons, how to practice, and why no honest guide can promise a number of days.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '7 min',
  },
  {
    slug: 'muscle-memory-and-touch-typing',
    title: 'Muscle Memory and Touch Typing: What the Science Says',
    excerpt: 'What muscle memory really is, what automatic typing looks like in the data, whether sleep helps you learn a motor skill (and why the evidence is debated), and what the science cannot tell you.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '7 min',
  },
  {
    slug: '10-bad-typing-habits',
    title: '10 Typing Habits to Fix, and the Evidence Behind Each',
    excerpt: 'Ten common typing habits across technique, desk setup and routine, what the research and OSHA guidance say about each, and what is only our suggestion.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '7 min',
  },
  {
    slug: 'data-entry-typing-test',
    title: 'Data Entry Typing Tests: How They Are Scored and How to Prepare',
    excerpt: 'How WPM converts to keystrokes per hour, how one vendor scores errors, real requirements from an official government notice, and how to prepare. No invented thresholds.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Practice',
    readTime: '6 min',
  },
  {
    slug: 'typing-speed-for-programmers',
    title: 'Typing Speed for Programmers: How Much Does It Matter?',
    excerpt: 'Two field studies of how developers spend their time show editing is only about 5 percent of it. What that means for typing speed, where typing still matters, and how to practise code typing.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Practice',
    readTime: '6 min',
  },
  {
    slug: 'mechanical-vs-membrane-keyboards',
    title: 'Mechanical vs Membrane Keyboards: Which Is Better for Typing?',
    excerpt:
      'Mechanical vs membrane for real typing — speed, accuracy, noise, fatigue, cost, and a FreeTyper A/B test so you pick with data instead of forum wars.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Productivity',
    readTime: '17 min',
  },
  {
    slug: 'fix-typing-posture-and-avoid-wrist-pain',
    title: 'How to Fix Your Typing Posture and Avoid Wrist Pain',
    excerpt:
      'A desk setup that follows OSHA guidance, what the research really says about typing and wrist problems, and when to see a doctor. General information, not medical advice.',
    date: '2026-08-07',
    updated: '2026-10-04',
    author: 'Ashiqur Rahman',
    category: 'Productivity',
    readTime: '7 min',
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
