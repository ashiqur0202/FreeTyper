import { ImageResponse } from 'next/og';
import { lengthLabel, levelName, loadSharedResult, rankPeriodOf, RANK_WORDS } from '@/lib/leaderboard/share';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const size = { width: 1200, height: 630 };

/** The preview picture of a shared result: level, speed, accuracy, time, username and (when asked) the current rank. Same look as the other cards. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const period = rankPeriodOf(new URL(request.url).searchParams.get('p'));
  const r = await loadSharedResult(id, period);
  if (!r) return new Response('Not found', { status: 404 });
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '70px 80px',
          backgroundColor: '#323234', backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(226,183,20,0.14) 0%, rgba(226,183,20,0) 45%)', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 48, fontWeight: 700 }}>
            <svg width="60" height="60" viewBox="0 0 64 64">
              <rect x="3.5" y="3.5" width="57" height="57" rx="14" fill="#1a1812" stroke="#e2b714" strokeWidth="3" />
              <path d="M10 16H54V25H19V30H30V37H19V48H10Z" fill="#e2b714" />
              <rect x="38.5" y="25" width="9" height="23" rx="1" fill="#f7f1d6" />
            </svg>
            <div style={{ display: 'flex' }}>
              <span style={{ color: '#f0f0e8' }}>Free</span>
              <span style={{ color: '#e2b714' }}>Typer</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#1a1812', backgroundColor: '#e2b714', borderRadius: 99, padding: '8px 28px', letterSpacing: 3, textTransform: 'uppercase' }}>
            {levelName(r.wpm)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 70 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 210, fontWeight: 300, lineHeight: 0.95, color: '#e2b714', letterSpacing: '-0.03em' }}>{r.wpm}</div>
            <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, color: '#a0a092', textTransform: 'uppercase', marginTop: 10 }}>net wpm</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 10 }}>
            <div style={{ display: 'flex', fontSize: 64, color: '#f0f0e8', fontWeight: 300 }}>{r.accuracy}% <span style={{ display: 'flex', fontSize: 26, color: '#a0a092', marginLeft: 16, alignSelf: 'flex-end', paddingBottom: 10 }}>accuracy</span></div>
            <div style={{ display: 'flex', fontSize: 64, color: '#f0f0e8', fontWeight: 300 }}>{lengthLabel(r.seconds)} <span style={{ display: 'flex', fontSize: 26, color: '#a0a092', marginLeft: 16, alignSelf: 'flex-end', paddingBottom: 10 }}>time</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 32, color: '#a0a092' }}>
          {r.rank ? (
            <div style={{ display: 'flex', color: '#f0f0e8', border: '3px solid #e2b714', borderRadius: 99, padding: '6px 28px' }}>
              <span style={{ display: 'flex', color: '#e2b714', fontWeight: 700, marginRight: 14 }}>#{r.rank}</span>
              {RANK_WORDS[period ?? 'today']}
            </div>
          ) : (
            <div style={{ display: 'flex' }}>Can you beat it?</div>
          )}
          <div style={{ display: 'flex', color: '#d0d0c4' }}>{r.username} · freetyper.com</div>
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
