import { GridRow } from '@uipath/datatable/types';

/**
 * Deep clone an object using JSON serialization
 * Note: Does not handle functions, undefined, Symbol, or circular references
 */
export const deepClone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

/**
 * Generate diff data for edited rows
 * Compares edited rows with original data to show changes
 */
export const getDiffData = (editedRows: Map<string, GridRow>, originalData: GridRow[]) => {
  return Array.from(editedRows.entries()).map(([rowId, editedRow]) => {
    const original = originalData.find((row) => row.Id === rowId);
    return { rowId, original, edited: editedRow };
  });
};

/**
 * Check if a row has any changes compared to the original
 */
export const hasRowChanges = (
  editedRow: GridRow | undefined,
  originalRow: GridRow | undefined
): boolean => {
  if (!editedRow || !originalRow) return false;
  return Object.keys(editedRow).some(
    (key) => JSON.stringify(originalRow[key]) !== JSON.stringify(editedRow[key])
  );
};
