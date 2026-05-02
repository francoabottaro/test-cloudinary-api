module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'image',
        'core',
        'app',
        'swagger',
        'deps',
        'docker',
        'ci',
        'docs',
        'tests',
        'release',
      ],
    ],
    'subject-case': [
      2,
      'never',
      ['upper-case', 'pascal-case', 'start-case'],
    ],
  },
};
