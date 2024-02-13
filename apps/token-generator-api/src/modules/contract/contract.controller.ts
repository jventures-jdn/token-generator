import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { Throttle } from '@nestjs/throttler';
import { environmentConfig } from '@jventures-jdn/config-consts';
import { ContractProducer } from './contract.producer';
import {
  GeneratedContractDto,
  JobDto,
  OriginalContractDto,
  VerifyERC20ContractERC2Dto,
} from './contract.dto';

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
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 10000 },
  }) // 1 req/1s
  @Post('generate')
  @ApiOperation({ summary: 'Generate contract' })
  async generateContract(@Body() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }

  /* ----------------------------- Add Compile Job ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('compile-job')
  @ApiOperation({ summary: 'Compile contract job' })
  async compileContractJob(@Body() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addCompileJob(payload) };
  }

  /* ---------------------------- Compile Contract ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('compile')
  @ApiOperation({ summary: 'Compile contract' })
  async compileContract(@Body() payload: GeneratedContractDto) {
    return await this.contractService.compileContract(payload);
  }

  /* ----------------------------- Verify Contract ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('verify')
  @ApiOperation({ summary: 'Verify contract' })
  async verifyContract(@Body() payload: VerifyERC20ContractERC2Dto) {
    return await this.contractService.verifyContract(payload);
  }

  /* ----------------------------- Add Verify Job ----------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/1s
  @Post('verify-job')
  @ApiOperation({ summary: 'Verify contract job' })
  async verifyContractJob(@Body() payload: GeneratedContractDto) {
    return { jobId: await this.contractProducer.addVerifyJob(payload) };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */
  /* ------------------------ Remove Generated Contract ----------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/1s
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
