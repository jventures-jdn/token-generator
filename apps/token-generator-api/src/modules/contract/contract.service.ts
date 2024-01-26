import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { emptyDirSync } from 'fs-extra';
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

  /**
   * Reads the original contract file based on the contract type.
   * @param contractType - The type of contract.
   * @returns The content of the original contract file as a string, or undefined if the file does not exist.
   */
  async readOriginalContract({
    contractType,
  }: OriginalContractDto): Promise<string> {
    const existPath = join(
      __dirname,
      `${this.originalContractPath}/${contractType}/${contractType}Generator.sol`,
    );

    if (existsSync(existPath)) {
      return readFileSync(existPath).toString();
    } else {
      throw new NotFoundException(undefined, {
        description: 'This original contract type does not exist',
      });
    }
  }

  /**
   * Reads the generated contract file based on the provided name and contract type.
   * @param {GeneratedContractDto} options - The options object containing the name and contract type.
   * @returns {string | undefined} - The content of the contract file if it exists, otherwise undefined.
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
      return readFileSync(existPath).toString();
    } else {
      throw new NotFoundException(undefined, {
        description: 'This generated contract does not exist',
      });
    }
  }

  /**
   * Generates a new contract based on the provided payload.
   * If contract name is not alphanumeric, then throws an error.
   * If a contract with the same name already exists, it returns the existing contract.
   * Otherwise, it reads the original contract, replaces the contract name, generates the new contract,
   * and writes it to the specified path.
   * @param payload - The payload containing the necessary information to generate the contract.
   * @returns The path of the generated contract.
   */
  async generateContract(payload: GeneratedContractDto) {
    // validate contract name
    if (payload.contractName.match(/[^A-Za-z0-9_]/g))
      throw new BadRequestException(undefined, {
        description: 'Contract name must be alphanumeric',
      });

    const filePath = `${payload.contractType}/${payload.contractName}.sol`;

    // if giving generated contract name is already exist, throw error
    const generatedContractPath = this.readGeneratedContract(payload);
    const isExist = await generatedContractPath.catch(() => false);
    if (isExist)
      throw new ConflictException(
        { data: filePath },
        {
          description: 'This contact name is already in use',
        },
      );

    // read orignal contract and replace contract name
    const originalContractRaw = await this.readOriginalContract(payload);
    const generatedContractRaw = originalContractRaw.replaceAll(
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

  async compileGeneratedContract() {
    const command = spawn('npx hardhat compile', {
      cwd: join(__dirname, '../../../'),
      shell: true,
    });
    command.stdout.on('data', (data) => console.log(data.toString()));
    command.stderr.on('data', (data) => console.error(data.toString()));
  }
  async clearGeneratedContract() {
    emptyDirSync(join(__dirname, this.generateContractPath));
  }

  // async verifyContract() {}
}
