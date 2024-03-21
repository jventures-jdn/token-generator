import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ContractService } from './contract.service';
import { CompileContractDto } from '@jventures-jdn/api-fetcher';

@Processor('contract')
export class ContractConsumer {
  constructor(private readonly contractService: ContractService) {}

  /**
   * Compiles the generated contract.
   * @param {Job<CompileContractDto>} job The job payload containing `contractName` and `contractType` of contract
   * @returns Compiled output
   */
  @Process({ name: 'compile', concurrency: 5 })
  async compileContract(job: Job<CompileContractDto>) {
    return await this.contractService.compileContract(job);
  }
}
