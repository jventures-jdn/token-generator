import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ContractService } from './contract.service';
import { GeneratedContractDto } from './contract.dto';

@Processor('contract')
export class ContractConsumer {
  constructor(private readonly contractService: ContractService) {}
  private readonly logger = new Logger('ContractConsumer');

  /**
   * Compiles the generated contract.
   * @param {Job<GeneratedContractDto>} job The job payload containing `contractName` and `contractType` of contract
   * @returns Compiled output
   */
  @Process({ name: 'compile', concurrency: 5 })
  async compileContract(job: Job<GeneratedContractDto>) {
    return await this.contractService.compileContract(job);
  }
}
