'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PracticeCard from './PracticeCard';

// The left sidebar already lists every page; these are the main tools, kept folded so the top of this sidebar stays about the visitor.
const links = [
  { href: '/', label: 'Speed test' },
  { href: '/typing-practice', label: 'Typing practice' },
  { href: '/typing-lessons', label: 'Typing lessons' },
  { href: '/keyboard-guide', label: 'Keyboard guide' },
  { href: '/typing-progress', label: 'Progress' },
  { href: '/mouse-lessons', label: 'Mouse lessons' },
  { href: '/mouse-practice', label: 'Mouse practice' },
  { href: '/blog', label: 'Blog' },
];

export default function RightSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed right-0 top-0 z-20 hidden h-full w-[200px]
        shrink-0 flex-col overflow-y-auto border-l border-surface-border bg-surface pt-5
        md:sticky md:top-0 md:z-auto md:flex md:h-screen md:self-start
      "
    >
      <PracticeCard />
      <details className="group mx-4 mt-4 border-t border-surface-border pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] uppercase tracking-widest text-text-dim [&::-webkit-details-marker]:hidden">
          On this site
          <span aria-hidden="true" className="text-sm leading-none group-open:hidden">+</span>
          <span aria-hidden="true" className="hidden text-sm leading-none group-open:inline">–</span>
        </summary>
        <nav className="-mx-2 mt-2 flex flex-col gap-0.5">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2 py-1.5 text-sm transition-colors ${
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
      </details>
      <div className="mx-4 mb-5 mt-4 border-t border-surface-border pt-3">
        <p className="text-[11px] leading-relaxed text-text-dim">
          Suggestion: aim for 95% accuracy or higher. Many people find speed follows once errors drop. This is our rule of thumb, not a standard.
        </p>
      </div>
    </aside>
  );
}
