# Fixtures

## Files

| File | Fixtures | Purpose |
|---|---|---|
| `browser-logs.fixture.ts` | `browserLogs` (auto) | Collects console messages and page errors; attaches `browser-logs.json` after every test |
| `app.fixture.ts` | `app` | Creates `AgTechApp` and opens `/#/test` |
| `data-state.fixture.ts` | `cleanApp`, `appWithDemoSample` | Put the app in a known data state and verify it |
| `index.ts` | — | `mergeTests(...)`; re-exports `test`, `expect`, `expectDataState` |

Specs import only from `@fixtures`.

## Data states

| Fixture | Built from | State |
|---|---|---|
| `cleanApp` | `app` + `clearSavedData()` | `CLEAN_STATE`: 3 points, fields 2 / 1 / 0 / 0 |
| `appWithDemoSample` | `cleanApp` + «Дані → Завантажити демо-зразок» | `DEMO_SAMPLE_STATE`: 9 points, fields 4 / 2 / 1 / 2 |

Every data-state fixture:

1. builds on the previous state (chain fixtures, don't repeat setup);
2. verifies the state with `expectDataState(app, STATE)` before `use`, so a broken setup fails in the fixture and not in the middle of the test;
3. has its expected state defined in `src/data/app-data.ts`.

Use `withPointAdded(STATE, field)` to describe the expected state after a test adds a point.

## Adding a data-state fixture

1. Add the expected `DataState` to `src/data/app-data.ts`. Get its numbers from the live app, not from reasoning.
2. Add the fixture to `data-state.fixture.ts`. In this example `importFile` is a `DataMenu` method you would add first:

```ts
appWithImportedFile: async ({ cleanApp }, use) => {
  await cleanApp.dataMenu.importFile(IMPORT_FILE_PATH);
  await expectDataState(cleanApp, IMPORTED_STATE);
  await use(cleanApp);
},
```

3. Add the fixture's type to the `extend<{ ... }>` block with a one-line JSDoc describing the state.

## Adding another kind of fixture

Create `src/fixtures/<name>.fixture.ts` exporting `test = base.extend<...>(...)` and add it to `mergeTests` in `index.ts`. Use `{ auto: true }` only for fixtures every test needs without asking (like `browserLogs`). Put teardown after `await use(...)`, and attach diagnostics with `testInfo.attach`.

## Isolation

Playwright gives every test a new browser context, so `localStorage` starts empty and tests can run in parallel (`fullyParallel: true`). Don't share state between tests, and don't depend on test order.
