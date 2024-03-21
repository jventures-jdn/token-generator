/* eslint-disable turbo/no-undeclared-env-vars */
import Supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractModule } from '../../src/modules/contract/contract.module';
import { AppModule } from '../../src/app.module';
import { compileTest } from './helper';
import { ContractTypeEnum } from '@jventures-jdn/config-consts';
import { GetOriginalContractDto } from '@jventures-jdn/api-fetcher';

describe('ContractController (integration)', () => {
  const prefix = '/contract';
  let app: INestApplication;
  let supertest: Supertest.SuperTest<Supertest.Test>;

  const payload1ERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'ERC20_PAYLOAD_01',
  };
  const payload2ERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'ERC20_PAYLOAD_02',
  };
  const payload3ERC20 = {
    contractType: ContractTypeEnum.ERC20,
    contractName: 'ERC20_PAYLOAD_03',
  };

  const removeGenerated = async () => {
    await Promise.all([
      supertest.delete(`${prefix}/generated`).query(payload1ERC20).send(),
      supertest.delete(`${prefix}/generated`).query(payload2ERC20).send(),
      supertest.delete(`${prefix}/generated`).query(payload3ERC20).send(),
    ]);
  };

  beforeAll(async () => {
    // setup instance
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ContractModule, AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    supertest = Supertest(app.getHttpServer());
    await app.init();
  });

  afterEach(async () => {
    await removeGenerated();
  });

  afterAll(async () => {
    await app.close();
    await removeGenerated();
    jest.clearAllMocks();
  });

  /* ----------------------------- GET / Original ----------------------------- */
  describe('GET / original', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should resolve when giving payload which is `erc20`', async () => {
      const payload: GetOriginalContractDto = {
        contractType: ContractTypeEnum.ERC20,
      };

      const response = await supertest
        .get(`${prefix}/original`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should resolve when giving payload which is `erc721`', async () => {
      const payload: GetOriginalContractDto = {
        contractType: ContractTypeEnum.ERC721,
      };

      const response = await supertest
        .get(`${prefix}/original`)
        .query(payload)
        .send();

      expect(response.status).toEqual(200);
    });

    it('should response 404 when giving payload is not in `ContractTypeEnum`', async () => {
      const payload: GetOriginalContractDto = {
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
    it('should response 404 when no generated file match with giving payload', async () => {
      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payload3ERC20)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual(
        'This generated contract does not exist',
      );
    });

    it('should resolve when payload is `erc20` and matched with generated contract', async () => {
      await supertest.post(`${prefix}/generate`).send(payload1ERC20);

      const response = await supertest
        .get(`${prefix}/generated`)
        .query(payload1ERC20)
        .send();

      expect(response.status).toEqual(200);
    });
  });

  /* ----------------------------- POST / Compile ----------------------------- */
  describe('POST / compile', () => {
    it('Should resolve normally when multiple user generate & compile at the same time', async () => {
      await Promise.all([
        supertest.post(`${prefix}/generate`).send(payload1ERC20),
        supertest.post(`${prefix}/generate`).send(payload2ERC20),
        supertest.post(`${prefix}/generate`).send(payload3ERC20),
      ]);
    });
  });

  /* ----------------------------- GET / Compiled ----------------------------- */
  describe('GET / compiled', () => {
    it('should resolve when payload is `erc20` and matched with compiled contract', async () => {
      await compileTest(supertest, { payload: payload1ERC20, prefix });

      const response = await supertest
        .get(`${prefix}/compiled`)
        .query(payload1ERC20)
        .send();

      expect(response.status).toEqual(200);
    });
  });
});

/* ----------------------------- POST / Compile Job ----------------------------- */
// describe('POST / compile-job', () => {
//   it('Should resolve with `jobId` when giving payload which is `erc20`', async () => {
//     await compileJobTest(supertest, { payload: payload1ERC20, prefix });
//   });

//   it('Should resolve with `jobId` when giving payload which is `erc721`', async () => {
//     await compileJobTest(supertest, { payload: payloadERC721, prefix });
//   });

//   it('Should work normally when multiple user generate & compile at the same time', async () => {
//     await Promise.all([
//       compileJobTest(supertest, { payload: payload1ERC20, prefix }),
//       compileJobTest(supertest, { payload: payload2ERC20, prefix }),
//       compileJobTest(supertest, { payload: payload3ERC20, prefix }),
//       compileJobTest(supertest, { payload: payloadERC721, prefix }),
//     ]);
//   });
// });
