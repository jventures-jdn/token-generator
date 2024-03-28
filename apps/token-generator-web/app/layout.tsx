import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai, Space_Mono } from 'next/font/google';
import RainbotKitProvider from '@jventures-jdn/react-rainbowkit-provider';
import '@/styles/global.css';
import Navbar from '@/components/Nav';
import Footer from '@/components/Footer';
import brand from '../public/brand.webp';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ---------------------------------- Doms ---------------------------------- */

  const title = 'Tokenizer 🎛️';
  const description = 'Start generating your tokens. just a few clicks';
  const keywords =
    'tokenizer, token, web3, blockchain, erc20, erc721, contract, generator';
  const images = brand;
  const author = 'J Ventures Co., Ltd.';
  return (
    <html lang="en">
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>JFIN - Tokenizer</title>
        <link rel="icon" type="image/webp" href="/brand.webp" />
        <meta name="title" content="JFIN - Tokenizer" />
        <meta
          name="description"
          content="Start generating your tokens. just a few clicks"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="" />
        <meta property="og:title" content="JFIN - Tokenizer" />
        <meta
          property="og:description"
          content="Start generating your tokens. just a few clicks"
        />
        <meta property="og:image" content="/cover.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="" />
        <meta property="twitter:title" content="JFIN - Tokenizer" />
        <meta
          property="twitter:description"
          content="Start generating your tokens. just a few clicks"
        />
        <meta property="twitter:image" content="/cover.png" />
      </head>
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
