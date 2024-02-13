import { supportContractType } from './const';
import { ContractTypeEnum } from './enum';
import {
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsString,
} from 'class-validator';
import { InternalChainEnum } from '@jventures-jdn/config-chains';

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

export class VerifyERC20ContractRequest extends GenerateContractRequest {
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
