const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Global ignores — replaces the now-unsupported .eslintignore
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'assets/js/*.min.js',
      'assets/js/bootstrap.min.js',
    ],
  },

  // ESLint recommended rules
  js.configs.recommended,

  // ── All JS files ──────────────────────────────────────────────────────────
  // Include Node globals so that module.exports / require in script.js are valid
  // (mirrors the original .eslintrc.json overrides["*.js"].env.node = true behaviour)
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node,
        gtag: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'warn',
      eqeqeq: 'error',
      // Allow empty catch blocks used for intentional swallowing
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // ── Jest unit test files ──────────────────────────────────────────────────
  // Kept separate from Playwright e2e tests to avoid no-redeclare conflicts
  {
    files: ['**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },

  // ── Playwright e2e tests ──────────────────────────────────────────────────
  // test/expect come from @playwright/test imports, not Jest globals
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Playwright imports resolve test/expect; disable undef for this dir
      'no-undef': 'off',
    },
  },

  // ── Tooling / config files ────────────────────────────────────────────────
  {
    files: ['jest.config.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
