import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import RainbotKitProvider from '@jventures-jdn/react-rainbowkit-provider';
import LoggerReactProvider from '@jventures-jdn/react-logger-provider';
import '@/styles/global.css';
import Navbar from '@/components/Nav';
import Footer from '@/components/Footer';

const plexSans = IBM_Plex_Sans_Thai({
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
  /* ---------------------------------- Doms ---------------------------------- */

  return (
    <html lang="en" className={`${plexSans.className}`}>
      <body>
        <RainbotKitProvider>
          <LoggerReactProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LoggerReactProvider>
        </RainbotKitProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';
