'use client';

import { UseControllerProps, useController } from 'react-hook-form';
import { InputTooltip, InputTooltipProps } from './Fragment';

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
        <InputTooltip title={title} id={controller.name} text={tooltip.text} />
        <input
          {...field}
          defaultChecked={field.value}
          type="checkbox"
          className={`toggle toggle-sm ${
            size === 'xs'
              ? `!toggle-xs`
              : size === 'sm'
                ? '!toggle-sm'
                : size === 'md'
                  ? '!toggle-md'
                  : size === 'lg'
                    ? '!toggle-lg'
                    : ''
          }`}
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
