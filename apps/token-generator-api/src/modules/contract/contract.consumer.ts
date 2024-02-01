import { GeneratedContractDto } from '@jventures-jdn/config-consts';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ContractService } from './contract.service';
import { spawn } from 'child_process';
import { join } from 'path';
import { InternalServerErrorException } from '@nestjs/common';

@Processor('contract')
export class ContractConsumer {
  constructor(private readonly contractService: ContractService) {}

  /**
   * Compiles the generated contract.
   * @param {Job<GeneratedContractDto>} job The job payload containing `contractName` and `contractType` of contract
   * @returns Compiled output
   */
  @Process({ name: 'compile', concurrency: 1 })
  async compileContract(job: Job<GeneratedContractDto>) {
    // if giving generated contract name is not exist, throw error
    await this.contractService.readGeneratedContract(job.data);

    // create execute streams
    const command = spawn('npx hardhat compile', {
      cwd: join(__dirname, '../'),
      shell: true,
    });

    return new Promise((resolve, reject) => {
      let output = '';

      // log in data
      command.stdout.on('data', (data) => {
        output += `\n${data.toString()}`;
        console.log(data.toString());
      });

      // reject on error
      command.stderr.on('data', async (data) => {
        console.error(data.toString());
        await Promise.all([
          job.moveToFailed({ message: data.toString() }),
          job.progress(100),
        ]);
        reject(
          new InternalServerErrorException({
            error: data.toString(),
            cause: 'hardhat',
          }),
        );
      });

      // resolve on exit
      command.on('exit', async () => {
        await Promise.all([job.moveToCompleted(output), job.progress(100)]);
        resolve(output);
      });
    });
  }

  @Process({ name: 'verify', concurrency: 1 })
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
