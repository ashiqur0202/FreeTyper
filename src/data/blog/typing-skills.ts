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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
