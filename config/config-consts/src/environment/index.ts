export const EnvironmentConfig = () => ({
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
});

export type EnvironmentConfig = ReturnType<typeof EnvironmentConfig>;
export const environmentConfig = EnvironmentConfig();
