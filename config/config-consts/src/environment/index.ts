/* eslint-disable turbo/no-undeclared-env-vars */
export const EnvironmentConfig = () => ({
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  tokenGeneratorApiEndpoint:
    process.env.NEXT_PUBLIC_TOKEN_GENERATOR_API_ENDPOINT ||
    'http://localhost:4000',
  tokenGeneratorWebEndpoint:
    process.env.NEXT_PUBLIC_TOKEN_GENERATOR_WEB_ENDPOINT ||
    'http://localhost:3000',
});

export type EnvironmentConfig = ReturnType<typeof EnvironmentConfig>;
export const environmentConfig = EnvironmentConfig();
