import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import { chains } from 'config-chains';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: [], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    dontOverrideCompile: false, // defaults to false
  },
  networks: chains.reduce((result: any, item: any) => {
    return { ...result, [item.id]: { url: item.rpcEndpoint } };
  }, {}),
};

export default config;
