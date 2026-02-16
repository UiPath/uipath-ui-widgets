/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEntityRecordsCache } from "../useEntityRecordsCache";
import { Entities } from "@uipath/uipath-typescript/entities";

describe("useEntityRecordsCache", () => {
  let mockEntityService: Partial<Entities>;
  let mockGetRecordsById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetRecordsById = vi.fn();
    mockEntityService = {
      getRecordsById: mockGetRecordsById,
    } as any;
    // Clear the static cache before each test
    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );
    result.current.clearCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and cache entity records", async () => {
    const mockRecords = [
      { Id: "1", name: "Record 1" },
      { Id: "2", name: "Record 2" },
    ];
    mockGetRecordsById.mockResolvedValue({ items: mockRecords });

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    const records = await result.current.getRecords("entity1");

    expect(records).toEqual(mockRecords);
    expect(mockGetRecordsById).toHaveBeenCalledWith("entity1");
    expect(mockGetRecordsById).toHaveBeenCalledTimes(1);
  });

  it("should return cached records on subsequent calls", async () => {
    const mockRecords = [{ Id: "1", name: "Record 1" }];
    mockGetRecordsById.mockResolvedValue({ items: mockRecords });

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    // First call - should fetch from API
    const records1 = await result.current.getRecords("entity1");
    // Second call - should return from cache
    const records2 = await result.current.getRecords("entity1");

    expect(records1).toEqual(mockRecords);
    expect(records2).toEqual(mockRecords);
    expect(mockGetRecordsById).toHaveBeenCalledTimes(1); // Only called once
  });

  it("should cache different entities separately", async () => {
    const mockRecords1 = [{ Id: "1", name: "Entity 1 Record" }];
    const mockRecords2 = [{ Id: "2", name: "Entity 2 Record" }];
    mockGetRecordsById
      .mockResolvedValueOnce({ items: mockRecords1 })
      .mockResolvedValueOnce({ items: mockRecords2 });

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    const records1 = await result.current.getRecords("entity1");
    const records2 = await result.current.getRecords("entity2");

    expect(records1).toEqual(mockRecords1);
    expect(records2).toEqual(mockRecords2);
    expect(mockGetRecordsById).toHaveBeenCalledTimes(2);
  });

  it("should clear specific entity cache", async () => {
    const mockRecords = [{ Id: "1", name: "Record 1" }];
    mockGetRecordsById.mockResolvedValue({ items: mockRecords });

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    // Fetch and cache
    await result.current.getRecords("entity1");
    expect(mockGetRecordsById).toHaveBeenCalledTimes(1);

    // Clear cache for entity1
    result.current.clearCache("entity1");

    // Fetch again - should call API again
    await result.current.getRecords("entity1");
    expect(mockGetRecordsById).toHaveBeenCalledTimes(2);
  });

  it("should clear all cache when no entityId provided", async () => {
    const mockRecords1 = [{ Id: "1", name: "Record 1" }];
    const mockRecords2 = [{ Id: "2", name: "Record 2" }];
    mockGetRecordsById
      .mockResolvedValueOnce({ items: mockRecords1 })
      .mockResolvedValueOnce({ items: mockRecords2 });

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    // Cache two entities
    await result.current.getRecords("entity1");
    await result.current.getRecords("entity2");
    expect(mockGetRecordsById).toHaveBeenCalledTimes(2);

    // Clear all cache
    result.current.clearCache();

    // Fetch again - should call API for both
    mockGetRecordsById
      .mockResolvedValueOnce({ items: mockRecords1 })
      .mockResolvedValueOnce({ items: mockRecords2 });

    await result.current.getRecords("entity1");
    await result.current.getRecords("entity2");
    expect(mockGetRecordsById).toHaveBeenCalledTimes(4);
  });

  it("should handle API errors gracefully", async () => {
    const error = new Error("API Error");
    mockGetRecordsById.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useEntityRecordsCache(mockEntityService as Entities),
    );

    await expect(result.current.getRecords("entity1")).rejects.toThrow(
      "API Error",
    );
  });

  it("should use updated entity service reference", async () => {
    const mockRecords = [{ Id: "1", name: "Record 1" }];
    const initialMockGetRecordsById = vi
      .fn()
      .mockResolvedValue({ items: mockRecords });
    const initialEntityService = {
      getRecordsById: initialMockGetRecordsById,
    } as Entities;

    const { result, rerender } = renderHook(
      ({ entityService }) => useEntityRecordsCache(entityService),
      { initialProps: { entityService: initialEntityService } },
    );

    // Create new entity service instance
    const newMockGetRecordsById = vi
      .fn()
      .mockResolvedValue({ items: mockRecords });
    const newEntityService = {
      getRecordsById: newMockGetRecordsById,
    } as Entities;

    // Update entity service
    rerender({ entityService: newEntityService });

    // Fetch records - should use new entity service
    await result.current.getRecords("entity1");

    expect(newMockGetRecordsById).toHaveBeenCalledWith("entity1");
    expect(initialMockGetRecordsById).not.toHaveBeenCalled();
  });
});
