import {
  IsBoolean,
  IsBtcAddress,
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ContractTypeEnum,
  supportContractType,
} from '@jventures-jdn/config-consts';
import { InternalChainEnum } from '@jventures-jdn/config-chains';
import { convertObjectToExample } from './helper';

/* ------------------------------ Get Original ------------------------------ */
export class GetOriginalContractDto {
  @IsEnum(supportContractType)
  @IsNotEmpty()
  contractType: ContractTypeEnum;
}
export class GetOriginalContractResponse {
  raw: string;
  path: string;
}
export const GetOriginalContractResponseExample = convertObjectToExample({
  path: '/$User/.../contracts/generated/erc20/ERC20Generator.sol',
  raw: `contracts/ERC20Generator.sol\n// SPDX-License-Identifier: UNLICENSED\npragma solidity ^0.8.17;.......`,
} as GetOriginalContractResponse);

/* ------------------------------ Get Generated ----------------------------- */
export class GetGeneratedContractDto extends GetOriginalContractDto {
  @IsString()
  @IsNotEmpty()
  contractName: string;
}
export class GetGeneratedContractResponse extends GetOriginalContractResponse {}
export const GetGeneratedContractResponseExample = convertObjectToExample({
  path: '/$User/.../contracts/generated/erc20/ERC20Generator.sol',
  raw: `contracts/ERC20Generator.sol\n// SPDX-License-Identifier: UNLICENSED\npragma solidity ^0.8.17;.......`,
} as GetGeneratedContractResponse);

/* ------------------------------ Get Compiled ------------------------------ */
export class GetCompiledContractDto extends GetGeneratedContractDto {}
export class GetCompiledContractResponse {
  raw: Record<string, unknown>;
  path: string;
}
export const GetCompiledContractResponseExample = convertObjectToExample({
  path: '/$User/.../contracts/generated/erc20/ERC20Generator.sol',
  raw: {
    _format: 'hh-sol-artifact-1',
    contractName: 'ERC20Generator',
    sourceName: 'contracts/generated/erc20/ERC20Generator.sol',
    abi: [
      {
        inputs: [
          {
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
            ],
          },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
    ],
  },
} as GetCompiledContractResponse);

/* --------------------------------- Get Abi -------------------------------- */
export class GetAbiContractDto extends GetGeneratedContractDto {}
export type GetAbiContractResponse = {
  abi: Record<string, unknown>[];
  bytecode: `0x${string}`;
  sourceName: string;
};
export const GetAbiContractResponseExample = convertObjectToExample({
  abi: [
    {
      inputs: [
        {
          components: [
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
          ],
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
  ],
  bytecode:
    '0x60a06040523480156200001157600080fd5b5060405162004068380380620040688339818101604052810190620000379190620009e4565b80600001518160200151816003908162000052919062000c76565b50806004908162000064919062000c76565b5050506000600560006101000a8154816......',
  sourceName: 'contracts/generated/erc20/ERC20Generator.sol',
} as GetAbiContractResponse);

/* --------------------------------- Compile -------------------------------- */
export class CompileContractDto extends GetGeneratedContractDto {}
export class CompileContractResponse {
  output: unknown;
}
export const CompileContractResponseExample = convertObjectToExample({
  output: 'Compiled 1 Solidity files successfully (evm target: london)',
});

/* -------------------------------- Generate -------------------------------- */

export class GenerateContractDto extends GetGeneratedContractDto {
  @IsOptional()
  disable?: GenerateContractDisable;
}

class GenerateContractDisable {
  @IsBoolean()
  @IsOptional()
  supplyCap?: boolean;

  @IsBoolean()
  @IsOptional()
  mint?: boolean;

  @IsBoolean()
  @IsOptional()
  burn?: boolean;

  @IsBoolean()
  @IsOptional()
  adminBurn?: boolean;

  @IsBoolean()
  @IsOptional()
  pause?: boolean;

  @IsBoolean()
  @IsOptional()
  adminTransfer?: boolean;
}

export class GenerateContractResponse {
  path: string;
}

export const GenerateContractResponseExample = convertObjectToExample(
  {
    path: 'erc20/ERC20Generator.sol',
  },
  201,
);

/* --------------------------------- Verify --------------------------------- */
export class VerifyERC20ContractDto extends GetGeneratedContractDto {
  @IsEnum(InternalChainEnum)
  @IsNotEmpty()
  chainName: InternalChainEnum;

  @IsEthereumAddress()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  sourceName: string;

  @IsNotEmpty()
  body: VerifyERC20ContractBody;
}

export class VerifyERC20ContractBody {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  initialSupply: bigint;

  @IsOptional()
  supplyCap?: bigint;

  @IsOptional()
  @IsBtcAddress()
  payee?: `0x${string}` | string;

  @IsOptional()
  @IsBtcAddress()
  transferor?: `0x${string}` | string;

  @IsOptional()
  @IsBtcAddress()
  minter?: `0x${string}` | string;

  @IsOptional()
  @IsBtcAddress()
  burner?: `0x${string}` | string;

  @IsOptional()
  @IsBtcAddress()
  pauser?: `0x${string}` | string;
}

export class VerifyERC20ContractResponse {
  output: unknown;
}

export const VerifyContractResponseExample = convertObjectToExample({
  output: 'fwefew',
});

/* ----------------------------------- Job ---------------------------------- */
export class JobDto {
  @IsNumberString()
  @IsNotEmpty()
  jobId: number;
}
