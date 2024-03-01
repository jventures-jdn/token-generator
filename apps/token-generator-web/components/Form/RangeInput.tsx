import { SetStateAction } from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import { TextInput } from './TextInput';

export function RangeInput<
  T extends { data: Record<K, any>; validation?: Record<K, boolean> },
  K extends keyof T['data'],
>(
  props: JSX.IntrinsicElements['div'] & {
    title?: string;
    tooltip?: {
      value?: string;
      position?: 'left' | 'right' | 'center' | 'top' | 'bottom';
      icon?: JSX.Element;
    };
    disabled?: boolean;
    validation?: ((value: unknown) => boolean) | RegExp;
    options: {
      key: K;
      form: T;
      min?: number;
      max?: number;
      step?: number;
      setter: (value: SetStateAction<T>) => void;
    };
  },
) {
  return (
    <div className={`form-control ${props.className || ''}`} {...props}>
      <label className="label p-0">
        <span className="label-text  items-center flex gap-1">
          <span>{props.title}</span>

          <TextInput
            className="ml-1"
            tooltip={props.tooltip}
            disabled={props.disabled}
            size="xs"
            options={{
              form: props.options.form,
              key: props.options.key,
              setter: props.options.setter,
            }}
          />
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
      <input
        type="range"
        min={props.options.min}
        max={props.options.max}
        value={props.options.form.data[props.options.key]}
        step={props.options.step}
        className="range range-sm lg:range:md mt-2 disabled:opacity-10 disabled:cursor-not-allowed"
        disabled={props.disabled}
        onChange={(e) => {
          props.onChange
            ? props.onChange(e)
            : props.options.setter((form) => ({
                ...form,
                [props.options.key]: +e.target.value,
              }));
        }}
      />
    </div>
  );
}
