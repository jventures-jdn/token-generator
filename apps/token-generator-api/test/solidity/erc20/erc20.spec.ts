import { execSync } from 'child_process';
import { copyFileSync, existsSync, unlinkSync } from 'fs';
import { ethers } from 'hardhat';
import { utils, BigNumber } from 'ethers';
import { join } from 'path';
import { parseEther } from 'ethers/lib/utils';

describe('ERC20 Generator', function () {
  /* -------------------------------------------------------------------------- */
  /*                                    Types                                   */
  /* -------------------------------------------------------------------------- */
  const contractName = 'ERC20Generator';
  type Args = {
    name: string;
    symbol: string;
    initialSupply: string;
    supplyCap: string;
    recipient: `0x${string}` | string;
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
    recipient: '0x',
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

    await contract.deployed();
    return { contract, deployer, wallet1, wallet2, wallet3 };
  }

  beforeAll(async function () {
    setupContract();
    const [deployer] = await ethers.getSigners();
    initialArgs = {
      ...initialArgs,
      recipient: deployer.address,
      transferor: deployer.address,
      minter: deployer.address,
      burner: deployer.address,
      pauser: deployer.address,
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

      // check recipient supply should same as initial supply
      await expect(contract.balanceOf(deployer.address)).resolves.toEqual(
        BigNumber.from(initialArgs.initialSupply),
      );

      // check total supply
      await expect(contract.totalSupply()).resolves.toEqual(
        BigNumber.from(initialArgs.initialSupply),
      );

      // check supply cap
      await expect(contract.cap()).resolves.toEqual(
        BigNumber.from(initialArgs.supplyCap),
      );

      // check initial roles
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE')),
          deployer.address,
        ),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('BURNER_ROLE')),
          deployer.address,
        ),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('PAUSER_ROLE')),
          deployer.address,
        ),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('TRANSFEROR_ROLE')),
          deployer.address,
        ),
      ).resolves.toBeTruthy();
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('TRANSFEROR_ROLE')),
          wallet1.address,
        ),
      ).resolves.toBeFalsy();
    });
  });

  describe('burn', () => {
    it('burn should be resolve when caller has balance', async () => {
      const [, wallet1] = await ethers.getSigners();
      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        recipient: wallet1.address,
      });

      await expect(contract.mint(deployer.address, BigNumber.from(1000)));
      await expect(contract.burn(BigNumber.from(100))).resolves.toBeTruthy();
      await expect(contract.balanceOf(deployer.address)).resolves.toEqual(
        BigNumber.from(900),
      );
    });

    it('burn should be reject when caller has no balance', async () => {
      const [, wallet1] = await ethers.getSigners();
      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        recipient: wallet1.address,
      });

      await expect(contract.burn(BigNumber.from(100))).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20: burn amount exceeds balance'",
      );
      await expect(contract.balanceOf(deployer.address)).resolves.toEqual(
        BigNumber.from(0),
      );
    });
  });

  describe('adminBurn', () => {
    it('adminBurn should be resolve when caller has BURNER_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();

      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        burner: wallet1.address,
      });

      // deployer caller
      await expect(
        contract.adminBurn(wallet2.address, BigNumber.from(100)),
      ).rejects.toThrow();

      // wallet1 caller with burner role
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      const burnAmount = 1000000;

      // check recipient supply should same as initial supply
      await expect(
        contractWallet1.balanceOf(deployer.address),
      ).resolves.toEqual(BigNumber.from(initialArgs.initialSupply));
      // burn recipient
      await expect(
        contractWallet1.adminBurn(deployer.address, BigNumber.from(burnAmount)),
      ).resolves.toBeTruthy();
      // check recipient supply
      await expect(
        contractWallet1.balanceOf(deployer.address),
      ).resolves.toEqual(
        BigNumber.from(initialArgs.initialSupply).sub(
          BigNumber.from(burnAmount),
        ),
      );
    });

    it('adminBurn should be reject when caller has no BURNER_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      // deployer contract with wallet1 is burner role
      const { contract, deployer } = await deploy({
        ...initialArgs,
        burner: wallet1.address,
      });

      const contractWallet2 = (await contract.connect(
        wallet2,
      )) as typeof contract;
      await expect(
        contractWallet2.adminBurn(deployer.address, BigNumber.from(100)),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have burner role'",
      );
    });
  });

  describe('adminTransfer', () => {
    it('adminTransfer should be resolve when caller has TRANSFEROR_ROLE', async () => {
      const [, wallet1, wallet2] = await ethers.getSigners();
      const { contract, deployer } = await deploy({
        ...initialArgs,
        transferor: wallet1.address,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      const transferAmount = parseEther('100');

      // check wallet1 has transferor role
      await expect(
        contract.hasRole(
          utils.keccak256(utils.toUtf8Bytes('TRANSFEROR_ROLE')),
          wallet1.address,
        ),
      ).resolves.toBeTruthy();

      // check transfer from recipient to wallet2
      await expect(
        contractWallet1.adminTransfer(
          deployer.address,
          wallet2.address,
          transferAmount,
        ),
      ).resolves.toBeTruthy();

      // check recipient balance
      await expect(
        contractWallet1.balanceOf(deployer.address),
      ).resolves.toEqual(
        BigNumber.from(initialArgs.initialSupply).sub(transferAmount),
      );

      // check wallet2 balance
      await expect(contractWallet1.balanceOf(wallet2.address)).resolves.toEqual(
        transferAmount,
      );
    });

    it('adminTransfer should be resolve when caller has no TRANSFEROR_ROLE', async () => {
      const { contract, deployer, wallet1, wallet2 } = await deploy();

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;
      const transferAmount = parseEther('100');

      // check deployer has transferor role
      await expect(
        contractWallet1.hasRole(
          utils.keccak256(utils.toUtf8Bytes('TRANSFEROR_ROLE')),
          deployer.address,
        ),
      ).resolves.toBeTruthy();

      // check transfer from recipient to wallet2
      await expect(
        contractWallet1.adminTransfer(
          deployer.address,
          wallet2.address,
          BigNumber.from(transferAmount),
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
      });
      const transferAmount = parseEther('100');

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // pause
      await expect(contractWallet1.pause()).resolves.toBeTruthy();

      // when pause adminTransfer should be rejected
      await expect(
        contractWallet1.adminTransfer(
          deployer.address,
          wallet2.address,
          BigNumber.from(transferAmount),
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
  describe('mint', () => {
    it('mint should be resolve when caller has MINTER_ROLE', async () => {
      const mintAmount = parseEther('100');
      const [, wallet1, wallet2] = await ethers.getSigners();
      const { contract } = await deploy({
        ...initialArgs,
        minter: wallet1.address,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // mint
      await expect(
        contractWallet1.mint(wallet2.address, mintAmount),
      ).resolves.toBeTruthy();
      await expect(contractWallet1.balanceOf(wallet2.address)).resolves.toEqual(
        mintAmount,
      );
    });

    it('mint should be reject when caller has no MINTER_ROLE', async () => {
      const mintAmount = parseEther('100');
      const [, wallet1, wallet2] = await ethers.getSigners();
      const { contract } = await deploy({
        ...initialArgs,
        minter: wallet2.address,
      });

      // connect to wallet1
      const contractWallet1 = (await contract.connect(
        wallet1,
      )) as typeof contract;

      // mint
      await expect(
        contractWallet1.mint(wallet2.address, mintAmount),
      ).rejects.toThrow(
        "VM Exception while processing transaction: reverted with reason string 'ERC20Generator: caller must have minter role'",
      );

      await expect(contractWallet1.balanceOf(wallet2.address)).resolves.toEqual(
        BigNumber.from(0),
      );
    });
  });
});
