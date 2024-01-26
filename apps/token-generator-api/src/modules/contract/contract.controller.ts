import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import {
  GeneratedContractDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';
import { Throttle } from '@nestjs/throttler';
import { environmentConfig } from '@jventures-jdn/config-consts';

@ApiTags('contract')
@Controller({
  path: 'contract',
  version: '1',
})
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

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

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 60000 },
  }) // 1 req/1min
  @Post('generate')
  @ApiOperation({ summary: 'Generate contract' })
  async generateContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 60000 },
  }) // 1 req/1min
  @Post('compile')
  @ApiOperation({ summary: 'Compile contract' })
  async compileContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.compileContract(payload);
  }

  @Throttle({
    default: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 60000 },
  }) // 1 req/1min
  @Delete('generated')
  @ApiOperation({ summary: 'Remove generated contract' })
  async removeContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.removeContract(payload);
  }
}
