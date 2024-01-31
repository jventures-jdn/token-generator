import { GeneratedContractDto } from '@jventures-jdn/config-consts';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('contract')
export class ContractConsumer {
  constructor() {}

  @Process({ name: 'compile', concurrency: 1 })
  async compileContract(job: Job<GeneratedContractDto>) {
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

  @Process({ name: 'verify', concurrency: 1 })
  async verifyContract(job: Job<GeneratedContractDto>) {
    console.log('compileContract', job);
  }
}
