import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
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
  pageSize,
  columnConfig,
  rowClassRules,
}: DataTableProps) => {
  const [showDiffDialog, setShowDiffDialog] = useState(false);

  const openDiffDialog = () => setShowDiffDialog(true);

  const closeDiffDialog = () => setShowDiffDialog(false);

  const {
    rowData,
    setRowData,
    originalData,
    columnDefs,
    loading,
    error,
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
        editedRowsCount={editedRows.size}
      />
      <div className="datatable-grid-wrapper">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize || 50}
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
          rowClassRules={rowClassRules}
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
