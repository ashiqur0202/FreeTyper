'use client';

import { keyboardRows, fingerMap } from './typingData';
import { useTypingProgress } from './useTypingProgress';

export default function KeyboardHeatmap() {
  const { progress } = useTypingProgress();

  const getHeatColor = (key: string): string => {
    const stats = progress.keyStats[key.toLowerCase()];
    if (!stats || stats.totalPresses < 3) return '#374151'; // gray-700
    const errorRate = stats.incorrectPresses / stats.totalPresses;
    if (errorRate > 0.15) return '#ef4444'; // red-500
    if (errorRate > 0.10) return '#f97316'; // orange-500
    if (errorRate > 0.05) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getTooltip = (key: string): string => {
    const stats = progress.keyStats[key.toLowerCase()];
    if (!stats || stats.totalPresses < 1) return `${key.toUpperCase()}: No data`;
    const acc = Math.round((stats.correctPresses / stats.totalPresses) * 100);
    return `${key.toUpperCase()}: ${acc}% accuracy (${stats.totalPresses} presses)`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Error Heatmap</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Few errors</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-6 rounded-sm bg-green-500" />
            <div className="h-3 w-6 rounded-sm bg-yellow-500" />
            <div className="h-3 w-6 rounded-sm bg-orange-500" />
            <div className="h-3 w-6 rounded-sm bg-red-500" />
          </div>
          <span className="text-xs text-gray-500">Many errors</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="space-y-1">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => (
                <div
                  key={key}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium text-gray-200 transition-colors"
                  style={{ backgroundColor: getHeatColor(key) }}
                  title={getTooltip(key)}
                >
                  {key.toUpperCase()}
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-center">
            <div className="flex h-9 w-64 items-center justify-center rounded-md text-xs text-gray-200" style={{ backgroundColor: getHeatColor(' ') }}>
              SPACE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
