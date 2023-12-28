module.exports = {
  dependencyTypes: ['dev', 'peer', 'prod'],
  semverRange: '^',
  source: [
    'package.json',
    'config/*/package.json',
    'libs/*/package.json',
    'apps/*/package.json',
  ],
  versionGroups: [
    {
      label:
        'Internal config packages should be pinned to "*" (meaning any version is acceptable)',
      packages: ['**'],
      dependencies: [
        '@jventures-jdn/config-chains',
        '@jventures-jdn/config-prettier',
        '@jventures-jdn/config-tsconfig',
        '@jventures-jdn/config-tailwind',
        '@jventures-jdn/eslint-config-react',
        '@jventures-jdn/eslint-config-next',
        '@jventures-jdn/eslint-config-nest',
      ],
      dependencyTypes: ['dev'],
      pinVersion: '*',
    },
    {
      label:
        'Internal libary packages should be pinned to "workspace:*" (meaning any version of workspace is acceptable)',
      packages: ['**'],
      dependencies: [
        '@jventures-jdn/react-logger',
        '@jventures-jdn/react-rainbowkit-provider',
      ],
      dependencyTypes: ['prod'],
      pinVersion: 'workspace:*',
    },
  ],
  semverGroups: [{}],
};
