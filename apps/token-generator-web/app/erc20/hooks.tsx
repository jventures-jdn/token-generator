import { LoggerStore } from '@jventures-jdn/react-logger';
import { ChangeEvent, useEffect, useState } from 'react';
import { PublicClient } from 'wagmi';
import { GetAccountResult, getAccount, watchAccount } from 'wagmi/actions';

export interface ERC20Form {
  symbol: string;
  name: string;
  initialSupply: number;
  supplyCap: number;
  payee?: string;
  transferor?: string;
  minter?: string;
  burner?: string;
  pauser?: string;
}

export const ERC20FormDefaultState: ERC20Form = {
  symbol: '',
  name: '',
  initialSupply: 2000000,
  supplyCap: 5000000,
  payee: '',
  transferor: undefined,
  minter: '',
  burner: '',
  pauser: '',
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
  const [feature, setFeature] = useState({
    supplyCap: true,
    mint: true,
    burn: true,
    adminBurn: false,
    pause: true,
    adminTransfer: false,
  });

  const minSupply = 0;
  const maxSupply = 10000000;
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
    // update feature admin
    setForm((form) => ({
      ...form,
      payee: form.payee || account?.address,
      minter: form.minter || account?.address,
      burner: form.burner || account?.address,
      pauser: form.pauser || account?.address,
      transferor: form.transferor || account?.address,
    }));
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(handleAccountChange, [account.address]);
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
    form,
    account,
    feature,
    handleInitialSupplyChange,
    handleSupplyCapChange,
    handleAccountChange,
    setFeature,
    setForm,
    isDisabled,
  };
}
