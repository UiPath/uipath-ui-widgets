import { EntityGetResponse } from '@uipath/uipath-typescript';
import { ColDef } from 'ag-grid-community';
import { useCallback, useState } from 'react';
import { TEMP_ID_PREFIX } from '@uipath/datatable/constants/defaults';
import { GridRow } from '@uipath/datatable/types';
import type { UseNewRecordsReturn } from '@uipath/datatable/types/hooks';

/**
 * Hook to manage new records being added to the grid
 *
 * Handles:
 * - Adding new rows with temporary IDs
 * - Tracking changes to new records
 * - Inserting new records via API
 * - Discarding new records
 */
export const useNewRecords = (
  columnDefs: ColDef[],
  rowData: GridRow[],
  setRowData: React.Dispatch<React.SetStateAction<GridRow[]>>,
  entity: EntityGetResponse | undefined,
  fetchEntityRecords: () => Promise<void>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): UseNewRecordsReturn & { setNewRecords: React.Dispatch<React.SetStateAction<Map<string, GridRow>>> } => {
  const [newRecords, setNewRecords] = useState<Map<string, GridRow>>(new Map());

  const handleAddRow = useCallback(() => {
    // Create a new empty record with all column fields
    const newRecord: GridRow = { Id: '', id: '', _type: '' };
    columnDefs.forEach((colDef) => {
      if (colDef.field && colDef.field !== 'Id') {
        newRecord[colDef.field] = '';
      }
    });

    // Add a temporary ID for the new record
    const tempId = `${TEMP_ID_PREFIX}${Date.now()}`;
    newRecord.Id = tempId;

    // Track this as a new record
    setNewRecords((prev) => {
      const updated = new Map(prev);
      updated.set(tempId, newRecord);
      return updated;
    });

    // Add the new record to the top of the data
    const updatedRowData = [newRecord, ...rowData];
    setRowData(updatedRowData);
  }, [columnDefs, rowData, setRowData]);

  const handleInsertRecord = useCallback(async () => {
    if (!entity || newRecords.size === 0) return;

    try {
      // Get all new records and prepare them for insertion (remove temp IDs)
      const recordsToInsert = Array.from(newRecords.values()).map((record) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Id, ...recordWithoutId } = record;
        return recordWithoutId;
      });

      // Insert via SDK
      await entity.insert(recordsToInsert);

      // Clear new records tracking
      setNewRecords(new Map());

      // Refresh the data to show the newly inserted records with real IDs
      await fetchEntityRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert records');
    }
  }, [entity, newRecords, fetchEntityRecords, setError]);

  const handleDiscardNewRecords = useCallback(() => {
    if (newRecords.size === 0) return;

    // Confirm before discarding
    const recordText = newRecords.size === 1 ? 'row' : 'rows';
    const confirmed = window.confirm(
      `Are you sure you want to discard ${newRecords.size} new ${recordText}? This action cannot be undone.`
    );

    if (!confirmed) return;

    // Remove all new records from the row data
    const newRecordIds = Array.from(newRecords.keys());
    const updatedRowData = rowData.filter((row) => !newRecordIds.includes(row.Id));
    setRowData(updatedRowData);

    // Clear new records tracking
    setNewRecords(new Map());
  }, [newRecords, rowData, setRowData]);

  const trackNewRecordChange = useCallback((rowId: string, data: GridRow) => {
    if (rowId && rowId.startsWith(TEMP_ID_PREFIX)) {
      setNewRecords((prev) => {
        const updated = new Map(prev);
        updated.set(rowId, data);
        return updated;
      });
    }
  }, []);

  return {
    newRecords,
    setNewRecords,
    handleAddRow,
    handleInsertRecord,
    handleDiscardNewRecords,
    trackNewRecordChange,
  };
};
