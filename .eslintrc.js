module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'plugin:prettier/recommended'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './app/tsconfig.json',
      './lib/room/tsconfig.json',
      './lib/conduit/tsconfig.json',
      './lib/multiplayer/tsconfig.json',
      './lib/wallet/tsconfig.json',
      './lib/design-system/tsconfig.json',
      './tsconfig.eslint.json',
    ],
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  root: true,
  plugins: ['react', 'unused-imports', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/react-in-jsx-scope': 'off',
    'prefer-const': 'warn',
    'no-self-assign': 'warn',
    'multiline-ternary': 'off',
    'no-case-declarations': 'warn',
    'array-callback-return': 'warn',
    'no-prototype-builtins': 'warn',
    'constructor-super': 'off',
    'prefer-regex-literals': 'warn',
    eqeqeq: 'warn',
    'no-empty': 'warn',
    'valid-typeof': 'warn',
    'react/display-name': 'warn',
    'no-unsafe-finally': 'warn',
    'no-async-promise-executor': 'warn',
    'react/no-find-dom-node': 'warn',
    'no-import-assign': 'warn',
    'react/no-unknown-property': 'warn',
    'react/prop-types': 'warn',
    'no-dupe-keys': 'warn',
    'no-useless-escape': 'warn',
    'prefer-promise-reject-errors': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  // Workaround for a bug regarding .d.ts files
  ignorePatterns: ['*.d.ts'],
};
