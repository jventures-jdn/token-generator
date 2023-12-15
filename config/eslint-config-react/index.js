module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'turbo',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  rules: {},
  settings: {
    react: {
      version: 'detect',
    },
  },
};
