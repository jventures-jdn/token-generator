module.exports = {
  dependencyTypes: ['dev', 'peer', 'prod'],
  semverRange: '^',
  source: [
    'package.json',
    'apps/*/package.json',
    'config/*/package.json',
    'libs/*/package.json',
  ],
  versionGroups: [
    {
      label:
        'Internal config packages should be pinned to "*" (meaning any version is acceptable)',
      packages: ['**'],
      dependencies: ['@config/config-prettier', '@config/config-tsconfig', '@config/config-eslint-react'],
      dependencyTypes: ['dev'],
      pinVersion: '*',
    },
  ],
};
