import useSWR from 'swr';
import { FetcherAPI } from '../shared';
import {
  GenerateContractRequest,
  OriginalContractRequest,
} from '@jventures-jdn/config-consts';

export class ContractFetcherAPI extends FetcherAPI {
  private readonly key = 'contract';

  /* ----------------------------------- Get ---------------------------------- */
  public getOriginalContract(payload: OriginalContractRequest) {
    return useSWR([`${this.key}/original`, payload], () =>
      this.fetch('get', '/original', { params: payload }),
    );
  }

  public getGeneratedContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/original`, payload], () =>
      this.fetch('get', '/generated', { params: payload }),
    );
  }

  public getCompiledContract(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/compiled`, payload], () =>
      this.fetch('get', '/compiled', { params: payload }),
    );
  }

  public getCompiledContractABI(payload: GenerateContractRequest) {
    return useSWR([`${this.key}/abi`, payload], () =>
      this.fetch('get', '/abi', { params: payload }),
    );
  }

  public getJob() {}

  /* ---------------------------------- Post ---------------------------------- */
  public generateContract() {}

  public compileContract() {}

  /* --------------------------------- Delete --------------------------------- */
  public removeGeneratedContract() {}

  public removeJob() {}
}

export const contractFetcherApi = new ContractFetcherAPI();
