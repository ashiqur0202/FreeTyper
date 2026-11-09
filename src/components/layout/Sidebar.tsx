'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  CalendarDays,
  Swords,
  GraduationCap,
  PenTool,
  Keyboard,
  BarChart3,
  ArrowDown,
  Crosshair,
  Mouse,
  BookOpen,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import LogoMark from './LogoMark';
import AppearanceControls from './AppearanceControls';

const navGroups = [
  {
    label: null,
    items: [
      { href: '/', label: 'start', icon: Timer },
      { href: '/typing-lessons', label: 'lessons', icon: GraduationCap },
      { href: '/typing-practice', label: 'practice', icon: PenTool },
      { href: '/keyboard-guide', label: 'guide', icon: Keyboard },
      { href: '/typing-progress', label: 'progress', icon: BarChart3 },
      { href: '/mouse-practice', label: 'mouse', icon: Mouse },
    ],
  },
  {
    label: 'tests',
    items: [
      { href: '/daily-typing-challenge', label: 'daily', icon: CalendarDays },
      { href: '/typing-challenge', label: 'challenge', icon: Swords },
      { href: '/1-minute-typing-test', label: '1 minute', icon: Timer },
      { href: '/3-minute-typing-test', label: '3 minutes', icon: Timer },
      { href: '/5-minute-typing-test', label: '5 minutes', icon: Timer },
    ],
  },
  {
    label: 'games',
    items: [
      { href: '/typing-game-falling-words', label: 'falling words', icon: ArrowDown },
      { href: '/typing-game-word-attack', label: 'word attack', icon: Crosshair },
    ],
  },
  {
    label: null,
    items: [
      { href: '/blog', label: 'blog', icon: BookOpen },
    ],
  },
];

const version = '1.0.0';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();

  return (
    <>
      {/* Mobile floating hamburger */}
      <button
        onClick={toggle}
        className="fixed left-4 top-4 z-50 rounded-lg bg-surface-raised p-2 text-text-dim shadow-lg transition-colors hover:text-text md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-[200px]
          flex-col gap-1 overflow-y-auto bg-surface
          border-r border-surface-border
          transition-transform duration-200 ease-in-out
          md:sticky md:top-0 md:z-auto md:h-screen md:self-start md:translate-x-0 md:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          hidden md:flex
          ${isOpen ? '!flex' : ''}
        `}
      >
        {/* Logo */}
        <div className="px-4 pb-3 pt-5">
          <Link
            href="/"
            onClick={close}
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            {/* Mark — FT with the T stem as the cursor */}
            <LogoMark size={28} className="shrink-0" />
            {/* Wordmark */}
            <div className="flex items-baseline">
              <span className="text-sm font-semibold tracking-tight text-text-bright">
                Free
              </span>
              <span className="text-sm font-semibold tracking-tight text-accent">
                Typer
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-2 mb-2 h-px bg-surface-border" />

        {/* Nav groups */}
        {navGroups.map((group, gi) => (
          <div key={gi} className="px-2">
            {group.label && (
              <span className="mb-1 mt-3 block px-3 text-[10px] uppercase tracking-widest text-text-dim">
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`
                    group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors
                    ${isActive
                      ? 'border-l-2 border-accent bg-accent-bg text-accent'
                      : 'text-text-dim hover:bg-surface-raised hover:text-text'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {gi < navGroups.length - 1 && (
              <div className="mx-2 my-2 h-px bg-surface-border" />
            )}
          </div>
        ))}

        {/* Settings, appearance, version — after nav */}
        <div className="px-2">
          <div className="mx-2 my-2 h-px bg-surface-border" />

          <Link
            href="/settings"
            onClick={close}
            className={`
              group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors
              ${pathname === '/settings'
                ? 'border-l-2 border-accent bg-accent-bg text-accent'
                : 'text-text-dim hover:bg-surface-raised hover:text-text'
              }
            `}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>settings</span>
          </Link>

          <AppearanceControls />

          <div className="mt-3 px-3 pb-4">
            <span className="font-mono text-[10px] text-text-dim">v{version}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
