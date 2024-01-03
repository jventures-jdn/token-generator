import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import { chains } from '@jventures-jdn/config-chains';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: chains.reduce((chains, chain) => {
    return { ...chains, [chain.id]: { url: chain.rpcUrls.default.http[0] } };
  }, {}),
  paths: {
    sources: './contracts/original',
    artifacts: './contracts/compiled/artifacts',
    cache: './contracts/compiled/cache',
  },
};

export default config;
