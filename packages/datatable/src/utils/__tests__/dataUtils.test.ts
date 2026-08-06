import { describe, it, expect } from "vitest";
import { deepClone, getDiffData, hasRowChanges } from "../dataUtils";

describe("dataUtils", () => {
  describe("deepClone", () => {
    it("should create a deep copy of a simple object", () => {
      const original = { name: "John", age: 30 };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it("should create a deep copy of a nested object", () => {
      const original = {
        user: { name: "John", address: { city: "NYC", zip: "10001" } },
        items: [1, 2, 3],
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.user).not.toBe(original.user);
      expect(cloned.user.address).not.toBe(original.user.address);
      expect(cloned.items).not.toBe(original.items);
    });

    it("should clone arrays correctly", () => {
      const original = [1, 2, { value: 3 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it("should handle null and undefined", () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it("should handle primitive values", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("test")).toBe("test");
      expect(deepClone(true)).toBe(true);
    });

    it("should not preserve object references after cloning", () => {
      const original = { data: { value: 1 } };
      const cloned = deepClone(original);

      cloned.data.value = 2;

      expect(original.data.value).toBe(1);
      expect(cloned.data.value).toBe(2);
    });
  });

  describe("getDiffData", () => {
    it("should return diff data for edited rows", () => {
      const editedRows = new Map([
        ["row1", { Id: "row1", name: "John Updated", age: 31 }],
        ["row2", { Id: "row2", name: "Jane Updated", age: 26 }],
      ]);
      const originalData = [
        { Id: "row1", name: "John", age: 30 },
        { Id: "row2", name: "Jane", age: 25 },
        { Id: "row3", name: "Bob", age: 35 },
      ];

      const result = getDiffData(editedRows, originalData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        rowId: "row1",
        original: { Id: "row1", name: "John", age: 30 },
        edited: { Id: "row1", name: "John Updated", age: 31 },
      });
      expect(result[1]).toEqual({
        rowId: "row2",
        original: { Id: "row2", name: "Jane", age: 25 },
        edited: { Id: "row2", name: "Jane Updated", age: 26 },
      });
    });

    it("should handle empty edited rows", () => {
      const editedRows = new Map();
      const originalData = [{ Id: "row1", name: "John", age: 30 }];

      const result = getDiffData(editedRows, originalData);

      expect(result).toHaveLength(0);
    });

    it("should handle missing original row", () => {
      const editedRows = new Map([
        ["row99", { Id: "row99", name: "New User", age: 40 }],
      ]);
      const originalData = [{ Id: "row1", name: "John", age: 30 }];

      const result = getDiffData(editedRows, originalData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        rowId: "row99",
        original: undefined,
        edited: { Id: "row99", name: "New User", age: 40 },
      });
    });
  });

  describe("hasRowChanges", () => {
    it("should return true when row has changes", () => {
      const editedRow = { Id: "row1", name: "John Updated", age: 30 };
      const originalRow = { Id: "row1", name: "John", age: 30 };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(true);
    });

    it("should return false when row has no changes", () => {
      const editedRow = { Id: "row1", name: "John", age: 30 };
      const originalRow = { Id: "row1", name: "John", age: 30 };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(false);
    });

    it("should detect changes in nested objects", () => {
      const editedRow = { Id: "row1", data: { value: 2 } };
      const originalRow = { Id: "row1", data: { value: 1 } };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(true);
    });

    it("should return false when comparing identical nested objects", () => {
      const editedRow = { Id: "row1", data: { value: 1 } };
      const originalRow = { Id: "row1", data: { value: 1 } };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(false);
    });

    it("should handle null original row", () => {
      const editedRow = { Id: "row1", name: "John" };
      const originalRow = null;

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(true);
    });

    it("should handle undefined original row", () => {
      const editedRow = { Id: "row1", name: "John" };
      const originalRow = undefined;

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(true);
    });

    it("should detect changes in array properties", () => {
      const editedRow = { Id: "row1", items: [1, 2, 3] };
      const originalRow = { Id: "row1", items: [1, 2] };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(true);
    });

    it("should return false for identical arrays", () => {
      const editedRow = { Id: "row1", items: [1, 2, 3] };
      const originalRow = { Id: "row1", items: [1, 2, 3] };

      const result = hasRowChanges(editedRow, originalRow);

      expect(result).toBe(false);
    });
  });
});
