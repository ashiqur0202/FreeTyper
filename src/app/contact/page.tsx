import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with FreeTyper — questions, feedback, and suggestions welcome.',
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-lg font-medium text-text-bright">Contact</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p className="text-sm text-text-dim">
          Have questions, feedback, or suggestions? We would love to hear from you.
        </p>
        <div className="mt-6">
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
        </div>
        <p className="mt-6 text-xs text-text-dim">
          This is a small project. Email is the best way to reach us; replies can take a few days.
        </p>
      </div>
    </div>
  );
}
