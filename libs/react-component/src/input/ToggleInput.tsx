import { UseControllerProps, useController } from 'react-hook-form';
import { InputTooltip, InputTooltipProps } from './Fragment';
import { HTMLInputTypeAttribute } from 'react';

export function ToggleInput<Inputs extends Record<string, any>>({
  controller,
  size,
  title,
  tooltip,
  hideMessage,
}: {
  controller: UseControllerProps<Inputs>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  tooltip?: InputTooltipProps;
  hideMessage?: boolean;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    field,
    formState: { errors },
  } = useController(controller);
  const inputSize = size ? `!toggle-${size}` : '';
  const error = errors[controller.name];
  const message = error?.message as string | undefined;

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="input-container">
      {/* Title */}
      <div className="flex items-center gap-2 label-text">
        {title && <label className="ml-1">{title}</label>}
        <InputTooltip options={tooltip} />
        <input
          {...field}
          type="checkbox"
          className={`toggle toggle-sm ${inputSize}`}
          disabled={field.disabled}
        />
      </div>

      {/* Message */}
      {!hideMessage && message && (
        <p className="text-xs text-error/70">{message}</p>
      )}
    </div>
  );
}