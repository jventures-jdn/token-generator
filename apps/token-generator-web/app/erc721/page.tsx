'use client';

import { useForm } from 'react-hook-form';
import { RangeInput, TextInput } from '@jventures-jdn/react-component';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

export default function ERC721Page() {
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
        'Name must be [alphanumeric,space,dash] and start with a letter',
      ),
    symbol: z
      .string({ required_error: 'Symbol is required' })
      .min(1, 'Symbol is required')
      .max(10, 'Symbol must be less than 10 characters')
      .regex(
        /^[a-zA-Z][A-Za-z0-9 _]+$/,
        'Symbol must be [alphanumeric,space,dash] and start with a letter',
      ),
    receiver: z
      .string({ required_error: 'Receiver is required' })
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
  });

  const [toggleFields, setToggleFields] = useState<{
    [key in keyof typeof schema._type]: boolean;
  }>({
    supplyCap: true,
  });

  const { handleSubmit, watch, control, unregister, setValue } = useForm<
    typeof schema._type
  >({
    resolver: zodResolver(schema),
    shouldUnregister: true,
  });

  const onSubmit = (data: typeof schema._type) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-base-100 p-5 flex gap-2 flex-col"
    >
      <TextInput
        controller={{
          control: control,
          name: 'name',
          defaultValue: '',
          rules: { required: true },
        }}
        title="Name"
        tooltip={{ text: 'Name of the token' }}
      />
      <TextInput
        controller={{
          control: control,
          name: 'symbol',
          defaultValue: '',
          rules: { required: true },
        }}
        title="Symbol"
        tooltip={{ text: 'Symbol of the token' }}
      />
      <TextInput
        controller={{
          control: control,
          name: 'receiver',
          defaultValue: '0x058860089f3ac315346cc7eb12010aee8f712a39',
          rules: { required: true },
        }}
        title="Receiver"
        tooltip={{ text: 'Receiver address' }}
      />

      <div className="border border-gray-400/25 p-3 pb-5 rounded-lg mt-5 flex flex-col gap-5">
        <RangeInput
          controller={{
            control: control,
            name: 'initialSupply',
            defaultValue: '0',
            rules: { required: true },
          }}
          title="Initial Supply"
          tooltip={{ text: 'Initial Supply' }}
        />
        <RangeInput
          controller={{
            control: control,
            name: 'supplyCap',
            defaultValue: '0',
            rules: { required: true },
            unregister,
            setValue,
          }}
          toggleFields={{ setter: setToggleFields, value: toggleFields }}
          title="Supply Cap"
          tooltip={{ text: 'Supply Cap' }}
        />
      </div>
      <input type="submit" className="btn-submit my-5" />
    </form>
  );
}
