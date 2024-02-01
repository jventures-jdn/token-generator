import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import {
  GeneratedContractDto,
  JobDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';
import { Throttle } from '@nestjs/throttler';
import { environmentConfig } from '@jventures-jdn/config-consts';
import { ContractProducer } from './contract.producer';

@ApiTags('contract')
@Controller({
  path: 'contract',
  version: '1',
})
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractProducer: ContractProducer,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     Get                                    */
  /* -------------------------------------------------------------------------- */
  /* -------------------------- Get Original Contract ------------------------- */
  @Get('original')
  @ApiOperation({ summary: 'Get original contract' })
  async getOriginalContract(@Query() payload: OriginalContractDto) {
    return this.contractService.readOriginalContract(payload);
  }

  /* ------------------------- Get Generated Contract ------------------------- */
  @Get('generated')
  @ApiOperation({ summary: 'Get generated contract' })
  async getGeneratedContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.readGeneratedContract(payload);
  }

  /* -------------------------- Get Compiled Contract ------------------------- */
  @Get('compiled')
  @ApiOperation({ summary: 'Get compiled contract' })
  async getCompiledContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.readCompiledContract(payload);
  }

  /* ---------------------------- Get Compiled ABI ---------------------------- */
  @Get('abi')
  @ApiOperation({ summary: 'Get compiled contract' })
  async getCompiledAbi(@Query() payload: GeneratedContractDto) {
    return this.contractService.readAbi(payload);
  }

  /* --------------------------------- Get Job -------------------------------- */
  @Get('job')
  @ApiOperation({ summary: 'Get job' })
  async getJob(@Query() payload: JobDto) {
    const job = await this.contractProducer.getJob(payload);
    return this.contractProducer.getJobStatus(job);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Post                                    */
  /* -------------------------------------------------------------------------- */
  /* ---------------------------- Generate contract --------------------------- */
  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 1, ttl: 10000 },
  }) // 1 req/10s
  @Post('generate')
  @ApiOperation({ summary: 'Generate contract' })
  async generateContract(@Body() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }

  /* ----------------------------- Add Compile Job ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 10000 },
  }) // 1 req/ 10s
  @Post('compile')
  @ApiOperation({ summary: 'Compile contract' })
  async compileContractJob(@Query() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addCompileJob(payload) };
  }

  /* ----------------------------- Add Verify Job ----------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 10000 },
  }) // 1 req/10s
  @Post('verify')
  @ApiOperation({ summary: 'Verify contract' })
  async verifyContractJob(@Query() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addVerifyJob(payload) };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */
  /* ------------------------ Remove Generated Contract ----------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 10000 },
  }) // 1 req/10s
  @Delete('generated')
  @ApiOperation({ summary: 'Remove generated contract' })
  async removeContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.removeContract(payload);
  }

  /* ------------------------------- Remove Job ------------------------------- */
  @Delete('job')
  @ApiOperation({ summary: 'Remove job' })
  async removeJob(@Query() payload: JobDto) {
    const job = await this.contractProducer.removeJob(payload);
    return {
      state: await job.getState(),
    };
  }
}
