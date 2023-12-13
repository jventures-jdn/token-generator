import { Chain } from 'viem';

/* ------------------------ Chain config declearation ----------------------- */
export type InternalChain = 'JFIN' | 'JFINT';
export const CHAIN_DECIMAL_UNIT = 18;
export const CHAIN_DECIMAL = BigInt('10') ** BigInt(CHAIN_DECIMAL_UNIT);

/* ----------------------- Chain property declearation ---------------------- */
export const CHAIN_EXPLORER: { [key in InternalChain]: string } = {
  JFIN: 'https://exp.jfinchain.com/',
  JFINT: 'https://exp.testnet.jfinchain.com',
};

export const CHAIN_RPC: { [key in InternalChain]: string } = {
  JFIN: 'https://rpc.jfinchain.com',
  JFINT: 'https://rpc.testnet.jfinchain.com',
};

export const CHAIN_ID: { [key in InternalChain]: number } = {
  JFIN: 3501,
  JFINT: 3502,
};

export const CHAIN_NAME: { [key in InternalChain]: string } = {
  JFIN: 'JFIN Mainnet',
  JFINT: 'JFIN Testnet',
};

export const CHAIN_SYMBOL: { [key in InternalChain]: InternalChain } = {
  JFIN: 'JFIN',
  JFINT: 'JFINT',
};

/* --------------------------------- Chains --------------------------------- */
export const jfin: Chain = {
  id: CHAIN_ID.JFIN,
  name: CHAIN_NAME.JFIN,
  network: CHAIN_SYMBOL.JFIN as InternalChain,
  nativeCurrency: {
    decimals: 1,
    name: CHAIN_NAME.JFIN,
    symbol: CHAIN_SYMBOL.JFIN,
  },
  rpcUrls: {
    public: { http: [CHAIN_RPC.JFIN] },
    default: { http: [CHAIN_RPC.JFIN] },
  },
  blockExplorers: {
    default: {
      name: 'BlockScout',
      url: CHAIN_EXPLORER.JFIN,
    },
  },
};

export const jfint: Chain = {
  id: CHAIN_ID.JFINT,
  name: CHAIN_NAME.JFINT,
  network: CHAIN_SYMBOL.JFINT as InternalChain,
  nativeCurrency: {
    decimals: CHAIN_DECIMAL_UNIT,
    name: CHAIN_NAME.JFINT,
    symbol: CHAIN_SYMBOL.JFINT,
  },
  rpcUrls: {
    public: { http: [CHAIN_RPC.JFINT] },
    default: { http: [CHAIN_RPC.JFINT] },
  },
  blockExplorers: {
    default: {
      name: 'BlockScout',
      url: CHAIN_EXPLORER.JFINT,
    },
  },
};

export const chains = [jfin, jfint];
