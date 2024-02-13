import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import React from 'react';

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */
interface ILog {
  key: string;
  message: string | JSX.Element | JSX.Element[];
  provider: string | JSX.Element | JSX.Element[];
  date: Date;
  type: 'MESSAGE' | 'NEWLINE';
  newLine?: boolean;
  color?: keyof typeof LoggerStoreColorEnum;
}

interface ILoggerState {
  logSelectId: string;
  logs: Record<string, ILog[]>;
  loading: Record<string, undefined | string | JSX.Element | JSX.Element[]>;
  initiating: Record<string, boolean>;
  defaultProvider: string;
}

interface ILoggerAction {
  newLine: (options?: { id?: string }) => void;
  add: (
    message: ILog['message'],
    options?: {
      provider?: ILog['provider'];
      id?: string;
      color?: ILog['color'];
      newLine?: ILog['newLine'];
    },
  ) => void;
  pop: (options?: { id?: string }) => void;
  clear: (options?: { id?: string }) => void;
  setLoading: (
    message: undefined | string | JSX.Element | JSX.Element[],
    options?: { id?: string },
  ) => void;
  setInitiating: (state: boolean, options?: { id?: string }) => void;
}

/* -------------------------------------------------------------------------- */
/*                                   Stores                                   */
/* -------------------------------------------------------------------------- */
export enum LoggerStoreColorEnum {
  'danger' = 'rgb(220 38 38)',
  'success' = 'rgb(22 163 74)',
  'warning' = 'rgb(234 88 12)',
  'info' = 'rgb(2 132 199)',
  'default' = '#d1d5db',
}

export const LoggerStore = create<ILoggerState & ILoggerAction>()(
  immer(
    devtools((set, get) => ({
      /* --------------------------------- States --------------------------------- */
      logs: { main: [] },
      loading: { main: undefined },
      initiating: { main: true },
      defaultProvider: 'DEPLOYER',
      logSelectId: 'main',

      /* --------------------------------- Actions -------------------------------- */
      add(message, options) {
        options?.newLine && get().newLine({ id: options.id });
        set((state) => {
          state.logs[options?.id || get().logSelectId].push({
            date: new Date(),
            key: `${state.logs.length}`,
            provider: options?.provider || get().defaultProvider,
            message: message,
            type: 'MESSAGE',
            color: options?.color,
            newLine: options?.newLine,
          });
        });
      },

      newLine(options) {
        set((state) => {
          state.logs[options?.id || get().logSelectId].push({
            date: new Date(),
            key: `${state.logs.length}`,
            provider: get().defaultProvider,
            message: (
              <React.Fragment
                key={state.logs[options?.id || get().logSelectId].length}
              >
                <br />
              </React.Fragment>
            ),
            type: 'NEWLINE',
          });
        });
      },

      pop(options) {
        set((state) => {
          state.logs[options?.id || get().logSelectId].pop();
        }, true);
      },

      clear(options) {
        set((state) => {
          state.logs[options?.id || get().logSelectId] = [];
        }, true);
      },

      setLoading(message, options) {
        set((_state) => {
          _state.loading[options?.id || get().logSelectId] = message;
        });
      },

      setInitiating(state, options) {
        set((_state) => {
          _state.initiating[options?.id || get().logSelectId] = state;
        });
      },
    })),
  ),
);
