import {
  UseControllerProps,
  UseFormUnregister,
  useController,
} from 'react-hook-form';
import { InputTooltip, InputTooltipProps } from './Fragment';
import {
  Dispatch,
  HTMLInputTypeAttribute,
  SetStateAction,
  useEffect,
} from 'react';

export function TextInput<Inputs extends Record<string, any>>({
  controller,
  type,
  size,
  title,
  placeholder,
  tooltip,
  toggleFields,
  hideMessage,
}: {
  controller: UseControllerProps<Inputs> & {
    unregister?: UseFormUnregister<Inputs>;
  };
  type?: HTMLInputTypeAttribute;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  placeholder?: string;
  tooltip?: InputTooltipProps;
  toggleFields?: {
    setter: Dispatch<SetStateAction<{ [key in keyof Inputs]: boolean }>>;
    value: { [key in keyof Inputs]: boolean };
  };
  hideMessage?: boolean;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const {
    field,
    formState: { errors },
  } = useController(controller);
  const inputSize = size ? `!input-${size}` : '';
  const error = errors[controller.name];
  const message = error?.message as string | undefined;
  const disableFieldState = toggleFields?.value[controller.name];

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  // If input is disabled asuuming it is not required --> unregister validation
  useEffect(() => {
    if (disableFieldState === false) {
      controller?.unregister?.(controller.name as never, { keepValue: false });
    }
  }, [disableFieldState]);

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="input-container">
      {/* Title */}
      <div className="flex items-center gap-1 label-text ml-1">
        <label>{title}</label>
        <InputTooltip options={tooltip} />
        {toggleFields && (
          <input
            checked={disableFieldState}
            onChange={() =>
              toggleFields.setter((s) => ({
                ...s,
                [controller.name]: !s[controller.name],
              }))
            }
            type="checkbox"
            className="ml-2 toggle toggle-sm"
            disabled={field.disabled}
          />
        )}
      </div>

      {/* Input */}
          className={`input text-input ${
            size === 'xs'
              ? `!input-xs`
              : size === 'sm'
                ? '!input-sm'
                : size === 'md'
                  ? '!input-md'
                  : size === 'lg'
                    ? '!input-lg'
                    : ''
          } ${message ? '!input-error' : ''}`}

      {/* Message */}
      {!hideMessage && message && (
        <p className="ml-1  text-xs text-error/70">{message}</p>
      )}
    </div>
  );
}
