'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  GraduationCap,
  PenTool,
  Keyboard,
  BarChart3,
  ArrowDown,
  Crosshair,
  BookOpen,
  Settings,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import { useState } from 'react';

const navGroups = [
  {
    label: null,
    items: [
      { href: '/', label: 'start', icon: Timer },
      { href: '/typing-lessons', label: 'lessons', icon: GraduationCap },
      { href: '/typing-practice', label: 'practice', icon: PenTool },
      { href: '/keyboard-guide', label: 'guide', icon: Keyboard },
      { href: '/typing-progress', label: 'progress', icon: BarChart3 },
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

const accentColors = [
  { name: 'gold', color: '#e2b714' },
  { name: 'blue', color: '#519aba' },
  { name: 'green', color: '#8a8a6e' },
  { name: 'red', color: '#c44250' },
  { name: 'purple', color: '#a37acc' },
  { name: 'cyan', color: '#56b6c2' },
];

function ThemeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xs rounded-xl border border-surface-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-3">
          <span className="text-sm font-medium text-text">Theme</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-dim transition-colors hover:bg-surface-raised hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <span className="mb-3 block text-xs text-text-dim">accent color</span>
          <div className="flex gap-2">
            {accentColors.map((c) => (
              <button
                key={c.name}
                className="h-7 w-7 rounded-full border-2 border-transparent transition-all hover:scale-110"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
          <span className="mb-3 mt-5 block text-xs text-text-dim">mode</span>
          <div className="flex gap-1">
            <button className="rounded-md bg-accent-bg px-3 py-1.5 text-xs text-accent">
              dark
            </button>
            <button className="rounded-md px-3 py-1.5 text-xs text-text-dim hover:bg-surface-raised hover:text-text">
              light
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();
  const [showTheme, setShowTheme] = useState(false);

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
          md:sticky md:z-auto md:h-auto md:min-h-screen md:translate-x-0 md:shrink-0
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
            {/* Mark — keyboard key with cursor */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-border bg-surface-raised">
              <span className="inline-block h-3.5 w-0.5 bg-accent cursor-blink" />
            </div>
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

        {/* Settings, theme, version — after nav */}
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

          <button
            onClick={() => setShowTheme(true)}
            className="group flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-text-dim transition-colors hover:bg-surface-raised hover:text-text"
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span>theme</span>
          </button>

          <div className="mt-3 px-3 pb-4">
            <span className="font-mono text-[10px] text-text-dim">v{version}</span>
          </div>
        </div>
      </aside>

      {/* Theme modal */}
      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
    </>
  );
}
