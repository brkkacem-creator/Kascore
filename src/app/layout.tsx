import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { PWARegister } from '@/components/ui/PWARegister';
import './globals.css';

// Self-hosted fonts — no Google Fonts network call needed
const dmSans = localFont({
  src: [
    { path: '../../public/fonts/dmsans-300.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/dmsans-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/dmsans-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
});

const syne = localFont({
  src: [
    { path: '../../public/fonts/syne-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/syne-600.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/syne-700.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/syne-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kascore — Pronostics Coupe du Monde 2026',
  description: 'Pronostique les matchs de la Coupe du Monde FIFA 2026 et affronte tes amis dans le classement.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kascore',
  },
  openGraph: {
    title: 'Kascore — Pronostics CDM 2026',
    description: 'Pronostics Coupe du Monde FIFA 2026 🏆',
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kascore" />
        <meta name="application-name" content="Kascore" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased bg-[#0A0A0A] overscroll-none`}>
        {children}
        <PWARegister />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: '20px',
              background: '#111111',
              color: '#E8D5A0',
              border: '1px solid rgba(201,168,76,0.3)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  );
}
