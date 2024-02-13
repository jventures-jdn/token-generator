import { LoggerStore } from '@jventures-jdn/react-logger';
import {
  CHAIN_DECIMAL,
  InternalChain,
  getChain,
} from '@jventures-jdn/config-chains';
import { getNetwork, getPublicClient, getWalletClient } from 'wagmi/actions';

export async function deployContract(
  type: 'ERC20' | 'ERC721',
  options: {
    args: Record<string, any>;
    abi: readonly unknown[];
    bytecode: `0x${string}`;
  },
) {
  const { add, setLoading, pop } = LoggerStore.getState();
  const { chain } = getNetwork();
  const walletClient = await getWalletClient({ chainId: chain?.id });
  const publicClient = await getPublicClient({ chainId: chain?.id });
  const gasPrice = await publicClient.getGasPrice();
  const transactionFeeDecimal = 10 ** 7;

  /* ------------------------------- Initialize ------------------------------- */
  add(`🗳️ Deploying ${type} to ${chain?.name}`, { color: 'info' });
  add(
    <div className="flex flex-col gap-2">
      {Object.entries(options.args).map(([arg, value]) => (
        <div key={arg}>
          <span className="capitalize">{arg}: </span>
          <span>{`${value}`}</span>
        </div>
      ))}
    </div>,
    { color: 'info' },
  );

  /* --------------------------- Singin Transaction --------------------------- */
  setLoading('📝 Signing transaction...');
  const hash = await walletClient
    ?.deployContract({
      abi: options.abi,
      bytecode: options.bytecode,
      args: [options.args],
      chain: chain,
    })
    .catch((e) => {
      add(e?.details || e?.message || 'Unknown', {
        color: 'warning',
      });
      setLoading(undefined);
      return Promise.reject();
    });

  /* ----------------------------- Deploy Contract ---------------------------- */
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
    add(`✅  Deploying ${type} to ${chain?.name} successfully`, {
      color: 'success',
    });

    console.log(chain, getChain(`${chain?.name}` as InternalChain));
    add(
      <a
        href={`${
          getChain(`${chain?.network}` as InternalChain).chainExplorer.homePage
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
          getChain(`${chain?.network}` as InternalChain).chainExplorer.homePage
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

    return transaction.contractAddress;
  } catch (e: any) {
    add(e?.details || e?.message || 'Unknown', {
      color: 'danger',
    });
  } finally {
    setLoading(undefined);
  }
}
