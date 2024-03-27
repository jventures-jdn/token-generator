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
      className={`tooltip tooltip-secondary hidden md:flex ${
        options?.position === 'top'
          ? `!tooltip-top`
          : options?.position === 'bottom'
            ? '!tooltip-bottom'
            : options?.position === 'left'
              ? '!tooltip-left'
              : options?.position === 'right'
                ? '!tooltip-right'
                : '!tooltip-right'
      } ${className || ''}`}
      data-tip={options.text}
    >
      {options.icon || <HiInformationCircle />}
    </div>
  );
}
