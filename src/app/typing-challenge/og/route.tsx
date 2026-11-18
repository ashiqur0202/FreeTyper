import { ImageResponse } from 'next/og';
import { challengeCard, parseScore, parseSeconds } from '@/components/skills/typing/challengeLink';

export const runtime = 'nodejs';

const size = { width: 1200, height: 630 };

/**
 * Link preview picture for /typing-challenge links: "Beat 72 WPM" plus the sender's accuracy.
 * It carries nothing but the two numbers from the query string, range-checked by `parseScore`
 * (no name, no text typed). Same look as `src/app/opengraph-image.tsx`. Satori needs
 * explicit flexbox on every container with more than one child, and inline styles.
 */
export function GET(request: Request) {
  const { search } = new URL(request.url);
  const score = parseScore(search);
  const card = challengeCard(score, parseSeconds(search));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#323234',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(226,183,20,0.12) 0%, rgba(226,183,20,0) 45%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 52, fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect x="3.5" y="3.5" width="57" height="57" rx="14" fill="#1a1812" stroke="#e2b714" strokeWidth="3" />
            <path d="M10 16H54V25H19V30H30V37H19V48H10Z" fill="#e2b714" />
            <rect x="38.5" y="25" width="9" height="23" rx="1" fill="#f7f1d6" />
          </svg>
          <div style={{ display: 'flex' }}>
            <span style={{ color: '#f0f0e8' }}>Free</span>
            <span style={{ color: '#e2b714' }}>Typer</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: score.wpm === null ? 88 : 132,
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#e2b714',
              letterSpacing: '-0.02em',
            }}
          >
            {card.headline}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 40, color: '#f0f0e8' }}>
            {card.sub.split('. ').map((part, i, all) => (i < all.length - 1 ? `${part}.` : part)).map((line) => (
              <div key={line} style={{ display: 'flex' }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#a0a092' }}>
          {card.footer}
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=86400' } }
  );
}
