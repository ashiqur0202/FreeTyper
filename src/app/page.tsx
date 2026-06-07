import TypingSpeedTest from '@/components/skills/typing/TypingSpeedTest';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-2xl">
        <TypingSpeedTest />
      </div>
    </div>
  );
}
