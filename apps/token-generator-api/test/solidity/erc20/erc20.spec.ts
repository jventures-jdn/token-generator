import { execSync } from 'child_process';
import { copyFileSync, existsSync, unlinkSync } from 'fs';
import { ethers } from 'hardhat';
import { keccak256, toUtf8Bytes } from 'ethers';
import { join } from 'path';

describe('ERC20 Generator', function () {
  /* -------------------------------------------------------------------------- */
  /*                                    Types                                   */
  /* -------------------------------------------------------------------------- */
  const contractName = 'ERC20GeneratorUpdate';
  type Args = {
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

  let initialArgs: Readonly<Args> = Object.freeze({
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

  /* -------------------------------------------------------------------------- */
  /*                                   Helper                                   */
  /* -------------------------------------------------------------------------- */
  async function setupContract() {
    copyFileSync(
      `${process.cwd()}/contracts/original/erc20/${contractName}.sol`,
      `${process.cwd()}/contracts/generated/erc20/${contractName}.sol`,
    );
    execSync('pnpm hardhat compile', {
      cwd: join(__dirname, '../../../'),
    });
  }

  async function cleanupContract() {
    const cleanPath = `${process.cwd()}/contracts/generated/erc20/${contractName}.sol`;
    if (existsSync(cleanPath)) unlinkSync(cleanPath);
  }

  async function deploy(args = initialArgs) {
    const [deployer, wallet1, wallet2, wallet3] = await ethers.getSigners();
    const contract = await ethers.deployContract(contractName, [
      Object.values(args),
    ]);
    await contract.waitForDeployment();
    return { contract, deployer, wallet1, wallet2, wallet3 };
  }

  beforeAll(async function () {
    setupContract();
    const [admin] = await ethers.getSigners();
    initialArgs = {
      ...initialArgs,
      payee: admin.address,
      transferor: admin.address,
      minter: admin.address,
      burner: admin.address,
      pauser: admin.address,
    };
    const { contract } = await deploy();
    console.table(
      contract.interface.fragments.map((f: any) => f.name).filter((f) => f),
    );
  });

  afterAll(async function () {
    cleanupContract();
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Test                                    */
  /* -------------------------------------------------------------------------- */

  describe('Initial', () => {
    it('Initial contract parameter should be the same as the given when deployed', async () => {
      const { contract, deployer, wallet1 } = await deploy();

      // check name, symbol
      await expect(contract.name()).resolves.toEqual(initialArgs.name);
      await expect(contract.symbol()).resolves.toEqual(initialArgs.symbol);

      // check payee supply should same as initial supply
      await expect(contract.balanceOf(deployer.address)).resolves.toEqual(
        BigInt(initialArgs.initialSupply),
      );

      // check total supply
      await expect(contract.totalSupply()).resolves.toEqual(
        BigInt(initialArgs.initialSupply),
      );

      // check supply cap
      await expect(contract.cap()).resolves.toEqual(
        BigInt(initialArgs.supplyCap),
      );

      // check initial features enabled
      await expect(contract.mintable()).resolves.toBeFalsy();
      await expect(contract.burnable()).resolves.toBeFalsy();
      await expect(contract.pausable()).resolves.toBeFalsy();

      // check initial roles
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), deployer),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('BURNER_ROLE')), deployer),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('PAUSER_ROLE')), deployer),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('TRANSFEROR_ROLE')), deployer),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('TRANSFEROR_ROLE')), wallet1),
      ).resolves.toBeFalsy();
    });

    it('Mint, Burn, Pause should be resolve when mintable, burnable, pausable is enabled', async () => {
      const { contract, wallet1, wallet2 } = await deploy({
        ...initialArgs,
        mintable: true,
        burnable: true,
        pausable: true,
      });

      // deployer caller with all role
      await expect(
        contract.mint(wallet1.address, BigInt(100)),
      ).resolves.toBeTruthy();
      await expect(contract.burn(BigInt(100))).resolves.toBeTruthy();
      await expect(
        contract.adminBurn(wallet1.address, BigInt(100)),
      ).resolves.toBeTruthy();
      await expect(contract.pause()).resolves.toBeTruthy();

      // other caller without role
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      await expect(
        contractWallet1.mint(wallet2.address, BigInt(100)),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have minter role'",
      );
      await expect(
        contractWallet1.adminBurn(wallet2.address, BigInt(100)),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have burner role'",
      );
      await expect(contractWallet1.pause()).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have pauser role'",
      );
    });

    it('Mint, Burn, Pause should be rejected when mintable, burnable, pausable is disabled', async () => {
      const { contract, wallet1 } = await deploy();

      await expect(
        contract.mint(wallet1.address, BigInt(100)),
      ).rejects.toThrow();
      await expect(contract.burn(BigInt(100))).rejects.toThrow();
      await expect(contract.adminBurn(wallet1, BigInt(100))).rejects.toThrow();
      await expect(contract.pause()).rejects.toThrow();
    });
  });

  describe('adminBurn', () => {
    it('adminBurn should be resolve when caller has BURNER_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();

      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        burner: wallet1.address,
        burnable: true,
      });

      // deployer caller
      await expect(
        contract.adminBurn(wallet2.address, BigInt(100)),
      ).rejects.toThrow();

      // wallet1 caller with burner role
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      const burnAmount = 1000000;

      // check payee supply should same as initial supply
      await expect(
        contractWallet1.balanceOf(deployer.address),
      ).resolves.toEqual(BigInt(initialArgs.initialSupply));
      // burn payee
      await expect(
        contractWallet1.adminBurn(deployer.address, BigInt(burnAmount)),
      ).resolves.toBeTruthy();
      // check payee supply
      await expect(
        contractWallet1.balanceOf(deployer.address),
      ).resolves.toEqual(
        BigInt(initialArgs.initialSupply) - BigInt(burnAmount),
      );
    });

    it('adminBurn should be reject when caller has no BURNER_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        burner: wallet1.address,
        burnable: true,
      });

      const contractWallet2 = (await contract.connect(
        wallet2,
      )) as typeof contract;
      await expect(
        contractWallet2.adminBurn(deployer.address, BigInt(100)),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have burner role'",
      );
    });

    it('adminBurn should be reject when burnable is disabled', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      // deployer contract with wallet1 is burner role
      const { contract } = await deploy({
        ...initialArgs,
        burner: wallet1.address,
        burnable: false,
      });

      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      await expect(
        contractWallet1.adminBurn(wallet2.address, BigInt(100)),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: burn functionality not enabled'",
      );
    });
  });

  describe('adminTransfer', () => {
    it('adminTransfer should be resolve when caller has TRANSFEROR_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      const { contract, deployer } = await deploy({
        ...initialArgs,
        transferor: wallet1.address,
        mintable: true,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      const transferAmount = BigInt(100) * BigInt(10 ** 18);

      // check wallet1 has transferor role
      await expect(
        contract.hasRole(keccak256(toUtf8Bytes('TRANSFEROR_ROLE')), wallet1),
      ).resolves.toBeTruthy();

      // check transfer from payee to wallet2
      await expect(
        contractWallet1.adminTransfer(
          deployer,
          wallet2.address,
          BigInt(transferAmount),
        ),
      ).resolves.toBeTruthy();

      // check payee balance
      await expect(contractWallet1.balanceOf(deployer)).resolves.toEqual(
        BigInt(initialArgs.initialSupply) - transferAmount,
      );

      // check wallet2 balance
      await expect(contractWallet1.balanceOf(wallet2)).resolves.toEqual(
        transferAmount,
      );
    });

    it('adminTransfer should be resolve when caller has no TRANSFEROR_ROLE', async () => {
      const { contract, deployer, wallet1, wallet2 } = await deploy();

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      const transferAmount = BigInt(100) * BigInt(10 ** 18);

      // check deployer has transferor role
      await expect(
        contractWallet1.hasRole(
          keccak256(toUtf8Bytes('TRANSFEROR_ROLE')),
          deployer,
        ),
      ).resolves.toBeTruthy();

      // check transfer from payee to wallet2
      await expect(
        contractWallet1.adminTransfer(
          deployer,
          wallet2.address,
          BigInt(transferAmount),
        ),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have transferor role'",
      );
    });

    it('adminTransfer should be reject when paused', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      const { contract, deployer } = await deploy({
        ...initialArgs,
        transferor: wallet1.address,
        pauser: wallet1.address,
        mintable: true,
        pausable: true,
      });
      const transferAmount = BigInt(100) * BigInt(10 ** 18);

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // pause
      await expect(contractWallet1.pause()).resolves.toBeTruthy();

      // when pause adminTransfer should be rejected
      await expect(
        contractWallet1.adminTransfer(
          deployer,
          wallet2.address,
          BigInt(transferAmount),
        ),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'Pausable: paused'",
      );
    });
  });

  describe('pause', () => {
    it('pause should be resolve when caller has PAUSER_ROLE', async () => {
      const [, wallet1] = await ethers.getSigners();
      const { contract } = await deploy({
        ...initialArgs,
        pauser: wallet1.address,
        pausable: true,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // pause
      await expect(contractWallet1.pause()).resolves.toBeTruthy();

      // check pause status
      await expect(contractWallet1.paused()).resolves.toBeTruthy();
    });

    it('unpause should be resolve when caller has PAUSER_ROLE', async () => {
      const [, wallet1] = await ethers.getSigners();
      const { contract } = await deploy({
        ...initialArgs,
        pauser: wallet1.address,
        pausable: true,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // unpause
      await expect(contractWallet1.pause()).resolves.toBeTruthy();
      await expect(contractWallet1.unpause()).resolves.toBeTruthy();

      // check pause status
      await expect(contractWallet1.paused()).resolves.toBeFalsy();
    });

    it('pause, unpause should be reject when caller has no PAUSER_ROLE', async () => {
      const { contract, wallet1 } = await deploy({
        ...initialArgs,
        pausable: true,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // check pause
      await expect(contractWallet1.pause()).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have pauser role'",
      );

      // check unpause
      await expect(contractWallet1.unpause()).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have pauser role'",
      );
    });
  });
});
