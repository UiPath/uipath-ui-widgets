import { GridRow } from '@uipath/datatable/types';
import type { UseRowEditingReturn } from '@uipath/datatable/types/hooks';
import { deepClone, hasRowChanges } from '@uipath/datatable/utils/dataUtils';
import { EntityGetResponse } from '@uipath/uipath-typescript';
import { CellValueChangedEvent } from 'ag-grid-community';
import { useCallback, useState } from 'react';

/**
 * Hook to manage row editing state and operations
 *
 * Handles:
 * - Tracking edited rows
 * - Cell value changes
 * - Committing updates to the backend
 * - Reverting changes (all or single field)
 */
export const useRowEditing = (
  originalData: GridRow[],
  setRowData: React.Dispatch<React.SetStateAction<GridRow[]>>,
  fetchEntityRecords: () => Promise<void>
): UseRowEditingReturn => {
  const [editedRows, setEditedRows] = useState<Map<string, GridRow>>(new Map());

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const rowId = event.data.Id;
    if (!rowId) return;

    setEditedRows((prev) => {
      const updated = new Map(prev);
      updated.set(rowId, event.data);
      return updated;
    });
  }, []);

  const commitUpdates = useCallback(
    async (entity: EntityGetResponse | undefined) => {
      try {
        const rowsToUpdate = Array.from(editedRows.values());
        await entity?.update(rowsToUpdate);
        setEditedRows(new Map());
        await fetchEntityRecords();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to commit changes');
      }
    },
    [editedRows, fetchEntityRecords]
  );

  const revertAllUpdates = useCallback(() => {
    setRowData(deepClone(originalData));
    setEditedRows(new Map());
  }, [originalData, setRowData]);

  const revertSingleCellUpdate = useCallback(
    (rowId: string, fieldKey: string, originalValue: unknown) => {
      // Restore original field value in the row data
      setRowData((prev) => {
        return prev.map((row) => {
          if (row.Id === rowId) {
            return { ...row, [fieldKey]: originalValue };
          }
          return row;
        });
      });

      // Update edited rows map
      setEditedRows((prev) => {
        const updated = new Map(prev);
        const editedRow = updated.get(rowId);

        if (editedRow) {
          const newEditedRow = { ...editedRow, [fieldKey]: originalValue };

          // Check if this row still has any changes
          const originalRow = originalData.find((row) => row.Id === rowId);
          const hasChanges = hasRowChanges(newEditedRow, originalRow);

          if (hasChanges) {
            updated.set(rowId, newEditedRow);
          } else {
            updated.delete(rowId);
          }
        }

        return updated;
      });
    },
    [originalData, setRowData]
  );

  return {
    editedRows,
    handleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  };
};
