import { ethers } from 'hardhat';
import { toUtf8Bytes, keccak256 } from 'ethers';
import { ContractService } from '../../src/modules/contract/contract.service';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';

describe('Contract Service', () => {
  let contractService: ContractService;
  type DefaultArgs = {
    name: string;
    symbol: string;
    initialSupply: string;
    supplyCap: string;
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
      payee: '0x',
      transferor: '0x',
      minter: '0x',
      burner: '0x',
      pauser: '0x',
    });

    const contractNamespaces = [
      { name: 'ERC20_NoCap', disable: { supplyCap: true } },
      { name: 'ERC20_NoMint', disable: { mint: true } },
    ];

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

      await Promise.all(
        contractNamespaces.map(
          async (i) =>
            new Promise((resolve) => {
              resolve(
                contractService.generateContract({
                  contractName: i.name,
                  contractType: ContractTypeEnum.ERC20,
                  disable: i.disable,
                }),
              );
            }),
        ),
      );

      await contractService.compileContract({
        contractType: ContractTypeEnum.ERC20,
        contractName: 'ERC20_NoCap',
      });
    });

    afterAll(async () => {
      await Promise.all(
        contractNamespaces.map(
          (i) =>
            new Promise((resolve) => {
              resolve(
                contractService.removeContract({
                  contractType: ContractTypeEnum.ERC20,
                  contractName: i.name,
                }),
              );
            }),
        ),
      );
    });

    describe('ERC20: Disable supply cap', () => {
      const contractName = 'ERC20_NoCap';
      let _args: DefaultArgs;

      beforeAll(() => {
        _args = { ...initialArgs, name: contractName };
        delete _args.supplyCap;
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

    describe('ERC20: Disable mint', () => {
      const contractName = 'ERC20_NoMint';
      let _args: DefaultArgs;

      beforeAll(async () => {
        _args = { ...initialArgs, name: contractName };
        delete _args.minter;
      });

      it('Disable `mint`  should not have `mint()`', async () => {
        const { contract } = await deploy(contractName, _args);
        const methods = contract.interface.fragments
          .map((f: any) => f.name)
          .filter((f) => f);
        expect(methods).not.toContain('mint');
        expect(methods).not.toContain('MINTER_ROLE');
      });

      it('Disable `mint` should not have `MINTER_ROLE` role', async () => {
        const { contract, deployer } = await deploy(contractName, _args);
        await expect(
          contract.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), deployer),
        ).resolves.toBeFalsy();
      });
    });
  });
});
