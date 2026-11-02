export const STORAGE_KEY = 'agtech_monitoring_points_v1';

export const FIELDS = {
  wheat: 'Поле №1 - Озима пшениця',
  sunflower: 'Поле №2 - Соняшник класичний',
  corn: 'Поле №3 - Кукурудза на зерно',
  rapeseed: 'Поле №4 - Ріпак озимий',
} as const;

export type FieldName = (typeof FIELDS)[keyof typeof FIELDS];

export const POINT_TYPES = {
  soilSample: 'Проба ґрунту',
  pests: 'Шкідники',
  plantDisease: 'Хвороби рослин',
  other: 'Інше',
} as const;

export type PointType = (typeof POINT_TYPES)[keyof typeof POINT_TYPES];

export interface DataState {
  totalPoints: number;
  pointsPerField: Record<FieldName, number>;
}

/** Built-in demo points shown when nothing is saved in localStorage. */
export const CLEAN_STATE: DataState = {
  totalPoints: 3,
  pointsPerField: {
    [FIELDS.wheat]: 2,
    [FIELDS.sunflower]: 1,
    [FIELDS.corn]: 0,
    [FIELDS.rapeseed]: 0,
  },
};

/** Clean state plus «Дані → Завантажити демо-зразок» (6 more points). */
export const DEMO_SAMPLE_STATE: DataState = {
  totalPoints: 9,
  pointsPerField: {
    [FIELDS.wheat]: 4,
    [FIELDS.sunflower]: 2,
    [FIELDS.corn]: 1,
    [FIELDS.rapeseed]: 2,
  },
};

export const DEMO_SAMPLE_SIZE = 6;

/** The given state with one more point in the given field. */
export function withPointAdded(state: DataState, field: FieldName): DataState {
  return {
    totalPoints: state.totalPoints + 1,
    pointsPerField: { ...state.pointsPerField, [field]: state.pointsPerField[field] + 1 },
  };
}

/** MGRS as rendered by the app, e.g. "36U UA 22148 87973". All fields lie in grid square 36U UA. */
export const MGRS_PATTERN = /^36U UA \d{5} \d{5}$/;
