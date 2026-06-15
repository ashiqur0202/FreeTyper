import { siteConfig } from '@/config/site';
import { Keyboard } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <div className="flex items-center gap-3 mb-8">
        <Keyboard className="h-8 w-8 text-amber-500" />
        <h1 className="text-3xl font-bold text-white">About {siteConfig.name}</h1>
      </div>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          <strong className="text-white">{siteConfig.name}</strong> is a free, privacy-first typing
          skills platform built for anyone who wants to type faster. Whether you are a student, writer,
          developer, or just someone who spends a lot of time at a keyboard, we help you build the
          muscle memory for fast, accurate typing.
        </p>
        <p>
          Our philosophy is simple: typing tools should be free, require no account, and respect your
          privacy. All your progress data is stored locally in your browser — we never see it, collect
          it, or share it.
        </p>
        <h2 className="text-xl font-bold text-white pt-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>7 progressive typing lessons from home row to speed building</li>
          <li>Adaptive practice with themed content (quotes, news, code, fun facts)</li>
          <li>Timed speed tests (1, 3, 5, and 10 minutes)</li>
          <li>Interactive keyboard guide with color-coded finger mapping</li>
          <li>Full progress tracking with achievements and streaks</li>
          <li>Two arcade-style typing games for fun practice</li>
        </ul>
        <h2 className="text-xl font-bold text-white pt-4">Our Mission</h2>
        <p className="text-gray-400">
          We believe everyone should have access to quality typing education. In an increasingly digital
          world, typing speed is a fundamental skill that impacts productivity, communication, and even
          career opportunities. {siteConfig.name} exists to make that skill accessible to everyone,
          regardless of budget or background.
        </p>
        <h2 className="text-xl font-bold text-white pt-4">Open Source</h2>
        <p className="text-gray-400">
          {siteConfig.name} is open source. You can view the code, report issues, or contribute on{' '}
          <a href={siteConfig.links.github} className="text-amber-500 hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </div>
    </div>
  );
}
