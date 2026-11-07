import {
  GraduationCap,
  PenTool,
  Timer,
  Keyboard,
  BarChart3,
  ArrowDown,
  Crosshair,
  Mouse,
} from 'lucide-react';

export type ToolData = {
  id: string;
  name: string;
  seoTitle: string;
  description: string;
  iconName: string;
  category: 'typing';
  featured: boolean;
};

export type Tool = ToolData & {
  icon: React.ComponentType<{ className?: string }>;
};

const toolData: ToolData[] = [
  {
    id: 'typing-lessons',
    name: 'Typing Lessons',
    seoTitle: 'Free Typing Lessons for Beginners & Adults — 34 Lessons',
    description:
      'Free online typing lessons for beginners and adults: 34 lessons from the home row to symbols, a live keyboard and a 95% accuracy pass mark. No signup.',
    iconName: 'GraduationCap',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-practice',
    name: 'Typing Practice',
    seoTitle: 'Free Typing Practice Online — Quotes, Code & Weak-Key Drills',
    description:
      'Free typing practice exercises online: quotes, news, code and fun passages, plus an adaptive drill from the keys and letter pairs you miss most. No signup.',
    iconName: 'PenTool',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    seoTitle: 'Typing Speed Test: Check Your WPM in 60 Seconds (Free)',
    description:
      'Timed typing speed test — 1, 3, 5, or 10 minutes. Get instant WPM, accuracy, and detailed results. Free, no signup.',
    iconName: 'Timer',
    category: 'typing',
    featured: true,
  },
  {
    id: 'keyboard-guide',
    name: 'Keyboard Guide',
    seoTitle: 'Keyboard Finger Chart — Which Finger Types Which Key (Free)',
    description:
      'A colour-coded laptop keyboard with two hands: see which finger types each key, including Shift symbols, Enter and Backspace, plus your own key accuracy. Free, no signup, QWERTY.',
    iconName: 'Keyboard',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-progress',
    name: 'Typing Progress',
    seoTitle: 'Typing Progress Tracker — WPM History, Streaks & Achievements',
    description:
      'Free typing progress tracker with WPM history, accuracy trends, weak-key heatmap, streaks, and achievements. Private local storage — no signup.',
    iconName: 'BarChart3',
    category: 'typing',
    featured: true,
  },
  {
    id: 'mouse-practice',
    name: 'Mouse Practice',
    seoTitle: 'Mouse Practice for Beginners — Free Mouse & Trackpad Exercises',
    description:
      'Free mouse and trackpad practice for beginners: guided click, double-click, right-click, drag and scroll steps, plus a 30-second aim game. No signup.',
    iconName: 'Mouse',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-game-falling-words',
    name: 'Falling Words Game',
    seoTitle: 'Falling Words Typing Game — Free Speed Training (No Signup)',
    description:
      'Free falling words typing game: type words before they hit the bottom. 10 difficulty tiers, lives, high scores, and WPM tracking. No login required.',
    iconName: 'ArrowDown',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-game-word-attack',
    name: 'Word Attack Game',
    seoTitle: 'Word Attack Typing Game — Combos, Rounds & Free Speed Drills',
    description:
      'Free Word Attack typing game with timed words, combo multipliers, and 8 difficulty rounds. Build burst speed and consistency — no signup required.',
    iconName: 'Crosshair',
    category: 'typing',
    featured: true,
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  PenTool,
  Timer,
  Keyboard,
  BarChart3,
  ArrowDown,
  Crosshair,
  Mouse,
};

/** Serializable tool data (no functions) — safe for server → client */
export const toolsData = toolData;

/** Full tools with resolved icon components — for client components */
export const tools: Tool[] = toolData.map((t) => ({
  ...t,
  icon: iconMap[t.iconName],
}));

/** Resolve iconName string to icon component (for client components) */
export function getIcon(name: string): React.ComponentType<{ className?: string }> {
  return iconMap[name] || GraduationCap;
}

export function getToolBySlug(slug: string): ToolData | undefined {
  return toolData.find((t) => t.id === slug);
}
