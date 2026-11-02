import { CLEAN_STATE, DEMO_SAMPLE_STATE, MGRS_PATTERN, withPointAdded } from '@data/app-data';
import { DISEASE_POINT_IN_CORN, PESTS_POINT_IN_WHEAT } from '@data/points.data';
import { expect, expectDataState, test } from '@fixtures';

/** Dialog shows 5 decimals, the app stores 6: both must describe the same spot. */
const DIALOG_PRECISION = 0.000005;

test.describe('Add monitoring point (TC-02)', () => {
  test('adds a point inside the active field and keeps it after reload', async ({ cleanApp: app, browserLogs }) => {
    const { field, type, description } = PESTS_POINT_IN_WHEAT;
    const expected = withPointAdded(CLEAN_STATE, field);
    const markersBefore = await app.map.countMarkers();

    await test.step('Поле №1 is active by default', async () => {
      await app.fields.expectActive(field);
    });

    const spot = await test.step('Click inside the active field', () => app.map.clickInsideActiveField());

    const coordinates = await test.step('The dialog opens with coordinates and default values', async () => {
      const read = await app.addPointDialog.readCoordinates();
      expect.soft(read.mgrs).toMatch(MGRS_PATTERN);
      return read;
    });

    const saveStartedAt = new Date();
    await test.step(`Save a «${type}» point with a description`, () =>
      app.addPointDialog.savePoint({ type, description }),
    );
    const saveFinishedAt = new Date();

    const card = app.points.card({ type, mgrs: coordinates.mgrs, field });
    const created = await test.step('The point appears first in the list and on the field counter', async () => {
      await expectDataState(app, expected);
      await expect(card.root).toBeVisible();
      await expect.soft(app.points.first.root, 'newest point is listed first').toHaveAccessibleName(
        `Точка заміру ${type}, сітка ${coordinates.mgrs}, ${field}`,
      );
      await expect.soft(card.typeLabel).toHaveText(type);
      await expect.soft(card.fieldLabel).toHaveText(`• ${field}`);
      await expect.soft(card.description).toHaveText(description);
      await expect.soft(card.mgrs).toHaveText(coordinates.mgrs);

      const created = await card.readCreatedAt();
      expect.soft(created.getTime(), 'createdAt is the save time').toBeGreaterThanOrEqual(saveStartedAt.getTime() - 1_000);
      expect.soft(created.getTime(), 'createdAt is the save time').toBeLessThanOrEqual(saveFinishedAt.getTime() + 1_000);
      return created;
    });

    await test.step('A marker is added where the map was clicked, and its popup shows the point', async () => {
      await expect(app.map.markers).toHaveCount(markersBefore + 1);
      const popup = await app.map.openMarkerAt(spot);
      await expect(popup.root).toHaveAccessibleName(`Моніторингова точка ${type}, ${field}`);
      await expect(popup.typeLabel).toHaveText(type);
      await expect(popup.fieldLabel).toHaveText(field);
      await expect(popup.description).toHaveText(`"${description}"`);
      await expect(popup.mgrs).toHaveText(coordinates.mgrs);

      const stored = await popup.readCoordinates();
      expect(Math.abs(stored.lat - coordinates.lat)).toBeLessThanOrEqual(DIALOG_PRECISION);
      expect(Math.abs(stored.lng - coordinates.lng)).toBeLessThanOrEqual(DIALOG_PRECISION);
    });

    await test.step('The point is still there after reload', async () => {
      await app.reload();
      await expectDataState(app, expected);
      await expect(card.description).toHaveText(description);
      expect(await card.readCreatedAt(), 'reload keeps the original createdAt').toEqual(created);
    });

    expect.soft(browserLogs.pageErrors, 'no uncaught errors in the page').toEqual([]);
  });

  test('adds a point to another field after the demo sample is loaded', async ({ appWithDemoSample: app, browserLogs }) => {
    const { field, type } = DISEASE_POINT_IN_CORN;
    const expected = withPointAdded(DEMO_SAMPLE_STATE, field);

    await test.step('Select Поле №3', () => app.fields.select(field));

    const { mgrs } = await test.step('Click inside the field and save a point without a description', async () => {
      await app.map.clickInsideActiveField();
      await app.addPointDialog.expectOpenWithDefaults();
      const read = await app.addPointDialog.readCoordinates();
      expect.soft(read.mgrs).toMatch(MGRS_PATTERN);
      await app.addPointDialog.savePoint({ type });
      return read;
    });

    const card = app.points.card({ type, mgrs, field });
    await test.step('Only the selected field counter grows', async () => {
      await expectDataState(app, expected);
      await expect(card.root).toBeVisible();
      await expect.soft(card.description, 'an empty description is not rendered').toHaveCount(0);
    });

    await test.step('The point and the demo sample are still there after reload', async () => {
      await app.reload();
      await expectDataState(app, expected);
      await expect(card.root).toBeVisible();
    });

    expect.soft(browserLogs.pageErrors, 'no uncaught errors in the page').toEqual([]);
  });
});
