import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { Throttle } from '@nestjs/throttler';
import {
  ContractTypeEnum,
  environmentConfig,
  supportContractType,
} from '@jventures-jdn/config-consts';
import { ContractProducer } from './contract.producer';
import {
  CompileContractDto,
  CompileContractResponse,
  CompileContractResponseExample,
  GenerateContractDto,
  GenerateContractResponse,
  GenerateContractResponseExample,
  GetAbiContractDto,
  GetAbiContractResponseExample,
  GetCompiledContractDto,
  GetCompiledContractResponseExample,
  GetGeneratedContractDto,
  GetGeneratedContractResponseExample,
  GetOriginalContractDto,
  GetOriginalContractResponseExample,
  JobDto,
  VerifyContractResponseExample,
  VerifyERC20ContractDto,
  VerifyERC20ContractResponse,
} from '@jventures-jdn/api-fetcher/dto';
import {
  CHAIN_DECIMAL,
  InternalChainEnum,
  InternalChains,
} from '@jventures-jdn/config-chains';

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
  @ApiQuery({
    enum: supportContractType,
    name: 'contractType',
  })
  @ApiOkResponse({ content: GetOriginalContractResponseExample })
  async getOriginalContract(@Query() payload: GetOriginalContractDto) {
    return this.contractService.readOriginalContract(payload);
  }

  /* ------------------------- Get Generated Contract ------------------------- */
  @Get('generated')
  @ApiOperation({ summary: 'Get generated contract' })
  @ApiQuery({
    enum: supportContractType,
    name: 'contractType',
  })
  @ApiQuery({
    example: 'ERC20Generator',
    name: 'contractName',
  })
  @ApiOkResponse({
    content: GetGeneratedContractResponseExample,
  })
  async getGeneratedContract(@Query() payload: GetGeneratedContractDto) {
    return this.contractService.readGeneratedContract(payload);
  }

  /* -------------------------- Get Compiled Contract ------------------------- */
  @Get('compiled')
  @ApiOperation({ summary: 'Get compiled contract' })
  @ApiQuery({
    enum: supportContractType,
    name: 'contractType',
  })
  @ApiQuery({
    example: 'ERC20Generator',
    name: 'contractName',
  })
  @ApiOkResponse({ content: GetCompiledContractResponseExample })
  async getCompiledContract(@Query() payload: GetCompiledContractDto) {
    return this.contractService.readCompiledContract(payload);
  }

  /* ---------------------------- Get Compiled ABI ---------------------------- */
  @Get('abi')
  @ApiQuery({
    enum: supportContractType,
    name: 'contractType',
  })
  @ApiQuery({
    example: 'ERC20Generator',
    name: 'contractName',
  })
  @ApiOkResponse({ content: GetAbiContractResponseExample })
  @ApiOperation({ summary: 'Get compiled contract' })
  async getCompiledAbi(@Query() payload: GetAbiContractDto) {
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contractType: {
          type: 'enum',
          enum: supportContractType,
          example: ContractTypeEnum.ERC20,
        },
        contractName: {
          type: 'string',
          example: 'ERC20Generator',
        },
        disable: {
          type: 'object',
          example: {
            supplyCap: true,
            minter: true,
            burnable: true,
            burner: false,
            pauser: true,
            transferor: false,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, content: GenerateContractResponseExample })
  async generateContract(
    @Body() payload: GenerateContractDto,
  ): Promise<GenerateContractResponse> {
    return this.contractService.generateContract(payload);
  }

  /* ----------------------------- Add Compile Job ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('compile-job')
  @ApiOperation({ summary: 'Compile contract job' })
  async compileContractJob(@Body() payload: CompileContractDto) {
    return { jobId: await this.contractProducer.addCompileJob(payload) };
  }

  /* ---------------------------- Compile Contract ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('compile')
  @ApiOperation({ summary: 'Compile contract' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contractType: {
          type: 'enum',
          enum: supportContractType,
          example: ContractTypeEnum.ERC20,
        },
        contractName: {
          type: 'string',
          example: 'ERC20Generator',
        },
      },
    },
  })
  @ApiOkResponse({ content: CompileContractResponseExample })
  async compileContract(
    @Body() payload: CompileContractDto,
  ): Promise<CompileContractResponse> {
    return await this.contractService.compileContract(payload);
  }

  /* ----------------------------- Verify Contract ---------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/ 1s
  @Post('verify')
  @ApiOperation({ summary: 'Verify contract' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contractType: {
          type: 'enum',
          enum: supportContractType,
          example: ContractTypeEnum.ERC20,
        },
        contractName: {
          type: 'string',
          example: 'ERC20Generator',
        },
        chainName: {
          type: 'enum',
          enum: InternalChains,
          example: InternalChainEnum.JFINT,
        },
        address: {
          type: 'string',
          example: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
        },
        sourceName: {
          type: 'string',
          example: 'contracts/generated/erc20/ERC20Generator.sol',
        },
        body: {
          type: 'object',
          example: {
            symbol: 'EX',
            name: 'Example',
            initialSupply: (BigInt(100000) * CHAIN_DECIMAL).toString(),
            supplyCap: (BigInt(500000) * CHAIN_DECIMAL).toString(),
            recipient: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
            transferor: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
            minter: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
            burner: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
            pauser: '0xC0cFA9025cE80f446FFDe9e9B6ee90EC130A3cD1',
          },
        },
      },
    },
  })
  @ApiOkResponse({ content: VerifyContractResponseExample })
  async verifyContract(
    @Body() payload: VerifyERC20ContractDto,
  ): Promise<VerifyERC20ContractResponse> {
    return await this.contractService.verifyContract(payload);
  }

  /* ----------------------------- Add Verify Job ----------------------------- */
  @Throttle({
    short: { limit: environmentConfig.isProduction ? 1 : 0, ttl: 1000 },
  }) // 1 req/1s
  @Post('verify-job')
  @ApiOperation({ summary: 'Verify contract job' })
  async verifyContractJob(@Body() payload: VerifyERC20ContractDto) {
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
  async removeContract(@Query() payload: GetGeneratedContractDto) {
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
