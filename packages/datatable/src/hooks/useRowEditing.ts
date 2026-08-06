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
      await entity?.updateRecords(rowsToUpdate);
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
  ): boolean => {
    // Restore original field value in the row data
    setRowData((prev) => {
      return prev.map((row: any) => {
        if (row.Id === rowId) {
          return { ...row, [fieldKey]: originalValue };
        }
        return row;
      });
    });

    // Compute whether any edits will remain after this revert
    const editedRow = editedRows.get(rowId);
    const remainingEdits = new Map(editedRows);

    if (editedRow) {
      const newEditedRow = { ...editedRow, [fieldKey]: originalValue };
      const originalRow = originalData.find(
        (row: any) => row.Id === rowId,
      ) as any;

      if (hasRowChanges(newEditedRow, originalRow)) {
        remainingEdits.set(rowId, newEditedRow);
      } else {
        remainingEdits.delete(rowId);
      }
    }

    const noRemainingEdits = remainingEdits.size === 0;

    // Update edited rows map
    setEditedRows(remainingEdits);

    return noRemainingEdits;
  };

  return {
    editedRows,
    handleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  };
};
