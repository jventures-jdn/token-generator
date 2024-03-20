import { CompileContractDto } from '@jventures-jdn/api-fetcher';
import Supertest from 'supertest';

export async function compileJobTest(
  supertest: Supertest.SuperTest<Supertest.Test>,
  options: {
    prefix: string;
    payload: CompileContractDto;
  },
) {
  // generate contract
  await supertest.post(`${options.prefix}/generate`).send(options.payload);

  // compile contract
  const response = await supertest
    .post(`${options.prefix}/compile-job`)
    .send(options.payload);

  // get compile job suddenly
  const jobResponse = await supertest
    .get(`${options.prefix}/job`)
    .query({ jobId: response.body.jobId })
    .send();

  expect(response.status).toEqual(201);
  expect(response.body).toHaveProperty('jobId');
  expect(jobResponse.body.state).toEqual('active');

  // wait consumer process 3s
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));

  // get compile job after consumer process 3s
  const jobResponse2 = await supertest
    .get(`${options.prefix}/job`)
    .query({ jobId: response.body.jobId })
    .send();

  expect(jobResponse2.body.state).toEqual('completed');
}

export async function compileTest(
  supertest: Supertest.SuperTest<Supertest.Test>,
  options: {
    prefix: string;
    payload: CompileContractDto;
  },
) {
  // generate contract
  await supertest.post(`${options.prefix}/generate`).send(options.payload);

  // compile contract
  const response = await supertest
    .post(`${options.prefix}/compile`)
    .send(options.payload);

  expect(response.status).toEqual(201);
}
