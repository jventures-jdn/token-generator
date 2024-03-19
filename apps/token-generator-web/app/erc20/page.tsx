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
import { contractFetcherApi } from '@jventures-jdn/api-fetcher';
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
    setFeature,
    isDisabled,
    minSupply,
    maxSupply,
    stepSupply,
    feature,
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
      disable: Object.entries(feature).reduce(
        (prev, [index, value]) => {
          prev[index] = !value;
          return prev;
        },
        {} as Record<string, boolean>,
      ),
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
    const args = {
      symbol: form.symbol,
      name: form.name.replace('_', ' '),
      payee: form.payee,
      initialSupply: BigInt(form.initialSupply) * CHAIN_DECIMAL,
      ...(feature.supplyCap && {
        supplyCap: BigInt(form.supplyCap) * CHAIN_DECIMAL,
      }),
      ...(feature.adminTransfer && {
        transferor: form.transferor,
      }),
      ...(feature.mint && { minter: form.minter }),
      ...(feature.adminBurn && { burner: form.burner }),
      ...(feature.pause && { pauser: form.pauser }),
    };
    const contractAddress = await deployContract('ERC20', {
      abi: getABIResp.data.abi,
      bytecode: getABIResp.data.bytecode,
      feature: feature,
      args,
    });

    setLoading('📝 Verifying smart contract ...');
    add(`📝 Verifying smart contract ...`, { color: 'info' });
    const verifyContractResp = await verifyContract.trigger({
      contractName: form.name,
      contractType: ContractTypeEnum.ERC20,
      address: contractAddress,
      chainName: chain.nativeCurrency.symbol as any, // NEED TO FIX
      sourceName: getABIResp.data.sourceName,
      body: args,
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
      onSubmit={(e) => handleDeploy(e).finally(() => setLoading(undefined))}
    >
      <div className="p-5 h-screen-nav-form overflow-y-auto">
        <TextInput
          options={{
            inputProps: {
              pattern: '[a-zA-Z][A-Za-z0-9_]*',
            },
            key: 'name',
            title: 'Name',
            tooltip: 'Contract Name',
            setter: setForm,
            value: form.name,
            disabled: isDisabled,
            icon: <HiInformationCircle />,
            size: 'sm',
          }}
        />
        <TextInput
          options={{
            inputProps: {
              pattern: '[a-zA-Z][A-Za-z0-9_]*',
            },
            key: 'symbol',
            title: 'Symbol',
            tooltip: 'Token Symbol',
            setter: setForm,
            value: form.symbol,
            disabled: isDisabled,
            icon: <HiInformationCircle />,
            size: 'sm',
          }}
        />
        <TextInput
          options={{
            inputProps: {
              pattern: '(0x)?[0-9a-fA-F]{40}',
            },
            key: 'payee',
            title: 'Payee',
            tooltip: 'Address who receive initial balance',
            tooltipPosition: 'right',
            setter: setForm,
            value: form.payee,
            disabled: isDisabled,
            icon: <HiInformationCircle />,
            size: 'sm',
          }}
        />

        <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex flex-col gap-5">
          <RangeInput
            onChange={handleInitialSupplyChange}
            options={{
              key: 'initialSupply',
              tooltip: 'Initial Supply',
              title: 'Initial Supply',
              setter: setForm,
              value: form.initialSupply,
              disabled: isDisabled,
              icon: <HiInformationCircle />,
              min: minSupply,
              max: maxSupply,
              step: stepSupply,
            }}
          />

          <div>
            <span className="label-text  items-center flex">
              <span>Supply Cap</span>
              <div
                className="tooltip tooltip-secondary ml-1"
                data-tip={'Supply Cap'}
              >
                <div>{<HiInformationCircle />}</div>
              </div>
              <div
                className="tooltip tooltip-secondary ml-1"
                data-tip={'Turn off/on supply cap'}
              >
                <ERC20CheckboxInput
                  className="w-auto ml-3"
                  options={{
                    key: 'supplyCap',
                    tooltipPosition: 'right',
                    value: feature.supplyCap,
                    setter: setFeature,
                    disabled: isDisabled,
                    size: 'sm',
                  }}
                />
              </div>
            </span>

            <RangeInput
              onChange={handleSupplyCapChange}
              options={{
                key: 'supplyCap',
                setter: setForm,
                value: form.supplyCap,
                disabled: isDisabled || !feature.supplyCap,
                icon: <HiInformationCircle />,
                min: minSupply,
                max: maxSupply,
                step: stepSupply,
              }}
            />
          </div>
        </div>

        {/* -------------------------------- Features -------------------------------- */}
        <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex flex-col gap-3">
          {/* Burnable */}
          <div className="flex flex-col gap-2">
            <div className="label-text items-center flex gap-3">
              <span>Burnable</span>
              <ERC20CheckboxInput
                className="!w-auto"
                options={{
                  key: 'burn',
                  tooltipPosition: 'right',
                  value: feature.burn,
                  setter: setFeature,
                  disabled: isDisabled,
                  size: 'sm',
                }}
              />
              <div
                className="tooltip tooltip-secondary"
                data-tip="Turn off/on burn functionality"
              >
                <div>{<HiInformationCircle />}</div>
              </div>
            </div>
          </div>
          {/* Admin burn */}
          <div className="flex flex-col gap-2">
            <div className="label-text items-center flex gap-3">
              <span>Admin Burn</span>
              <ERC20CheckboxInput
                className="!w-auto"
                options={{
                  key: 'adminBurn',
                  tooltipPosition: 'right',
                  value: feature.adminBurn,
                  setter: setFeature,
                  disabled: isDisabled,
                  size: 'sm',
                }}
              />
              <div
                className="tooltip tooltip-secondary"
                data-tip="Turn off/on adminBurn functionality"
              >
                <div>{<HiInformationCircle />}</div>
              </div>
            </div>
            {feature.adminBurn && (
              <TextInput
                options={{
                  inputProps: {
                    pattern: '(0x)?[0-9a-fA-F]{40}',
                  },
                  placeholder: 'Burner Address',
                  key: 'burner',
                  setter: setForm,
                  value: form.burner,
                  disabled: isDisabled || !feature.adminBurn,
                  icon: <HiInformationCircle />,
                  size: 'sm',
                }}
              />
            )}
          </div>
          {/* Mintable */}
          <div className="flex flex-col gap-2">
            <div className="label-text items-center flex gap-3">
              <span>Mintable</span>
              <ERC20CheckboxInput
                className="!w-auto"
                options={{
                  key: 'mint',
                  tooltipPosition: 'right',
                  value: feature.mint,
                  setter: setFeature,
                  disabled: isDisabled,
                  size: 'sm',
                }}
              />
              <div
                className="tooltip tooltip-secondary"
                data-tip="Turn off/on mint functionality"
              >
                <div>{<HiInformationCircle />}</div>
              </div>
            </div>
            {feature.mint && (
              <TextInput
                options={{
                  inputProps: {
                    pattern: '(0x)?[0-9a-fA-F]{40}',
                  },
                  placeholder: 'Minter Address',
                  key: 'minter',
                  setter: setForm,
                  value: form.minter,
                  disabled: isDisabled || !feature.mint,
                  icon: <HiInformationCircle />,
                  size: 'sm',
                }}
              />
            )}
          </div>
          {/* Pausable */}
          <div className="flex flex-col gap-2">
            <div className="label-text items-center flex gap-3">
              <span>Pausable</span>
              <ERC20CheckboxInput
                className="!w-auto"
                options={{
                  key: 'pause',
                  tooltipPosition: 'right',
                  value: feature.pause,
                  setter: setFeature,
                  disabled: isDisabled,
                  size: 'sm',
                }}
              />
              <div
                className="tooltip tooltip-secondary"
                data-tip="Turn off/on pause/unpause functionality"
              >
                <div>{<HiInformationCircle />}</div>
              </div>
            </div>
            {feature.pause && (
              <TextInput
                options={{
                  inputProps: {
                    pattern: '(0x)?[0-9a-fA-F]{40}',
                  },
                  placeholder: 'Pauser Address',
                  key: 'pauser',
                  setter: setForm,
                  value: form.pauser,
                  disabled: isDisabled || !feature.pause,
                  icon: <HiInformationCircle />,
                  size: 'sm',
                }}
              />
            )}
          </div>
          {/* Admin Transfer */}
          <div className="flex flex-col gap-2">
            <div className="label-text items-center flex gap-3">
              <span>Admin Transfer</span>
              <ERC20CheckboxInput
                className="!w-auto"
                options={{
                  key: 'adminTransfer',
                  tooltipPosition: 'right',
                  value: feature.adminTransfer,
                  setter: setFeature,
                  disabled: isDisabled,
                  size: 'sm',
                }}
              />
              <div
                className="tooltip tooltip-secondary"
                data-tip="Turn off/on adminTransfer functionality"
              >
                <div>{<HiInformationCircle />}</div>
              </div>
            </div>
            {feature.adminTransfer && (
              <TextInput
                options={{
                  inputProps: {
                    pattern: '(0x)?[0-9a-fA-F]{40}',
                  },
                  placeholder: 'Transferor Address',
                  key: 'transferor',
                  setter: setForm,
                  value: form.transferor,
                  disabled: isDisabled || !feature.adminTransfer,
                  icon: <HiInformationCircle />,
                  size: 'sm',
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-black/25">
        <button
          type={!account ? 'button' : 'submit'}
          className="btn btn-primary  w-full disabled:bg-primary/25 "
          disabled={isDisabled}
          onClick={() => !account?.address && openConnectModal?.()}
        >
          Deploy
        </button>
      </div>
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
