import {
  ContractTypeEnum,
  GenerateContractRequest,
  JobRequest,
  OriginalContractRequest,
  VerifyERC20ContractRequest,
} from '@jventures-jdn/config-consts';
import { ApiProperty } from '@nestjs/swagger';
import { InternalChainEnum } from '@jventures-jdn/config-chains';

export class OriginalContractDto extends OriginalContractRequest {
  @ApiProperty({
    example: ContractTypeEnum.ERC20,
    enum: ContractTypeEnum,
  })
  declare contractType: ContractTypeEnum;
}

export class GeneratedContractDto
  extends OriginalContractDto
  implements GenerateContractRequest
{
  @ApiProperty({
    example: 'TOKEN_GENERATOR',
  })
  contractName: string;
}

export class JobDto extends JobRequest {
  @ApiProperty({
    example: '1',
  })
  declare jobId: number;
}

export class VerifyERC20ContractERC2Dto
  extends GeneratedContractDto
  implements VerifyERC20ContractRequest
{
  @ApiProperty({
    example: InternalChainEnum.JFIN,
    enum: InternalChainEnum,
  })
  chainName: InternalChainEnum;

  @ApiProperty({
    example: 'contracts/generated/erc20/TOKEN_GENERATOR.sol',
  })
  sourceName: string;

  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
  })
  address: string;

  @ApiProperty({
    example: {
      symbol: 'PH_TOKEN',
      name: 'Peaches_Token',
      initialSupply: '2000000000000',
      supplyCap: '5000000000000',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  })
  body: {
    symbol: string;
    name: string;
    initialSupply: bigint;
    supplyCap: bigint;
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
  };
}
