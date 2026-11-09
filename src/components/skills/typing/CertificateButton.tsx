'use client';

import { useState } from 'react';
import { Award, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { TypingSession } from './types';
import { cleanCertificateName, certificateFileName, CERT_NAME_MAX } from './certificateRules';

const NAME_KEY = 'freetyper-certificate-name';

type State = 'closed' | 'form' | 'busy' | 'done' | 'failed';

function readName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode: the name is just not remembered */
  }
}

/**
 * Asks for a name (optional), then downloads the certificate picture. The name stays on this device:
 * it is drawn on the picture and remembered in localStorage, never sent anywhere. The picture code and
 * its fonts load only when the button is used.
 */
export default function CertificateButton({ run }: { run: TypingSession }) {
  const [state, setState] = useState<State>('closed');
  const [name, setName] = useState('');

  const open = () => {
    if (state === 'closed' || state === 'done' || state === 'failed') {
      setName(readName());
      setState('form');
    } else if (state === 'form') {
      setState('closed');
    }
  };

  const download = async () => {
    if (state === 'busy') return;
    setState('busy');
    try {
      const { renderCertificate } = await import('./certificateImage');
      const printed = cleanCertificateName(name);
      const blob = await renderCertificate(run, printed);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = certificateFileName(printed, run.wpm);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      if (name.trim()) saveName(printed);
      trackEvent('certificate_download', { has_name: Boolean(name.trim()) });
      setState('done');
    } catch {
      setState('failed');
    }
  };

  const showForm = state === 'form' || state === 'busy' || state === 'failed';

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-expanded={showForm}
        title="Download a certificate for this result"
        className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
      >
        {state === 'done' ? <Check className="h-3 w-3 text-accent" /> : <Award className="h-3 w-3" />}
        <span aria-live="polite">{state === 'done' ? 'certificate saved' : 'certificate'}</span>
      </button>

      {showForm && (
        <form
          data-typing-ignore
          className="flex w-full flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void download();
          }}
        >
          <label htmlFor="cert-name" className="sr-only">
            Name to print on the certificate
          </label>
          <input
            id="cert-name"
            type="text"
            value={name}
            maxLength={CERT_NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name on certificate (optional)"
            autoComplete="name"
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-surface-border bg-surface px-2.5 py-1 text-[12px] text-text-bright placeholder:text-text-dim focus:border-accent/60 focus:outline-none sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={state === 'busy'}
            className="rounded-md border border-accent/50 px-2.5 py-1 text-[11px] text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
          >
            {state === 'busy' ? 'making certificate…' : 'download'}
          </button>
          <span className="w-full text-[11px] text-text-dim">
            {state === 'failed'
              ? 'Could not make the certificate. Try again.'
              : 'Printed on the picture only. Not sent anywhere. Not independently verified.'}
          </span>
        </form>
      )}
    </>
  );
}
