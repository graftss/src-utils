module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: [
    'import',
  ],

  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    }],
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'no-public',
    }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      varsIgnorePattern: '_+',
    }],
    'import/order': ['error', {
      'newlines-between': 'never',
    }],
    'no-console': 'off',
    'react/no-render-return-value': 'off',
    'react/prop-types': 'off',
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
