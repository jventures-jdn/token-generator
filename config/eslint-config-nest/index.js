module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['turbo', 'prettier', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    jest: true,
  },
};