# AgTech Fields GIS — QA

QA assignment for [AgTech Fields GIS](https://main.d8gkeeaiko6qy.amplifyapp.com/#/test), a client-only React app for agricultural fields and monitoring points: a list of 4 fields, a Leaflet map, monitoring points saved in `localStorage`, and GeoJSON / CSV import and export.

This folder contains:

| Folder | Content |
|---|---|
| [`test-cases/`](test-cases/02-test-cases.pdf) | 12 P1 test cases for the main scenarios |
| [`bugs/`](bugs/03-bug-reports.pdf) | 8 bug reports (BUG-01…BUG-08) with priorities and screenshots |
| `tests/`, `src/` | Playwright + TypeScript automation of the key scenario: adding a monitoring point (TC-02) |

## Automated scenario

`tests/add-point.spec.ts` covers TC-02 «Add a monitoring point» with two tests:

1. **Clean state** (3 built-in points): click inside Поле №1, check the dialog (coordinates, MGRS, default values), save a «Шкідники» point with a description, then check:
   - the list total and the field counter;
   - the new card is listed first, with its type, field, description, MGRS and creation time;
   - a new marker and its popup with the same data and coordinates;
   - the point and its creation time stay the same after a page reload.
2. **After the demo sample** (9 points): select Поле №3, save a «Хвороби рослин» point without a description, check that only that field's counter grows, and that everything stays after a reload.

Key checks are hard assertions; card details use `expect.soft`, so one run reports every mismatch.

## Project structure

```
src/
  data/
    app-data.ts          fields, point types, known data states (clean, demo sample)
    points.data.ts       points created by the tests
  pages/
    agtech-app.ts        root page object: open, reload, clear saved data
    components/          fields-list, points-list, map-view, add-point-dialog, data-menu
  fixtures/
    browser-logs.fixture.ts   console messages and page errors, attached to every test
    app.fixture.ts            `app`: page object created and the app opened
    data-state.fixture.ts     `cleanApp`, `appWithDemoSample`
    index.ts                  merges the fixtures
tests/
  add-point.spec.ts
```

## Running the tests

Requirements: Node.js 20+ and Google Chrome (tests use the installed Chrome via `channel: 'chrome'`).

1. Install dependencies:

   ```bash
   npm install
   npx playwright install ffmpeg   # needed for videos of failed tests
   ```

2. Create `.env` from `.env.example` and fill in the site's Basic Auth credentials. `.env` is git-ignored.

   ```
   BASE_URL=https://main.d8gkeeaiko6qy.amplifyapp.com
   BASIC_AUTH_USERNAME=...
   BASIC_AUTH_PASSWORD=...
   PW_CHANNEL=chrome
   ```

   To use the bundled Chromium instead, set `PW_CHANNEL=chromium` and run `npx playwright install chromium`.

3. Run:

   | Command | What it does |
   |---|---|
   | `npm test` | Run all tests headless |
   | `npm run test:headed` | Run with a visible browser |
   | `npm run typecheck` | TypeScript check without running |
   | `npm run report` | Open the HTML report |
   | `npm run trace -- test-results/<test>/trace.zip` | Open a test's trace |

## Reports and traces

- **Trace** is recorded for every test (`trace: 'on'`) in `test-results/<test>/trace.zip`, and is also available from the HTML report.
- **Screenshot and video** are kept only for failed tests.
- **Browser logs**: every test gets a `browser-logs.json` attachment with console messages and uncaught page errors.
