import { SetStateAction } from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import { TextInput } from './TextInput';

export function RangeInput<T>(
  props: JSX.IntrinsicElements['div'] & {
    options: {
      key: string;
      title?: string;
      tooltip?: string;
      value: number;
      min?: number;
      max?: number;
      step?: number;
      setter: (value: SetStateAction<T>) => void;
      disabled?: boolean;
      icon?: JSX.Element;
    };
  },
) {
  return (
    <div className={`form-control ${props.className || ''}`} {...props}>
      <label className="label p-0">
        <span className="label-text  items-center flex gap-1">
          {props.options.title && <span>{props.options.title}</span>}
          {props.options.tooltip && (
            <div
              className="tooltip tooltip-secondary ml-1"
              data-tip={props.options.tooltip}
            >
              <div>{props.options.icon || <HiInformationCircle />}</div>
            </div>
          )}
        </span>
      </label>
      <span className="mt-2">
        <TextInput
          options={{
            key: props.options.key,
            tooltip: props.options.tooltip,
            setter: props.options.setter,
            value: props.options.value,
            disabled: props.options.disabled,
            icon: undefined,
            size: 'xs',
          }}
        />
      </span>
      <input
        type="range"
        min={props.options.min}
        max={props.options.max}
        value={props.options.value}
        step={props.options.step}
        className="range range-sm lg:range:md mt-2 disabled:opacity-10 disabled:cursor-not-allowed"
        disabled={props.options.disabled}
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
