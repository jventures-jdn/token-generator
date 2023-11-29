module.exports = {
  dependencyTypes: ['dev', 'peer', 'prod'],
  semverRange: '^',
  source: [
    'package.json',
    'app/**/package.json',
    'config/**/package.json',
    'libs/**/package.json',
  ],
};
