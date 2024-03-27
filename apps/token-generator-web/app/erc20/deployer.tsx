import {
  GetAbiContractResponse,
  contractFetcherApi,
} from '@jventures-jdn/api-fetcher';
import {
  CHAIN_DECIMAL,
  InternalChain,
  getChain,
} from '@jventures-jdn/config-chains';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';
import { LoggerStore } from '@jventures-jdn/react-logger';
import { getNetwork, getPublicClient, getWalletClient } from 'wagmi/actions';

export function useDeployErc20() {
  /* --------------------------------- States --------------------------------- */
  // Hooks
  const { setLoading, add, pop } = LoggerStore();
  const generateContract = contractFetcherApi.generateContract();
  const compileContract = contractFetcherApi.compileContract();
  const verifyContract = contractFetcherApi.verifyContract();

  /* -------------------------------- Generate -------------------------------- */
  async function generate<
    T extends Record<string, any>,
    F extends Record<string, boolean>,
  >(data: T, fieldStates: F) {
    add(`✨ Generating contract ...`, { color: 'info' });

    // generate contract
    const generateContractResp = await generateContract.trigger({
      contractType: ContractTypeEnum.ERC20,
      contractName: data.name,
      disable: Object.entries(fieldStates).reduce(
        (prev, [index, value]) => {
          prev[index] = !value;
          return prev;
        },
        {} as Record<string, boolean>,
      ),
    });

    // wait logger animation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // log result
    pop();
    if (generateContractResp.status === 409) {
      add('🚫 Contract name is already in used, Please try again', {
        color: 'warning',
      });
      return;
    } else if (generateContractResp.status !== 201) {
      add(`🚫 ${generateContractResp.message}`, {
        color: 'warning',
      });
      return;
    } else {
      add(`✅ Generate contract successfully`, {
        color: 'success',
      });
    }
  }

  /* --------------------------------- Compile -------------------------------- */
  async function compile<T extends Record<string, any>>(data: T) {
    add(`⚙️ Compiling contract ...`, { color: 'info' });

    // compile contract
    const compileContractResp = await compileContract.trigger({
      contractType: ContractTypeEnum.ERC20,
      contractName: data.name,
    });

    // log result
    pop();
    if (compileContractResp.isSuccess) {
      add(`✅ Compiled contract successfully`, {
        color: 'success',
      });
    } else {
      add(`⚠️ ${compileContractResp?.message}`, {
        color: 'warning',
      });
    }
  }

  /* ----------------------------------- ABI ---------------------------------- */
  async function abi<T extends Record<string, any>>(data: T) {
    add(`📝 Processing Bytecode & ABI ...`, { color: 'info' });

    // get abi
    const getABIResp = await contractFetcherApi.fetch<GetAbiContractResponse>(
      'get',
      '/abi',
      {
        config: {
          params: {
            contractType: ContractTypeEnum.ERC20,
            contractName: data.name,
          },
        },
      },
    );

    // wait logger animation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // log result
    pop();
    if (getABIResp.isSuccess) {
      add(`✅ Processing Bytecode & ABI successfully`, { color: 'success' });
    } else {
      add(`⚠️ ${getABIResp?.message}`, {
        color: 'warning',
      });
    }

    return getABIResp.data;
  }

  async function deploy<
    T extends Record<string, any>,
    F extends Record<string, boolean>,
  >(data: T, fieldStates: F, contractData: GetAbiContractResponse) {
    const { chain } = getNetwork();
    const walletClient = await getWalletClient({ chainId: chain?.id });
    const publicClient = await getPublicClient({ chainId: chain?.id });
    const gasPrice = await publicClient.getGasPrice();
    const transactionFeeDecimal = 10 ** 7;

    const args = {
      symbol: data.symbol,
      name: data.name,
      recipient: data.recipient,
      initialSupply: BigInt(data.initialSupply) * CHAIN_DECIMAL,
      ...(data.supplyCap && {
        supplyCap: BigInt(data.supplyCap) * CHAIN_DECIMAL,
      }),
      ...(fieldStates.adminTransfer && {
        transferor: data.adminTransfer,
      }),
      ...(fieldStates.mintable && { minter: data.mintable }),
      ...(fieldStates.adminBurn && { burner: data.adminBurn }),
      ...(fieldStates.pausable && { pauser: data.pausable }),
    };

    add(`🗳️ Deploying ERC20 to ${chain?.name}`, { color: 'info' });
    add(
      <div className="flex flex-col gap-2">
        {Object.entries(args).map(([arg, value]) => (
          <div key={arg}>
            <span className="capitalize">{arg}: </span>
            <span>{`${value}`}</span>
          </div>
        ))}
      </div>,
      { color: 'info' },
    );

    // Sign transaction
    setLoading('📝 Signing transaction...');
    let hash: `0x${string}`;
    try {
      hash = await walletClient?.deployContract({
        abi: contractData.abi,
        bytecode: contractData.bytecode,
        args: [args],
        chain: chain,
      });
    } catch (e: any) {
      add(e?.details || e?.message || 'Unknown', {
        color: 'warning',
      });
      setLoading(undefined);
      return Promise.reject(e?.details || e?.message);
    }

    // Wait for transaction
    setLoading(`💫 Deploying...`);
    try {
      await setTimeout(() => {
        setLoading(`⏳ Wait for transaction...`);
      }, 2000);
      const transaction = await publicClient.waitForTransactionReceipt({
        hash: hash || '0x',
      });
      pop();
      pop();
      add(`✅  Deploying ERC20 to ${chain?.name} successfully`, {
        color: 'success',
      });

      add(
        <a
          href={`${
            getChain(`${chain?.network}` as InternalChain).chainExplorer
              .homePage
          }/tx/${transaction.transactionHash}`}
          target="_blank"
        >
          🌍 Transaction Hash:{' '}
          <span className="underline">
            [`${transaction.transactionHash.slice(0, 10)}...$
            {transaction.transactionHash.slice(-10)}`]
          </span>
        </a>,
      );
      add(
        <a
          href={`${
            getChain(`${chain?.network}` as InternalChain).chainExplorer
              .homePage
          }/address/${transaction.contractAddress}//read-contract`}
          target="_blank"
        >
          🌍 Contract Address:{' '}
          <span className="underline">
            [`${transaction.contractAddress?.slice(0, 10)}...$
            {transaction.contractAddress?.slice(-10)}`]
          </span>
        </a>,
      );
      add(
        `🧾 Transaction Fee: ${(
          Number(
            (transaction.gasUsed * gasPrice * BigInt(transactionFeeDecimal)) /
              CHAIN_DECIMAL,
          ) / transactionFeeDecimal
        ).toLocaleString(undefined, { minimumFractionDigits: 7 })} ${chain
          ?.nativeCurrency.symbol}`,
      );

      return { contractAddress: transaction.contractAddress, args };
    } catch (e: any) {
      add(e?.details || e?.message || 'Unknown', {
        color: 'danger',
      });
    } finally {
      setLoading(undefined);
    }
  }

  async function verify(
    name: string,
    contractData: GetAbiContractResponse,
    contractAddress: string,
    args: any,
  ) {
    const { chain } = getNetwork();
    setLoading('📝 Verifying smart contract ...');
    add(`📝 Verifying smart contract ...`, { color: 'info' });

    // Verify smart contract
    const verifyContractResp = await verifyContract.trigger({
      contractName: name,
      contractType: ContractTypeEnum.ERC20,
      address: contractAddress,
      chainName: chain.nativeCurrency.symbol as any, // NEED TO FIX
      sourceName: contractData.sourceName,
      body: args,
    });

    // Wait for logger animation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log result
    pop();
    if (verifyContractResp.isSuccess) {
      add(`✅ Verifying smart contract successfully`, { color: 'success' });
      add(
        <a
          href={`${
            getChain(`${chain?.network}` as InternalChain).chainExplorer
              .homePage
          }/address/${contractAddress}//read-contract`}
          target="_blank"
        >
          🌍 Contract URL:{' '}
          <span className="underline">
            {`${
              getChain(`${chain?.network}` as InternalChain).chainExplorer
                .homePage
            }/address/${contractAddress}//read-contract`}
          </span>
        </a>,
      );
    } else {
      add(`⚠️ ${verifyContractResp?.message}`, {
        color: 'warning',
      });
    }
  }

  return { generate, compile, abi, deploy, verify };
}
