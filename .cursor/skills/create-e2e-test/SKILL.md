---
name: create-e2e-test
description: Creates or extends Playwright + TypeScript end-to-end tests for AgTech Fields GIS in this project, using page objects, custom fixtures for data states (clean app, demo sample), test data modules and test.step. Use when the user asks to automate a test case (TC-xx), add or change a spec in tests/, add a page object or component, add a fixture or data state, or fix a locator.
---

# Create an E2E test for AgTech Fields GIS

## Project layout

```
src/data/            app-data.ts (fields, point types, known data states), <topic>.data.ts (inputs for tests)
src/pages/           agtech-app.ts (root page object) and components/<component>.ts
src/fixtures/        <name>.fixture.ts, merged in index.ts
tests/               <scenario>.spec.ts
```

File names are kebab-case; classes are PascalCase. Imports use the aliases `@data/*`, `@pages/*`, `@fixtures`.

## Rules

1. **Specs never work with elements directly.** A spec does two things only:
   - calls page object methods for every action and read (`app.fields.select(field)`, `dialog.savePoint(...)`, `popup.readCoordinates()`, `map.countMarkers()`);
   - passes page object locators to `expect(...)` / `expect.soft(...)`.

   Finding elements (`locator()`, `getByRole()`, `getByText()`…) and calling locator methods (`click()`, `fill()`, `count()`, `innerText()`, `getAttribute()`…) happen only in page objects. If a spec needs a new action or value, add a method to the page object. Both checks must print nothing:

   ```bash
   rg "locator\(|getBy" tests
   rg "\.(click|fill|count|innerText|textContent|getAttribute|press|check|hover|selectOption|isVisible|boundingBox|evaluate)\(" tests
   ```
2. **No test data literals in specs.** Inputs go to `src/data/<topic>.data.ts` (`satisfies` the input interface); known app states and helpers such as `withPointAdded` go to `src/data/app-data.ts`. Values read from the page at run time (e.g. `markersBefore`) stay in the spec.
3. **Start from a fixture, not from setup code in the spec.** Use `cleanApp` or `appWithDemoSample`; add a new data-state fixture when a test needs another starting state. See [references/fixtures.md](references/fixtures.md).
4. **One `test.step` per user action or checkpoint**, named in plain English (`'Select Поле №3'`, `'The point is still there after reload'`).
5. **Assertions:**
   - hard `expect` for preconditions and for anything later steps depend on (dialog open, counters, card visible, popup content, state after reload);
   - `expect.soft` for details of one result (card labels, order, timestamps), so a run reports every mismatch;
   - end every test with `expect.soft(browserLogs.pageErrors, 'no uncaught errors in the page').toEqual([])`.
6. **Title** the `describe` with the test case id: `test.describe('Add monitoring point (TC-02)', …)`.
7. **No retries, waits by time, or `test.skip` to hide flakiness.** Wait for a state (`expect(...)`, `expect.poll`) instead of `waitForTimeout`.

## Workflow

```
- [ ] 1. Read the test case (test-cases/02-test-cases.pdf) and list its steps and expected results
- [ ] 2. Check the real UI and accessible names (see "Checking the UI")
- [ ] 3. Add missing page object members (references/page-objects.md)
- [ ] 4. Add test data and, if needed, a data-state fixture (references/fixtures.md)
- [ ] 5. Write the spec with test.step
- [ ] 6. npm run typecheck
- [ ] 7. npm test
- [ ] 8. On failure, open the trace before changing code
```

## Checking the UI

The site is behind Basic Auth; credentials are in `.env` (`BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD`). Never print, commit or hardcode them.

Use the `playwright-cli` skill (`npx playwright cli …`) to open the page and take a snapshot: the snapshot shows roles and accessible names, which are what page objects should target. Facts about the app that matter for tests:

- Data lives only in `localStorage` (`agtech_monitoring_points_v1`); without it the app shows 3 built-in points. Each test gets a fresh browser context, so tests are isolated.
- After reload the active field resets to Поле №1.
- Selecting a field animates the map; call `app.map.waitUntilSettled()` (done inside `clickInsideActiveField`) before clicking the map.
- Toasts are `role=status` and hide after 4 s; close them with «Закрити сповіщення» when the next step needs a clean screen.
- «Скинути дані» and point deletion use `window.confirm`; handle it with `page.once('dialog', d => d.accept())` before the click.

## Running

```bash
npm run typecheck
npm test
npm run report
npm run trace -- test-results/<test>/trace.zip
```

Traces are recorded for every test; screenshots and video only for failed tests. Every test has a `browser-logs.json` attachment.

## Additional resources

- Page object conventions and templates: [references/page-objects.md](references/page-objects.md)
- Fixture conventions and templates: [references/fixtures.md](references/fixtures.md)
- Reference spec: `tests/add-point.spec.ts`
