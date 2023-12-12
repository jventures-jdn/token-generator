import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai, Space_Mono } from 'next/font/google';
import RainbotKitProvider from '@jventures-jdn/react-rainbowkit-provider';
import '@/styles/global.css';
import Navbar from '@/components/Nav';
import Footer from '@/components/Footer';

const plexSans = IBM_Plex_Sans_Thai({
  variable: '--font-plex-sans-thai',
  subsets: ['thai'],
  weight: ['300', '400', '700'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
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
  /* ---------------------------------- Doms ---------------------------------- */

  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${spaceMono.variable}`}>
        <RainbotKitProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </RainbotKitProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';
