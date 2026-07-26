import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const runtime = 'nodejs';
export const alt = `${siteConfig.name} — Free Typing Speed Test`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Dynamic Open Graph image for the site.
 *
 * Next.js auto-wires this route into <meta property="og:image"> and
 * <meta name="twitter:image"> for the root segment (and inherited below),
 * so no static /og-image.png asset is required.
 *
 * Satori (ImageResponse) requires explicit flexbox on every container that
 * holds more than one child, and inline styles. See the Next.js docs at
 * node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md.
 */
export default function OpengraphImage() {
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
        {/* Wordmark: Free (white) + Typer (gold) */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 52, fontWeight: 700 }}>
          <span style={{ color: '#f0f0e8' }}>Free</span>
          <span style={{ color: '#e2b714' }}>Typer</span>
        </div>

        {/* Headline + value prop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#f0f0e8',
              letterSpacing: '-0.02em',
            }}
          >
            Free Typing Speed Test
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#a0a092' }}>
            Check your WPM and accuracy in 60 seconds
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', gap: 40, fontSize: 28, fontWeight: 600 }}>
          <span style={{ color: '#e2b714', display: 'flex' }}>✓ Free Forever</span>
          <span style={{ color: '#a0a092', display: 'flex' }}>✓ No Sign-up</span>
          <span style={{ color: '#a0a092', display: 'flex' }}>✓ Privacy-First</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
