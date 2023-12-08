module.exports = {
  dependencyTypes: ['dev', 'peer', 'prod'],
  semverRange: '^',
  source: [
    'package.json',
    'app/*/package.json',
    'config/*/package.json',
    'libs/*/package.json',
  ],
  versionGroups: [
    {
      label: 'Internal Workspace Version Group',
      packages: ['**'],
      dependencies: [
        'config-prettier',
        'config-tsconfig',
        'config-tailwind',
        'eslint-config-react',
        'eslint-config-next-workspace',
      ],
      dependencyTypes: ['dev'],
      pinVersion: 'workspace:*',
    },
  ],
};
