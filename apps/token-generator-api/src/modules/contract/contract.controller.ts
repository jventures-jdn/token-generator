import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ContractService } from './contract.service';
import {
  ContractTypeEnum,
  GeneratedContractDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';

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

  @Post('generate')
  @ApiOperation({ summary: 'Generated contract' })
  async generateContract(@Query() payload: GeneratedContractDto) {
    return this.contractService.generateContract(payload);
  }
}
