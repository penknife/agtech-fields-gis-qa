import { expect, type Locator, type Page } from '@playwright/test';
import { STORAGE_KEY } from '@data/app-data';
import { AddPointDialog } from './components/add-point-dialog';
import { DataMenu } from './components/data-menu';
import { FieldsList } from './components/fields-list';
import { MapView } from './components/map-view';
import { PointsList } from './components/points-list';

/** Root page object for the «#/test» page: the sidebar (fields, points, data menu) and the map. */
export class AgTechApp {
  static readonly path = '/#/test';

  readonly title: Locator;
  readonly fields: FieldsList;
  readonly points: PointsList;
  readonly map: MapView;
  readonly addPointDialog: AddPointDialog;
  readonly dataMenu: DataMenu;

  constructor(readonly page: Page) {
    this.title = page.getByRole('heading', { level: 1, name: 'AgTech Fields GIS' });
    this.fields = new FieldsList(page);
    this.points = new PointsList(page);
    this.map = new MapView(page);
    this.addPointDialog = new AddPointDialog(page);
    this.dataMenu = new DataMenu(page);
  }

  async open(): Promise<void> {
    await this.page.goto(AgTechApp.path);
    await this.waitUntilReady();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitUntilReady();
  }

  /** Removes the saved points, so the app falls back to its built-in demo points. */
  async clearSavedData(): Promise<void> {
    await this.page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
    await this.reload();
  }

  private async waitUntilReady(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.points.heading).toBeVisible();
    await this.map.waitUntilSettled();
  }
}
