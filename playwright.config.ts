import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  throw new Error('Set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD (see .env.example).');
}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://main.d8gkeeaiko6qy.amplifyapp.com',
    httpCredentials: { username, password, send: 'always' },
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    viewport: { width: 1440, height: 900 },
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        channel: process.env.PW_CHANNEL === 'chromium' ? undefined : (process.env.PW_CHANNEL ?? 'chrome'),
      },
    },
  ],
});
