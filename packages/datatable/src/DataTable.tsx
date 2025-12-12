import type { CellValueChangedEvent, GridApi, ICellRendererParams, IRowNode } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DiffDialog } from '@uipath/datatable/components/DiffDialog';
import { EmptyState } from '@uipath/datatable/components/EmptyState';
import { ErrorState } from '@uipath/datatable/components/ErrorState';
import { LoadingState } from '@uipath/datatable/components/LoadingState';
import { Toolbar } from '@uipath/datatable/components/Toolbar';
import { DEFAULT_CLASS_NAME, DEFAULT_PAGE_SIZE } from '@uipath/datatable/constants/defaults';
import { useEntityData } from '@uipath/datatable/hooks/useEntityData';
import { useGridApi } from '@uipath/datatable/hooks/useGridApi';
import { useGridCallbacks } from '@uipath/datatable/hooks/useGridCallbacks';
import { useMasterDetail } from '@uipath/datatable/hooks/useMasterDetail';
import { useNewRecords } from '@uipath/datatable/hooks/useNewRecords';
import { useRowEditing } from '@uipath/datatable/hooks/useRowEditing';
import type { DataTableProps } from '@uipath/datatable/types';
import { getDiffData } from '@uipath/datatable/utils/dataUtils';
import { getDefaultColDef, getRowSelection } from '@uipath/datatable/utils/gridConfig';

import './DataTable.scss';

/**
 * DataTable Component
 *
 * A feature-rich data table component built on top of ag-Grid with support for:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Master-detail view with grouping
 * - Cell editing with diff visualization
 * - Batch operations
 * - Row selection
 *
 * @example
 * ```tsx
 * <DataTable
 *   sdk={uiPathSDK}
 *   entityId="user-entity-id"
 *   pageSize={50}
 * />
 * ```
 */
