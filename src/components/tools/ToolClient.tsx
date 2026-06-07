'use client';

import dynamic from 'next/dynamic';

const TypingLessons = dynamic(() => import('@/components/skills/typing/TypingLessons'));
const TypingPractice = dynamic(() => import('@/components/skills/typing/TypingPractice'));
const TypingSpeedTest = dynamic(() => import('@/components/skills/typing/TypingSpeedTest'));
const KeyboardGuide = dynamic(() => import('@/components/skills/typing/KeyboardGuide'));
const TypingProgress = dynamic(() => import('@/components/skills/typing/TypingProgress'));
const FallingWordsGame = dynamic(() => import('@/components/skills/typing/FallingWordsGame'));
const WordAttackGame = dynamic(() => import('@/components/skills/typing/WordAttackGame'));

const componentMap: Record<string, React.ComponentType> = {
  'typing-lessons': TypingLessons,
  'typing-practice': TypingPractice,
  'typing-speed-test': TypingSpeedTest,
  'keyboard-guide': KeyboardGuide,
  'typing-progress': TypingProgress,
  'typing-game-falling-words': FallingWordsGame,
  'typing-game-word-attack': WordAttackGame,
};

export default function ToolClient({ toolId }: { toolId: string }) {
  const Component = componentMap[toolId];
  if (!Component) return <div>Tool not found</div>;
  return <Component />;
}
