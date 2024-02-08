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

  public fetch = <Response>(
    method: 'get' | 'post' | 'patch' | 'delete',
    path: string,
    options?: {
      body?: any;
      config?: AxiosRequestConfig;
    },
  ) => {
    return (
      ['post', 'patch'].includes(method)
        ? axios[method]<Response>(`${path}`, options?.body || {}, {
            baseURL: this.baseUrl,
            ...options?.config,
          })
        : axios[method]<Response>(`${path}`, {
            baseURL: this.baseUrl,
            ...options?.config,
          })
    )
      .then((res) => res.data)
      .catch((err) => {
        console.warn(`[${path}] An error occurred while fetching the data`, {
          cause:
            err?.response?.data?.message || err?.message || 'Unknown error',
        });
        return err.response.data;
      });
  };
}

export const fetcherAPI = new FetcherAPI();
