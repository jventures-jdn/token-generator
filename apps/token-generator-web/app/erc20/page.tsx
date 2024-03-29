'use client';

import { LoggerStore, LoggerWindow } from '../../../../libs/react-logger';
import React, { useEffect } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useErc20 } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import {
  RangeInput,
  TextInput,
  ToggleInput,
} from '@jventures-jdn/react-component';
import { useDeployErc20 } from './deployer';

export default function ERC20Page() {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    isDisabled,
    account,
    maxSupply,
    minSupply,
    stepSupply,
    fieldStates,
    setFieldStates,
  } = useErc20();
  const { openConnectModal } = useConnectModal();
  const { clear, setLoading } = LoggerStore.getState();
  const { generate, compile, abi, deploy, verify } = useDeployErc20();

  /* --------------------------------- Schema --------------------------------- */
  const schema = z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(1, 'Name is required')
      .max(100, 'Symbol must be less than 100 characters')
      .regex(
        /^[a-zA-Z][A-Za-z0-9 _]+$/,
        'Name must be alphanumeric space underscore and must start with a letter',
      ),
    symbol: z
      .string({ required_error: 'Symbol is required' })
      .min(1, 'Symbol is required')
      .max(10, 'Symbol must be less than 10 characters')
      .regex(
        /^[a-zA-Z][A-Za-z0-9 _]+$/,
        'Symbol must be alphanumeric space underscore and must start with a letter',
      ),
    recipient: z
      .string({ required_error: 'Recipient is required' })
      .refine((v) => /^0x[a-fA-F0-9]{40}$/.test(v), 'Invalid address'),
    initialSupply: z
      .string()
      .regex(/^\d+$/, 'Initial supply must be number')
      .transform(Number),
    supplyCap: z.optional(
      z
        .string()
        .regex(/^(\s*|\d+)$/, 'Supply cap must be number')
        .transform(Number),
    ),
    burnable: z.boolean(),
    burner: z
      .string({ required_error: 'Burner address is required' })
      .refine(
        (v) => !fieldStates['burner'] || /^0x[a-fA-F0-9]{40}$/.test(v),
        'Invalid address',
      ),
    minter: z
      .string({ required_error: 'Minter address is required' })
      .refine(
        (v) => !fieldStates['minter'] || /^0x[a-fA-F0-9]{40}$/.test(v),
        'Invalid address',
      ),
    pauser: z
      .string({ required_error: 'Pauser address is required' })
      .refine(
        (v) => !fieldStates['pauser'] || /^0x[a-fA-F0-9]{40}$/.test(v),
        'Invalid address',
      ),
    transferor: z
      .string({ required_error: 'Trasnferor address is required' })
      .refine(
        (v) => !fieldStates['transferor'] || /^0x[a-fA-F0-9]{40}$/.test(v),
        'Invalid address',
      ),
  });

  /* ---------------------------------- Form ---------------------------------- */
  const { handleSubmit, control, unregister, setValue, watch } = useForm<
    typeof schema._type
  >({
    resolver: zodResolver(schema),
    shouldUnregister: true,
  });

  const onSubmit = async (data: typeof schema._type) => {
    const handler = async () => {
      const _fieldStates = {
        ...fieldStates,
        burnable: data.burnable,
      };
      clear();
      setLoading('🚀 Contract Processing ...');
      await generate(data.name, _fieldStates);
      await compile(data.name);
      const contractData = await abi(data.name);
      const deployResult = await deploy(data, _fieldStates, contractData);
      await verify(
        data.name,
        contractData,
        deployResult.contractAddress,
        deployResult.args,
      );
    };

    await handler().finally(() => setLoading(undefined));
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  const [initialSupply, supplyCap] = watch(['initialSupply', 'supplyCap']);

  useEffect(() => {
    if (+initialSupply > +supplyCap) {
      setValue('supplyCap', initialSupply, { shouldValidate: true });
    }
  }, [initialSupply]);

  useEffect(() => {
    if (+supplyCap < +initialSupply)
      setValue('initialSupply', supplyCap, { shouldValidate: true });
  }, [supplyCap]);

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  const ERC20Form = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-5 h-screen-nav-form overflow-y-auto">
        {/* --------------------------- Information Section -------------------------- */}
        <div className="gap-2 flex flex-col">
          <TextInput
            controller={{
              control: control,
              name: 'name',
              defaultValue: '',
              rules: { required: true },
              disabled: isDisabled,
            }}
            title="Name"
            tooltip={{
              text: 'Name of the token, must be alphanumeric space underscore and must start with a letter',
            }}
          />
          <TextInput
            controller={{
              control: control,
              name: 'symbol',
              defaultValue: '',
              rules: { required: true },
              disabled: isDisabled,
            }}
            title="Symbol"
            tooltip={{
              text: 'Symbol of the token, must be alphanumeric space underscore and must start with a letter',
            }}
          />
          <TextInput
            controller={{
              control: control,
              name: 'recipient',
              defaultValue: account.address,
              rules: { required: true },
              disabled: isDisabled,
            }}
            title="Recipient"
            tooltip={{
              text: 'Recipient address who received the initial token when smart contract deployed',
            }}
          />
        </div>

        {/* ----------------------------- Supply Section ----------------------------- */}
        <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex flex-col gap-5">
          {/* Initial Supply */}
          <RangeInput
            controller={{
              control: control,
              name: 'initialSupply',
              defaultValue: '1000000',
              rules: { required: true },
              disabled: isDisabled,
            }}
            min={minSupply}
            max={maxSupply}
            step={stepSupply}
            title="Initial Supply"
            tooltip={{
              text: 'Initial token amount that will be mint to recipient address',
            }}
          />

          {/* Supply Cap */}
          <RangeInput
            controller={{
              control: control,
              name: 'supplyCap',
              defaultValue: '5000000',
              rules: { required: true },
              disabled: isDisabled,
              unregister,
            }}
            min={minSupply}
            max={maxSupply}
            step={stepSupply}
            toggleFields={{ setter: setFieldStates, value: fieldStates }}
            title="Supply Cap"
            tooltip={{
              text: 'The maximum token supply in contract',
            }}
          />
        </div>

        {/* ----------------------------- Feature Section ---------------------------- */}
        <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex flex-col gap-4">
          {/* Burnable */}
          <ToggleInput
            controller={{
              control: control,
              name: 'burnable',
              defaultValue: true,
              rules: { required: true },
              disabled: isDisabled,
            }}
            title="Burnable"
            tooltip={{ text: 'Can users burn their own tokens?' }}
          />

          {/* AdminBurn */}
          <TextInput
            controller={{
              control: control,
              name: 'burner',
              defaultValue: account.address,
              rules: { required: true },
              disabled: isDisabled,
            }}
            title="Admin Burn"
            tooltip={{ text: 'Can admins(burner) burn user tokens?' }}
            toggleFields={{ setter: setFieldStates, value: fieldStates }}
          />

          {/* Mintable */}
          <TextInput
            controller={{
              control: control,
              name: 'minter',
              defaultValue: account.address,
              rules: { required: true },
              disabled: isDisabled,
            }}
            size="xs"
            title="Mintable"
            tooltip={{ text: 'Can admins(minter) mint tokens?' }}
            toggleFields={{ setter: setFieldStates, value: fieldStates }}
          />

          {/* Pausable */}
          <TextInput
            controller={{
              control: control,
              name: 'pauser',
              defaultValue: account.address,
              rules: { required: true },
              disabled: isDisabled,
            }}
            size="xs"
            title="Pausable"
            tooltip={{ text: 'Can admins(pauser) pause transfers?' }}
            toggleFields={{ setter: setFieldStates, value: fieldStates }}
          />

          {/* Admin Transfer */}
          <TextInput
            controller={{
              control: control,
              name: 'transferor',
              defaultValue: account.address,
              rules: { required: true },
              disabled: isDisabled,
            }}
            size="xs"
            title="Admin Transfer"
            tooltip={{ text: 'Can admins(transferor) transfer user token?' }}
            toggleFields={{ setter: setFieldStates, value: fieldStates }}
          />
        </div>
      </div>

      {/* --------------------------------- Submit --------------------------------- */}
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
