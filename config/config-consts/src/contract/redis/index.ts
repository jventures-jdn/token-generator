/* eslint-disable turbo/no-undeclared-env-vars */
export const RedisConfig = () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || 'SECRET',
    port: +(process.env.REDIS_PORT || 6379),
    useInMemoryRedis: process.env.USED_IN_MEMORY_REDIS === 'true',
  },
  bull: {
    defaultJobOptions: {
      removeOnComplete: 60,
      removeOnFail: 60,
      timeout: 3600000,
      lifo: true,
    },
  },
});

export type RedisConfig = ReturnType<typeof RedisConfig>;
export const redisConfig = RedisConfig();
