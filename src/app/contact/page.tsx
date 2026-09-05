import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import ContactPanel from '@/components/layout/ContactPanel';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Email FreeTyper about the typing test, lessons, privacy, or the site in general.',
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <div className="flex items-center gap-3 mb-3">
        <Mail className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-text-bright">Contact</h1>
      </div>
      <p className="text-sm text-text-dim">
        Questions about the test, lessons, privacy, or anything else on FreeTyper.
      </p>

      <div className="mt-10 max-w-xl">
        <ContactPanel />

        <p className="mt-10 text-sm text-text-dim">
          For how data is stored, see the{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            privacy policy
          </Link>
          . Who runs the site:{' '}
          <Link href="/about" className="text-accent hover:underline">
            about
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
