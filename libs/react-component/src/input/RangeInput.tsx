import { Dispatch, SetStateAction, useState } from 'react';
import {
  UseControllerProps,
  UseFormSetValue,
  UseFormUnregister,
  useController,
  useFieldArray,
} from 'react-hook-form';
import { InputTooltipProps } from './Fragment';
import { TextInput } from '.';

export function RangeInput<Inputs extends Record<string, any>>({
  controller,
  size,
  title,
  placeholder,
  tooltip,
  min,
  max,
  toggleFields,
}: {
  controller: UseControllerProps<Inputs> & {
    unregister?: UseFormUnregister<Inputs>;
    setValue?: UseFormSetValue<Inputs>;
  };

  textInputSize?: 'xs' | 'sm' | 'md' | 'lg';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  placeholder?: string;
  tooltip?: InputTooltipProps;
  min?: number;
  max?: number;
  toggleFields?: {
    setter: Dispatch<SetStateAction<{ [key in keyof Inputs]: boolean }>>;
    value: { [key in keyof Inputs]: boolean };
  };
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    field,
    formState: { errors },
  } = useController(controller);
  const rangeInputSize = size ? `!range-${size}` : 'range-sm';
  const error = errors[controller.name];
  const message = error?.message as string | undefined;

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="input-container">
      {/* Text Input */}
      <TextInput
        controller={controller}
        title={title}
        placeholder={placeholder}
        tooltip={tooltip}
        type="number"
        size="xs"
        toggleFields={toggleFields}
        hideMessage
      />

      {/* Range Input */}
      <input
        type="range"
        min={min || 0}
        max={max || 100}
        {...field}
        className={`range-input mt-1 ${rangeInputSize}`}
        disabled={field.disabled || !toggleFields?.value?.[controller.name]}
      />

      {/* Message */}
      {message && <p className="ml-1 mt-1 text-xs text-error/70">{message}</p>}
    </div>
  );
}
