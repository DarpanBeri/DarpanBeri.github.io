'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const pluginPromise = require('eslint-plugin-promise');

module.exports = [
  // 1. Global ignores — replaces .eslintignore
  {
    ignores: ['assets/js/*.min.js', 'assets/js/bootstrap.min.js', 'coverage/**', 'node_modules/**'],
  },

  // 2. eslint:recommended baseline for all linted files
  js.configs.recommended,

  // 3. Base rules + browser globals applied to all JS
  {
    files: ['**/*.js'],
    plugins: { promise: pluginPromise },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        gtag: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'warn',
      eqeqeq: 'error',
    },
  },

  // 4. script.js uses `module.exports` at the bottom for Jest compatibility
  {
    files: ['assets/js/script.js'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
      },
    },
  },

  // 5a. Jest unit test files
  {
    files: ['**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },

  // 5b. Playwright E2E test files — Node only (test/expect come from require('@playwright/test'))
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 6. Tooling/config files — Node.js environment
  {
    files: ['jest.config.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
