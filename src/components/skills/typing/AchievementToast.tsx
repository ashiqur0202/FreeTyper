'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Achievement } from './types';

const iconMap: Record<string, string> = {
  Footprints: '👣',
  Rocket: '🚀',
  Zap: '⚡',
  Flame: '🔥',
  Trophy: '🏆',
  Sword: '⚔️',
  Target: '🎯',
  Crosshair: '🔎',
  Calendar: '📅',
  Crown: '👑',
  Repeat: '🔄',
  Award: '🎖️',
  Star: '⭐',
};

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 top-16 z-[100] max-w-xs rounded border border-surface-border bg-surface-raised px-3 py-2 shadow-lg ${
        exiting ? 'toast-exit' : 'toast-enter'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{iconMap[achievement.icon] || '🏅'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-accent">{achievement.name}</p>
          <p className="text-xs text-text-dim truncate">{achievement.description}</p>
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(onClose, 200); }}
          className="text-text-dim hover:text-text shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
