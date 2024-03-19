import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcherAPI } from '@jventures-jdn/tools/fetcher';
import {
  GenerateContractRequest,
  JobRequest,
  OriginalContractRequest,
  VerifyERC20ContractRequest,
} from '@jventures-jdn/config-consts';
import JSONbig from 'json-bigint';

export default class ContractFetcherAPI {
  private readonly key = 'contract';
  private fetcher = fetcherAPI.fetch;

  /* ----------------------------------- Get ---------------------------------- */
  public fetch = this.fetcher;

  public getOriginalContract(payload: OriginalContractRequest) {
    return useSWR([`${this.key}/get/original`, payload], () =>
      this.fetcher('get', '/original', { config: { params: payload } }),
    );
  }

  public getGeneratedContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/generated`, payload], () =>
      this.fetcher('get', '/generated', { config: { params: payload } }),
    );
  }

  public getCompiledContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/compiled`, payload], () =>
      this.fetcher('get', '/compiled', { config: { params: payload } }),
    );
  }

  public getCompiledContractABI(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/abi`, payload], () =>
      this.fetcher('get', '/abi', { config: { params: payload } }),
    );
  }

  public getJob(payload: JobRequest) {
    return useSWR([`${this.key}/get/job`, payload], () =>
      this.fetcher('get', '/job', { config: { params: payload } }),
    );
  }

  /* ---------------------------------- Post ---------------------------------- */
  public generateContract() {
    return useSWRMutation(
      [`${this.key}/generate`],
      (_, { arg }: { arg: GenerateContractRequest }) => {
        return this.fetcher('post', '/generate', {
          body: arg,
        });
      },
    );
  }

  public compileContract() {
    return useSWRMutation(
      [`${this.key}/compile`],
      (_, { arg }: { arg: GenerateContractRequest }) => {
        return this.fetcher('post', '/compile', {
          body: arg,
        });
      },
    );
  }

  public verifyContract() {
    return useSWRMutation(
      [`${this.key}/verify`],
      (_, { arg }: { arg: VerifyERC20ContractRequest }) => {
        return this.fetcher('post', '/verify', {
          body: JSONbig({ storeAsString: true }).parse(
            JSONbig({ storeAsString: true }).stringify(arg),
          ),
        });
      },
    );
  }

  /* --------------------------------- Delete --------------------------------- */
  public removeGeneratedContract() {}

  public removeJob() {}
}

export const contractFetcherApi = new ContractFetcherAPI();
