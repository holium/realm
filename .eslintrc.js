module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  plugins: ['unused-imports', 'react-native-web'],
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // many cases where we need other variables in the deps
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
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
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
