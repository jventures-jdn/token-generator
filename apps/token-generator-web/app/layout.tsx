import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import '@/styles/global.css';

const inter = IBM_Plex_Sans_Thai({
  variable: '--font-plex-sans-thai',
  subsets: ['thai'],
  weight: ['300', '400', '700'],
});

export const metadata: Metadata = {
  title: 'JFIN: Token Generator',
  description: 'JFIN: Token Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

export const runtime = 'edge';
