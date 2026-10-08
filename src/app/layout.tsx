import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { SettingsProvider } from '@/components/layout/SettingsProvider';
import JsonLd, { organizationSchema, webSiteSchema } from '@/components/seo/JsonLd';
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
    other: {
      'msvalidate.01': '1F48A97683ED0321E94215706856A3DE',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    // og:image is generated dynamically by src/app/opengraph-image.tsx.
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    // twitter:image is generated dynamically by src/app/opengraph-image.tsx.
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
  other: {
    'google-adsense-account': siteConfig.adsenseClient,
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
    <html lang="en" className="h-full dark" data-theme="dark" data-font-size="default" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#323234" />
        {/* AdSense requires this snippet in <head> (site-wide, every page). */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} flex min-h-full flex-col`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var s=JSON.parse(localStorage.getItem('freetyper-settings')||'{}');var t=s.theme||'dark';var dark=t==='dark'||t==='midnight';var light=t==='light'||t==='paper';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-font-size',s.fontSize||'default');document.documentElement.classList.toggle('dark',dark);var accents={gold:'#e2b714',blue:'#519aba',green:'#8a8a6e',red:'#c44250',purple:'#a37acc',cyan:'#56b6c2'};var lightAccents={gold:'#b08912',blue:'#3d738c',green:'#5c6350',red:'#b44a4a',purple:'#6e5a88',cyan:'#3d7d82'};var a=(light?lightAccents:accents)[s.accentColor]||(light?lightAccents:accents).gold;var r=document.documentElement;r.style.setProperty('--color-accent',a);r.style.setProperty('--color-accent-dim',a+'99');r.style.setProperty('--color-accent-bg',a+(light?'22':'15'));var meta={dark:'#323234',light:'#e8e9e4',midnight:'#0e0e10',paper:'#e2d3b8'};var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',meta[t]||meta.dark);}catch(e){}})();`}
        </Script>
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

        {/* Site-wide entity schema (Organization + WebSite). Page-level schemas
            (WebApplication / FAQPage / HowTo) are added on the home page. */}
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />

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


      </body>
    </html>
  );
}
