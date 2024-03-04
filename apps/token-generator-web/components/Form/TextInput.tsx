import { SetStateAction } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

export function TextInput<
  T extends { data: Record<K, any>; validation?: Record<K, boolean> },
  K extends keyof T['data'],
>(
  props: JSX.IntrinsicElements['div'] & {
    tooltip?: {
      value?: string;
      position?: 'left' | 'right' | 'center' | 'top' | 'bottom';
      icon?: JSX.Element;
    };
    required?: boolean;
    inputProps?: JSX.IntrinsicElements['input'];
    title?: string;
    disabled?: boolean;
    validation?: ((value: unknown) => boolean) | RegExp;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    options: {
      key: K;
      form: T;
      setter: (value: SetStateAction<T>) => void;
    };
  },
) {
  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isError = props.validation
      ? typeof props.validation === 'function'
        ? !props.validation(e.target.value)
        : !props.validation.test(e.target.value)
      : undefined;

    props.options.setter((form) => ({
      ...form,
      data: {
        ...form.data,
        [props.options.key]: e.target.value,
      },
      validation: {
        ...form.validation,
        [props.options.key]: isError,
      },
    }));
  };
  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className={`form-control ${props.className || ''}`} {...props}>
      {/* --------------------------------- Tooltip -------------------------------- */}
      {props.title && (
        <label className="label">
          <span className="label-text flex items-center">
            <span>{props.title}</span>
            {props.tooltip && (
              <div
                className="tooltip tooltip-secondary ml-1"
                data-tip={props.tooltip.value}
              >
                <div>{props.tooltip.icon || <HiInformationCircle />}</div>
              </div>
            )}
          </span>
        </label>
      )}

      {/* ---------------------------------- Input --------------------------------- */}
      <input
        {...props.inputProps}
        type="text"
        placeholder={props.title}
        onChange={handleValueChange}
        value={props.options.form?.data?.[props.options.key]}
        required={true && props.required}
        disabled={props.disabled}
        className={`input input-bordered w-full disabled:bg-base-300/0 disabled:border-gray-400/25 input-xs  ${
          props.size ? `!input-${props.size}` : 'input-sm lg:input-md'
        } ${
          props.options.form?.validation?.[props.options.key]
            ? 'input-error'
            : ''
        }`}
      />
    </div>
  );
}
