import { FIELDS, POINT_TYPES, type FieldName, type PointType } from './app-data';

export interface NewPoint {
  field: FieldName;
  type: PointType;
  description?: string;
}

/** Point added to the default active field in the clean state. */
export const PESTS_POINT_IN_WHEAT = {
  field: FIELDS.wheat,
  type: POINT_TYPES.pests,
  description: 'Колонія попелиці на краю поля, близько 15 уражених рослин',
} satisfies NewPoint;

/** Point without a description, added to a field selected by the user after the demo sample. */
export const DISEASE_POINT_IN_CORN = {
  field: FIELDS.corn,
  type: POINT_TYPES.plantDisease,
} satisfies NewPoint;
