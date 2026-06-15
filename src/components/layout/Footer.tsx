import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border">
      <div className="flex items-center justify-between px-8 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-3">
          {/* Mini logo mark */}
          <div className="flex h-5 w-5 items-center justify-center rounded border border-surface-border bg-surface-raised">
            <span className="inline-block h-2.5 w-0.5 bg-accent" />
          </div>
          <span className="text-xs font-semibold tracking-tight">
            <span className="text-text-bright">Free</span>
            <span className="text-accent">Typer</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <Link href="/about" className="text-text-dim transition-colors hover:text-accent">about</Link>
          <Link href="/contact" className="text-text-dim transition-colors hover:text-accent">contact</Link>
          <Link href="/privacy" className="text-text-dim transition-colors hover:text-accent">privacy</Link>
          <Link href="/terms" className="text-text-dim transition-colors hover:text-accent">terms</Link>
          <Link href="/disclaimer" className="text-text-dim transition-colors hover:text-accent">disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
