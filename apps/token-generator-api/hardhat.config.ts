import { HardhatUserConfig } from 'hardhat/config';
import { chains } from '@jventures-jdn/config-chains';
import '@nomicfoundation/hardhat-verify';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: chains.reduce((chains, chain) => {
    return { ...chains, [chain.id]: { url: chain.rpcUrls.default.http[0] } };
  }, {}),
  etherscan: {
    apiKey: chains.reduce((chains, chain) => {
      return {
        ...chains,
        [chain.id]: undefined,
      };
    }, {}),
    customChains: chains.map((chain) => ({
      network: chain.nativeCurrency.symbol,
      chainId: chain.id,
      urls: {
        apiURL: `${chain.blockExplorers?.default.url}/api` || '',
        browserURL: chain.blockExplorers?.default.url || '',
      },
    })),
  },
  paths: {
    sources: './contracts/generated',
    artifacts: './contracts/compiled/artifacts',
    cache: './contracts/compiled/cache',
  },
};

export default config;
