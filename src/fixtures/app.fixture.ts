import { test as base } from '@playwright/test';
import { AgTechApp } from '@pages/agtech-app';

export const test = base.extend<{
  /** The app opened as is. */
  app: AgTechApp;
}>({
  app: async ({ page }, use) => {
    const app = new AgTechApp(page);
    await app.open();
    await use(app);
  },
});
