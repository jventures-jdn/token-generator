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
        'config-chains',
        'config-prettier',
        'config-tsconfig',
        'config-tailwind',
        'eslint-config-react',
        'eslint-config-next-workspace',
        '@jventures-jdn/token-generator-web',
        '@jventures-jdn/token-generator-contract',
        '@jventures-jdn/react-rainbowkit-provider',
        '@jventures-jdn/react-logger',
      ],
      dependencyTypes: ['dev'],
      pinVersion: 'workspace:*',
    },
  ],
};
