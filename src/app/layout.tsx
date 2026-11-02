import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SCAM GUARD — Spot the Scam. Stay Safe.',
  description: 'Mobile-first scam detection intelligence: verify phone numbers, phishing emails, malicious links, suspicious messages, and fraudulent UPI QR codes.',
  applicationName: 'SCAM GUARD',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SCAM GUARD',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full bg-slate-50 ${inter.className}`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
