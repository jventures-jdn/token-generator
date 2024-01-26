import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import {
  GeneratedContractDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';
import { Throttle } from '@nestjs/throttler';

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

  @Throttle({ default: { limit: 1, ttl: 60000 } }) // 1 req/1min
  @Post('generate')
  @ApiOperation({ summary: 'Generated contract' })
  async generateContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }
}
