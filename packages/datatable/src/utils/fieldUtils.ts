import { FieldMetaData } from '@uipath/uipath-typescript';

/**
 * Extract the display value for a field
 * For foreign key fields, returns the reference field value
 * For regular fields, returns the value as-is
 */
export const getFieldValue = (value: unknown, field: FieldMetaData | undefined): unknown => {
  if (field?.isForeignKey) {
    const referenceFieldName = field.referenceField?.definition?.name;
    return referenceFieldName && value && typeof value === 'object'
      ? (value as Record<string, unknown>)[referenceFieldName]
      : value;
  }
  return value;
};
