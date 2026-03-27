/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEntityData } from "../useEntityData";
import {
  Entities,
  ChoiceSets,
  EntityFieldDataType,
  FieldDisplayType,
} from "@uipath/uipath-typescript/entities";
import { IdColumn } from "../../types";

// Mock telemetry
vi.mock("@uipath/uipath-typescript/core", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    telemetryClient: { track: vi.fn() },
  };
});

// Mock apollo-wind
vi.mock("@uipath/apollo-wind", () => ({
  toast: { error: vi.fn() },
  DateTimePicker: () => null,
}));

describe("useEntityData", () => {
  let mockEntityService: any;
  let mockChoiceSetService: any;
  let mockGetById: ReturnType<typeof vi.fn>;
  let mockGetAllRecords: ReturnType<typeof vi.fn>;

  const stringField = {
    name: "name",
    displayName: "Name",
    isSystemField: false,
    isForeignKey: false,
    fieldDataType: { name: "STRING" },
  };

  const idField = {
    name: IdColumn,
    displayName: IdColumn,
    isSystemField: true,
    isForeignKey: false,
    fieldDataType: { name: "STRING" },
  };

  const statusField = {
    name: "status",
    displayName: "Status",
    isSystemField: false,
    isForeignKey: false,
    fieldDataType: { name: "STRING" },
  };

  const mockRecords = [
    { Id: "row1", name: "Item 1", status: "Active" },
    { Id: "row2", name: "Item 2", status: "Inactive" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetAllRecords = vi.fn().mockResolvedValue({ items: mockRecords });
    mockGetById = vi.fn().mockResolvedValue({
      fields: [idField, stringField, statusField],
      getAllRecords: mockGetAllRecords,
    });

    mockEntityService = { getById: mockGetById } as any;
    mockChoiceSetService = {
      getById: vi.fn().mockResolvedValue({ items: [] }),
    } as any;
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    expect(result.current.rowData).toEqual([]);
    expect(result.current.columnDefs).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.entity).toBeUndefined();
  });

  it("should fetch and set row data", async () => {
    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(mockGetById).toHaveBeenCalledWith("entity-1");
    expect(mockGetAllRecords).toHaveBeenCalledWith({
      expansionLevel: 2,
      pageSize: 10000,
    });
    expect(result.current.rowData).toEqual(mockRecords);
  });

  it("should create column defs from non-system fields", async () => {
    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.columnDefs).toHaveLength(2);
    expect(result.current.columnDefs[0].field).toBe("name");
    expect(result.current.columnDefs[0].headerName).toBe("Name");
    expect(result.current.columnDefs[1].field).toBe("status");
    expect(result.current.columnDefs[1].headerName).toBe("Status");
  });

  it("should show Id column when showIdColumn is true", async () => {
    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
        undefined,
        true,
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.columnDefs).toHaveLength(3);
    // Id should be moved to first position
    expect(result.current.columnDefs[0].field).toBe(IdColumn);
    expect(result.current.columnDefs[1].field).toBe("name");
    expect(result.current.columnDefs[2].field).toBe("status");
  });

  it("should handle error when fetch fails", async () => {
    mockGetById.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.rowData).toEqual([]);
  });

  it("should handle non-Error thrown objects", async () => {
    mockGetById.mockRejectedValueOnce("string error");

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.error).toBe("Failed to fetch entity records");
  });

  it("should handle empty records", async () => {
    mockGetById.mockResolvedValueOnce({
      fields: [idField, stringField],
      getAllRecords: vi.fn().mockResolvedValue({ items: [] }),
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.rowData).toEqual([]);
    expect(result.current.columnDefs).toEqual([]);
  });

  it("should set entity after fetch", async () => {
    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.entity).toBeDefined();
    expect(result.current.entity?.fields).toHaveLength(3);
  });

  it("should apply columnConfig overrides", async () => {
    const columnConfig = {
      Name: { width: 200, sortable: false },
    };

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
        columnConfig,
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    const nameCol = result.current.columnDefs.find((c) => c.field === "name");
    expect(nameCol?.width).toBe(200);
    expect(nameCol?.sortable).toBe(false);
  });

  it("should set minWidth 130 for date fields", async () => {
    mockGetById.mockResolvedValueOnce({
      fields: [
        idField,
        {
          name: "createdOn",
          displayName: "Created On",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: EntityFieldDataType.DATE },
        },
      ],
      getAllRecords: vi
        .fn()
        .mockResolvedValue({ items: [{ Id: "1", createdOn: "2024-01-01" }] }),
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.columnDefs[0].minWidth).toBe(130);
  });

  it("should set minWidth 300 and disable editing for datetime fields", async () => {
    mockGetById.mockResolvedValueOnce({
      fields: [
        idField,
        {
          name: "timestamp",
          displayName: "Timestamp",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: EntityFieldDataType.DATETIME },
        },
      ],
      getAllRecords: vi.fn().mockResolvedValue({
        items: [{ Id: "1", timestamp: "2024-01-01T10:00:00Z" }],
      }),
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    const col = result.current.columnDefs[0];
    expect(col.minWidth).toBe(300);
    expect(col.editable).toBe(false);
  });

  it("should disable editing for file fields", async () => {
    mockGetById.mockResolvedValueOnce({
      fields: [
        idField,
        {
          name: "attachment",
          displayName: "Attachment",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: "STRING" },
          fieldDisplayType: FieldDisplayType.File,
        },
      ],
      getAllRecords: vi
        .fn()
        .mockResolvedValue({ items: [{ Id: "1", attachment: null }] }),
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.columnDefs[0].editable).toBe(false);
  });

  it("should clear error on successful refetch", async () => {
    mockGetById.mockRejectedValueOnce(new Error("Failed"));

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });
    expect(result.current.error).toBe("Failed");

    // Now fetch successfully
    await act(async () => {
      await result.current.fetchEntityRecords();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.rowData).toEqual(mockRecords);
  });

  it("should fetch choice set values for choice set fields", async () => {
    const choiceSetField = {
      name: "priority",
      displayName: "Priority",
      isSystemField: false,
      isForeignKey: false,
      fieldDataType: { name: "STRING" },
      fieldDisplayType: FieldDisplayType.ChoiceSetSingle,
      choiceSetId: "cs-1",
    };

    mockGetById.mockResolvedValueOnce({
      fields: [idField, choiceSetField],
      getAllRecords: vi
        .fn()
        .mockResolvedValue({ items: [{ Id: "1", priority: 1 }] }),
    });

    mockChoiceSetService.getById.mockResolvedValueOnce({
      items: [
        { numberId: 1, displayName: "High" },
        { numberId: 2, displayName: "Low" },
      ],
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    expect(result.current.choiceSetValuesMap.size).toBe(1);
    expect(result.current.choiceSetValuesMap.get("cs-1")?.get(1)).toBe("High");
    expect(result.current.choiceSetValuesMap.get("cs-1")?.get(2)).toBe("Low");
  });

  it("should create boolean valueSetter that maps Yes/No/None", async () => {
    mockGetById.mockResolvedValueOnce({
      fields: [
        idField,
        {
          name: "active",
          displayName: "Active",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: EntityFieldDataType.BOOLEAN },
        },
      ],
      getAllRecords: vi
        .fn()
        .mockResolvedValue({ items: [{ Id: "1", active: true }] }),
    });

    const { result } = renderHook(() =>
      useEntityData(
        mockEntityService as Entities,
        mockChoiceSetService as ChoiceSets,
        "entity-1",
      ),
    );

    await act(async () => {
      await result.current.fetchEntityRecords();
    });

    const col = result.current.columnDefs[0];
    const valueSetter = col.valueSetter as any;

    const data = { Id: "1", active: null };
    expect(valueSetter({ data, newValue: "Yes" })).toBe(true);
    expect(data.active).toBe(true);

    expect(valueSetter({ data, newValue: "No" })).toBe(true);
    expect(data.active).toBe(false);

    expect(valueSetter({ data, newValue: "None" })).toBe(true);
    expect(data.active).toBeNull();
  });
});
