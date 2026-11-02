import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SCAM GUARD — Spot the Scam. Stay Safe.',
    short_name: 'SCAM GUARD',
    description: 'Real-time mobile fraud detection for QR codes, UPI payments, suspicious messages, and deceptive links.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F9F7',
    theme_color: '#1DB954',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
