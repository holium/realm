module.exports = {
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [
    'prettier',
    'unused-imports',
    '@typescript-eslint',
    'simple-import-sort',
  ],
  parser: '@typescript-eslint/parser',
  root: true,
  parserOptions: { project: './tsconfig.json' },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // many cases where we need other variables in the deps
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'import/no-duplicates': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // React and Electron packages first, then other third-party packages.
          ['^react', '^electron', '^@?\\w'],
          // Holium packages.
          ['^@holium'],
          // Aliased internal packages.
          [
            '^(background|main|os|renderer|components|util|blocks|general|input|navigation|hooks|analysers|connection|helpers|peer)(/.*|$)',
          ],
          // Relative imports.
          ['^\\.'],
          // Style imports.
          ['^.+\\.?(css)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
