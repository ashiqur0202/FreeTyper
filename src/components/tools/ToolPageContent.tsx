import type { ToolData } from '@/config/tools';

interface ToolPageContentProps {
  tool: ToolData;
  children: React.ReactNode;
}

/**
 * Shared shell for tool routes (`/[slug]`).
 * Centers the tool in the viewport so each tool feels like the home speed test —
 * clean, full-height, no chrome competing with the typing surface.
 */
export default function ToolPageContent({ children }: ToolPageContentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 py-12 sm:px-10 lg:px-12">
      <div className="w-full">{children}</div>
    </div>
  );
}
