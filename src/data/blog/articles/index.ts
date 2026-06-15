import { typingSpeedArticles } from './typing-speed';
import { typingTestsArticles } from './typing-tests';
import { touchTypingArticles } from './touch-typing';
import { practiceArticles } from './practice';
import { productivityArticles } from './productivity';

export const articleContent: Record<string, string> = {
  ...typingSpeedArticles,
  ...typingTestsArticles,
  ...touchTypingArticles,
  ...practiceArticles,
  ...productivityArticles,
};
