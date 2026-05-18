import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import '../styles/tailwind.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CardiacWatch — Real-Time Cardiac Emergency Monitoring',
  description:
    'CardiacWatch monitors patient BPM in real time, surfaces cardiac emergencies instantly, and routes automatic doctor notifications from a single clinical dashboard.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body className={dmSans.className}>{children}

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcardiacwat3983back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}