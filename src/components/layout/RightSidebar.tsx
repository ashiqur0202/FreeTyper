'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Speed test' },
  { href: '/typing-practice', label: 'Practice' },
  { href: '/typing-lessons', label: 'Lessons' },
  { href: '/keyboard-guide', label: 'Keyboard guide' },
  { href: '/typing-progress', label: 'Progress' },
  { href: '/blog', label: 'Blog' },
];

export default function RightSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed right-0 top-0 z-20 hidden h-full w-[200px]
        shrink-0 flex-col overflow-y-auto border-l border-surface-border bg-surface
        md:sticky md:top-0 md:z-auto md:flex md:h-auto md:min-h-screen
      "
    >
      <div className="px-4 pb-3 pt-5">
        <p className="text-[10px] uppercase tracking-widest text-text-dim">On this site</p>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? 'bg-accent-bg text-accent'
                  : 'text-text-dim hover:bg-surface-raised hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 mt-6 border-t border-surface-border pt-4">
        <p className="text-[11px] leading-relaxed text-text-dim">
          Tip: keep accuracy at 95% or higher. Speed follows clean reps, not the other way around.
        </p>
      </div>
    </aside>
  );
}
