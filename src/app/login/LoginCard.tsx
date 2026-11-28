'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Gift, History, MonitorSmartphone, type LucideIcon } from 'lucide-react';
import LogoMark from '@/components/layout/LogoMark';
import { authClient } from '@/lib/auth-client';
import { useAccount } from '@/lib/sync/useAccount';

const HEADING = 'Keep your progress on every device';

/** What logging in gives, in the order people care about it. Short on purpose. */
const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: MonitorSmartphone, title: 'Use it on any device', text: 'Your speed history, lessons and streak follow you from laptop to phone.' },
  { icon: History, title: 'Get it back after clearing your browser', text: 'Progress is saved to your account, not only to this browser.' },
  { icon: Gift, title: 'Free, with or without an account', text: 'Every test, lesson and practice stays free. Logging in only adds saving across devices.' },
];

/**
 * The heading types itself once. Each word is kept whole (so it wraps nicely on a phone) and each letter
 * appears in turn through CSS only; with reduced motion everything shows at once (see globals.css).
 */
function TypedHeading() {
  let index = 0;
  return (
    <h1 className="login-type grid min-h-[2.4em] content-start text-balance text-[1.6rem] font-semibold leading-tight tracking-tight text-text-bright sm:text-[1.95rem]" aria-label={HEADING}>
      <span aria-hidden="true">
        {HEADING.split(' ').map((word, w, all) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((ch) => (
                <span key={index} className="ch" style={{ '--i': index++ } as React.CSSProperties}>{ch}</span>
              ))}
              {w === all.length - 1 && <span className="cur" style={{ '--i': index } as React.CSSProperties} />}
            </span>
            {w < all.length - 1 && ' '}
          </span>
        ))}
      </span>
    </h1>
  );
}

/**
 * Log in. Optional: FreeTyper works the same without it. Google today; an email
 * code and a link follow in a later release.
 */
export default function LoginCard({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  // Already logged in on this browser: nothing to do here.
  useEffect(() => {
    if (account) router.replace('/account');
  }, [account, router]);

  const google = async () => {
    setBusy(true);
    setProblem('');
    try {
      const r = await authClient.signIn.social({ provider: 'google', callbackURL: '/account' });
      if (r?.error) throw new Error(r.error.message);
      // On success the browser is sent to Google; nothing more to do here.
    } catch {
      setBusy(false);
      setProblem('Could not start the login. Check your connection and try again.');
    }
  };

  return (
    <div className="login-stage relative isolate overflow-hidden rounded-xl px-2 pb-16 pt-6 sm:pt-12">
      <div className="relative z-10 mx-auto grid w-full max-w-[430px] justify-items-center gap-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80" aria-label="FreeTyper home">
          <LogoMark size={36} className="shrink-0" />
          <span className="font-mono text-lg font-bold text-text-bright">
            Free<span className="text-accent">Typer</span>
          </span>
        </Link>

        <div>
          <TypedHeading />
          <p className="mt-1.5 text-[15px] text-text-dim">Log in once. Practising stays exactly the same.</p>
        </div>

        <div className="relative w-full rounded-2xl border border-surface-border bg-surface-raised px-5 pb-5 pt-6 text-left shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)]">
          <span aria-hidden="true" className="absolute inset-x-5 -top-px h-0.5 rounded bg-gradient-to-r from-transparent via-accent to-transparent" />
          {enabled ? (
            <>
              <button
                type="button"
                onClick={google}
                disabled={busy}
                className="login-key flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-accent bg-accent-bg px-4 py-3 text-[15.5px] font-semibold text-text-bright disabled:cursor-wait disabled:opacity-65"
              >
                {busy ? (
                  <>
                    <span className="login-spin" aria-hidden="true" />
                    Opening Google…
                  </>
                ) : (
                  <>
                    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[19px] w-[19px] shrink-0">
                      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
                      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <p role="alert" className="mt-3 min-h-5 text-[13.5px] text-error">{problem}</p>
              <div className="text-center">
                <Link href="/" className="inline-block rounded-lg border border-transparent px-3 py-1.5 text-[13.5px] text-text-dim transition-colors hover:border-surface-border hover:text-text-bright">
                  Keep using FreeTyper as a guest
                </Link>
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-surface-border bg-surface px-3.5 py-3 text-sm text-text-dim">
              Login is not available right now. Everything else on FreeTyper works as usual.
            </p>
          )}
          <p className="mt-3.5 text-center text-[12.5px] text-text-dim">
            By continuing you agree to the <Link href="/terms" className="text-accent underline">Terms</Link> and <Link href="/privacy" className="text-accent underline">Privacy Policy</Link>.
          </p>
        </div>

        <ul className="grid w-full gap-4 text-left">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="grid grid-cols-[38px_1fr] items-start gap-3.5">
              <span aria-hidden="true" className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-b-[3px] border-surface-border border-b-key-shadow bg-surface-raised text-accent">
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <div>
                <strong className="block text-[14.5px] text-text-bright">{title}</strong>
                <span className="text-[13.5px] text-text-dim">{text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
