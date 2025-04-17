import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcherAPI } from '@jventures-jdn/tools/fetcher';
import JSONbig from 'json-bigint';
import {
  CompileContractDto,
  CompileContractResponse,
  GenerateContractDto,
  GenerateContractResponse,
  GetAbiContractDto,
  GetAbiContractResponse,
  GetCompiledContractDto,
  GetCompiledContractResponse,
  GetGeneratedContractDto,
  GetGeneratedContractResponse,
  GetOriginalContractDto,
  GetOriginalContractResponse,
  JobDto,
  VerifyERC20ContractDto,
  VerifyERC20ContractResponse,
} from '../dto/contract';

export class ContractFetcherAPI {
  private readonly key = 'contract';
  private fetcher = fetcherAPI.fetch;

  /* ----------------------------------- Get ---------------------------------- */
  public fetch = this.fetcher;

  public getOriginalContract(payload: GetOriginalContractDto) {
    return useSWR([`${this.key}/get/original`, payload], () =>
      this.fetcher<GetOriginalContractResponse>('get', '/original', {
        config: { params: payload },
      }),
    );
  }

  public getGeneratedContract(payload: GetGeneratedContractDto) {
    return useSWR([`${this.key}/get/generated`, payload], () =>
      this.fetcher<GetGeneratedContractResponse>('get', '/generated', {
        config: { params: payload },
      }),
    );
  }

  public getCompiledContract(payload: GetCompiledContractDto) {
    return useSWR([`${this.key}/get/compiled`, payload], () =>
      this.fetcher<GetCompiledContractResponse>('get', '/compiled', {
        config: { params: payload },
      }),
    );
  }

  public getCompiledContractABI(payload: GetAbiContractDto) {
    return useSWR([`${this.key}/get/abi`, payload], () =>
      this.fetcher<GetAbiContractResponse>('get', '/abi', {
        config: { params: payload },
      }),
    );
  }

  public getJob(payload: JobDto) {
    return useSWR([`${this.key}/get/job`, payload], () =>
      this.fetcher('get', '/job', { config: { params: payload } }),
    );
  }

  /* ---------------------------------- Post ---------------------------------- */
  public generateContract() {
    return useSWRMutation(
      [`${this.key}/generate`],
      (_, { arg }: { arg: GenerateContractDto }) => {
        return this.fetcher<GenerateContractResponse>('post', '/generate', {
          body: arg,
        });
      },
    );
  }

  public compileContract() {
    return useSWRMutation(
      [`${this.key}/compile`],
      (_, { arg }: { arg: CompileContractDto }) => {
        return this.fetcher<CompileContractResponse>('post', '/compile', {
          body: arg,
        });
      },
    );
  }

  public verifyContract() {
    return useSWRMutation(
      [`${this.key}/verify`],
      (_, { arg }: { arg: VerifyERC20ContractDto }) => {
        return this.fetcher<VerifyERC20ContractResponse>('post', '/verify', {
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
