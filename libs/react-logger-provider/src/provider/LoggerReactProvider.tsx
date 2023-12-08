'use client';

import React from 'react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */
enum colorEnum {
  'error' = '#ff5724',
  'success' = '#009485',
  'warning' = '#ff9900',
  'info' = '#2094f3',
  'default' = '#d1d5db',
}

export interface LoggerReactContextType {
  logs: ReactNode[];
  setHandleMessage: Dispatch<
    SetStateAction<
      | ((type: 'add' | 'newline' | 'pop', message?: ReactNode) => void)
      | undefined
    >
  >;
  addMessage: (
    message: string | ReactNode,
    color?: keyof typeof colorEnum,
  ) => void;
  addNewline: (line?: number) => void;
  popMessage: () => void;
  clearMessage: () => void;
  setLoading: Dispatch<SetStateAction<string | undefined>>;
  loading?: string;
}

const defaultValues: LoggerReactContextType = {
  logs: [],
  setHandleMessage: () => {},
  addMessage: () => {},
  addNewline: () => {},
  popMessage: () => <></>,
  clearMessage: () => {},
  setLoading: () => {},
  loading: undefined,
};

export const LoggerReactContext =
  createContext<LoggerReactContextType>(defaultValues);
export function useLoggerReact() {
  return useContext(LoggerReactContext);
}

/* -------------------------------------------------------------------------- */
/*                                  Provider                                  */
/* -------------------------------------------------------------------------- */
export function LoggerReactProvider({ children }: { children: ReactNode }) {
  /* --------------------------------- States --------------------------------- */
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [loading, setLoading] = useState<string>();
  const [handleMessage, setHandleMessage] =
    useState<(type: 'add' | 'newline' | 'pop', message?: ReactNode) => void>();

  /* --------------------------------- Methods -------------------------------- */
  const addMessage = (
    message: string | ReactNode,
    color?: keyof typeof colorEnum,
  ) => {
    const isString = typeof message === 'string';
    if (!isString)
      setLogs((logs) => [
        ...logs,
        <span style={{ color: color ? colorEnum[color] : colorEnum.default }}>
          {message}
        </span>,
      ]);
    else
      setLogs((logs) => [
        ...logs,
        <div style={{ color: color ? colorEnum[color] : colorEnum.default }}>
          {message}
        </div>,
      ]);
    handleMessage && handleMessage('add', message);
  };

  const addNewline = (line = 1) => {
    setLogs((logs) => [
      ...logs,
      Array(line)
        .fill(0)
        .map((index) => (
          <React.Fragment key={index}>
            <br />
          </React.Fragment>
        )),
    ]);
    handleMessage && handleMessage('newline', <br />);
  };

  const popMessage = () => {
    setLogs((logs) => {
      logs.pop();
      return logs;
    });
    handleMessage && handleMessage('pop');
  };

  const clearMessage = () => {
    setLogs((_) => []);
  };

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <>
      <LoggerReactContext.Provider
        value={{
          logs,
          loading,
          setHandleMessage,
          addMessage,
          addNewline,
          popMessage,
          clearMessage,
          setLoading,
        }}
      >
        {children}
      </LoggerReactContext.Provider>
    </>
  );
}
