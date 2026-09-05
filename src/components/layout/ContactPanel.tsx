'use client';

import { useState, type FormEvent } from 'react';
import { Check, Clock, Copy, Mail, Send } from 'lucide-react';

const CONTACT_EMAIL = 'contact@freetyper.com';

const TOPICS = [
  'General',
  'Test / scoring',
  'Lessons',
  'Privacy',
  'Bug',
] as const;

type Topic = (typeof TOPICS)[number];

export default function ContactPanel() {
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState<Topic>('General');
  const [name, setName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState('');

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const openMail = (subject: string, body?: string) => {
    const parts = [`subject=${encodeURIComponent(subject)}`];
    if (body) parts.push(`body=${encodeURIComponent(body)}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?${parts.join('&')}`;
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const lines = [
      trimmed,
      '',
      name.trim() ? `Name: ${name.trim()}` : '',
      fromEmail.trim() ? `Reply to: ${fromEmail.trim()}` : '',
    ].filter(Boolean);
    openMail(`[FreeTyper] ${topic}`, lines.join('\n'));
  };

  const fieldClass =
    'w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-text-bright placeholder:text-text-dim outline-none transition-colors focus:border-accent';

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-surface-border bg-surface-raised/50 p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-dim">Email</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-surface-border bg-surface px-4 py-3">
            <Mail className="h-5 w-5 shrink-0 text-accent" />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="truncate font-mono text-sm text-text-bright hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2.5 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => openMail('FreeTyper')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-bg px-3 py-2.5 text-xs text-accent transition-colors hover:border-accent"
            >
              <Send className="h-3.5 w-3.5" />
              Open mail
            </button>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-text-dim">
          <Clock className="h-3.5 w-3.5" />
          Replies can take a few days. This is a small project — email is the only channel.
        </p>
      </div>

      <form onSubmit={sendMessage} className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-text-bright">Write a message</h2>
          <p className="mt-1 text-sm text-text-dim">
            Opens your mail app with this address filled in. Nothing is sent to our servers.
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-widest text-text-dim">
            Topic
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  topic === item
                    ? 'bg-accent-bg text-accent'
                    : 'text-text-dim hover:bg-surface-raised hover:text-text'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-text-dim">Your name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Optional"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-text-dim">Your email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className={fieldClass}
              placeholder="So we can reply"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-text-dim">Message</span>
          <textarea
            name="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} resize-y min-h-[8rem]`}
            placeholder="What should we know?"
          />
        </label>

        <button
          type="submit"
          disabled={!message.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-bg px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Open in mail app
        </button>
      </form>
    </div>
  );
}
