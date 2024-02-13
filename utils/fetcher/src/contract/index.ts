import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { FetcherAPI } from '../shared';
import {
  GenerateContractRequest,
  JobRequest,
  OriginalContractRequest,
  VerifyERC20ContractRequest,
} from '@jventures-jdn/config-consts';
import JSONbig from 'json-bigint';

export class ContractFetcherAPI extends FetcherAPI {
  private readonly key = 'contract';

  /* ----------------------------------- Get ---------------------------------- */
  public getOriginalContract(payload: OriginalContractRequest) {
    return useSWR([`${this.key}/get/original`, payload], () =>
      this.fetch('get', '/original', { config: { params: payload } }),
    );
  }

  public getGeneratedContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/generated`, payload], () =>
      this.fetch('get', '/generated', { config: { params: payload } }),
    );
  }

  public getCompiledContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/compiled`, payload], () =>
      this.fetch('get', '/compiled', { config: { params: payload } }),
    );
  }

  public getCompiledContractABI(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/get/abi`, payload], () =>
      this.fetch('get', '/abi', { config: { params: payload } }),
    );
  }

  public getJob(payload: JobRequest) {
    return useSWR([`${this.key}/get/job`, payload], () =>
      this.fetch('get', '/job', { config: { params: payload } }),
    );
  }

  /* ---------------------------------- Post ---------------------------------- */
  public generateContract() {
    return useSWRMutation(
      [`${this.key}/generate`],
      (_, { arg }: { arg: GenerateContractRequest }) => {
        return this.fetch('post', '/generate', {
          body: arg,
        });
      },
    );
  }

  public compileContract() {
    return useSWRMutation(
      [`${this.key}/compile`],
      (_, { arg }: { arg: GenerateContractRequest }) => {
        return this.fetch('post', '/compile', {
          body: arg,
        });
      },
    );
  }

  public verifyContract() {
    return useSWRMutation(
      [`${this.key}/verify`],
      (_, { arg }: { arg: VerifyERC20ContractRequest }) => {
        return this.fetch('post', '/verify', {
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
