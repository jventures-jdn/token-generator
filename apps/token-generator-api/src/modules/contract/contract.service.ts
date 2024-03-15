import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { Job } from 'bull';
import {
  GenerateContractDto,
  GeneratedContractDto,
  OriginalContractDto,
  VerifyERC20ContractERC2Dto,
} from './contract.dto';
import JSON from 'json-bigint';
import { ContractRemovePattern } from '@jventures-jdn/config-consts';
@Injectable()
export class ContractService {
  constructor() {}

  private readonly logger = new Logger('ContractService');
  generateContractPath = `${process.cwd()}/contracts/generated`;
  originalContractPath = `${process.cwd()}/contracts/original`;
  compiledContractPath = `${process.cwd()}/contracts/compiled`;
  argsContractPath = `${process.cwd()}/contracts/args`;

  /* ------------------------- Read Original Contract ------------------------- */
  /**
   * Read a original contract file based on the contract type.
   *
   * @param {OriginalContractDto} payload - Type of contract
   * @returns Content and path of the contract file
   * @throws NotFoundException if the compiled contract does not exist.
   */
  async readOriginalContract(payload: OriginalContractDto) {
    const existPath = `${this.originalContractPath}/${
      payload.contractType
    }/${payload.contractType.toUpperCase()}Generator.sol`;

    if (existsSync(existPath)) {
      return { raw: readFileSync(existPath).toString(), path: existPath };
    } else {
      throw new NotFoundException(undefined, {
        description: 'This original contract type does not exist',
      });
    }
  }

  /* ------------------------- Read Generated Contract ------------------------ */
  /**
   * Read a generated contract file based on the provided name and contract type.
   *
   * @param {GeneratedContractDto} payload - Type and name of contract
   * @returns Content and path of the contract file
   * @throws NotFoundException if the compiled contract does not exist.
   */
  async readGeneratedContract(payload: GeneratedContractDto) {
    const existPath = `${this.generateContractPath}/${payload.contractType}/${payload.contractName}.sol`;

    if (existsSync(existPath)) {
      return { raw: readFileSync(existPath).toString(), path: existPath };
    } else {
      throw new NotFoundException(undefined, {
        description: 'This generated contract does not exist',
      });
    }
  }

  /* ------------------------- Read Compiled Contract ------------------------- */
  /**
   * Reads the compiled contract file based on the provided name and contract type.
   *
   * @param {GeneratedContractDto} payload - Type and name of contract
   * @returns Content and path of the contract file
   * @throws NotFoundException if the compiled contract does not exist.
   */
  async readCompiledContract(payload: GeneratedContractDto) {
    const existPath = `${this.compiledContractPath}/artifacts/contracts/generated/${payload.contractType}/${payload.contractName}.sol/${payload.contractName}.json`;

    if (existsSync(existPath)) {
      return {
        raw: JSON.parse(readFileSync(existPath).toString()) as Record<
          string,
          unknown
        >,
        path: existPath,
      };
    } else {
      throw new NotFoundException(undefined, {
        description: 'This compiled contract does not exist',
      });
    }
  }

  /* ---------------------------- GenerateContract ---------------------------- */
  /**
   * Generates a new contract based on the provided payload.
   * if contract name is not alphanumeric, then throws an error.
   * if a contract with the same name already exists, it returns the existing contract.
   * otherwise, it reads the original contract, replaces the contract name, generates the new contract,
   * and writes it to the specified path.
   *
   * @param {GenerateContractDto} payload - The payload containing `contractName` and `contractType` of contract
   * @returns The path of the generated contract.
   */
  async generateContract(payload: GenerateContractDto) {
    const filePath = `${payload.contractType}/${payload.contractName}.sol`;

    // validate contract name
    if (!payload.contractName.match(/^[a-zA-Z][A-Za-z0-9_]*$/g))
      throw new BadRequestException(undefined, {
        description:
          'Contract name must be alphanumeric and start with a letter',
      });

    // if giving generated contract name is already exist, throw error
    if (await this.readGeneratedContract(payload).catch(() => {})) {
      throw new ConflictException(
        { data: filePath },
        {
          description: 'This contact name is already in use',
        },
      );
    }

    // read orignal contract and replace contract name
    const { raw } = await this.readOriginalContract(payload);

    // replace contract name
    const generatedContractRaw = raw.replaceAll(
      `${payload.contractType.toUpperCase()}Generator`,
      payload.contractName,
    );

    // disable feature
    const generatedFeatureContractRaw = this.contractFeatureGenerator(
      generatedContractRaw,
      payload.disable,
    );

    // write new contract
    const writePath = `${this.generateContractPath}/${filePath}`;
    writeFileSync(writePath, generatedFeatureContractRaw);
    return filePath;
  }

