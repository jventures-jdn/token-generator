module.exports = {
  roots: ['<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'node_modules',
    '.dto.ts',
    '.interface.ts',
    '.module.ts',
    '.mock.ts',
    '.helpers.ts',
    '.spec.ts',
  ],
};