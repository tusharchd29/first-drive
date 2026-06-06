import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'First Drive',
  description: 'Learn manual car driving — clutch, gears, hill starts.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        background: '#e8f0e8',
        overflow: 'hidden',
        position: 'fixed',
        width: '100%',
        height: '100dvh',
        top: 0, left: 0,
      }}>
        {children}
      </body>
    </html>
  );
}
