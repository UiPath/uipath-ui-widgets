/* eslint-disable @typescript-eslint/no-explicit-any */
import { RefFieldCellEditor } from '@uipath/datatable/components/RefFieldCellEditor';
import { GridRow } from '@uipath/datatable/types';
import { EntityFieldDataType, FieldMetaData, UiPath } from '@uipath/uipath-typescript';
import { ICellEditorParams, ValueSetterParams } from 'ag-grid-community';

export const getFieldValue = (value: any, field: FieldMetaData | undefined): string => {
  if (field?.isForeignKey) {
    const referenceFieldName = field.referenceField?.definition?.name;
    return referenceFieldName ? value?.[referenceFieldName] : value;
  } else if (field && isFieldTypeDate(field) && value instanceof Date) {
    return value.toLocaleDateString(); // yyyy-mm-dd
  }
  return value;
};

export const createValueSetter = (fieldName: string) => {
  return (params: ValueSetterParams<GridRow>) => {
    if (params.data) {
      params.data[fieldName] = params.newValue;
      return true;
    }
    return false;
  };
};

export const createCellEditorSelector = (
  field: FieldMetaData,
  sdk: UiPath,
) => {
  return (params: ICellEditorParams<GridRow>) => {
    if (field.isForeignKey) {
      return {
        component: RefFieldCellEditor,
        params: { sdk, field, entityRecord: params.data }
      };
    } else if (isFieldTypeDate(field)) {
      return {
        component: 'agDateStringCellEditor',
      }
    }
    return undefined;
  };
};

export const isFieldTypeDate = (field: FieldMetaData): boolean => {
  return field.fieldDataType.name === EntityFieldDataType.DATE
}
