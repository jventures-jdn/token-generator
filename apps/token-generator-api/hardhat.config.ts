import { HardhatUserConfig } from 'hardhat/config';
import { chains } from '@jventures-jdn/config-chains';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-jest';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: chains.reduce((chains, chain) => {
    return {
      ...chains,
      [chain.nativeCurrency.symbol]: { url: chain.rpcUrls.default.http[0] },
    };
  }, {}),
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: chains.reduce((_chains, _chain) => {
      return {
        ..._chains,
        [_chain.nativeCurrency.symbol]: '_',
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
    tests: './test/solidity',
  },
};

export default config;
