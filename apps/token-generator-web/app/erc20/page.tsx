'use client';

import { LoggerStore, LoggerWindow } from '../../../../libs/react-logger';
import { ERC20CheckboxInput } from '@/components/Form/Input';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TextInput } from '@/components/Form/TextInput';
import { RangeInput } from '@/components/Form/RangeInput';
import { HiInformationCircle } from 'react-icons/hi';
import { GetAccountResult, getNetwork, watchAccount } from 'wagmi/actions';
import { PublicClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface ERC20Form {
  symbol: string;
  name: string;
  initialSupply: number;
  supplyCap: number;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
}

const ERC20FormDefaultState: ERC20Form = {
  symbol: '',
  name: '',
  initialSupply: 200000,
  supplyCap: 500000,
  mintable: false,
  burnable: false,
  pausable: false,
};

export default function ERC20Page() {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  watchAccount((account) => setAccount(account));

  const { openConnectModal } = useConnectModal();
  const { loading, logSelectId, initiating, newLine } = LoggerStore();
  const { add, clear, setLoading, setInitiating } = LoggerStore.getState();
  const [account, setAccount] = useState<GetAccountResult<PublicClient>>();
  const [form, setForm] = useState(ERC20FormDefaultState);
  const minSupply = 0;
  const maxSupply = 1000000;
  const stepSupply = 10000;
  const isDisabled = loading[logSelectId] || initiating[logSelectId];

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
      ? add(<span className="text-warning">Please connect your wallet</span>)
      : add(
          <span>
            <span>🔗 Connected: </span>
            <span className="underline font-bold">{account?.address}</span>
          </span>,
        );
  };

  const handleDeploy = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { chain } = getNetwork();
    setLoading(true);

    newLine();
    add(`🗳️ Deploy : ERC20 [${chain?.name}]`);
    add(
      <div className="flex flex-col gap-2 text-info">
        {Object.entries(form).map(([field, value]) => (
          <div key={field}>
            <span className="capitalize">{field}: </span>
            <span>{`${value}`}</span>
          </div>
        ))}
      </div>,
    );

    // const transaction = await deployContract({
    //   logger,
    //   abi: ERC20Generator__factory.abi,
    //   bytecode: ERC20Generator__factory.bytecode,
    //   args: [
    //     {
    //       symbol: form.symbol,
    //       name: form.name,
    //       initialSupply: BigInt(form.initialSupply) * CHAIN_DECIMAL,
    //       supplyCap: BigInt(form.supplyCap) * CHAIN_DECIMAL,
    //       mintable: form.mintable,
    //       burnable: form.burnable,
    //       pausable: form.pausable,
    //     },
    //   ],
    // });

    // if (!transaction?.contractAddress) return Promise.reject();

    // await verifyContract({
    //   logger,
    //   address: transaction?.contractAddress,
    //   contractName: 'contracts/ERC20/ERC20Generator.sol:ERC20Generator',
    //   args: [
    //     {
    //       symbol: form.symbol,
    //       name: form.name,
    //       initialSupply: (
    //         BigInt(form.initialSupply) * CHAIN_DECIMAL
    //       ).toString(),
    //       supplyCap: (BigInt(form.supplyCap) * CHAIN_DECIMAL).toString(),
    //       mintable: form.mintable,
    //       burnable: form.burnable,
    //       pausable: form.pausable,
    //     },
    //   ],
    // });
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  //   useEffect(() => {
  //     if (!chain?.id) return;
  //     setDefaultChain(chain);
  //   }, [chain]);

  useEffect(handleAccountChange, [account?.address]);
  useEffect(() => {
    setLoading(false);
    return () => {
      setLoading(false);
      setInitiating(false);
    };
  }, []);

  /* ---------------------------------- Doms ---------------------------------- */
  const ERC20Form = (
    <form className="p-5" onSubmit={handleDeploy}>
      <TextInput
        options={{
          key: 'symbol',
          title: 'Symbol',
          tooltip: 'Token Symbol',
          setter: setForm,
          value: form.symbol,
          disabled: isDisabled,
          icon: <HiInformationCircle />,
        }}
      />
      <TextInput
        options={{
          key: 'name',
          title: 'Name',
          tooltip: 'Token Name',
          setter: setForm,
          value: form.name,
          disabled: isDisabled,
          icon: <HiInformationCircle />,
        }}
      />

      <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex gap-5 flex-col">
        <RangeInput
          onChange={handleInitialSupplyChange}
          options={{
            key: 'initialSupply',
            title: 'Initial Supply',
            tooltip: 'Initial Supply',
            setter: setForm,
            value: form.initialSupply,
            disabled: isDisabled,
            icon: <HiInformationCircle />,
            min: minSupply,
            max: maxSupply,
            step: stepSupply,
          }}
        />

        <RangeInput
          onChange={handleSupplyCapChange}
          options={{
            key: 'supplyCap',
            title: 'Supply Cap',
            tooltip: 'Supply Cap',
            setter: setForm,
            value: form.supplyCap,
            disabled: isDisabled,
            icon: <HiInformationCircle />,
            min: minSupply,
            max: maxSupply,
            step: stepSupply,
          }}
        />
      </div>

      {/* Switch Case */}
      <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <ERC20CheckboxInput
          className="items-baseline sm:items-start lg:items-baseline xl:items-start"
          options={{
            key: 'mintable',
            title: 'Mintable',
            tooltip:
              '"Contract Owner" can mint more tokens (max at supply cap)',
            value: form.mintable,
            setter: setForm,
            disabled: isDisabled,
          }}
        />

        <ERC20CheckboxInput
          className="items-baseline sm:items-center lg:items-baseline xl:items-center"
          options={{
            key: 'burnable',
            title: 'Burnable',
            tooltip: '"Token Holder" can burn their own tokens',
            value: form.burnable,
            setter: setForm,
            disabled: isDisabled,
          }}
        />
        <ERC20CheckboxInput
          className="items-baseline sm:items-end lg:items-baseline  xl:items-end"
          options={{
            key: 'pausable',
            title: 'Pausable',
            tooltip: '"Contract Owner" can pause all activities on this token',
            value: form.pausable,
            setter: setForm,
            disabled: isDisabled,
          }}
        />
      </div>

      <button
        type={!account?.address ? 'button' : 'submit'}
        className="btn btn-primary  w-full mt-10 disabled:bg-primary/25"
        disabled={isDisabled}
        onClick={() => !account?.address && openConnectModal?.()}
      >
        Deploy
      </button>
    </form>
  );

  const ERC20Body = (
    <div className="h-full rounded-lg bg-base-100">
      <div className="relative flex items-center h-[50px] border-b border-base-300 p-5">
        <div className="text-center">ERC20 Token</div>
      </div>
      {ERC20Form}
    </div>
  );

  return (
    <div className="erc20-page page py-5">
      <div className="container min-h-screen-nav h-screen-nav">
        <div className="grid grid-cols-6 w-full h-full gap-5">
          <div className="col-span-6 lg:col-span-2">{ERC20Body}</div>
          <div className="col-span-6 lg:col-span-4">
            <LoggerWindow title="Token Deployer" className="font-spacemono " />
          </div>
        </div>
      </div>
    </div>
  );
}
