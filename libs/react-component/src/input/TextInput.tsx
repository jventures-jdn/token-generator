import { UseControllerProps, useController } from 'react-hook-form';
import { InputTooltip, InputTooltipProps } from './Fragment';
import { HTMLInputTypeAttribute } from 'react';

export function TextInput<Inputs extends Record<string, any>>({
  controller,
  type,
  size,
  title,
  placeholder,
  tooltip,
}: {
  controller: UseControllerProps<Inputs>;
  type?: HTMLInputTypeAttribute;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  placeholder?: string;
  tooltip?: InputTooltipProps;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { field, fieldState } = useController(controller);
  const inputSize = size ? `!input-${size}` : '';

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="input-controller text-input">
      {/* Title */}
      <div className="flex items-center gap-1 label-text ml-1">
        <label>{title}</label>
        <InputTooltip options={tooltip} />
      </div>

      {/* Input */}
      <input
        type={type}
        placeholder={placeholder || controller.name}
        className={`input input-basic ${inputSize}`}
        {...field}
      />

      {/* Message */}
    </div>
  );
}
