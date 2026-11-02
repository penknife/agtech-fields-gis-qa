import { test as base } from '@playwright/test';

export interface BrowserLogs {
  console: string[];
  pageErrors: string[];
}

export const test = base.extend<{
  /** Console messages and uncaught page errors, attached to the report after every test. */
  browserLogs: BrowserLogs;
}>({
  browserLogs: [
    async ({ page }, use, testInfo) => {
      const logs: BrowserLogs = { console: [], pageErrors: [] };
      page.on('console', (message) => logs.console.push(`[${message.type()}] ${message.text()}`));
      page.on('pageerror', (error) => logs.pageErrors.push(error.stack ?? error.message));

      await use(logs);

      await testInfo.attach('browser-logs.json', {
        body: JSON.stringify(logs, null, 2),
        contentType: 'application/json',
      });
    },
    { auto: true },
  ],
});
