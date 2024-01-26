import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  GeneratedContractDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';

@Injectable()
export class ContractService {
  constructor() {}

  generateContractPath = '../contracts/generated';
  originalContractPath = '../contracts/original';
  compiledContractPath = '../contracts/compiled';

  /* ------------------------- Read Original Contract ------------------------- */
  /**
   * Read a original contract file based on the contract type.
   *
   * @param {OriginalContractDto} contractType - type of contract
   * @returns Content and path of the contract file
   */
  async readOriginalContract({ contractType }: OriginalContractDto) {
    const existPath = join(
      __dirname,
      `${this.originalContractPath}/${contractType}/${contractType}Generator.sol`,
    );

    if (existsSync(existPath)) {
      return { data: readFileSync(existPath).toString(), path: existPath };
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
   * @param {GeneratedContractDto} contractName - Type of contract
   * @param {GeneratedContractDto} contractType - Name of contract
   * @returns Content and path of the contract file
   */
  async readGeneratedContract({
    contractName,
    contractType,
  }: GeneratedContractDto) {
    const existPath = join(
      __dirname,
      `${this.generateContractPath}/${contractType}/${contractName}.sol`,
    );

    if (existsSync(existPath)) {
      return { data: readFileSync(existPath).toString(), path: existPath };
    } else {
      throw new NotFoundException(undefined, {
        description: 'This generated contract does not exist',
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
   * @param payload - The payload containing `contractName` and `contractType` of contract
   * @returns The path of the generated contract.
   */
  async generateContract(payload: GeneratedContractDto) {
    const filePath = `${payload.contractType}/${payload.contractName}.sol`;

    // validate contract name
    if (
      payload.contractName.match(/[^A-Za-z0-9_]/g) ||
      payload.contractName.match(/^[0-9]+$/g)
    )
      throw new BadRequestException(undefined, {
        description: 'Contract name must be alphanumeric or all numberic',
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
    const { data } = await this.readOriginalContract(payload);
    const generatedContractRaw = data.replaceAll(
      `${payload.contractType.toUpperCase()}Generator`,
      payload.contractName,
    );

    // write new contract
    const writePath = join(
      __dirname,
      `${this.generateContractPath}/${filePath}`,
    );
    writeFileSync(writePath, generatedContractRaw);
    return filePath;
  }

  /* ----------------------------- Remove Contract ---------------------------- */
  /**
   * Removes a contract.
   * if providing contract name is not exist, then throws an error.
   *
   * @param payload - `contractType` and `contractName` of contract
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

  /* ---------------------------- Compile Contract ---------------------------- */
  /**
   * Compiles the generated contract.
   * @param payload The payload containing `contractName` and `contractType` of contract
   * @returns Compiled output
   */
  async compileContract(payload: GeneratedContractDto): Promise<string> {
    // if giving generated contract name is not exist, throw error
    await this.readGeneratedContract(payload);

    // create execute streams
    const command = spawn('npx hardhat compile', {
      cwd: join(__dirname, '../'), // TODO!: need to be check in production runtime
      shell: true,
    });

    return new Promise((resolve, reject) => {
      let output = '';

      // log in data
      command.stdout.on('data', (data) => {
        output += `\n${data.toString()}`;
        console.log(data.toString());
      });

      // reject on error
      command.stderr.on('data', (data) => {
        console.error(data.toString());
        reject(
          new InternalServerErrorException({
            error: data.toString(),
            cause: 'hardhat',
          }),
        );
      });

      // resolve on exit
      command.on('exit', () => {
        resolve(output);
      });
    });
  }
}
