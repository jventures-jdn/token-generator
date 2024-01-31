import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
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

  @Get('original')
  @ApiOperation({ summary: 'Get original contract' })
  async getOriginalContract(@Query() payload: OriginalContractDto) {
    return this.contractService.readOriginalContract(payload);
  }

  @Get('generated')
  @ApiOperation({ summary: 'Get generated contract' })
  async getGeneratedContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.readGeneratedContract(payload);
  }

  @Get('compiled')
  @ApiOperation({ summary: 'Get compiled contract' })
  async getCompiledContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.readCompiledContract(payload);
  }

  @Get('abi')
  @ApiOperation({ summary: 'Get compiled contract' })
  async getCompiledAbi(@Query() payload: GeneratedContractDto) {
    return this.contractService.readAbi(payload);
  }

  @Get('job')
  @ApiOperation({ summary: 'Get job' })
  async getJob(@Query() payload: JobDto) {
    const job = await this.contractProducer.getJob(payload);
    return this.contractProducer.getJobStatus(job);
  }

  @Delete('job')
  @ApiOperation({ summary: 'Remove job' })
  async removeJob(@Query() payload: JobDto) {
    const job = await this.contractProducer.removeJob(payload);
    return {
      state: await job.getState(),
    };
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/10s
  @Post('compile-job')
  @ApiOperation({ summary: 'Add compile contract job' })
  async compileContractJob(@Query() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addCompileJob(payload) };
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/10s
  @Post('verify-job')
  @ApiOperation({ summary: 'Add compile contract job' })
  async verifyContractJob(@Query() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addVerifyJob(payload) };
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/10s
  @Post('generate')
  @ApiOperation({ summary: 'Generate contract' })
  async generateContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/10s
  @Post('compile')
  @ApiOperation({ summary: 'Compile contract' })
  async compileContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.compileContract(payload);
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/10s
  @Delete('generated')
  @ApiOperation({ summary: 'Remove generated contract' })
  async removeContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.removeContract(payload);
  }
}
