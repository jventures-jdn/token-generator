/* eslint-disable turbo/no-undeclared-env-vars */
import Supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ContractTypeEnum,
  GeneratedContractDto,
  OriginalContractDto,
} from '@jventures-jdn/config-consts';
import { ContractModule } from '../../src/modules/contract/contract.module';
import { AppModule } from '../../src/app.module';
import { compileTest } from './helper';

describe('ContractController (integration)', () => {
  const prefix = '/contract';
  let app: INestApplication;
  let supertest: Supertest.SuperTest<Supertest.Test>;
  process.env.USED_IN_MEMORY_REDIS = 'true';
  process.env.REDIS_PASSWORD = '';
  const payloadERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'TEST',
  };
  const payloadERC721 = {
    contractType: ContractTypeEnum.ERC721,
    contractName: 'TEST',
  };

  beforeEach(async () => {
    // setup instance
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ContractModule, AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    supertest = Supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    // wait bull client disconnect before close instance
    await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    await app.close();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await supertest.delete(`${prefix}/generated`).query(payloadERC20).send();
    await supertest.delete(`${prefix}/generated`).query(payloadERC721).send();
  });

  /* ----------------------------- GET / Original ----------------------------- */
  describe('GET / original', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should response 200 when giving payload which is `erc20`', async () => {
      const payload: OriginalContractDto = {
        contractType: ContractTypeEnum.ERC20,
      };

      const response = await supertest
        .get(`${prefix}/original`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should response 200 when giving payload which is `erc721`', async () => {
      const payload: OriginalContractDto = {
        contractType: ContractTypeEnum.ERC721,
      };

      const response = await supertest
        .get(`${prefix}/original`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should response 404 when giving payload is not in `ContractTypeEnum`', async () => {
      const payload: OriginalContractDto = {
        contractType: 'ERC404' as ContractTypeEnum,
      };

      const response = await supertest
        .get(`${prefix}/original`)
        .query(payload)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual(
        'This original contract type does not exist',
      );
    });
  });

  /* ----------------------------- GET / Generated ---------------------------- */
  describe('GET / generated', () => {
    it('should response 404 when no file match with giving `contractName` and `contractType`', async () => {
      const payload: GeneratedContractDto = {
        contractType: ContractTypeEnum.ERC20,
        contractName: 'TEST',
      };

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payload)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual(
        'This generated contract does not exist',
      );
    });

    it('should response 200 when giving payload which is `erc20`', async () => {
      const payload: GeneratedContractDto = {
        contractType: ContractTypeEnum.ERC20,
        contractName: 'TEST',
      };

      await supertest.post(`${prefix}/generate`).send(payload);

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should response 200 when giving payload which is `erc721`', async () => {
      const payload: GeneratedContractDto = {
        contractType: ContractTypeEnum.ERC721,
        contractName: 'TEST',
      };

      await supertest.post(`${prefix}/generate`).send(payload);

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });
  });

  /* ----------------------------- POST / Compile ----------------------------- */
  describe('POST / compile', () => {
    it('Should response 200 with `jobId` when giving payload which is `erc20`', async () => {
      const payload: GeneratedContractDto = {
        contractType: ContractTypeEnum.ERC20,
        contractName: 'TEST',
      };

      await compileTest(supertest, { payload, prefix });
    });

    it('Should response 200 with `jobId` when giving payload which is `erc721`', async () => {
      const payload: GeneratedContractDto = {
        contractType: ContractTypeEnum.ERC721,
        contractName: 'TEST',
      };
      await compileTest(supertest, { payload, prefix });
    });
  });

  /* ----------------------------- GET / Compiled ----------------------------- */
  describe('GET / compiled', () => {});
});
