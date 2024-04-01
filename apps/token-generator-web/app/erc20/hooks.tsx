import { contractFetcherApi } from '@jventures-jdn/api-fetcher';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';
import { LoggerStore } from '@jventures-jdn/react-logger';
import { useEffect, useState } from 'react';
import { PublicClient } from 'wagmi';
import { GetAccountResult, getAccount, watchAccount } from 'wagmi/actions';

export function useErc20() {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  /* ---------------------------------- Hooks --------------------------------- */
  const {
    loading,
    setLoading,
    setInitiating,
    logSelectId,
    initiating,
    clear,
    add,
    pop,
  } = LoggerStore();
  const generateContract = contractFetcherApi.generateContract();

  /* ------------------------------ Field States ------------------------------ */
  const [fieldStates, setFieldStates] = useState({
    decimals: 18,
    supplyCap: true,
    minter: true,
    burner: false,
    pauser: true,
    transferor: false,
  });

  // State
  const minSupply = 0;
  const maxSupply = 10000000;
  const stepSupply = 500000;
  const isDisabled = !!loading[logSelectId] || initiating[logSelectId];

  // Account
  const [account, setAccount] =
    useState<GetAccountResult<PublicClient>>(getAccount());
  watchAccount((account) => setAccount(account));

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleAccountChange = () => {
    clear();
    !account?.address
      ? add('Please connect your wallet', { color: 'warning' })
      : add(
          <span>
            <span>🔗 Connected: </span>
            <span className="underline font-bold">{account?.address}</span>
          </span>,
          { color: 'success' },
        );
  };

  async function handleGenerate<
    T extends Record<string, any>,
    F extends Record<string, boolean>,
  >(data: T, features: F) {
    add(`✨ Generating contract ...`, { color: 'info' });
    // generate contract
    const generateContractResp = await generateContract.trigger({
      contractType: ContractTypeEnum.ERC20,
      contractName: data.name,
      disable: Object.entries(features).reduce(
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

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    handleAccountChange();
    if (!account.address) {
      setLoading(undefined);
      setInitiating(false);
    }
  }, [account.address]);
  useEffect(() => {
    setLoading(undefined);
    setInitiating(false);
    return () => {
      setLoading(undefined);
      setInitiating(false);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  return {
    minSupply,
    maxSupply,
    stepSupply,
    account,
    fieldStates,
    setFieldStates,
    handleAccountChange,
    handleGenerate,
    isDisabled,
  };
}
