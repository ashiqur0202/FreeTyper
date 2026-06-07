'use client';

import { useState } from 'react';
import { keyboardRows, keyboardColors, fingerMap, homeRowKeys, getKeyColor } from './typingData';
import { useTypingProgress } from './useTypingProgress';
import Link from 'next/link';

const fingerNames = ['Pinky', 'Ring', 'Middle', 'Index'];
const hands = ['left', 'right'] as const;

export default function KeyboardGuide() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { progress } = useTypingProgress();

  const getKeyStats = (key: string) => {
    const k = key.toLowerCase();
    return progress.keyStats[k] || null;
  };

  const fingerZoneColors = Object.entries(keyboardColors).map(([zone, color]) => {
    const [hand, finger] = zone.split('-');
    return { zone, hand, finger, color };
  });

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fingerZoneColors.map(({ zone, hand, finger, color }) => (
          <div key={zone} className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-300 capitalize">{hand} {finger}</span>
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="space-y-2">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const mapping = fingerMap[key.toLowerCase()];
                const isHome = homeRowKeys.has(key);
                const color = getKeyColor(key);
                const stats = getKeyStats(key);
                const isHovered = hoveredKey === key;

                return (
                  <div
                    key={key}
                    className={`key relative h-12 w-12 text-sm transition-all duration-150 cursor-pointer ${
                      isHome ? 'home-row' : ''
                    } ${isHovered ? 'scale-110 z-10' : ''}`}
                    style={{ borderColor: color, color }}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <span className="relative z-10">{key.toUpperCase()}</span>
                    {isHome && (
                      <div className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-50" />
                    )}

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-xl z-50 min-w-[140px]">
                        <p className="text-xs font-bold text-white">{key.toUpperCase()}</p>
                        {mapping && (
                          <p className="text-xs text-gray-400">
                            {mapping.hand} {fingerNames[mapping.finger]}
                          </p>
                        )}
                        {stats ? (
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-gray-400">Presses: {stats.totalPresses}</p>
                            <p className="text-xs text-green-400">
                              Accuracy: {Math.round((stats.correctPresses / stats.totalPresses) * 100)}%
                            </p>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">No data yet</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Space bar */}
          <div className="flex justify-center gap-1.5">
            <div className="key h-12 w-80" style={{ borderColor: keyboardColors['right-index'], color: keyboardColors['right-index'] }}>
              SPACE
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="font-semibold text-amber-400">Home Row Position</h3>
          <p className="mt-2 text-sm text-gray-400">
            Place your fingers on <strong className="text-white">A S D F</strong> (left hand) and{' '}
            <strong className="text-white">J K L ;</strong> (right hand). The small bumps on F and J
            help you find them without looking.
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="font-semibold text-amber-400">Practice Tips</h3>
          <p className="mt-2 text-sm text-gray-400">
            Each key is color-coded to match the finger that should press it. Focus on accuracy first,
            then speed. Use the{' '}
            <Link href="/typing-practice" className="text-amber-400 hover:underline">
              Typing Practice
            </Link>{' '}
            tool to drill weak keys.
          </p>
        </div>
      </div>
    </div>
  );
}
