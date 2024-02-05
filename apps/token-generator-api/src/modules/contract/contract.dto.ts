import {
  ContractTypeEnum,
  GenerateContractRequest,
  JobRequest,
  OriginalContractRequest,
} from '@jventures-jdn/config-consts';
import { ApiProperty } from '@nestjs/swagger';

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
