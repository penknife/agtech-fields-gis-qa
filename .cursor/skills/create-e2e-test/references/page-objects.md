# Page objects

## Structure

- `AgTechApp` (`src/pages/agtech-app.ts`) is the only object a spec receives. It owns navigation (`open`, `reload`, `clearSavedData`) and exposes components as readonly properties: `fields`, `points`, `map`, `addPointDialog`, `dataMenu`.
- A **component** (`src/pages/components/<name>.ts`) covers one region of the page: a list, the map, a dialog, a menu.
- An **item object** wraps one repeated element and takes its root locator in the constructor: `PointCard` (list item), `PointPopup` (marker popup). A component returns it from a method such as `points.card({...})` or `map.openMarkerAt(spot)`.
- Add a new component to `AgTechApp` instead of creating it in a spec.

## Locators

Prefer, in this order:

1. `getByRole` with the accessible name. The app names most elements through `aria-label` / `aria-labelledby`, e.g. the point card `Точка заміру <type>, сітка <MGRS>, <field>`, the dialog `Додати моніторингову точку`, the map `main` «Робоча область інтерактивної карти».
2. `getByText` / `getByLabel` scoped to a component root.
3. CSS, only where there is no accessible name: Leaflet internals (`path.leaflet-interactive`, `.leaflet-marker-icon`, `.leaflet-popup`) and structure inside an item (`header span`, `footer span`, `time`).

Scope every locator to the component or item root. Build names from typed data (`FieldName`, `PointType`), not from literals scattered across files. Escape user text before putting it in a RegExp.

## Members

| Kind | Form | Example |
|---|---|---|
| Element | `readonly` locator set in the constructor, or a getter on item objects | `saveButton`, `card.mgrs` |
| Action | `async` verb, waits for the result of the action | `select(field)` waits for `aria-pressed=true`; `save()` waits for the dialog to close |
| Composite action | one call for a whole user action | `savePoint({ type, description })` |
| Read | `async read<Thing>()` returning a parsed value; throws with a clear message if it can't parse | `readCoordinates()`, `readCreatedAt(): Promise<Date>` |
| Shared check | `async expect<Thing>()`, only for checks repeated across tests | `expectActive(field)`, `expectTotal(n)` |

Keep test-specific assertions in the spec; page objects only hold waits that belong to the action and shared checks.

A spec may use a locator member only as the argument of `expect(...)`. Any other use (clicking, filling, counting, reading text or attributes) needs a page object method, even a one-line one such as `countMarkers()`.

## Template

```ts
import { expect, type Locator, type Page } from '@playwright/test';
import type { PointType } from '@data/app-data';

export class ExampleDialog {
  readonly root: Locator;
  readonly typeSelect: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'Dialog name' });
    this.typeSelect = this.root.getByRole('combobox', { name: 'Тип моніторингу' });
    this.saveButton = this.root.getByRole('button', { name: 'Зберегти точку' });
  }

  async selectType(type: PointType): Promise<void> {
    await this.typeSelect.selectOption({ label: type });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await expect(this.root).toBeHidden();
  }
}
```

## Map

Map clicks are coordinate based:

- `map.clickInsideActiveField()` waits for the map to settle, finds a free spot inside the active field polygon and returns its viewport coordinates.
- `map.openMarkerAt(spot)` finds the marker centred on that spot and returns a `PointPopup`.

Reuse these instead of clicking the map with fixed coordinates.
