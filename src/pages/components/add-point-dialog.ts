import { expect, type Locator, type Page } from '@playwright/test';
import type { PointType } from '@data/app-data';

export interface DialogCoordinates {
  lat: number;
  lng: number;
  mgrs: string;
}

export class AddPointDialog {
  readonly root: Locator;
  readonly coordinates: Locator;
  readonly wgs84Value: Locator;
  readonly mgrsValue: Locator;
  readonly typeSelect: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'Додати моніторингову точку' });
    this.coordinates = this.root.getByRole('region', { name: 'Географічні координати заміру' });
    this.wgs84Value = this.coordinates.getByText(/^-?\d+\.\d{5}, -?\d+\.\d{5}$/);
    this.mgrsValue = this.coordinates.getByText(/^(\d{1,2}[C-X] [A-Z]{2} \d{5} \d{5}|Некоректні координати)$/);
    this.typeSelect = this.root.getByRole('combobox', { name: 'Тип моніторингу' });
    this.descriptionInput = this.root.getByRole('textbox', { name: 'Опис (опціонально)' });
    this.saveButton = this.root.getByRole('button', { name: 'Зберегти точку' });
    this.cancelButton = this.root.getByRole('button', { name: 'Скасувати' });
  }

  async expectOpenWithDefaults(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.typeSelect.locator('option:checked')).toHaveText('Проба ґрунту');
    await expect(this.descriptionInput).toHaveValue('');
  }

  async readCoordinates(): Promise<DialogCoordinates> {
    const [lat, lng] = (await this.wgs84Value.innerText()).split(',').map((part) => Number(part.trim()));
    if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error('Cannot parse WGS 84 coordinates from the dialog');
    }
    return { lat, lng, mgrs: (await this.mgrsValue.innerText()).trim() };
  }

  async selectType(type: PointType): Promise<void> {
    await this.typeSelect.selectOption({ label: type });
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await expect(this.root).toBeHidden();
  }

  /** Selects the type, fills the description when given, and saves the point. */
  async savePoint(point: { type: PointType; description?: string }): Promise<void> {
    await this.selectType(point.type);
    if (point.description !== undefined) {
      await this.fillDescription(point.description);
    }
    await this.save();
  }
}
