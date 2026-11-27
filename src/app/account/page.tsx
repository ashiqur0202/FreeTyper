import type { Metadata } from 'next';
import { authConfigured } from '@/lib/auth-config';
import AccountPanel from './AccountPanel';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account' },
};

export default function AccountPage() {
  return (
    <div className="px-6 py-12 sm:px-10 lg:px-12">
      <AccountPanel enabled={authConfigured()} />
    </div>
  );
}
