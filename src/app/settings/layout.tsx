import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize your FreeTyper experience — font size, sound, keyboard layout, and more.',
  robots: { index: false, follow: true },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
