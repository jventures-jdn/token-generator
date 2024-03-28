'use client';

import { Dispatch, SetStateAction, useEffect } from 'react';
import {
  UseControllerProps,
  UseFormUnregister,
  useController,
} from 'react-hook-form';
import { InputTooltipProps } from './Fragment';
import { TextInput } from '.';

export function RangeInput<
  Inputs extends Record<string, any>,
  FieldStates extends Record<string, any>,
>({
  controller,
  size,
  title,
  placeholder,
  tooltip,
  min,
  max,
  step,
  toggleFields,
}: {
  controller: UseControllerProps<Inputs> & {
    unregister?: UseFormUnregister<Inputs>;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  placeholder?: string;
  tooltip?: InputTooltipProps;
  min?: number;
  max?: number;
  step?: number;
  toggleFields?: {
    setter: Dispatch<SetStateAction<{ [key in keyof FieldStates]: boolean }>>;
    value: { [key in keyof FieldStates]: boolean };
  };
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    field,
    formState: { errors },
  } = useController(controller);
  const error = errors[controller.name];
  const message = error?.message as string | undefined;
  const disableFieldState = toggleFields?.value[controller.name];

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  // If input is disabled asuuming it is not required --> unregister validation
  useEffect(() => {
    if (disableFieldState === false) {
      controller?.unregister?.(controller.name as never);
    }
  }, [disableFieldState]);

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
        alwayShowInput
      />

      {/* Range Input */}
      <input
        type="range"
        min={min || 0}
        max={max || 100}
        step={step || 1}
        {...field}
        className={`range-input mt-1 ${
          size === 'xs'
            ? `!range-xs`
            : size === 'sm'
              ? '!range-sm'
              : size === 'md'
                ? '!range-md'
                : size === 'lg'
                  ? '!range-lg'
                  : '!range-sm'
        }`}
        disabled={field.disabled || disableFieldState === false}
      />

      {/* Message */}
      {message && <p className="ml-1 mt-1 text-xs text-error/70">{message}</p>}
    </div>
  );
}
