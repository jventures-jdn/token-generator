import { supportContractType } from './const';
import { ContractTypeEnum } from './enum';
import { IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class OriginalContractRequest {
  @IsEnum(supportContractType)
  @IsNotEmpty()
  contractType: ContractTypeEnum;
}

export class GenerateContractRequest extends OriginalContractRequest {
  @IsString()
  @IsNotEmpty()
  contractName: string;
}

export class JobRequest {
  @IsNumberString()
  @IsNotEmpty()
  jobId: number;
}
