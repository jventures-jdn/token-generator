import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('AppController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    // wait bull client disconnect before close instance
    await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    await app.close();
    jest.clearAllMocks();
  });

  it('/health (GET)', async () => {
    return true;
  });
});
