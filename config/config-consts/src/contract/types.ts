import { supportContractType } from './const';
import { ContractRemovePatternEnum, ContractTypeEnum } from './enum';
import {
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { InternalChainEnum } from '@jventures-jdn/config-chains';

export class OriginalContractRequest {
  @IsEnum(supportContractType)
  @IsNotEmpty()
  contractType: ContractTypeEnum;
}

export class GeneratedContractRequest extends OriginalContractRequest {
  @IsString()
  @IsNotEmpty()
  contractName: string;
}

export class GenerateContractRequest extends GeneratedContractRequest {
  @IsObject()
  @IsOptional()
  disable?: {
    supplyCap?: boolean;
    mintable?: boolean;
    burnable?: boolean;
    pausable?: boolean;
  };
}

export class JobRequest {
  @IsNumberString()
  @IsNotEmpty()
  jobId: number;
}

export class VerifyERC20ContractRequest extends GeneratedContractRequest {
  @IsEnum(InternalChainEnum)
  @IsNotEmpty()
  chainName: InternalChainEnum;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  sourceName: string;

  @IsObject()
  @IsNotEmpty()
  body: {
    symbol: string;
    name: string;
    initialSupply: bigint;
    supplyCap: bigint;
    mintable?: boolean;
    burnable?: boolean;
    pausable?: boolean;
  };
}
