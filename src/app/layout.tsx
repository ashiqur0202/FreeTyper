import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { SettingsProvider } from '@/components/layout/SettingsProvider';
import { siteConfig } from '@/config/site';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  metadataBase: new URL(siteConfig.url),
  verification: {
    google: '7QAFCmfXImiyrOrEwKlk7SsRaoXaJopD8k5c6Xbv5lc',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1c1c1c" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} flex min-h-full flex-col`}>
        <SidebarProvider>
          <SettingsProvider>
            <main className="flex flex-1">
              <Sidebar />
              <div className="flex-1 min-w-0">{children}</div>
              <RightSidebar />
            </main>
            <Footer />
          </SettingsProvider>
        </SidebarProvider>

        {/* Google Analytics — GA4 ID: G-QC5509TVSF */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-QC5509TVSF`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QC5509TVSF');
          `}
        </Script>

        {/* Google AdSense — replace with your publisher ID */}
        <Script
          src="https://pagead2.googlesyndication.com/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
