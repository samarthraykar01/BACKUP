import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SCAM GUARD — Spot the Scam. Stay Safe.',
  description: 'AI-assisted & community-powered scam detector for phone numbers, phishing emails, malicious links, fake SMS, and fraudulent UPI QR codes.',
  applicationName: 'SCAM GUARD',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SCAM GUARD',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#131313',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#131313]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#131313] text-white antialiased flex flex-col font-['Inter',sans-serif]">
        {children}
      </body>
    </html>
  );
}
