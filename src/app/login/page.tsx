import type { Metadata } from 'next';
import { authConfigured } from '@/lib/auth-config';
import LoginCard from './LoginCard';

// A tool page for the person logging in, not for search results.
export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false, follow: false },
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <div className="px-6 py-12 sm:px-10 lg:px-12">
      <LoginCard enabled={authConfigured()} />
    </div>
  );
}
