/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  reporter: [['list']],
  use: {
    // Set PWHEADED=1 to open a real browser window (used by test:e2e:debug script)
    headless: process.env.PWHEADED !== '1',
    // Set PWSLOWMO=<ms> to slow down each action so you can watch what's being clicked
    // Example: $env:PWSLOWMO=800; npm run test:e2e:debug
    slowMo: process.env.PWSLOWMO ? Number.parseInt(process.env.PWSLOWMO, 10) : 0,
  },
};

module.exports = config;
