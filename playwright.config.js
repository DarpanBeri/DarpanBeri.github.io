/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  reporter: [['list']],
  use: {
    headless: true
  }
};

module.exports = config;
