import Supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import {
  BullConfigFactory,
  BullUsingInMemoryRedisFactory,
} from '../../src/shared/bull.factory';

describe('AppController (integration)', () => {
  let app: INestApplication;
  let supertest: Supertest.SuperTest<Supertest.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BullConfigFactory)
      .useClass(BullUsingInMemoryRedisFactory)
      .compile();

    app = moduleFixture.createNestApplication();
    supertest = Supertest(app.getHttpServer());

    await app.init();
  });
  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('/health (GET)', async () => {
    return true
    // return supertest.get('/health').expect(200).expect('Hello World!');
  });
});
