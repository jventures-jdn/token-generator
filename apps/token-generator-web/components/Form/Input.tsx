import { SetStateAction } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

export const ERC20TextInput = <T extends Object>(props: {
  className?: JSX.IntrinsicElements['div']['className'];
  style?: JSX.IntrinsicElements['div']['style'];
  id?: JSX.IntrinsicElements['div']['id'];
  key?: JSX.IntrinsicElements['div']['key'];
  options: {
    key: string;
    title: string;
    tooltip?: string;
    value: string;
    setter: (value: SetStateAction<T>) => void;
    disabled?: boolean;
  };
}) => (
  <div
    className={`form-control w-full ${props.className || ''}`}
    style={props.style}
    id={props.id}
  >
    <label className="label">
      <span className="label-text flex items-center">
        <span>{props.options.title}</span>
        {props.options.tooltip && (
          <div
            className="tooltip tooltip-secondary ml-1"
            data-tip={props.options.tooltip}
          >
            <div>{/* <HiInformationCircle /> */}</div>
          </div>
        )}
      </span>
    </label>
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
      className="input input-sm lg:input-md input-bordered w-full disabled:bg-base-300/0 disabled:border-gray-400/25"
    />
  </div>
);

export const ERC20RangeInput = <T extends Object>(
  props: {
    className?: JSX.IntrinsicElements['div']['className'];
    style?: JSX.IntrinsicElements['div']['style'];
    id?: JSX.IntrinsicElements['div']['id'];
    key?: JSX.IntrinsicElements['div']['key'];
  } & {
    options: {
      key: string;
      title: string;
      tooltip?: string;
      value: number;
      setter: (value: SetStateAction<T>) => void;
      supplyMin?: number;
      supplyMax?: number;
      supplyStep?: number;
      disabled?: boolean;
    };
  },
) => (
  <div
    className={`form-control w-full ${props.className || ''}`}
    style={props.style}
    id={props.id}
  >
    <span className="label-text flex items-center">
      <span>
        {props.options.title} <b>{props.options.value.toLocaleString()}</b>
      </span>
      {props.options.tooltip && (
        <div
          className="tooltip tooltip-secondary ml-1"
          data-tip={props.options.tooltip}
        >
          <div>{/* <HiInformationCircle /> */}</div>
        </div>
      )}
    </span>
    <input
      type="range"
      min={props.options.supplyMin || 100000}
      max={props.options.supplyMax || 1000000}
      value={props.options.value}
      step={props.options.supplyStep || 100000}
      className="range range-sm lg:range:md mt-2 disabled:opacity-10 disabled:cursor-not-allowed"
      disabled={props.options?.disabled}
      onChange={(e) =>
        props.options.setter((form) => ({
          ...form,
          [props.options.key]: +e.target.value,
        }))
      }
    />
  </div>
);

export const ERC20CheckboxInput = <T extends Object>(
  props: {
    className?: JSX.IntrinsicElements['div']['className'];
    style?: JSX.IntrinsicElements['div']['style'];
    id?: JSX.IntrinsicElements['div']['id'];
    key?: JSX.IntrinsicElements['div']['key'];
  } & {
    options: {
      key: string;
      title: string;
      tooltip?: string;
      tooltipPosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
      value: boolean;
      setter: (value: SetStateAction<T>) => void;
      disabled?: boolean;
    };
  },
) => (
  <div
    className={`form-control w-full ${props.className || ''}`}
    style={props.style}
    id={props.id}
  >
    <label className="label">
      <span className="label-text flex items-center">
        <span>{props.options.title}</span>
        {props.options.tooltip && (
          <div
            className={`tooltip tooltip-secondary ml-1 text-left ${`tooltip-${
              props.options.tooltipPosition || 'center'
            }`}`}
            data-tip={props.options.tooltip}
          >
            <div>
              <HiInformationCircle />
            </div>
          </div>
        )}
      </span>
    </label>
    <input
      type="checkbox"
      className="toggle"
      checked={props.options.value}
      disabled={props.options.disabled}
      onChange={(e) =>
        props.options.setter((form) => ({
          ...form,
          [props.options.key]: e.target.checked,
        }))
      }
    />
  </div>
);
