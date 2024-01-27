import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { chains } from '@jventures-jdn/config-chains';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: [], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    dontOverrideCompile: false, // defaults to false
  },
  networks: chains.reduce((chains, chain) => {
    return { ...chains, [chain.id]: { url: chain.rpcUrls.default.http[0] } };
  }, {}),
};

export default config;
