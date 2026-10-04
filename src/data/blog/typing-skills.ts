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
    title: 'How to Type Faster: 15 Proven Techniques to Increase Your WPM',
    excerpt: 'Practical, proven techniques to increase your typing speed — from touch typing fundamentals to daily practice plans. Learn how to go from 45 WPM to 75 WPM in 60 days.',
    date: '2026-06-08',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '18 min',
  },
  {
    slug: 'good-typing-speed',
    title: 'What Is a Good Typing Speed? WPM Benchmarks by Age and Profession',
    excerpt: 'Exact WPM benchmarks by skill level, age group, and profession — so you know where you actually stand, what to aim for, and whether your typing speed is holding you back.',
    date: '2026-06-09',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '16 min',
  },
  {
    slug: 'improve-typing-accuracy',
    title: 'How to Improve Typing Accuracy From 90% to 99%',
    excerpt:
      'A practical plan to raise typing accuracy from 90% to 95% and toward 99% — weak-key drills, pace control, and FreeTyper tools that make clean speed stick.',
    date: '2026-07-27',
    author: 'Ashiqur Rahman',
    category: 'Typing Speed',
    readTime: '16 min',
  },
  {
    slug: 'touch-typing-for-beginners',
    title: 'Touch Typing for Beginners: A Complete 30-Day Learning Plan',
    excerpt:
      'A day-by-day 30-day touch typing plan for beginners — home row to mixed practice, 15–25 minutes a day on FreeTyper, with weekly checks and Day 30 goals.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '18 min',
  },
  {
    slug: 'muscle-memory-and-touch-typing',
    title: 'The Science Behind Muscle Memory and Touch Typing',
    excerpt:
      'How muscle memory really works for typing — motor learning stages, chunking, accuracy, why looking blocks skill, and how to practice on FreeTyper the smart way.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '18 min',
  },
  {
    slug: '10-bad-typing-habits',
    title: '10 Bad Typing Habits That Are Slowing You Down',
    excerpt:
      'Looking at keys, soft accuracy, mashing, test-only practice, weak keys ignored — ten habits that cap your WPM, how to spot each one, and how to fix them on FreeTyper.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Touch Typing',
    readTime: '17 min',
  },
  {
    slug: 'data-entry-typing-test',
    title: 'How to Pass a Data Entry Typing Test for Job Interviews',
    excerpt:
      'Pass data entry typing tests with a clear prep plan — score targets, accuracy and net WPM, 7- and 14-day FreeTyper schedules, digits, and test-day protocol.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Practice',
    readTime: '17 min',
  },
  {
    slug: 'typing-speed-for-programmers',
    title: 'Typing Speed for Programmers: How Fast Should Coders Type?',
    excerpt:
      'How fast programmers should type — practical WPM ranges, symbols vs prose scores, FreeTyper training for developers, and when more speed stops mattering.',
    date: '2026-08-07',
    author: 'Ashiqur Rahman',
    category: 'Practice',
    readTime: '17 min',
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
