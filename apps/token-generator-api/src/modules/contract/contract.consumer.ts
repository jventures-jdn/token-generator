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

  @Process({ name: 'verify', concurrency: 5 })
  async verifyContract(job: Job<GeneratedContractDto>) {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      progress += 1;
      await job.progress(progress);
      console.log(job.id, progress);
    }
    await job.moveToCompleted();
    return {};
  }
}
