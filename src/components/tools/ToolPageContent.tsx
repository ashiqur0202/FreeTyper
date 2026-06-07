import type { ToolData } from '@/config/tools';

interface ToolPageContentProps {
  tool: ToolData;
  children: React.ReactNode;
}

export default function ToolPageContent({ tool, children }: ToolPageContentProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {children}
    </div>
  );
}
