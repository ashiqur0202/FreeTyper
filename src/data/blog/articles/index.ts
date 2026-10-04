import { typingSpeedArticles } from './typing-speed';
import { touchTypingArticles } from './touch-typing';
import { practiceArticles } from './practice';
import { productivityArticles } from './productivity';

export const articleContent: Record<string, string> = {
  ...typingSpeedArticles,
  ...touchTypingArticles,
  ...practiceArticles,
  ...productivityArticles,
};
