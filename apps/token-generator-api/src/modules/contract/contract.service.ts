import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { split, mapSync } from 'event-stream';
import { emptyDirSync } from 'fs-extra';

@Injectable()
export class ContractService {
  constructor() {}

  generateContractPath = '../../../contracts/generator';
  originalContractPath = '../../../contracts/original';
  compiledContractPath = '../../../contracts/compiled';

  async readOriginalContract(contractType: 'ERC20'): Promise<string> {
    return new Promise((resolve, reject) => {
      // path to contract file
      const contractPath = join(
        __dirname,
        `${this.originalContractPath}/${contractType}/${contractType}Generator.sol`,
      );

      // read file line by line
      let newFile = '';
      const readStream = createReadStream(contractPath)
        .pipe(split())
        .pipe(
          mapSync(function (line) {
            readStream.pause();
            // assign line to `newFile`
            newFile += `${line}\n`;
            readStream.resume();
          })
            .on('end', function () {
              return resolve(newFile);
            })
            .on('error', function (err) {
              reject(err);
            }),
        );
    });
  }

  async readGeneratedContract(name, contractType: 'ERC20') {
    const existPath = join(
      __dirname,
      `${this.generateContractPath}/${contractType}/${name}.sol`,
    );
    return existsSync(existPath)
      ? readFileSync(existPath).toString()
      : undefined;
  }

  async generateNewContract(name: string, contractType: 'ERC20') {
    // if giving generated contract name is already exist, return it
    const isExist = await this.readGeneratedContract(name, contractType);
    if (isExist) return isExist;

    // read orignal contract and replace contract name
    const originalContractRaw = await this.readOriginalContract(contractType);
    const generatedContractRaw = originalContractRaw.replaceAll(
      `${contractType}Generator`,
      name,
    );

    // generator new contract
    const writePath = join(
      __dirname,
      `${this.generateContractPath}/${contractType}/${name}.sol`,
    );
    writeFileSync(writePath, generatedContractRaw);
    return generatedContractRaw;
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

  async verifyContract() {}
}
