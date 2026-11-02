import { expect, type Locator, type Page } from '@playwright/test';
import type { FieldName } from '@data/app-data';

export class FieldsList {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 2, name: /^Сільгосп поля \(\d+\)$/ });
  }

  /** Field card; its accessible name is "<field>, площа <area> гектарів, культура <crop>". */
  card(field: FieldName): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(field)}, площа`) });
  }

  pointsCounter(field: FieldName): Locator {
    return this.card(field).getByText('Точок моніторингу:').locator('xpath=following-sibling::*[1]');
  }

  async select(field: FieldName): Promise<void> {
    await this.card(field).click();
    await this.expectActive(field);
  }

  async expectActive(field: FieldName): Promise<void> {
    await expect(this.card(field)).toHaveAttribute('aria-pressed', 'true');
  }

  async expectPointsCounts(counts: Record<FieldName, number>): Promise<void> {
    for (const [field, count] of Object.entries(counts) as [FieldName, number][]) {
      await expect(this.pointsCounter(field), `points counter of ${field}`).toHaveText(String(count));
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
