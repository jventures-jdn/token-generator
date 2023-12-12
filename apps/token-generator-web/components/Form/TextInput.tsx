import { SetStateAction } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

export function TextInput<T>(
  props: JSX.IntrinsicElements['div'] & {
    options: {
      key: string;
      title?: string;
      tooltip?: string;
      value: string | number;
      setter: (value: SetStateAction<T>) => void;
      disabled?: boolean;
      icon?: JSX.Element;
      size?: 'xs' | 'sm' | 'md' | 'lg';
    };
  },
) {
  return (
    <div className={`form-control ${props.className || ''}`} {...props}>
      {props.options.title && (
        <label className="label">
          <span className="label-text flex items-center">
            <span>{props.options.title}</span>
            {props.options.tooltip && (
              <div
                className="tooltip tooltip-secondary ml-1"
                data-tip={props.options.tooltip}
              >
                <div>{props.options.icon}</div>
              </div>
            )}
          </span>
        </label>
      )}
      <input
        type="text"
        placeholder={props.options.title}
        onChange={(e) =>
          props.options.setter((form) => ({
            ...form,
            [props.options.key]: e.target.value,
          }))
        }
        value={props.options.value}
        required
        disabled={props.options?.disabled}
        className={`input input-bordered w-full disabled:bg-base-300/0 disabled:border-gray-400/25 input-xs  ${
          props.options.size
            ? `!input-${props.options.size}`
            : 'input-sm lg:input-md'
        }`}
      />
    </div>
  );
}
