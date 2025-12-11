/* eslint-disable @typescript-eslint/no-explicit-any */
import { GridApi, GridReadyEvent, IRowNode, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react';
import { DiffDialog } from '@uipath/datatable/components/DiffDialog';
import { Toolbar } from '@uipath/datatable/components/Toolbar';
import './DataTable.scss';
import { useEntityData } from '@uipath/datatable/hooks/useEntityData';
import { useRowEditing } from '@uipath/datatable/hooks/useRowEditing';
import type { DataTableProps } from '@uipath/datatable/types';
import { getDiffData } from '@uipath/datatable/utils/dataUtils';

export const DataTable = ({
  sdk,
  entityId,
  className = '',
  pageSize = 50,
  columnConfig,
  rowClassRules,
}: DataTableProps) => {
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [newRecords, setNewRecords] = useState<Map<string, any>>(new Map());

  const openDiffDialog = () => setShowDiffDialog(true);

  const closeDiffDialog = () => setShowDiffDialog(false);

  const {
    rowData,
    setRowData,
    originalData,
    columnDefs,
    loading,
    error,
    setError,
    entity,
    fetchEntityRecords,
  } = useEntityData(sdk, entityId, columnConfig);

  const {
    editedRows,
    handleCellValueChanged: originalHandleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  } = useRowEditing(originalData, setRowData, fetchEntityRecords);

  const handleCellValueChanged = (event: any) => {
    const rowId = event.data.Id;

    // Check if this is a new record (has temp ID)
    if (rowId && rowId.startsWith('temp-')) {
      setNewRecords((prev) => {
        const updated = new Map(prev);
        updated.set(rowId, event.data);
        return updated;
      });
    } else {
      // Handle existing record edits
      originalHandleCellValueChanged(event);
    }
  };

  const handleCommit = async () => {
    try {
      closeDiffDialog();
      await commitUpdates(entity);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevertAll = () => {
    try {
      closeDiffDialog();
      revertAllUpdates();
    } catch (err) {
      console.error(err);
    }
  };

  const refreshComponent = () => {
    fetchEntityRecords();
    revertAllUpdates();
    setNewRecords(new Map())
  }

  const rowSelection = useMemo(() => { 
    return { 
      mode: 'multiRow' as const
    };
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    setSelectedRowsCount(selectedRows.length);
  };

  const handleAddRow = () => {
    if (!gridApi) return;

    // Create a new empty record with all column fields
    const newRecord: any = {};
    columnDefs.forEach((colDef: any) => {
      if (colDef.field && colDef.field !== 'Id') {
        newRecord[colDef.field] = '';
      }
    });

    // Add a temporary ID for the new record
    const tempId = `temp-${Date.now()}`;
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
  };

  const handleInsertRecord = async () => {
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
  };

  const handleDiscardNewRecords = () => {
    if (newRecords.size === 0) return;

    // Confirm before discarding
    const recordText = newRecords.size === 1 ? 'row' : 'rows';
    const confirmed = window.confirm(
      `Are you sure you want to discard ${newRecords.size} new ${recordText}? This action cannot be undone.`
    );

    if (!confirmed) return;

    // Remove all new records from the row data
    const newRecordIds = Array.from(newRecords.keys());
    const updatedRowData = rowData.filter((row: any) => !newRecordIds.includes(row.Id));
    setRowData(updatedRowData);

    // Clear new records tracking
    setNewRecords(new Map());
  };

  const handleDeleteRecords = async () => {
    if (!gridApi) return;

    const selectedNodes: IRowNode[] = gridApi.getSelectedNodes();
    const selectedDataIds = selectedNodes.map((node) => node.data.Id);

    // Confirm before deleting
    const recordText = selectedDataIds.length === 1 ? 'record' : 'records';
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDataIds.length} ${recordText}? This action cannot be undone.`
    );

    if (!confirmed) return;

    // Remove selected rows from rowData
    const updatedRowData = rowData.filter((r: any) => !selectedDataIds.includes(r.Id));
    setRowData(updatedRowData);

    // Clear selection
    gridApi.deselectAll();
    setSelectedRowsCount(0);

    try {
      await entity?.delete(selectedDataIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity records')
    }
  };

  useEffect(() => {
    if (entityId && sdk) {
      refreshComponent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, sdk]);

  if (loading) {
    return <div className="datatable-loading">Loading...</div>;
  }

  if (error) {
    return <div className="datatable-error">Error: {error}</div>;
  }

  if (!rowData || rowData.length === 0) {
    return <div className="datatable-empty">No data available</div>;
  }

  return (
    <div className={`datatable-container ${className}`}>
      <Toolbar
        onRefresh={refreshComponent}
        onShowDiff={openDiffDialog}
        onDelete={handleDeleteRecords}
        onAddRow={handleAddRow}
        onInsertRecord={handleInsertRecord}
        onDiscardNewRecords={handleDiscardNewRecords}
        editedRowsCount={editedRows.size}
        selectedRowsCount={selectedRowsCount}
        newRecordsCount={newRecords.size}
      />

      <div className="datatable-grid-wrapper">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            editable: true,
            flex: 1,
            minWidth: 100,
          }}
          theme={themeQuartz}
          onCellValueChanged={handleCellValueChanged}
          rowSelection={rowSelection}
          rowClassRules={rowClassRules}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
        />
      </div>

      <DiffDialog
        isOpen={showDiffDialog}
        onClose={closeDiffDialog}
        onCommit={handleCommit}
        onRevertAll={handleRevertAll}
        onRevertField={revertSingleCellUpdate}
        diffData={getDiffData(editedRows, originalData)}
      />
    </div>
  );
};
