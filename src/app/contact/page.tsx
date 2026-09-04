import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Email FreeTyper about the typing test, lessons, privacy, or the site in general.',
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-text-bright">Contact</h1>
      <p className="mt-2 text-sm text-text-dim">
        Questions about the test, lessons, privacy, or anything else on FreeTyper.
      </p>

      <div className="mt-8 max-w-xl space-y-6 leading-relaxed text-text">
        <p>
          There is no contact form and no chat. Email is the only channel, and it is the one we
          actually read.
        </p>
        <a
          href="mailto:contact@freetyper.com"
          className="flex items-center gap-3 rounded-lg border border-surface-border p-4 transition-colors hover:border-accent/30"
        >
          <Mail className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-medium text-text">Email</p>
            <p className="text-xs text-text-dim">contact@freetyper.com</p>
          </div>
        </a>
        <p className="text-sm text-text-dim">
          This is a small project. Replies can take a few days. For how data is stored, see the{' '}
          <a href="/privacy" className="text-accent hover:underline">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
