module.exports = {
  dependencyTypes: ['dev', 'peer', 'prod'],
  semverRange: '^',
  source: [
    'package.json',
    'apps/*/package.json',
    'config/*/package.json',
    'libs/*/package.json',
  ],
};
