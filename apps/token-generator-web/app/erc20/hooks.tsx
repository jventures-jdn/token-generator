import { LoggerStore } from '@jventures-jdn/react-logger';
import { ChangeEvent, useEffect, useState } from 'react';
import { PublicClient } from 'wagmi';
import { GetAccountResult, getAccount, watchAccount } from 'wagmi/actions';

export interface ERC20Form {
  symbol: string;
  name: string;
  initialSupply: number;
  supplyCap: number;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
}

export const ERC20FormDefaultState: ERC20Form = {
  symbol: '',
  name: '',
  initialSupply: 200000,
  supplyCap: 500000,
  mintable: false,
  burnable: false,
  pausable: false,
};

export function useErc20() {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    loading,
    setLoading,
    setInitiating,
    logSelectId,
    initiating,
    clear,
    add,
  } = LoggerStore();
  const [form, setForm] = useState(ERC20FormDefaultState);
  const [account, setAccount] =
    useState<GetAccountResult<PublicClient>>(getAccount());

  const minSupply = 0;
  const maxSupply = 1000000;
  const stepSupply = 10000;
  const isDisabled = !!loading[logSelectId] || initiating[logSelectId];
  watchAccount((account) => setAccount(account));

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleInitialSupplyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (value > maxSupply || value < minSupply) return;
    if (value > form.supplyCap)
      setForm((form) => ({
        ...form,
        supplyCap: value,
      }));

    setForm((form) => ({
      ...form,
      initialSupply: value,
    }));
  };

  const handleSupplyCapChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (value > maxSupply || value < minSupply) return;
    if (value < form.initialSupply)
      setForm((form) => ({
        ...form,
        initialSupply: value,
      }));

    setForm((form) => ({
      ...form,
      supplyCap: value,
    }));
  };

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

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(handleAccountChange, [account.address]);
  useEffect(() => {
    setLoading(undefined);
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
    form,
    account,
    handleInitialSupplyChange,
    handleSupplyCapChange,
    handleAccountChange,
    setForm,
    isDisabled,
  };
}
