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
  alwayShowInput,
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
  alwayShowInput?: boolean;
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
  const fieldState = toggleFields?.value[controller.name];
  const shouldShowField =
    fieldState === true || fieldState === undefined || alwayShowInput;
  const shouldDisableField = fieldState === false;

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  // If input is disabled asuuming it is not required --> unregister validation
  useEffect(() => {
    if (fieldState === false) {
      controller?.unregister?.(controller.name as never, { keepValue: false });
    }
  }, [fieldState]);

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
            checked={fieldState}
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
      {shouldShowField && (
        <input
          type={type}
          placeholder={placeholder || controller.name}
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
          {...field}
          disabled={field.disabled || shouldDisableField}
          ref={field.ref}
        />
      )}

      {/* Message */}
      {!hideMessage && message && (
        <p className="ml-1  text-xs text-error/70">{message}</p>
      )}
    </div>
  );
}
