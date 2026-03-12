/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
  getFieldValue,
  createValueSetter,
  createCellEditorSelector,
  isFieldTypeDate,
  isChoiceSetSingle,
  isChoiceSetMultiple,
  ChoiceSetValuesMap,
  getMimeType,
} from "../fieldUtils";
import {
  EntityFieldDataType,
  FieldDisplayType,
  FieldMetaData,
} from "@uipath/uipath-typescript/entities";
import { GridRow } from "../../types";

describe("fieldUtils", () => {
  describe("getFieldValue", () => {
    it("should return value for non-foreign key field", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        name: "name",
      };
      const value = "John Doe";

      const result = getFieldValue(value, field as FieldMetaData);

      expect(result).toBe("John Doe");
    });

    it("should return reference field value for foreign key", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        referenceField: {
          definition: { name: "displayName" },
        } as any,
      };
      const value = { Id: "123", displayName: "Reference Value" };

      const result = getFieldValue(value, field as FieldMetaData);

      expect(result).toBe("Reference Value");
    });

    it("should return value directly if reference field name is not found", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        referenceField: undefined,
      };
      const value = { Id: "123", name: "Value" };

      const result = getFieldValue(value, field as FieldMetaData);

      expect(result).toEqual({ Id: "123", name: "Value" });
    });

    it("should format Date objects for date fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      };
      const value = new Date("2023-12-17");

      const result = getFieldValue(value, field as FieldMetaData);

      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format varies by locale
    });

    it("should return value as-is for date field with non-Date value", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      };
      const value = "2023-12-17";

      const result = getFieldValue(value, field as FieldMetaData);

      expect(result).toBe("2023-12-17");
    });

    it("should handle undefined field", () => {
      const value = "test";

      const result = getFieldValue(value, undefined);

      expect(result).toBe("test");
    });

    it("should handle null value", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
      };

      const result = getFieldValue(null, field as FieldMetaData);

      expect(result).toBe(null);
    });

    it("should resolve ChoiceSetSingle integer value to displayName", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
        choiceSetId: "cs-1",
      };
      const choiceSetValuesMap: ChoiceSetValuesMap = new Map([
        [
          "cs-1",
          new Map([
            [1, "High"],
            [2, "Medium"],
            [3, "Low"],
          ]),
        ],
      ]);

      const result = getFieldValue(
        2,
        field as FieldMetaData,
        choiceSetValuesMap,
      );

      expect(result).toBe("Medium");
    });

    it("should return stringified value for ChoiceSetSingle when numberId not found", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
        choiceSetId: "cs-1",
      };
      const choiceSetValuesMap: ChoiceSetValuesMap = new Map([
        ["cs-1", new Map([[1, "High"]])],
      ]);

      const result = getFieldValue(
        99,
        field as FieldMetaData,
        choiceSetValuesMap,
      );

      expect(result).toBe("99");
    });

    it("should return value as-is for ChoiceSetSingle without map", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
        choiceSetId: "cs-1",
      };

      const result = getFieldValue(2, field as FieldMetaData);

      expect(result).toBe(2);
    });

    it("should resolve ChoiceSetMultiple integer array to displayNames", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetMultiple,
        choiceSetId: "cs-2",
      };
      const choiceSetValuesMap: ChoiceSetValuesMap = new Map([
        [
          "cs-2",
          new Map([
            [1, "Red"],
            [2, "Green"],
            [3, "Blue"],
          ]),
        ],
      ]);

      const result = getFieldValue(
        [1, 3],
        field as FieldMetaData,
        choiceSetValuesMap,
      );

      expect(result).toBe("Red, Blue");
    });

    it("should return value as-is for ChoiceSetMultiple with non-array value", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetMultiple,
      };

      const result = getFieldValue("single value", field as FieldMetaData);

      expect(result).toBe("single value");
    });
  });

  describe("createValueSetter", () => {
    it("should create a value setter that updates field value", () => {
      const fieldName = "name";
      const valueSetter = createValueSetter(fieldName);
      const data: GridRow = { Id: "row1", name: "Old Name", id: "row1" };
      const params = {
        data,
        newValue: "New Name",
      } as any;

      const result = valueSetter(params);

      expect(result).toBe(true);
      expect(data.name).toBe("New Name");
    });

    it("should return false when data is undefined", () => {
      const fieldName = "name";
      const valueSetter = createValueSetter(fieldName);
      const params = {
        data: undefined,
        newValue: "New Name",
      } as any;

      const result = valueSetter(params);

      expect(result).toBe(false);
    });

    it("should handle setting nested field values", () => {
      const fieldName = "user.name";
      const valueSetter = createValueSetter(fieldName);
      const data: any = { Id: "row1", user: { name: "Old Name" } };
      const params = {
        data,
        newValue: "New Name",
      } as any;

      const result = valueSetter(params);

      expect(result).toBe(true);
      expect(data["user.name"]).toBe("New Name");
    });
  });

  describe("createCellEditorSelector", () => {
    it("should return RefFieldCellEditor for foreign key fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        name: "category",
      };
      const entityService = {} as any;
      const choiceSetService = {} as any;
      const cellEditorSelector = createCellEditorSelector(
        field as FieldMetaData,
        entityService,
        choiceSetService,
      );
      const params = {
        data: { Id: "row1" },
      } as any;

      const result = cellEditorSelector(params);

      expect(result).toBeDefined();
      expect(result?.component).toBeDefined();
      expect(result?.params).toEqual({
        entityService,
        field,
        entityRecord: params.data,
      });
    });

    it("should return ChoiceSetSingleCellEditor for ChoiceSetSingle fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
        choiceSetId: "cs-1",
      };
      const entityService = {} as any;
      const choiceSetService = {} as any;
      const cellEditorSelector = createCellEditorSelector(
        field as FieldMetaData,
        entityService,
        choiceSetService,
      );
      const params = { data: { Id: "row1" } } as any;

      const result = cellEditorSelector(params);

      expect(result).toBeDefined();
      expect(result?.component).toBeDefined();
      expect(result?.params).toEqual({
        choiceSetService,
        field,
        entityRecord: params.data,
      });
    });

    it("should return ChoiceSetMultipleCellEditor for ChoiceSetMultiple fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDisplayType: FieldDisplayType.ChoiceSetMultiple,
        choiceSetId: "cs-2",
      };
      const entityService = {} as any;
      const choiceSetService = {} as any;
      const cellEditorSelector = createCellEditorSelector(
        field as FieldMetaData,
        entityService,
        choiceSetService,
      );
      const params = { data: { Id: "row1" } } as any;

      const result = cellEditorSelector(params);

      expect(result).toBeDefined();
      expect(result?.component).toBeDefined();
      expect(result?.params).toEqual({
        choiceSetService,
        field,
        entityRecord: params.data,
      });
    });

    it("should return agDateStringCellEditor for date fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      };
      const entityService = {} as any;
      const choiceSetService = {} as any;
      const cellEditorSelector = createCellEditorSelector(
        field as FieldMetaData,
        entityService,
        choiceSetService,
      );
      const params = { data: { Id: "row1" } } as any;

      const result = cellEditorSelector(params);

      expect(result).toEqual({
        component: "agDateStringCellEditor",
      });
    });

    it("should return undefined for regular fields", () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.STRING } as any,
      };
      const entityService = {} as any;
      const choiceSetService = {} as any;
      const cellEditorSelector = createCellEditorSelector(
        field as FieldMetaData,
        entityService,
        choiceSetService,
      );
      const params = { data: { Id: "row1" } } as any;

      const result = cellEditorSelector(params);

      expect(result).toBeUndefined();
    });
  });

  describe("isFieldTypeDate", () => {
    it("should return true for DATE field type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      };

      const result = isFieldTypeDate(field as FieldMetaData);

      expect(result).toBe(true);
    });

    it("should return false for non-DATE field types", () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.STRING } as any,
      };

      const result = isFieldTypeDate(field as FieldMetaData);

      expect(result).toBe(false);
    });

    it("should return false for NUMBER field type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.INTEGER } as any,
      };

      const result = isFieldTypeDate(field as FieldMetaData);

      expect(result).toBe(false);
    });
  });

  describe("isChoiceSetSingle", () => {
    it("should return true for ChoiceSetSingle display type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
      };

      expect(isChoiceSetSingle(field as FieldMetaData)).toBe(true);
    });

    it("should return false for non-ChoiceSetSingle display type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDisplayType: FieldDisplayType.Basic,
      };

      expect(isChoiceSetSingle(field as FieldMetaData)).toBe(false);
    });
  });

  describe("isChoiceSetMultiple", () => {
    it("should return true for ChoiceSetMultiple display type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDisplayType: FieldDisplayType.ChoiceSetMultiple,
      };

      expect(isChoiceSetMultiple(field as FieldMetaData)).toBe(true);
    });

    it("should return false for non-ChoiceSetMultiple display type", () => {
      const field: Partial<FieldMetaData> = {
        fieldDisplayType: FieldDisplayType.Basic,
      };

      expect(isChoiceSetMultiple(field as FieldMetaData)).toBe(false);
    });
  });

  describe("getMimeType", () => {
    it("should return correct mime type for pdf", () => {
      expect(getMimeType("report.pdf")).toBe("application/pdf");
    });

    it("should return correct mime type for png", () => {
      expect(getMimeType("image.png")).toBe("image/png");
    });

    it("should return correct mime type for jpg", () => {
      expect(getMimeType("photo.jpg")).toBe("image/jpeg");
    });

    it("should return correct mime type for jpeg", () => {
      expect(getMimeType("photo.jpeg")).toBe("image/jpeg");
    });

    it("should return correct mime type for csv", () => {
      expect(getMimeType("data.csv")).toBe("text/csv");
    });

    it("should return correct mime type for json", () => {
      expect(getMimeType("config.json")).toBe("application/json");
    });

    it("should return correct mime type for mp4", () => {
      expect(getMimeType("video.mp4")).toBe("video/mp4");
    });

    it("should return correct mime type for mp3", () => {
      expect(getMimeType("audio.mp3")).toBe("audio/mpeg");
    });

    it("should return octet-stream for unknown extensions", () => {
      expect(getMimeType("file.xyz")).toBe("application/octet-stream");
    });

    it("should return octet-stream for files with no extension", () => {
      expect(getMimeType("README")).toBe("application/octet-stream");
    });

    it("should handle uppercase extensions", () => {
      expect(getMimeType("FILE.PDF")).toBe("application/pdf");
    });

    it("should handle mixed case extensions", () => {
      expect(getMimeType("image.Png")).toBe("image/png");
    });

    it("should handle files with multiple dots", () => {
      expect(getMimeType("my.report.final.pdf")).toBe("application/pdf");
    });

    it("should return octet-stream for empty string", () => {
      expect(getMimeType("")).toBe("application/octet-stream");
    });
  });
});
