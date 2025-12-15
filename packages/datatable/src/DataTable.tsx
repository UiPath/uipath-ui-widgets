/* eslint-disable @typescript-eslint/no-explicit-any */
import { CellWithExpandButton } from '@uipath/datatable/components/CellWithExpandButton';
import { DetailPanel } from '@uipath/datatable/components/DetailPanel';
import { DiffDialog } from '@uipath/datatable/components/DiffDialog';
import { Toolbar } from '@uipath/datatable/components/Toolbar';
import { useEntityData } from '@uipath/datatable/hooks/useEntityData';
import { useEntityRecordsCache } from '@uipath/datatable/hooks/useEntityRecordsCache';
import { useRowEditing } from '@uipath/datatable/hooks/useRowEditing';
import type { DataTableProps } from '@uipath/datatable/types';
import { GridRow } from '@uipath/datatable/types';
import { deepClone, getDiffData } from '@uipath/datatable/utils/dataUtils';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';
import type {
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  IRowNode,
  IsFullWidthRowParams,
  RowClassParams,
  RowHeightParams,
} from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './DataTable.scss';

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
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refEntityData, setRefEntityData] = useState<GridRow[]>([]);
  const [loading, setLoading] = useState(true);
  const expandedRowsRef = useRef<Set<string>>(new Set());
  const gridApiRef = useRef<GridApi | null>(null);
  const rowHeightCache = useRef<Map<string, number>>(new Map());
  const { getRecords, clearCache } = useEntityRecordsCache(sdk);

  const openDiffDialog = () => setShowDiffDialog(true);

  const closeDiffDialog = () => setShowDiffDialog(false);

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

  const groupableColumns = entity?.fields
    .filter((field) => field.isForeignKey && !field.isSystemField)
    .map((field) => field.displayName || field.name) || [];

  const handleGroupByChange = (column: string) => {
    setSelectedGroupBy(column);
    setExpandedRows(new Set());
    rowHeightCache.current.clear();
  };

  // Sync ref with state
  useEffect(() => {
    expandedRowsRef.current = expandedRows;
  }, [expandedRows]);

  const toggleExpand = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // Stable cell renderer function that reads from ref
  const expandButtonCellRenderer = useCallback((params: ICellRendererParams) => {
    if (params.data?._isDetailRow) return null;
    return CellWithExpandButton({
      cellName: params.value,
      cellId: params.data.Id,
      isExpanded: expandedRowsRef.current.has(params.data.Id),
      onToggleExpand: toggleExpand,
    });
  }, [toggleExpand]);

  // Fetch reference entity data when group by is selected
  useEffect(() => {
    const fetchRefEntityData = async () => {
      if (selectedGroupBy && entity) {
        setLoading(true);
        try {
          const refEntityId = entity?.fields.find(f => f.displayName === selectedGroupBy)?.referenceEntity?.id;
          if (refEntityId) {
            const refEntity = await sdk.entities.getById(refEntityId);
            const refEntityRecords = await getRecords(refEntityId);
            setRefEntityData(refEntityRecords);

            const columns: ColDef[] = refEntity.fields.filter(f => !f.isSystemField).map((f) => {
              const valueGetter = (params: any) => getFieldValue(params.data?.[f.name], f)
              return {
                field: f.name,
                headerName: f.displayName,
                valueGetter: valueGetter,
                tooltipValueGetter: valueGetter,
              }
            });
            columns[0].cellRenderer = expandButtonCellRenderer;
            setColumnDefs(columns);
          }
        } finally {
          setLoading(false);
        }
      } else if (!selectedGroupBy) {
        setRefEntityData([]);
        setColumnDefs(originalColumnDefs);
      }
    };

    fetchRefEntityData();
  }, [entity, selectedGroupBy, sdk, originalColumnDefs, setColumnDefs, expandButtonCellRenderer, getRecords]);

  // Flatten row data with detail rows when expandedRows changes
  useEffect(() => {
    if (selectedGroupBy && refEntityData.length > 0) {
      const newRows: GridRow[] = [];

      refEntityData.forEach((record) => {
        newRows.push(record);

        if (expandedRows.has(record.Id)) {
          const groupByFieldName = entity?.fields.find(f => f.displayName === selectedGroupBy)?.name || '';
          const groupedRecords = originalData.filter(r => r[groupByFieldName]?.Id === record.Id);
          newRows.push({
            ...record,
            _isExpandedRow: true,
            _groupedRecords: groupedRecords
          });
        }
      });

      setRowData(newRows);

      // Refresh cells to update expand button state
      if (gridApiRef.current) {
        gridApiRef.current.refreshCells({ force: true });
      }
    } else if (!selectedGroupBy) {
      setRowData(deepClone(originalData));
    }
  }, [expandedRows, refEntityData, selectedGroupBy, originalData, setRowData, entity?.fields]);

  const {
    editedRows,
    handleCellValueChanged: originalHandleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  } = useRowEditing(originalData, setRowData);

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

  const refreshComponent = (async () => {
    setLoading(true);
    try {
      setExpandedRows(new Set());
      setSelectedGroupBy('');
      setNewRecords(new Map())
      revertAllUpdates();
      clearCache();
      await fetchEntityRecords();
    } finally {
      setLoading(false);
    }
  })

  const isFullWidthRow = useCallback((params: IsFullWidthRowParams<GridRow>) => {
    return params.rowNode.data?._isExpandedRow === true;
  }, []);

  const fullWidthCellRenderer = useCallback((props: ICellRendererParams<GridRow>) => {
    return (
      <div className="detail-row-content">
        <DetailPanel rowData={props.data?._groupedRecords || []} groupByFieldDisplayName={selectedGroupBy} groupByFieldId={props.data?.Id} entity={entity} />
      </div>
    );
  }, [entity, selectedGroupBy]);

  const getRowHeight = useCallback((params: RowHeightParams<GridRow>) => {
    if (!params.data?._isExpandedRow) {
      return undefined; // ag-grid will automatically calc height of parent rows
    }

    const cacheKey = `detail-${params.data.Id}`;
    if (rowHeightCache.current.has(cacheKey)) {
      return rowHeightCache.current.get(cacheKey)!;
    }

    // Calculate estimated height
    const detailCount = params.data._groupedRecords?.length || 0;
    const estimatedHeight = 48 + (detailCount * 42) + 40; // Default size of header + rows + padding

    // Schedule re-measure after DOM renders. Without this, height calc is not working fine.
    setTimeout(() => {
      const row = document.querySelector(`[row-id="${cacheKey}"] .detail-row-content`);
      const actualHeight = row?.getBoundingClientRect().height;
      if (actualHeight && actualHeight > 0) {
        rowHeightCache.current.set(cacheKey, actualHeight);
        gridApiRef.current?.onRowHeightChanged();
      }
    }, 100);

    // First return an estimated height. When DOM renders, then return actual height
    return estimatedHeight;
  }, []);

  const getRowClass = useCallback((params: RowClassParams<GridRow>) => {
    return params.data?._isExpandedRow ? 'detail-row' : 'master-row';
  }, []);

  const getRowId = useCallback((params: GetRowIdParams<GridRow>): string => {
    if (!params.data) return `row-${Math.random()}`;
    if (params.data._isExpandedRow) {
      return `detail-${params.data.Id || params.data.id || Math.random()}`;
    }
    return params.data.Id || params.data.id || `row-${Math.random()}`;
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
    setGridApi(params.api);
  }, []);

  const rowSelection = useMemo(() => { 
    return { 
      mode: 'multiRow' as const
    };
  }, []);

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

  const isMasterDetailMode = !!selectedGroupBy;

  return (
    <div className={`datatable-container ${isMasterDetailMode ? 'datatable-master-detail' : ''} ${className}`}>
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
        groupableColumns={groupableColumns}
        selectedGroupBy={selectedGroupBy}
        onGroupByChange={handleGroupByChange}
      />

      <div className="datatable-grid-wrapper">
        <AgGridReact
          key={selectedGroupBy || 'default'}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            editable: !isMasterDetailMode,
            flex: 1,
            minWidth: 100,
          }}
          theme={themeQuartz}
          onCellValueChanged={handleCellValueChanged}
          rowSelection={!isMasterDetailMode ? rowSelection : undefined}
          rowClassRules={rowClassRules}
          onGridReady={onGridReady}
          onSelectionChanged={!isMasterDetailMode ? onSelectionChanged : undefined}
          {...(isMasterDetailMode && {
            getRowHeight,
            getRowClass,
            getRowId,
            onGridReady,
            isFullWidthRow,
            fullWidthCellRenderer,
            suppressScrollOnNewData: true,
            maintainColumnOrder: true,
            suppressRowTransform: true,
          })}
        />
      </div>

      <DiffDialog
        entity={entity}
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
