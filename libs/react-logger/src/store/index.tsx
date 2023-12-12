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
  provider: string | JSX.Element;
  date: Date;
  type: 'MESSAGE' | 'NEWLINE';
}

interface ILoggerState {
  logSelectId: string;
  logs: Record<string, ILog[]>;
  loading: Record<string, boolean>;
  initiating: Record<string, boolean>;
  defaultProvider: string;
}

interface ILoggerAction {
  newLine: (options?: { id?: string }) => void;
  add: (
    message: ILog['message'],
    options?: { provider?: ILog['provider']; id?: string },
  ) => void;
  pop: (options?: { id?: string }) => void;
  clear: (options?: { id?: string }) => void;
  setLoading: (state: boolean, options?: { id?: string }) => void;
  setInitiating: (state: boolean, options?: { id?: string }) => void;
}

/* -------------------------------------------------------------------------- */
/*                                   Stores                                   */
/* -------------------------------------------------------------------------- */
export const LoggerStore = create<ILoggerState & ILoggerAction>()(
  immer(
    devtools((set, get) => ({
      /* --------------------------------- States --------------------------------- */
      logs: { main: [] },
      loading: { main: false },
      initiating: { main: true },
      defaultProvider: 'DEPLOYER',
      logSelectId: 'main',

      /* --------------------------------- Actions -------------------------------- */
      add(message, options) {
        set((state) => {
          state.logs[options?.id || get().logSelectId].push({
            date: new Date(),
            key: `${state.logs.length}`,
            provider: options?.provider || get().defaultProvider,
            message: message,
            type: 'MESSAGE',
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
          return state.logs;
        }, true);
      },

      clear(options) {
        set((state) => {
          state.logs[options?.id || get().logSelectId] = [];
        }, true);
      },

      setLoading(state, options) {
        set((_state) => {
          _state.loading[options?.id || get().logSelectId] = state;
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
