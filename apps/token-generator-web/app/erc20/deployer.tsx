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

//! we should use type from form schema instead of redefining it
type _ERC20FormSchema = {
  name?: string;
  symbol?: string;
  recipient?: string;
  initialSupply?: number;
  supplyCap?: number;
  burnable?: boolean;
  burner?: string;
  minter?: string;
  pauser?: string;
  transferor?: string;
};

type _FieldStates = {
  supplyCap: boolean;
  minter: boolean;
  burner: boolean;
  pauser: boolean;
  transferor: boolean;
  burnable: boolean;
  decimals: number;
};

export function useDeployErc20() {
  /* --------------------------------- States --------------------------------- */
  // Hooks
  const { setLoading, add, pop } = LoggerStore();
  const generateContract = contractFetcherApi.generateContract();
  const compileContract = contractFetcherApi.compileContract();
  const verifyContract = contractFetcherApi.verifyContract();

  /* -------------------------------- Generate -------------------------------- */
  function generate(contractName: string, fieldStates: _FieldStates) {
    return new Promise<void>(async (resolve, reject) => {
      add(`✨ Generating contract ...`, { color: 'info' });

      // generate contract
      const generateContractResp = await generateContract.trigger({
        contractType: ContractTypeEnum.ERC20,
        contractName,
        disable: Object.entries(fieldStates).reduce(
          (prev, [index, value]) => {
            prev[index] = typeof value === 'number' ? value : !value;
            return prev;
          },
          {} as Record<string, boolean | number>,
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
        return reject('Contract name is already in used, Please try again');
      } else if (generateContractResp.status !== 201) {
        add(`🚫 ${generateContractResp.message}`, {
          color: 'warning',
        });
        return reject(generateContractResp.message);
      } else {
        add(`✅ Generate contract successfully`, {
          color: 'success',
        });
        return resolve();
      }
    });
  }

  /* --------------------------------- Compile -------------------------------- */
  function compile(contractName: string) {
    return new Promise<void>(async (resolve, reject) => {
      add(`⚙️ Compiling contract ...`, { color: 'info' });

      // compile contract
      const compileContractResp = await compileContract.trigger({
        contractType: ContractTypeEnum.ERC20,
        contractName,
      });

      // log result
      pop();
      if (compileContractResp.isSuccess) {
        add(`✅ Compiled contract successfully`, {
          color: 'success',
        });
        return resolve();
      } else {
        add(`⚠️ ${compileContractResp?.message}`, {
          color: 'warning',
        });
        return reject(compileContractResp?.message);
      }
    });
  }

  /* ----------------------------------- ABI ---------------------------------- */
  async function abi(contractName: string) {
    return new Promise<GetAbiContractResponse>(async (resolve, reject) => {
      add(`📝 Processing Bytecode & ABI ...`, { color: 'info' });

      // get abi
      const getABIResp = await contractFetcherApi.fetch<GetAbiContractResponse>(
        'get',
        '/abi',
        {
          config: {
            params: {
              contractType: ContractTypeEnum.ERC20,
              contractName,
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
        return reject(getABIResp?.message);
      }

      return resolve(getABIResp.data);
    });
  }

  async function deploy(
    data: _ERC20FormSchema,
    fieldStates: _FieldStates,
    contractData: GetAbiContractResponse,
  ) {
    return new Promise<{ contractAddress: string; args: Record<string, any> }>(
      async (resolve, reject) => {
        const { chain } = getNetwork();
        const walletClient = await getWalletClient({ chainId: chain?.id });
        const publicClient = await getPublicClient({ chainId: chain?.id });
        const gasPrice = await publicClient.getGasPrice();
        const transactionFeeDecimal = 10 ** 7;

        const args = {
          symbol: data.symbol,
          name: data.name,
          recipient: data.recipient,
          initialSupply:
            BigInt(data.initialSupply) * BigInt(10 ** fieldStates.decimals),
          ...(fieldStates.supplyCap && {
            supplyCap:
              BigInt(data.supplyCap) * BigInt(10 ** fieldStates.decimals),
          }),
          ...(fieldStates.transferor && {
            transferor: data.transferor,
          }),
          ...(fieldStates.minter && { minter: data.minter }),
          ...(fieldStates.burner && { burner: data.burner }),
          ...(fieldStates.pauser && { pauser: data.pauser }),
        };

        add(`🗳️ Deploying ERC20 to ${chain?.name}`, { color: 'info' });
        add(
          <div className="flex flex-col gap-2">
            {Object.entries({
              ...args,
              ...(data.burnable && { burnable: data.burnable }),
            }).map(([arg, value]) => (
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
                (transaction.gasUsed *
                  gasPrice *
                  BigInt(transactionFeeDecimal)) /
                  CHAIN_DECIMAL,
              ) / transactionFeeDecimal
            ).toLocaleString(undefined, { minimumFractionDigits: 7 })} ${
              chain?.nativeCurrency.symbol
            }`,
          );

          return resolve({
            contractAddress: transaction.contractAddress,
            args,
          });
        } catch (e: any) {
          add(e?.details || e?.message || 'Unknown', {
            color: 'danger',
          });
          return reject(e?.details || e?.message);
        } finally {
          setLoading(undefined);
        }
      },
    );
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
