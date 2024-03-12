import { ethers } from 'hardhat';
import { ContractService } from '../../src/modules/contract/contract.service';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';

describe('Contract Service', () => {
  let contractService: ContractService;
  type DefaultArgs = {
    name: string;
    symbol: string;
    initialSupply: string;
    supplyCap: string;
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
    payee: `0x${string}` | string;
    transferor: `0x${string}` | string;
    minter: `0x${string}` | string;
    burner: `0x${string}` | string;
    pauser: `0x${string}` | string;
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Helper                                   */
  /* -------------------------------------------------------------------------- */
  async function deploy(contractName: string, args: Record<string, any>) {
    const [deployer, wallet1, wallet2, wallet3] = await ethers.getSigners();
    const contract = await ethers.deployContract(contractName, [
      Object.values(args),
    ]);
    await contract.waitForDeployment();
    return { contract, deployer, wallet1, wallet2, wallet3 };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Test                                    */
  /* -------------------------------------------------------------------------- */
  describe('Generate contract', () => {
    let initialArgs: DefaultArgs = Object.freeze({
      name: 'JDN_TOKEN_GENERATOR',
      symbol: 'JDB',
      initialSupply: '1000000000000000000000000', // 1*10^24
      supplyCap: '2000000000000000000000000', // 2*10^24
      mintable: false,
      burnable: false,
      pausable: false,
      payee: '0x',
      transferor: '0x',
      minter: '0x',
      burner: '0x',
      pauser: '0x',
    });

    beforeAll(async () => {
      contractService = new ContractService();
      const [deployer] = await ethers.getSigners();
      initialArgs = {
        ...initialArgs,
        payee: deployer.address,
        transferor: deployer.address,
        minter: deployer.address,
        burner: deployer.address,
        pauser: deployer.address,
      };
    });

    describe('ERC20: Disable supply cap', () => {
      const contractName = 'ERC20_NoCap';
      let _args: DefaultArgs;

      beforeAll(async () => {
        _args = { ...initialArgs, name: contractName, mintable: true };
        delete _args.supplyCap;
        await contractService.generateContract({
          contractName,
          contractType: ContractTypeEnum.ERC20,
          disable: { supplyCap: true },
        });
        await contractService.compileContract({
          contractType: ContractTypeEnum.ERC20,
          contractName,
        });
      });

      afterAll(async () => {
        await contractService.removeContract({
          contractType: ContractTypeEnum.ERC20,
          contractName,
        });
      });

      it('Disable supply cap should not have `cap` method', async () => {
        const { contract } = await deploy(contractName, _args);
        const methods = contract.interface.fragments
          .map((f: any) => f.name)
          .filter((f) => f);
        expect(methods).not.toContain('cap');
      });

      it('Disable supply cap `mint` method should not be limit with `supplyCap`', async () => {
        const { contract, wallet1 } = await deploy(contractName, _args);
        await expect(
          contract.mint(wallet1, BigInt(initialArgs.initialSupply + 1000000)),
        ).resolves.toBeTruthy();
      });
    });
  });
});
