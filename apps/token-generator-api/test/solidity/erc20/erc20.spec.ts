import hre from 'hardhat';

describe('ERC20 Generator', function () {
  /* -------------------------------------------------------------------------- */
  /*                                    Types                                   */
  /* -------------------------------------------------------------------------- */
  type TokenFixtureReturnType = Awaited<ReturnType<typeof deployTokenFixture>>;
  type Args = {
    name: string;
    symbol: string;
    initialSupply: string;
    supplyCap: string;
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
  };

  const initialArgs: Readonly<Args> = Object.freeze({
    name: 'JDN_TOKEN_GENERATOR',
    symbol: 'JDB',
    initialSupply: '1000000000000000000000000', // 1*10^24
    supplyCap: '2000000000000000000000000', // 2*10^24
    mintable: false,
    burnable: false,
    pausable: false,
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Helper                                   */
  /* -------------------------------------------------------------------------- */
  async function deployTokenFixture(args = initialArgs) {
    const [address1, address2, address3] = await hre.viem.getWalletClients();
    const contract = await hre.viem.deployContract('ERC20Generator', [args]);
    const deployer = contract.address;
    console.table(Object.entries(args), ['0', '1']);
    return { contract, deployer, address1, address2, address3 };
  }

  beforeAll(async function () {
    const { contract, deployer } = await deployTokenFixture();
    console.log(deployer);
  });

  it('should deploy ERC20 contract', async function () {
    // const ERC20 = await hre.viem.deployContract('ERC20Generator');
  });
});
