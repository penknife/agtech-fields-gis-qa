import { expect, type Locator, type Page } from '@playwright/test';

export class DataMenu {
  readonly toggle: Locator;
  readonly loadDemoSampleItem: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    this.toggle = page.getByRole('button', { name: 'Дані', exact: true });
    this.loadDemoSampleItem = page.getByRole('button', { name: 'Завантажити демо-зразок' });
    this.toast = page.getByRole('status');
  }

  async open(): Promise<void> {
    if (!(await this.loadDemoSampleItem.isVisible())) {
      await this.toggle.click();
    }
    await expect(this.loadDemoSampleItem).toBeVisible();
  }

  /** «Дані → Завантажити демо-зразок»: imports /samples/monitoring-points-sample.geojson. */
  async loadDemoSample(expectedPoints: number): Promise<void> {
    await this.open();
    await this.loadDemoSampleItem.click();
    await expect(this.toast).toContainText(`Завантажено ${expectedPoints} точок з еталонного мок-файлу`);
    await this.toast.getByRole('button', { name: 'Закрити сповіщення' }).click();
    await expect(this.toast).toBeHidden();
  }
}
