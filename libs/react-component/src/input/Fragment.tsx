import { HiInformationCircle } from 'react-icons/hi';

export type InputTooltipProps = {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: JSX.Element | string;
  open?: boolean;
};
export function InputTooltip({
  className,
  options,
}: {
  className?: JSX.IntrinsicElements['div'];
  options?: InputTooltipProps;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const tooltipPosition = options?.position
    ? `tooltip-${options?.position}`
    : 'tooltip-right';
  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
  if (!options) return;
  return (
    <div
      className={`tooltip tooltip-secondary ${tooltipPosition} ${
        className || ''
      }`}
      data-tip={options.text}
    >
      {options.icon || <HiInformationCircle />}
    </div>
  );
}
