import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'First Drive – Learn Manual Car',
  description: 'The only mobile simulator that teaches you clutch control, gear shifting, and hill starts. Duolingo for manual driving.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#080c14', overflow: 'hidden', position: 'fixed', width: '100%', height: '100%' }}>
        {children}
      </body>
    </html>
  );
}