export const DataTable = ({
  sdk,
  entityId,
  className = DEFAULT_CLASS_NAME,
  pageSize = DEFAULT_PAGE_SIZE,
  columnConfig,
  rowClassRules,
}: DataTableProps) => {
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const gridApiRef = useRef<GridApi | null>(null);

  // Entity data management
  const {
    rowData,
    setRowData,
    originalData,
    columnDefs,
    setColumnDefs,
    originalColumnDefs,
    error,
    setError,
    entity,
    fetchEntityRecords,
  } = useEntityData(sdk, entityId, columnConfig);

  // Grid API and selection
  const { gridApi, selectedRowsCount, onGridReady: baseOnGridReady, onSelectionChanged } = useGridApi();

  // Row editing
  const {
    editedRows,
    handleCellValueChanged: baseHandleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  } = useRowEditing(originalData, setRowData, fetchEntityRecords);

  // New records management
  const {
    newRecords,
    setNewRecords,
    handleAddRow,
    handleInsertRecord,
    handleDiscardNewRecords,
    trackNewRecordChange,
  } = useNewRecords(columnDefs, rowData, setRowData, entity, fetchEntityRecords, setError);

  // Grid callbacks refs (must be declared before use)
  const expandedRowsRef = useRef<Set<string>>(new Set());
  const rowHeightCacheRef = useRef<Map<string, number>>(new Map());

  // Placeholder ref for gridCallbacks - will be populated after gridCallbacks is created
  const gridCallbacksRef = useRef<{
    expandButtonCellRenderer: (params: ICellRendererParams) => React.ReactNode;
  } | undefined>(undefined);

  // Master-detail with grouping
  const {
    selectedGroupBy,
    expandedRows,
    groupableColumns,
    handleGroupByChange,
    toggleExpand,
  } = useMasterDetail(
    sdk,
    entity,
    originalData,
    setRowData,
    setColumnDefs,
    originalColumnDefs,
    (params) => gridCallbacksRef.current?.expandButtonCellRenderer(params) ?? null,
    { current: gridApiRef.current ? { api: gridApiRef.current } : null } as React.MutableRefObject<{ api?: { refreshCells?: (params?: unknown) => void } } | null>,
    rowHeightCacheRef,
    setLoading
  );

  useEffect(() => {
    expandedRowsRef.current = expandedRows;
  }, [expandedRows]);

  const gridCallbacks = useGridCallbacks(
    entity,
    selectedGroupBy,
    expandedRowsRef,
    toggleExpand
  );

  // Update the ref with the gridCallbacks
  gridCallbacksRef.current = gridCallbacks;

  // Enhanced grid ready handler that combines grid API setup with base handler
  const onGridReady = useCallback(
    (params: { api: GridApi }) => {
      gridApiRef.current = params.api;
      baseOnGridReady(params);
    },
    [baseOnGridReady]
  );

  // Dialog handlers
  const openDiffDialog = useCallback(() => setShowDiffDialog(true), []);
  const closeDiffDialog = useCallback(() => setShowDiffDialog(false), []);

  // Combined cell value changed handler
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      const rowId = event.data?.Id;

      // Check if this is a new record (has temp ID)
      if (event.data) {
        trackNewRecordChange(rowId, event.data);
      }

      // If not a new record, handle as edit
      if (!rowId || !rowId.startsWith('temp-')) {
        baseHandleCellValueChanged(event);
      }
    },
    [trackNewRecordChange, baseHandleCellValueChanged]
  );

  // Commit changes handler
  const handleCommit = useCallback(async () => {
    try {
      closeDiffDialog();
      await commitUpdates(entity);
    } catch (err) {
      console.error(err);
    }
  }, [closeDiffDialog, commitUpdates, entity]);

  // Revert all changes handler
  const handleRevertAll = useCallback(() => {
    try {
      closeDiffDialog();
      revertAllUpdates();
    } catch (err) {
      console.error(err);
    }
  }, [closeDiffDialog, revertAllUpdates]);

  // Delete records handler
  const handleDeleteRecords = useCallback(async () => {
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
    const updatedRowData = rowData.filter((r) => !selectedDataIds.includes(r.Id));
    setRowData(updatedRowData);

    // Clear selection
    gridApi.deselectAll();

    try {
      await entity?.delete(selectedDataIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity records');
    }
  }, [gridApi, rowData, setRowData, entity, setError]);

  // Refresh component
  const refreshComponent = useCallback(async () => {
    setLoading(true);
    try {
      setNewRecords(new Map());
      revertAllUpdates();
      await fetchEntityRecords();
    } finally {
      setLoading(false);
    }
  }, [fetchEntityRecords, revertAllUpdates, setNewRecords]);

  // Initial data fetch on mount or when entityId/sdk changes
  useEffect(() => {
    if (entityId && sdk) {
      refreshComponent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, sdk]);

  // Memoized values
  const isMasterDetailMode = !!selectedGroupBy;
  const rowSelection = useMemo(() => getRowSelection(), []);
  const defaultColDef = useMemo(() => getDefaultColDef(!isMasterDetailMode), [isMasterDetailMode]);
  const diffData = useMemo(() => getDiffData(editedRows, originalData), [editedRows, originalData]);

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Render empty state
  if (!rowData || rowData.length === 0) {
    return <EmptyState />;
  }

  // Main render
  return (
    <div
      className={`datatable-container ${isMasterDetailMode ? 'datatable-master-detail' : ''} ${className}`}
    >
      <Toolbar
        onRefresh={refreshComponent}
        onShowDiff={openDiffDialog}
        onDelete={handleDeleteRecords}
        onAddRow={handleAddRow}
        onInsertRecord={handleInsertRecord}
        onDiscardNewRecords={handleDiscardNewRecords}
        onGroupByChange={handleGroupByChange}
        editedRowsCount={editedRows.size}
        selectedRowsCount={selectedRowsCount}
        newRecordsCount={newRecords.size}
        groupableColumns={groupableColumns}
        selectedGroupBy={selectedGroupBy}
      />

      <div className="datatable-grid-wrapper">
        <AgGridReact
          key={selectedGroupBy || 'default'}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          defaultColDef={defaultColDef}
          theme={themeQuartz}
          onCellValueChanged={handleCellValueChanged}
          rowClassRules={rowClassRules}
          onGridReady={onGridReady}
          {...(!isMasterDetailMode && {
            rowSelection: rowSelection,
            onSelectionChanged: onSelectionChanged,
          })}
          {...(isMasterDetailMode && {
            getRowHeight: gridCallbacks.getRowHeight,
            getRowClass: gridCallbacks.getRowClass,
            getRowId: gridCallbacks.getRowId,
            isFullWidthRow: gridCallbacks.isFullWidthRow,
            fullWidthCellRenderer: gridCallbacks.fullWidthCellRenderer,
            suppressScrollOnNewData: true,
            maintainColumnOrder: true,
            suppressRowTransform: true,
          })}
        />
      </div>

      <DiffDialog
        isOpen={showDiffDialog}
        onClose={closeDiffDialog}
        onCommit={handleCommit}
        onRevertAll={handleRevertAll}
        onRevertField={revertSingleCellUpdate}
        diffData={diffData}
      />
    </div>
  );
};
