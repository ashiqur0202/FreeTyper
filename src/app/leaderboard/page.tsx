import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { authConfigured } from '@/lib/auth-config';
import LeaderboardView from './LeaderboardView';

export const metadata: Metadata = {
  title: 'Typing Speed Leaderboard — Daily, Weekly, Monthly & All-Time',
  description:
    'The fastest typists on FreeTyper: daily, weekly, monthly and lifetime leaderboards from the speed test. Tests of 1 minute or longer count, with at least 95% accuracy.',
  alternates: { canonical: `${siteConfig.url}/leaderboard` },
};

export default function LeaderboardPage() {
  return (
    <div className="px-6 py-10 sm:px-10 lg:px-12">
      <LeaderboardView enabled={authConfigured()} />
    </div>
  );
}
