import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { ContractTypeEnum } from './enum';

export class OriginalContractDto {
  @IsEnum(ContractTypeEnum)
  @IsNotEmpty()
  @ApiProperty({
    example: ContractTypeEnum.ERC20,
    enum: ContractTypeEnum,
  })
  contractType: ContractTypeEnum;
}

export class GeneratedContractDto extends OriginalContractDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'TOKEN_GENERATOR',
  })
  contractName: string;
}

export class JobDto {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
  })
  jobId: number;
}
