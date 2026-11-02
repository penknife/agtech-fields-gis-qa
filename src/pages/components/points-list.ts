import { expect, type Locator, type Page } from '@playwright/test';
import type { FieldName, PointType } from '@data/app-data';

export interface PointIdentity {
  type: PointType;
  mgrs: string;
  field: FieldName;
}

export class PointsList {
  readonly heading: Locator;
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 2, name: /^Моніторингові точки \(\d+\)$/ });
    this.items = page.getByRole('button', { name: /^Точка заміру / });
  }

  /** Point card; its accessible name is "Точка заміру <type>, сітка <MGRS>, <field>". */
  card(point: PointIdentity): PointCard {
    return new PointCard(
      this.page.getByRole('button', {
        name: `Точка заміру ${point.type}, сітка ${point.mgrs}, ${point.field}`,
        exact: true,
      }),
    );
  }

  get first(): PointCard {
    return new PointCard(this.items.first());
  }

  async expectTotal(count: number): Promise<void> {
    await expect(this.heading).toHaveText(`Моніторингові точки (${count})`);
  }
}

export class PointCard {
  constructor(readonly root: Locator) {}

  get typeLabel(): Locator {
    return this.root.locator('header span').first();
  }

  get fieldLabel(): Locator {
    return this.root.locator('header span').nth(1);
  }

  get description(): Locator {
    return this.root.locator('p').first();
  }

  get mgrs(): Locator {
    return this.root.locator('footer span').first();
  }

  get createdAt(): Locator {
    return this.root.locator('time');
  }

  /** Exact creation time from <time datetime>; the visible text is rounded to minutes. */
  async readCreatedAt(): Promise<Date> {
    const value = await this.createdAt.getAttribute('datetime');
    const created = value ? new Date(value) : undefined;
    if (!created || Number.isNaN(created.getTime())) {
      throw new Error(`Point card has no valid <time datetime> value: "${value}"`);
    }
    return created;
  }
}
