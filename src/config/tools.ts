import {
  GraduationCap,
  PenTool,
  Timer,
  Keyboard,
  BarChart3,
  ArrowDown,
  Crosshair,
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
    seoTitle: 'Typing Lessons: Learn Fast with Visual Finger Guides (Free)',
    description:
      'Progressive typing lessons from home row to advanced. Visual finger guides show you exactly which finger to use. Free, no signup.',
    iconName: 'GraduationCap',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-practice',
    name: 'Typing Practice',
    seoTitle: 'Typing Practice: Drills & Weak-Key Fix (Free)',
    description:
      'Typing practice with themed content — quotes, news, code. Adaptive drills target your weak keys. Free, no signup.',
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
    seoTitle: 'Keyboard Guide: Color-Coded Finger Placement Map (Free)',
    description:
      'Interactive keyboard guide with color-coded finger mapping. Learn proper touch typing finger placement. Free, no signup.',
    iconName: 'Keyboard',
    category: 'typing',
    featured: false,
  },
  {
    id: 'typing-progress',
    name: 'Typing Progress',
    seoTitle: 'Typing Progress Tracker: WPM History & Achievements (Free)',
    description:
      'Track your typing progress with WPM history, accuracy trends, streaks, and 14 unlockable achievements. Free, no signup.',
    iconName: 'BarChart3',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-game-falling-words',
    name: 'Falling Words Game',
    seoTitle: 'Falling Words Game: Type Fast & Beat Every Level (Free)',
    description:
      'Falling words typing game — type words before they hit the bottom. 10 difficulty tiers, lives system, high scores. Free, no signup.',
    iconName: 'ArrowDown',
    category: 'typing',
    featured: true,
  },
  {
    id: 'typing-game-word-attack',
    name: 'Word Attack Game',
    seoTitle: 'Word Attack Game: Combos, Scores & Timed Rounds (Free)',
    description:
      'Word attack typing game — type fast for combos and multipliers. 8 rounds of increasing difficulty. Free, no signup.',
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
