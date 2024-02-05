export const SystemConfig = () => ({
  rateLimit: [
    {
      name: 'short', // 10 req/s
      ttl: 1000,
      limit: 10,
    },
    {
      name: 'medium',
      ttl: 10000,
      limit: 30, // 30 req/10s
    },
  ],
});

export type SystemConfig = ReturnType<typeof SystemConfig>;
export const systemConfig = SystemConfig();
