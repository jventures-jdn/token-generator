module.exports = {
  extends: ['turbo', 'next', 'prettier'],
  ignorePatterns: ['**/.next'],
  rules: {
    '@next/next/no-img-element': 0,
    'react-hooks/exhaustive-deps': 0,
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
