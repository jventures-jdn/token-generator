'use client';

import { useLoggerReact } from '../provider/LoggerReactProvider';
import { useEffect, useRef } from 'react';
import React from 'react';

export function LoggerReact(props: {
  className?: JSX.IntrinsicElements['div']['className'];
  style?: JSX.IntrinsicElements['div']['style'];
  id?: JSX.IntrinsicElements['div']['id'];
  key?: JSX.IntrinsicElements['div']['key'];
  loading?: boolean;
  title?: string;
  user?: string;
}) {
  /* --------------------------------- States --------------------------------- */
  const { logs, loading } = useLoggerReact();
  const scroller = useRef<HTMLDivElement>(null);

  /* --------------------------------- Methods -------------------------------- */
  const scrollToBottom = () => {
    scroller.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* --------------------------------- Watches -------------------------------- */
  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  /* ---------------------------------- Doms ---------------------------------- */
  const LoggerReactHead = (
    <div className="logger-react-head rounded-t-lg relative flex items-center bg-base-100 h-[50px] border-b border-base-300 p-5">
      <div className="flex gap-2">
        <div className="p-[7px] bg-red-400 w-0 h-0 rounded-full" />
        <div className="p-[7px] bg-yellow-400 w-0 h-0 rounded-full" />
        <div className="p-[7px] bg-green-400 w-0 h-0 rounded-full" />
      </div>
      <div className="absolute left-0 right-0 text-center">
        {props.title || 'Logger'}
      </div>
    </div>
  );

  const LoggerReactBody = (
    <div className="logger-react-body p-5 overflow-y-auto overflow-x-clip h-[calc(100vh_-_208px)] font-spacemono">
      <div className="text-sm text-gray-300 break-all">
        {logs.map((log, index) => (
          <React.Fragment key={index}>{log}</React.Fragment>
        ))}
      </div>
      {!loading ? (
        <div>
          <span className="font-bold">
            {props.user || '$'} {'>'}
          </span>{' '}
          <span className="animate-pulse">|</span>
          <div ref={scroller} />
        </div>
      ) : (
        <div className="flex justify-center pt-10 flex-col items-center">
          <div className="loading loading-ring loading-lg" />
          <div className="text-sm">{loading}</div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`logger-react w-full h-full bg-gradient-to-br from-base-100  to-base-200 rounded-lg ${
        props.className || ''
      }`}
      id={props.id}
      style={props.style}
      key={props.key}
    >
      {LoggerReactHead}
      {LoggerReactBody}
    </div>
  );
}
