/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldMetaData } from '@uipath/uipath-typescript';

export const getFieldValue = (value: any, field: FieldMetaData | undefined) => {
  if (field?.isForeignKey) {
    const referenceFieldName = field.referenceField?.definition?.name;
    return referenceFieldName ? value?.[referenceFieldName] : value;
  }
  return value;
};
