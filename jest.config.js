module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'], // Only run Jest unit tests
  testPathIgnorePatterns: ['/node_modules/', '/tests/'], // Ignore Playwright E2E tests
  collectCoverage: true,
  collectCoverageFrom: [
    'assets/js/**/*.js',
    '!assets/js/**/*.min.js' // Exclude vendor/minified files from coverage
  ], // Measure coverage on app JS
  coverageReporters: ['text-summary', 'lcov'],
  clearMocks: true
};
