import { expect, mergeTests } from '@playwright/test';
import { test as browserLogsTest } from './browser-logs.fixture';
import { test as dataStateTest } from './data-state.fixture';

export const test = mergeTests(browserLogsTest, dataStateTest);

export { expect };
export { expectDataState } from './data-state.fixture';
export type { BrowserLogs } from './browser-logs.fixture';
