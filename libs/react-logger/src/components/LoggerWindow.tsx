'use client';

import { useEffect, useRef } from 'react';
import React from 'react';
import { LoggerStore } from '../store';

export function LoggerWindow(
  props: JSX.IntrinsicElements['div'] & {
    title?: string;
  },
) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { logs, initiating, logSelectId, loading } = LoggerStore();
  const { setLoading } = LoggerStore.getState();
  const scroller = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const scrollToBottom = () => {
    scroller.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  /* -------------------------------------------------------------------------- */
  /*                                    Doms                                    */
  /* -------------------------------------------------------------------------- */
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
    <div
      className="logger-react-body p-5 overflow-y-auto overflow-x-clip relative"
      style={{ minHeight: 'calc(100% - 50px)' }}
    >
      <div className="text-sm break-all grid grid-cols-10 gap-y-2 text-gray-200">
        {logs[logSelectId].map((log, index) =>
          log.type === 'MESSAGE' ? (
            <React.Fragment key={index}>
              <span className="font-bold col-span-2 hidden xl:block">
                [{log.provider}]
              </span>
              <span className="col-span-10 xl:col-span-7 ml-2 md:ml-0 text-gray-300">
                {log.message}
              </span>
              <span className="col-span-1 text-xs text-right hidden xl:block text-gray-500">
                {log.date.toLocaleTimeString('en-GB')}
              </span>
            </React.Fragment>
          ) : (
            <React.Fragment key={index}>
              <span className="col-span-10">{log.message}</span>
            </React.Fragment>
          ),
        )}
        {!initiating[logSelectId] && !loading[logSelectId] && (
          <React.Fragment>
            <span className="col-span-2" />
            <span className="animate-pulse col-span-8">|</span>
          </React.Fragment>
        )}
      </div>
      {initiating[logSelectId] && (
        <div className="flex justify-center flex-col items-center absolute top-0 bottom-0 left-0 right-0 bg-gray-500/50">
          <div className="loading loading-ring loading-lg" />
          <div className="text-sm mt-2 text-gray-300">Loading</div>
        </div>
      )}
      {loading[logSelectId] && (
        <div className=" pt-10  relative">
          <div className="w-full bg-gradient-to-t from-base-100 to-base-300/0 p-5 rounded-lg flex justify-center flex-col items-center">
            <div className="loading loading-ring loading-lg" />
            <div className="text-sm mt-2 text-gray-300">Progressing</div>
            <div
              className="underline text-xs text-gray-500"
              onClick={() => setLoading(false)}
            >
              Cancel
            </div>
          </div>
        </div>
      )}
      <div ref={scroller} />
    </div>
  );

  return (
    <div
      className={`logger-react w-full h-full bg-gradient-to-tr from-base-100  to-base-200 rounded-lg ${
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
