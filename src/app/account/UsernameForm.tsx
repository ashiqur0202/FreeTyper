'use client';

import { useEffect, useState } from 'react';

const REASONS: Record<string, string> = {
  bad_username: 'Use 3 to 20 letters, digits, dots, dashes or underscores.',
  reserved: 'That name is not available. Try another.',
  taken: 'Someone already has that username. Try another.',
};

/** The person's public leaderboard name. It starts as their Google name in plain letters; they can change it. */
export default function UsernameForm({ name }: { name: string }) {
  const [saved, setSaved] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let live = true;
    fetch('/api/typist', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { username: string } | null) => { if (live && b) { setSaved(b.username); setValue(b.username); } })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/typist', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ username: value }),
      });
      const body = (await res.json().catch(() => ({}))) as { username?: string; error?: string };
      if (res.ok && body.username) { setSaved(body.username); setValue(body.username); setOk(true); setMessage('Saved.'); }
      else { setOk(false); setMessage(REASONS[body.error ?? ''] ?? 'Could not save. Try again in a moment.'); }
    } catch {
      setOk(false);
      setMessage('Could not reach the server. Try again in a moment.');
    }
    setBusy(false);
  };

  if (saved === null) return null;
  return (
    <form onSubmit={save} className="mt-5 border-t border-surface-border pt-4">
      <h2 className="text-sm font-semibold text-text-bright">Leaderboard name</h2>
      <p className="mt-1 text-xs text-text-dim">Your speed tests are ranked on the public leaderboard. Others see your username and your name from Google.</p>
      <label htmlFor="username" className="mt-3 block text-xs text-text-dim">Username (3 to 20 letters, digits, . - _)</label>
      <div className="mt-1 flex gap-2">
        <input
          id="username"
          type="text"
          value={value}
          maxLength={20}
          autoComplete="off"
          onChange={(e) => { setValue(e.target.value); setMessage(''); }}
          className="min-w-0 flex-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-text-bright"
        />
        <button type="submit" disabled={busy || value.trim().toLowerCase() === saved} className="cursor-pointer rounded-lg border border-accent bg-accent-bg px-3.5 py-2 text-sm font-semibold text-accent disabled:cursor-not-allowed disabled:opacity-40">
          Save
        </button>
      </div>
      <p className="mt-2 text-xs text-text-dim">Others see: <b className="text-text-bright">{saved}</b> {name}</p>
      <p role="status" className={`mt-1 min-h-5 text-[13px] ${ok ? 'text-text-dim' : 'text-error'}`}>{message}</p>
    </form>
  );
}
