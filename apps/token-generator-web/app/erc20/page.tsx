'use client';

import { LoggerStore, LoggerWindow } from '../../../../libs/react-logger';
import { ERC20CheckboxInput } from '@/components/Form/Input';
import React, { FormEvent } from 'react';
import { TextInput } from '@/components/Form/TextInput';
import { RangeInput } from '@/components/Form/RangeInput';
import { HiInformationCircle } from 'react-icons/hi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  CHAIN_DECIMAL,
  InternalChain,
  getChain,
} from '@jventures-jdn/config-chains';
import { useErc20 } from './hooks';
import { deployContract } from './deploy';
import { contractFetcherApi } from '@jventures-jdn/fetcher';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';
import { getNetwork } from 'wagmi/actions';

export default function ERC20Page() {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    form,
    account,
    handleInitialSupplyChange,
    handleSupplyCapChange,
    setForm,
    isDisabled,
    minSupply,
    maxSupply,
    stepSupply,
  } = useErc20();
  const { openConnectModal } = useConnectModal();
  const { add, clear, setLoading, pop } = LoggerStore.getState();
  const { chain } = getNetwork();
  const generateContract = contractFetcherApi.generateContract();
  const compileContract = contractFetcherApi.compileContract();
  const verifyContract = contractFetcherApi.verifyContract();

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleDeploy = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clear();
    setLoading('🚀 Contract Processing ...');

    /* ---------------------------- Generate Cotnract --------------------------- */
    add(`✨ Generating contract ...`, { color: 'info' });
    const generateContractResp = await generateContract.trigger({
      contractType: ContractTypeEnum.ERC20,
      contractName: form.name,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
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

    /* ---------------------------- Compile contract ---------------------------- */
    add(`⚙️ Compiling contract ...`, { color: 'info' });
    const compileContractResp = await compileContract.trigger({
      contractType: ContractTypeEnum.ERC20,
      contractName: form.name,
    });

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

    /* --------------------------------- Get ABI -------------------------------- */
    add(`📝 Processing Bytecode & ABI ...`, { color: 'info' });
    const getABIResp = await contractFetcherApi.fetch('get', '/abi', {
      config: {
        params: {
          contractType: ContractTypeEnum.ERC20,
          contractName: form.name,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    pop();
    if (compileContractResp.isSuccess) {
      add(`✅ Processing Bytecode & ABI successfully`, { color: 'success' });
    } else {
      add(`⚠️ ${compileContractResp?.message}`, {
        color: 'warning',
      });
    }

    const contractAddress = await deployContract('ERC20', {
      abi: getABIResp.data.abi,
      bytecode: getABIResp.data.bytecode,
      args: {
        symbol: form.symbol,
        name: form.name,
        initialSupply: BigInt(form.initialSupply) * CHAIN_DECIMAL,
        supplyCap: BigInt(form.supplyCap) * CHAIN_DECIMAL,
        mintable: form.mintable,
        burnable: form.burnable,
        pausable: form.pausable,
      },
    });

    setLoading('📝 Verifying smart contract ...');
    add(`📝 Verifying smart contract ...`, { color: 'info' });
    const verifyContractResp = await verifyContract.trigger({
      contractName: form.name,
      contractType: ContractTypeEnum.ERC20,
      address: contractAddress,
      chainName: chain.nativeCurrency.symbol as any, // NEED TO FIX
      sourceName: getABIResp.data.sourceName,
      body: {
        symbol: form.symbol,
        name: form.name,
        initialSupply: BigInt(form.initialSupply) * CHAIN_DECIMAL,
        supplyCap: BigInt(form.supplyCap) * CHAIN_DECIMAL,
        mintable: form.mintable,
        burnable: form.burnable,
        pausable: form.pausable,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
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
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  const ERC20Form = (
    <form
      className="p-5"
      onSubmit={(e) => handleDeploy(e).finally(() => setLoading(undefined))}
    >
      <TextInput
        options={{
          key: 'name',
          title: 'Name',
          tooltip: 'Contract Name',
          setter: setForm,
          value: form.name,
          disabled: isDisabled,
          icon: <HiInformationCircle />,
        }}
      />
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
      <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <ERC20CheckboxInput
          className="items-baseline sm:items-start lg:items-baseline xl:items-start"
          options={{
            key: 'mintable',
            title: 'Mintable',
            tooltip: 'Can mint more tokens',
            tooltipPosition: 'right',
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
            tooltip: 'Can burn own tokens',
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
            tooltip: 'Can pause all activities',
            tooltipPosition: 'left',
            value: form.pausable,
            setter: setForm,
            disabled: isDisabled,
          }}
        />
      </div>

      <button
        type={!account ? 'button' : 'submit'}
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
      <div className="container min-h-screen-nav">
        <div className="grid grid-cols-6 w-full h-full gap-5 ">
          <div className="col-span-6 lg:col-span-2">{ERC20Body}</div>
          <div className="col-span-6 lg:col-span-4 -order-1 md:order-1">
            <LoggerWindow
              title="Token Deployer"
              className="font-spacemono min-h-[50vh]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
