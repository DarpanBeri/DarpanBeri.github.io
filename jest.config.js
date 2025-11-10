module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['assets/js/**/*.js'],
  coverageReporters: ['text-summary', 'lcov'],
};
