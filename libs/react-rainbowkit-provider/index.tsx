'use client';

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  Theme,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jfin, jfint } from '@jventures-jdn/config-chains';
/* -------------------------------------------------------------------------- */
/*                                   States                                   */
/* -------------------------------------------------------------------------- */
const { chains, publicClient } = configureChains(
  [jfin, jfint],
  [publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: 'Token Generator',
  projectId:
    process.env['010ccdb31998feacae63140786d809ee'] ||
    '010ccdb31998feacae63140786d809ee',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const themeConfig: Theme = darkTheme({
  accentColor: '#ed0000',
  accentColorForeground: '#ffffff',
});

/* -------------------------------------------------------------------------- */
/*                                    Doms                                    */
/* -------------------------------------------------------------------------- */
export default function RainbotKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={themeConfig}
        initialChain={jfin}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
