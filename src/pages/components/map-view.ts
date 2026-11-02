import { expect, type Locator, type Page } from '@playwright/test';
import { PointPopup } from './point-popup';

export interface ScreenPoint {
  x: number;
  y: number;
}

export class MapView {
  readonly root: Locator;
  readonly activeField: Locator;
  readonly markers: Locator;
  readonly popup: PointPopup;
  readonly focusActiveFieldButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('main', { name: 'Робоча область інтерактивної карти' });
    // Leaflet renders inactive fields with a dashed stroke; the active one has no dash array.
    this.activeField = this.root.locator('path.leaflet-interactive:not([stroke-dasharray])');
    this.markers = this.root.locator('.leaflet-marker-icon');
    this.popup = new PointPopup(
      this.root.locator('.leaflet-popup').getByRole('article', { name: /^Моніторингова точка / }),
    );
    this.focusActiveFieldButton = this.root.getByRole('button', { name: 'Сфокусувати активне поле' });
  }

  async countMarkers(): Promise<number> {
    return this.markers.count();
  }

  /** Waits until the fly-to / fit-bounds animation has finished and the active field stops moving. */
  async waitUntilSettled(): Promise<void> {
    await expect(this.activeField).toBeVisible();
    let previous = '';
    await expect
      .poll(
        async () => {
          const box = await this.activeField.boundingBox();
          const current = JSON.stringify(box && [box.x, box.y, box.width, box.height].map(Math.round));
          const settled = current === previous;
          previous = current;
          return settled;
        },
        { message: 'map animation did not settle', intervals: [250] },
      )
      .toBe(true);
  }

  /**
   * Clicks a spot inside the active field that is not covered by a marker or a map control,
   * and returns its viewport coordinates.
   */
  async clickInsideActiveField(): Promise<ScreenPoint> {
    await this.waitUntilSettled();
    const spot = await this.activeField.evaluate((field) => {
      const box = field.getBoundingClientRect();
      const fractions = [0.5, 0.4, 0.6, 0.3, 0.7];
      for (const fx of fractions) {
        for (const fy of fractions) {
          const x = Math.round(box.left + box.width * fx);
          const y = Math.round(box.top + box.height * fy);
          if (document.elementFromPoint(x, y) === field) return { x, y };
        }
      }
      return null;
    });
    if (!spot) throw new Error('Could not find a free spot inside the active field');
    await this.page.mouse.click(spot.x, spot.y);
    return spot;
  }

  /** Returns the marker whose centre is at the given viewport coordinates (markers are anchored at their centre). */
  async markerAt(spot: ScreenPoint, tolerancePx = 3): Promise<Locator> {
    let index = -1;
    await expect
      .poll(
        async () => {
          index = await this.markers.evaluateAll(
            (markers, { x, y, tolerance }) =>
              markers.findIndex((marker) => {
                const r = marker.getBoundingClientRect();
                return Math.abs(r.left + r.width / 2 - x) <= tolerance && Math.abs(r.top + r.height / 2 - y) <= tolerance;
              }),
            { ...spot, tolerance: tolerancePx },
          );
          return index;
        },
        { message: `no marker is rendered at (${spot.x}, ${spot.y})` },
      )
      .toBeGreaterThanOrEqual(0);
    return this.markers.nth(index);
  }

  /** Clicks the marker at the given viewport coordinates and returns the opened popup. */
  async openMarkerAt(spot: ScreenPoint): Promise<PointPopup> {
    await (await this.markerAt(spot)).click();
    await expect(this.popup.root).toBeVisible();
    return this.popup;
  }
}
