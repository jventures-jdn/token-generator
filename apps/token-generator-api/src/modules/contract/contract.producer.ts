import { GeneratedContractDto, JobDto } from '@jventures-jdn/config-consts';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Injectable()
export class ContractProducer {
  constructor(@InjectQueue('contract') private contractQueue: Queue) {}

  async addCompileJob(payload: GeneratedContractDto) {
    return (await this.contractQueue.add('compile', payload))?.id;
  }

  async addVerifyJob(payload: GeneratedContractDto) {
    return (await this.contractQueue.add('verify', payload))?.id;
  }

  async removeJob(payload: JobDto) {
    const job = await this.getJob(payload);
    await job.remove();
    return job;
  }

  async getJob(payload: JobDto) {
    const job: Job<GeneratedContractDto> = await this.contractQueue.getJob(
      payload.jobId,
    );

    if (!job) {
      throw new NotFoundException(undefined, {
        description: 'This jobId does not exist',
      });
    }

    return job;
  }

  async getJobStatus(payload: Job<GeneratedContractDto>) {
    const [
      state,
      progress,
      isCompleted,
      isWaiting,
      isFailed,
      isStuck,
      isActive,
      failedReason,
    ] = await Promise.all([
      payload.getState(),
      payload.progress(),
      payload.isCompleted(),
      payload.isWaiting(),
      payload.isFailed(),
      payload.isStuck(),
      payload.isActive(),
      payload.failedReason,
    ]);
    return {
      state,
      progress,
      isCompleted,
      isWaiting,
      isFailed,
      isStuck,
      isActive,
      failedReason: isFailed ? failedReason : undefined,
    };
  }
}
