import type { Locator } from '@playwright/test';

/** Marker popup: header (type, field), quoted description, footer ("lat, lng", MGRS, date). */
export class PointPopup {
  constructor(readonly root: Locator) {}

  get typeLabel(): Locator {
    return this.root.locator('header span').first();
  }

  get fieldLabel(): Locator {
    return this.root.locator('header div div');
  }

  get description(): Locator {
    return this.root.locator('p');
  }

  get coordinates(): Locator {
    return this.root.locator('footer span').first();
  }

  get mgrs(): Locator {
    return this.root.locator('footer span').nth(1);
  }

  /** Reads the "lat, lng" line. The app stores up to 6 decimals and drops trailing zeros. */
  async readCoordinates(): Promise<{ lat: number; lng: number }> {
    const text = await this.coordinates.innerText();
    const [lat, lng] = text.split(',').map((part) => Number(part.trim()));
    if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error(`Cannot parse popup coordinates from "${text}"`);
    }
    return { lat, lng };
  }
}
