import { useState } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

export type InputTooltipProps = {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: JSX.Element | string;
  open?: boolean;
};
export function InputTooltip({
  title,
  id,
  text,
}: {
  title: string;
  id: string;
  text: string;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div>
      <div
        onClick={() => (document.getElementById(id) as any)?.showModal()}
        className="cursor-pointer"
      >
        {<HiInformationCircle />}
      </div>
      <dialog
        id={id}
        className="modal"
        onClick={() => (document.getElementById(id) as any)?.close()}
      >
        <div className={`modal-box ${open ? 'modal-open' : ''}`}>
          <h3 className="font-bold text-lg capitalize flex items-center gap-2">
            {title} <HiInformationCircle />
          </h3>
          <p className="py-4 text-md ">{text}</p>
        </div>
      </dialog>
    </div>
  );
}
