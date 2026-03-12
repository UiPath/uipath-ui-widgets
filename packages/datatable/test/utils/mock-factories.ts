/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EntityGetResponse,
  FieldMetaData,
  EntityFieldDataType,
} from "@uipath/uipath-typescript/entities";
import { vi } from "vitest";
import { GridRow } from "../../src/types";

/**
 * Factory functions for creating mock data in tests
 */

export const createMockField = (
  overrides?: Partial<FieldMetaData>,
): FieldMetaData =>
  ({
    name: "testField",
    displayName: "Test Field",
    isSystemField: false,
    isForeignKey: false,
    fieldDataType: { name: EntityFieldDataType.STRING } as any,
    ...overrides,
  }) as FieldMetaData;

export const createMockEntity = (
  overrides?: Partial<EntityGetResponse>,
): EntityGetResponse =>
  ({
    id: "entity-1",
    name: "TestEntity",
    displayName: "Test Entity",
    fields: [
      createMockField({ name: "Id", displayName: "ID", isSystemField: true }),
      createMockField({ name: "name", displayName: "Name" }),
      createMockField({ name: "status", displayName: "Status" }),
    ],
    getRecords: vi.fn().mockResolvedValue({ items: [] }),
    update: vi.fn().mockResolvedValue(undefined),
    insert: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as any;

export const createMockGridRow = (overrides?: Partial<GridRow>): GridRow => ({
  id: `row-${Math.random().toString(36).substr(2, 9)}`,
  name: "Test Row",
  status: "Active",
  ...overrides,
});

export const createMockGridRows = (count: number): GridRow[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockGridRow({
      Id: `row-${i + 1}`,
      name: `Row ${i + 1}`,
    }),
  );
};

export const createMockSdk = () => ({
  entities: {
    getById: vi.fn().mockResolvedValue(createMockEntity()),
    getRecordsById: vi.fn().mockResolvedValue({ items: createMockGridRows(5) }),
  },
});

/**
 * Create a mock field with foreign key configuration
 */
export const createMockForeignKeyField = (
  overrides?: Partial<FieldMetaData>,
): FieldMetaData => {
  return createMockField({
    name: "category",
    displayName: "Category",
    isForeignKey: true,
    referenceEntity: { id: "ref-entity-1" } as any,
    referenceField: { definition: { name: "name" } } as any,
    ...overrides,
  });
};

/**
 * Create a mock date field
 */
export const createMockDateField = (
  overrides?: Partial<FieldMetaData>,
): FieldMetaData => {
  return createMockField({
    name: "createdAt",
    displayName: "Created At",
    fieldDataType: { name: EntityFieldDataType.DATE } as any,
    ...overrides,
  });
};
