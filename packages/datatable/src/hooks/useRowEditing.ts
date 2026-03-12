/* eslint-disable @typescript-eslint/no-explicit-any */
import { GridRow } from "../types";
import { deepClone, hasRowChanges } from "../utils/dataUtils";
import { EntityGetResponse } from "@uipath/uipath-typescript/entities";
import { CellValueChangedEvent } from "ag-grid-community";
import { useState } from "react";

export const useRowEditing = (
  originalData: GridRow[],
  setRowData: React.Dispatch<React.SetStateAction<GridRow[]>>,
) => {
  const [editedRows, setEditedRows] = useState<Map<string, any>>(new Map());

  const handleCellValueChanged = (event: CellValueChangedEvent) => {
    const rowId = event.data.Id;
    if (!rowId) return;

    setEditedRows((prev) => {
      const updated = new Map(prev);
      updated.set(rowId, event.data);
      return updated;
    });
  };

  const commitUpdates = async (entity: EntityGetResponse | undefined) => {
    try {
      setEditedRows(new Map());
      const rowsToUpdate = Array.from(editedRows.values());
      await entity?.update(rowsToUpdate);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to commit changes",
      );
    }
  };

  const revertAllUpdates = () => {
    setRowData(deepClone(originalData));
    setEditedRows(new Map());
  };

  const revertSingleCellUpdate = (
    rowId: string,
    fieldKey: string,
    originalValue: any,
  ) => {
    // Restore original field value in the row data
    setRowData((prev) => {
      return prev.map((row: any) => {
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
        const originalRow = originalData.find(
          (row: any) => row.Id === rowId,
        ) as any;
        const hasChanges = hasRowChanges(newEditedRow, originalRow);

        if (hasChanges) {
          updated.set(rowId, newEditedRow);
        } else {
          updated.delete(rowId);
        }
      }

      return updated;
    });
  };

  return {
    editedRows,
    handleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  };
};
