/* eslint-disable turbo/no-undeclared-env-vars */
import Supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractModule } from '../../src/modules/contract/contract.module';
import { AppModule } from '../../src/app.module';
import { compileJobTest, compileTest } from './helper';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';
import { OriginalContractDto } from '@/src/modules/contract/contract.dto';

describe('ContractController (integration)', () => {
  const prefix = '/contract';
  let app: INestApplication;
  let supertest: Supertest.SuperTest<Supertest.Test>;
  process.env.USED_IN_MEMORY_REDIS = 'true';

  const payloadERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'TEST',
  };
  const payload2ERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'TEST2',
  };
  const payload3ERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'TEST3',
  };
  const payloadERC721 = {
    contractType: ContractTypeEnum.ERC721,
    contractName: 'TEST',
  };

  const removeGenerated = async () => {
    await Promise.all([
      supertest.delete(`${prefix}/generated`).query(payloadERC20).send(),
      supertest.delete(`${prefix}/generated`).query(payloadERC721).send(),
      supertest.delete(`${prefix}/generated`).query(payload2ERC20).send(),
      supertest.delete(`${prefix}/generated`).query(payload3ERC20).send(),
    ]);
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
    await new Promise((resolve) => setTimeout(() => resolve(true), 250));
    await app.close();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await removeGenerated();
  });

  afterAll(async () => {
    await removeGenerated();
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
      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payloadERC20)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual(
        'This generated contract does not exist',
      );
    });

    it('should response 200 when giving payload which is `erc20`', async () => {
      await supertest.post(`${prefix}/generate`).send(payloadERC20);

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payloadERC20)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should response 200 when giving payload which is `erc721`', async () => {
      await supertest.post(`${prefix}/generate`).send(payloadERC721);

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payloadERC721)
        .send();

      expect(response.status).toEqual(200);
    });
  });

  /* ----------------------------- POST / Compile Job ----------------------------- */
  describe('POST / compile-job', () => {
    it('Should response 200 with `jobId` when giving payload which is `erc20`', async () => {
      await compileJobTest(supertest, { payload: payloadERC20, prefix });
    });

    it('Should response 200 with `jobId` when giving payload which is `erc721`', async () => {
      await compileJobTest(supertest, { payload: payloadERC721, prefix });
    });

    it('Should work normally when multiple user generate & compile at the same time', async () => {
      await Promise.all([
        compileJobTest(supertest, { payload: payloadERC20, prefix }),
        compileJobTest(supertest, { payload: payload2ERC20, prefix }),
        compileJobTest(supertest, { payload: payload3ERC20, prefix }),
        compileJobTest(supertest, { payload: payloadERC721, prefix }),
      ]);
    });
  });

  /* ----------------------------- POST / Compile ----------------------------- */
  describe('POST / compile', () => {
    it('Should response 200 with `jobId` when giving payload which is `erc20`', async () => {
      await compileTest(supertest, { payload: payloadERC20, prefix });
    });

    it('Should response 200 with `jobId` when giving payload which is `erc721`', async () => {
      await compileTest(supertest, { payload: payloadERC721, prefix });
    });

    it('Should work normally when multiple user generate & compile at the same time', async () => {
      await Promise.all([
        compileTest(supertest, { payload: payloadERC20, prefix }),
        compileTest(supertest, { payload: payload2ERC20, prefix }),
        compileTest(supertest, { payload: payload3ERC20, prefix }),
        compileTest(supertest, { payload: payloadERC721, prefix }),
      ]);
    });
  });

  /* ----------------------------- GET / Compiled ----------------------------- */
  describe('GET / compiled', () => {});
});