  contractFeatureGenerator(
    contractRaw: string,
    disable?: {
      supplyCap?: boolean;
      mint?: boolean;
      burn?: boolean;
      adminBurn?: boolean;
      pause?: boolean;
      adminTransfer?: boolean;
    },
  ) {
    let newContractRaw = contractRaw;

    // no supply cap
    if (disable.supplyCap) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'supplyCap',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'supplyCap',
        type: 'RANGE',
      });
    }

    // no mint
    if (disable.mint) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'mint',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'mint',
        type: 'RANGE',
      });
    }

    // no self burn
    if (disable.burn) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'selfBurn',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'selfBurn',
        type: 'RANGE',
      });
    }

    // no admin burn
    if (disable.adminBurn) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'adminBurn',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'adminBurn',
        type: 'RANGE',
      });
    }

    // no brun
    if (disable.burn && disable.adminBurn) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'burn',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'burn',
        type: 'RANGE',
      });
    }

    // no pause
    if (disable.pause) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'pause',
        type: 'REPLACE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'pause',
        type: 'LINE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'pause',
        type: 'RANGE',
      });
    }

    // no admin transfer
    if (disable.adminTransfer) {
      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'adminTransfer',
        type: 'RANGE',
      });

      newContractRaw = this.removePattern({
        payload: newContractRaw,
        pattern: 'adminTransfer',
        type: 'LINE',
      });
    }

    return newContractRaw;
  }

  removePattern({
    type,
    pattern,
    payload,
  }: {
    payload: string;
    type: ContractRemovePattern;
    pattern: string;
  }) {
    // remove line by line
    if (type === 'LINE') {
      return payload
        .split('\n')
        .filter((line) => !line.includes(`@${pattern}`))
        .join('\n');
    }

    // remove in range
    if (type === 'RANGE') {
      const lines = payload.split('\n');

      const removeLines = lines.reduce((acc, line, index) => {
        if (line.includes(`@start_${pattern}`)) {
          acc.push(index);
        }

        if (line.includes(`@end_${pattern}`)) {
          const prevStartLine = acc[acc.length - 1];
          Array(index - prevStartLine)
            .fill(0)
            .map((_, i) => acc.push(prevStartLine + i + 1));
        }
        return acc;
      }, [] as number[]);

      return lines
        .filter((_, index) => !removeLines.includes(index))
        .join('\n');
    }

    if (type === 'REPLACE') {
      const lines = payload.split('\n');
      const newContractRaw = lines.reduce(
        (acc, line) => {
          if (line.includes(`@start_replace_${pattern}`)) {
            acc.inRange = true;
          }

          if (acc.inRange === true) {
            if (line.includes(`_${pattern}[`)) {
              acc.replace = line
                .match(/\[(.*?)]/g)
                .toString()
                .replaceAll('[', '')
                .replaceAll(']', '');
            }

            acc.new.push(line.replaceAll(acc.replace, ''));
          } else {
            acc.new.push(line);
          }

          if (line.includes(`@end_replace_${pattern}`)) {
            acc.inRange = false;
            acc.replace = undefined;
          }

          return acc;
        },
        { inRange: false, new: [] as string[], replace: undefined },
      );

      // console.log(newContractRaw.new);
      return newContractRaw.new.join('\n');

      // const contractRaw = replaceLines.map((line) => {});
    }
  }

  /* ---------------------------- Compile Contract ---------------------------- */
  /**
   * Compiles the generated contract.
   *
   * @param {Job<GeneratedContractDto> | GeneratedContractDto} payload Job or payload with containing `contractName` and `contractType` of contract
   * @returns Compiled output
   */
  async compileContract(
    payload: GeneratedContractDto | Job<GeneratedContractDto>,
  ) {
    const isJob = payload.hasOwnProperty('id');

    // create execute streams
    const command = spawn('npx hardhat compile', {
      cwd: join(__dirname, '../'),
      shell: true,
    });

    return new Promise((resolve, reject) => {
      let output = '';

      // log in data
      command.stdout.on('data', (data) => {
        output += `\n${data.toString()}`;
        this.logger.verbose(
          `[compileContract] ${data.toString()?.replaceAll('\n', '')}`,
        );
      });
      // reject on error
      command.stderr.on('data', async (data) => {
        this.logger.error(
          `[compileContract] ${data.toString()?.replaceAll('\n', '')}`,
        );
        if (isJob) {
          const job = payload as Job<GeneratedContractDto>;
          await Promise.all([
            job.moveToFailed({ message: data.toString() }),
            job.progress(100),
          ]);
        }
        reject(
          new InternalServerErrorException({
            error: data.toString(),
            cause: 'hardhat',
          }),
        );
      });

      // resolve on exit
      command.on('exit', async () => {
        if (isJob) {
          const job = payload as Job<GeneratedContractDto>;
          await Promise.all([job.moveToCompleted(output), job.progress(100)]);
        }
        await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
        resolve(output);
      });
    });
  }

  /* ---------------------------- Compile Contract ---------------------------- */
  /**
   * Verify the generated contract.
   *
   * @param {VerifyERC20ContractERC2Dto} payload payload with containing `contractName`, `contractType`, `address`, `chainName` of contract
   * @returns Verify output
   */
  async verifyContract(payload: VerifyERC20ContractERC2Dto) {
    // creates an argument file for use in contract verify
    const argsName = `${payload.contractName}.js`;
    const argsPath = `${this.argsContractPath}/${argsName}`;
    writeFileSync(
      argsPath,
      `module.exports = ${JSON({ storeAsString: true }).stringify([
        payload.body,
      ])}`,
    );

    // create execute streams
    const command = spawn(
      `npx hardhat verify --network ${payload.chainName} ${payload.address} --constructor-args ${argsPath}`,
      {
        cwd: join(__dirname, '../'),
        shell: true,
      },
    );

    return new Promise((resolve, reject) => {
      let output = '';

      // log in data
      command.stdout.on('data', (data) => {
        output += `\n${data.toString()}`;
        this.logger.verbose(
          `[verifyContract] ${data.toString()?.replaceAll('\n', '')}`,
        );
      });
      // reject on error
      command.stderr.on('data', async (data) => {
        this.logger.error(
          `[verifyContract] ${data.toString()?.replaceAll('\n', '')}`,
        );
        reject(
          new InternalServerErrorException({
            error: data.toString(),
            cause: 'hardhat',
          }),
        );
      });

      // resolve on exit
      command.on('exit', async () => {
        resolve(output);
      });
    });
  }

  /* ----------------------------- Remove Contract ---------------------------- */
  /**
   * Removes a contract.
   * if providing contract name is not exist, then throws an error.
   *
   * @param {GeneratedContractDto} payload - `contractType` and `contractName` of contract
   * @returns void
   * @throws InternalServerErrorException if there is an error removing the contract.
   */
  async removeContract(payload: GeneratedContractDto) {
    // if giving generated contract name is not exist, throw error
    const generatedContract = await this.readGeneratedContract(payload);

    try {
      unlinkSync(generatedContract.path);
    } catch (error) {
      throw new InternalServerErrorException(
        { error },
        {
          description: 'Failed to remove contract',
        },
      );
    }
  }

  /* -------------------------------- Read ABI -------------------------------- */
  /**
   * Reads the ABI and bytecode of a generated contract.
   * @param {GeneratedContractDto} payload - The payload containing the generated contract information.
   * @returns An object containing the ABI and bytecode of the contract.
   */
  async readAbi(payload: GeneratedContractDto) {
    // if giving generated contract name is not exist, throw error
    const { raw } = await this.readCompiledContract(payload);
    return {
      abi: raw.abi as Record<string, unknown>[],
      bytecode: raw.bytecode as string,
      sourceName: raw.sourceName as string,
    };
  }
}
