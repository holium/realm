module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  plugins: ['unused-imports'],
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // many cases where we need other variables in the deps
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-expressions': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
