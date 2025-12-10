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
    handleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  } = useRowEditing(originalData, setRowData, fetchEntityRecords);

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
        editedRowsCount={editedRows.size}
        selectedRowsCount={selectedRowsCount}
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
