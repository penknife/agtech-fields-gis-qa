import { CLEAN_STATE, DEMO_SAMPLE_SIZE, DEMO_SAMPLE_STATE, type DataState } from '@data/app-data';
import type { AgTechApp } from '@pages/agtech-app';
import { test as appTest } from './app.fixture';

export const test = appTest.extend<{
  /** The app with saved data removed: the 3 built-in demo points. */
  cleanApp: AgTechApp;
  /** The clean app plus «Дані → Завантажити демо-зразок»: 9 points across all 4 fields. */
  appWithDemoSample: AgTechApp;
}>({
  cleanApp: async ({ app }, use) => {
    await app.clearSavedData();
    await expectDataState(app, CLEAN_STATE);
    await use(app);
  },

  appWithDemoSample: async ({ cleanApp }, use) => {
    await cleanApp.dataMenu.loadDemoSample(DEMO_SAMPLE_SIZE);
    await expectDataState(cleanApp, DEMO_SAMPLE_STATE);
    await use(cleanApp);
  },
});

export async function expectDataState(app: AgTechApp, state: DataState): Promise<void> {
  await app.points.expectTotal(state.totalPoints);
  await app.fields.expectPointsCounts(state.pointsPerField);
}
