/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChoiceSets,
  Entities,
  EntityFieldDataType,
  FieldDisplayType,
  FieldMetaData,
} from "@uipath/uipath-typescript/entities";
import { ICellEditorParams, ValueSetterParams } from "ag-grid-community";
import { ChoiceSetMultipleCellEditor } from "../components/ChoiceSetMultipleCellEditor";
import { ChoiceSetSingleCellEditor } from "../components/ChoiceSetSingleCellEditor";
import { RefFieldCellEditor } from "../components/RefFieldCellEditor";
import { GridRow } from "../types";

// Maps choiceSetId → (numberId → displayName)
export type ChoiceSetValuesMap = Map<string, Map<number, string>>;

export const getFieldValue = (
  value: any,
  field: FieldMetaData | undefined,
  choiceSetValuesMap?: ChoiceSetValuesMap,
): string => {
  if (field?.isForeignKey) {
    const referenceFieldName = field.referenceField?.definition?.name;
    return referenceFieldName ? value?.[referenceFieldName] : value;
  } else if (field && isChoiceSetSingle(field)) {
    if (typeof value === "number" && field.choiceSetId && choiceSetValuesMap) {
      return (
        choiceSetValuesMap.get(field.choiceSetId)?.get(value) || String(value)
      );
    }
    return value;
  } else if (field && isChoiceSetMultiple(field)) {
    if (Array.isArray(value) && field.choiceSetId && choiceSetValuesMap) {
      const lookup = choiceSetValuesMap.get(field.choiceSetId);
      return value
        .map((v: number) => lookup?.get(v) || String(v))
        .filter(Boolean)
        .join(", ");
    }
    return value;
  } else if (field && isFieldTypeDate(field) && value instanceof Date) {
    return value.toLocaleDateString();
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
  entityService: Entities,
  choiceSetService: ChoiceSets,
) => {
  return (params: ICellEditorParams<GridRow>) => {
    if (field.isForeignKey) {
      return {
        component: RefFieldCellEditor,
        params: { entityService, field, entityRecord: params.data },
      };
    } else if (isChoiceSetSingle(field)) {
      return {
        component: ChoiceSetSingleCellEditor,
        params: { choiceSetService, field, entityRecord: params.data },
      };
    } else if (isChoiceSetMultiple(field)) {
      return {
        component: ChoiceSetMultipleCellEditor,
        params: { choiceSetService, field, entityRecord: params.data },
      };
    } else if (isFieldTypeDate(field)) {
      return {
        component: "agDateStringCellEditor",
      };
    }
    return undefined;
  };
};

export const isFieldTypeDate = (field: FieldMetaData): boolean => {
  return field.fieldDataType?.name === EntityFieldDataType.DATE;
};

export const isChoiceSetSingle = (field: FieldMetaData): boolean => {
  return field.fieldDisplayType === FieldDisplayType.ChoiceSetSingle;
};

export const isChoiceSetMultiple = (field: FieldMetaData): boolean => {
  return field.fieldDisplayType === FieldDisplayType.ChoiceSetMultiple;
};
