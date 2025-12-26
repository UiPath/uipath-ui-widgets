/* eslint-disable @typescript-eslint/no-explicit-any */

export const deepClone = <T>(data: T): T => {
  if (data === null || data === undefined) {
    return data;
  }
  return JSON.parse(JSON.stringify(data));
};

export const getDiffData = (editedRows: Map<string, any>, originalData: unknown[]) => {
  return Array.from(editedRows.entries()).map(([rowId, editedRow]) => {
    const original = originalData.find((row: any) => row.Id === rowId);
    return { rowId, original, edited: editedRow };
  });
};

export const hasRowChanges = (editedRow: any, originalRow: any): boolean => {
  return Object.keys(editedRow).some(
    (key) => JSON.stringify(originalRow?.[key]) !== JSON.stringify(editedRow[key])
  );
};
