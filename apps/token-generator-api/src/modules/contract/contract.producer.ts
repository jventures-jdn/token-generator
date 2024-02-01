import { GeneratedContractDto, JobDto } from '@jventures-jdn/config-consts';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Injectable()
export class ContractProducer {
  constructor(@InjectQueue('contract') private contractQueue: Queue) {}

  /* ----------------------------- Add Compile Job ---------------------------- */
  /**
   * Add compile job to queue.
   *
   * @param {GeneratedContractDto} payload - Type and name of contract
   * @returns Job id
   */
  async addCompileJob(payload: GeneratedContractDto) {
    return (await this.contractQueue.add('compile', payload))?.id;
  }

  /* ----------------------------- Add Verify Job ----------------------------- */
  /**
   * Add verify job to queue.
   *
   * @param {GeneratedContractDto} payload - Type and name of contract
   * @returns Job id
   */
  async addVerifyJob(payload: GeneratedContractDto) {
    return (await this.contractQueue.add('verify', payload))?.id;
  }

  /* ------------------------------- Remove Job ------------------------------- */
  /**
   * Removes a job from queue.
   *
   * @param {JobDto} payload - The payload containing the jobId.
   * @returns The removed job.
   * @throws NotFoundException if the jobId does not exist.
   */
  async removeJob(payload: JobDto) {
    const job = await this.getJob(payload);
    await job.remove();
    return job;
  }

  /* --------------------------------- Get Job -------------------------------- */
  /**
   * Retrieves a job from the contract queue based on the provided payload.
   *
   * @param {JobDto} payload - The payload containing the jobId.
   * @returns The job object if found.
   * @throws NotFoundException if the jobId does not exist.
   */
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

  /* ----------------------------- Get Job Status ----------------------------- */
  /**
   * Retrieves the status of a job.
   *
   * @param {Job<GeneratedContractDto>} payload - The job payload.
   * @returns An object containing the job status properties.
   */
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
      completedMessage,
    ] = await Promise.all([
      payload.getState(),
      payload.progress(),
      payload.isCompleted(),
      payload.isWaiting(),
      payload.isFailed(),
      payload.isStuck(),
      payload.isActive(),
      payload.failedReason,
      payload.returnvalue,
    ]);

    return {
      state,
      progress,
      isCompleted,
      isWaiting,
      isFailed,
      isStuck,
      isActive,
      failedReason: isFailed ? failedReason : null,
      completedMessage: completedMessage,
    };
  }
}
