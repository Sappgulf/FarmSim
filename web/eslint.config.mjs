import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

const unusedVarRule = [
  'warn',
  {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_|^React$',
    caughtErrors: 'none',
  },
]

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.config.js',
      'vitest.config.js',
      'playwright.config.mjs',
      'e2e/**',
    ],
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{js,jsx,mjs}'],
    plugins: {
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['error'] }],
      'no-debugger': 'error',
      'no-unused-vars': unusedVarRule,
      'no-case-declarations': 'off',
      'no-sparse-arrays': 'warn',
      'react/no-unescaped-entities': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: [
      'src/test/**/*.{js,jsx,mjs}',
      'test/**/*.{js,mjs}',
      'src/test/setup.js',
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.vitest },
    },
  },
  {
    files: [
      'src/utils/logger.js',
      'src/utils/debugTools.js',
      'src/utils/releaseTools.js',
      'src/performance.js',
      'src/test/**/*.{js,jsx,mjs}',
      'test/**/*.{js,mjs}',
      'src/components/farm-sim/qa/qaTests.js',
    ],
    rules: { 'no-console': 'off' },
  },
  eslintConfigPrettier,
]
