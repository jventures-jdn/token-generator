import { environmentConfig } from '@jventures-jdn/config-consts';
import axios, { AxiosRequestConfig } from 'axios';

export class FetcherAPI {
  constructor(version?: number, endpoint?: string, baseUrl?: string) {
    this.version = version || 1;
    this.endpoint = endpoint || environmentConfig.tokenGeneratorApiEndpoint;
    this.baseUrl = baseUrl || `${this.endpoint}/v${this.version}/contract`;
  }

  protected readonly version: number;
  protected readonly endpoint: string;
  protected readonly baseUrl: string;

  protected fetch = <T extends Record<string, unknown>>(
    method: 'get' | 'post' | 'patch' | 'delete',
    path: string,
    config?: AxiosRequestConfig,
  ) =>
    axios[method]<T>(`${path}`, { baseURL: this.baseUrl, ...config })
      .then((res) => res.data)
      .catch((err) => {
        return new Error(
          `[${path}] An error occurred while fetching the data`,
          {
            cause: err?.message || 'Unknown error',
          },
        );
      });
}
