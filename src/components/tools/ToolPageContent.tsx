import type { ToolData } from '@/config/tools';

interface ToolPageContentProps {
  tool: ToolData;
  children: React.ReactNode;
}

export default function ToolPageContent({ tool, children }: ToolPageContentProps) {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      {children}
    </div>
  );
}
