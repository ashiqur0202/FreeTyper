/**
 * FreeTyper mark: F and T share one top bar, and the T's stem is the typing cursor.
 * The gold parts follow the accent chosen in Settings (--color-accent); the dark tile and the
 * pale cursor stay fixed. public/favicon.svg and the share image are static files, so they stay gold.
 */
const ACCENT = 'var(--color-accent, #e2b714)';

export default function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.5" y="3.5" width="57" height="57" rx="14" fill="#1a1812" strokeWidth="3" style={{ stroke: ACCENT }} />
      <path d="M10 16H54V25H19V30H30V37H19V48H10Z" style={{ fill: ACCENT }} />
      <rect x="38.5" y="25" width="9" height="23" rx="1" fill="#f7f1d6" />
    </svg>
  );
}
