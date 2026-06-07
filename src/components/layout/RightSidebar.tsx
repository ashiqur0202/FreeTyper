'use client';

export default function RightSidebar() {
  return (
    <aside
      className="
        fixed right-0 top-0 z-20 h-full w-[200px]
        flex-col shrink-0 overflow-y-auto bg-surface
        border-l border-surface-border
        md:sticky md:top-0 md:z-auto md:h-auto md:min-h-screen md:flex
        hidden md:flex
      "
    >
      {/* Empty for now — will add content later */}
    </aside>
  );
}
