/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CellWithExpandButton } from "./components/CellWithExpandButton";
import { DetailPanel } from "./components/DetailPanel";
import { DiffDialog } from "./components/DiffDialog";
import { Toolbar } from "./components/Toolbar";
import "./DataTable.css";
import { useEntityData } from "./hooks/useEntityData";
import { useEntityRecordsCache } from "./hooks/useEntityRecordsCache";
import { useRowEditing } from "./hooks/useRowEditing";
import type { DataTableProps } from "./types";
import { GridRow } from "./types";
import { deepClone, getDiffData } from "./utils/dataUtils";
import { getFieldValue } from "./utils/fieldUtils";
import { Entities } from "@uipath/uipath-typescript/entities";

export const DataTable = ({
  sdk,
  entityId,
  className = "",
  pageSize = 50,
  columnConfig,
  rowClassRules,
  customPaddingForExpandedRow = 40,
  showIdColumn = true,
}: DataTableProps) => {
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [newRecords, setNewRecords] = useState<Map<string, any>>(new Map());
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const entityService = useRef<Entities>(new Entities(sdk));
  const hasInitialized = useRef<string | null>(null);
  const rowsMapInGroupByMode = useRef<Record<string, GridRow>>({});
  const { getRecords, clearCache } = useEntityRecordsCache(
    entityService.current,
  );

  const openDiffDialog = useCallback(() => setShowDiffDialog(true), []);

  const closeDiffDialog = useCallback(() => setShowDiffDialog(false), []);

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
  } = useEntityData(
    entityService.current,
    entityId,
    columnConfig,
    showIdColumn,
  );

  const groupableColumns = useMemo(() => {
    return (
      entity?.fields
        .filter((field) => field.isForeignKey && !field.isSystemField)
        .map((field) => ({
          name: field.name,
          displayName: field.displayName,
        })) || []
    );
  }, [entity?.fields]);

  const rowSelection = useMemo(() => {
    return {
      mode: "multiRow" as const,
    };
  }, []);

  const toggleExpand = useCallback(
    (rowId: string) => {
      rowsMapInGroupByMode.current[`detailRow-${rowId}`]._isHidden =
        !rowsMapInGroupByMode.current[`detailRow-${rowId}`]._isHidden;
      const filteredRows = Object.values(rowsMapInGroupByMode.current).filter(
        (row) => !row._isHidden,
      );
      setRowData(filteredRows);
    },
    [setRowData],
  );

  const handleGroupByChange = useCallback(
    async (column: string) => {
      column = column === "none" ? "" : column;
      setSelectedGroupBy(column);

      if (column && entity) {
        setLoading(true);
        try {
          const refEntityId = entity.fields.find((f) => f.name === column)
            ?.referenceEntity?.id;
          if (refEntityId) {
            const refEntity = await entityService.current.getById(refEntityId);
            const refEntityRecords = await getRecords(refEntityId);

            rowsMapInGroupByMode.current = {};
            refEntityRecords.forEach((record) => {
              rowsMapInGroupByMode.current[record.Id] = {
                ...record,
                _isHidden: false,
              };
              rowsMapInGroupByMode.current[`detailRow-${record.Id}`] = {
                ...record,
                Id: `detailRow-${record.Id}`,
                _isHidden: true,
                _isExpandedRow: true,
                _groupedRecords: [],
              };
            });

            originalData.forEach((row) => {
              const detailRowKey = `detailRow-${row[column]?.Id}`;
              const detailRow = rowsMapInGroupByMode.current[detailRowKey];
              if (detailRow && Array.isArray(detailRow._groupedRecords)) {
                detailRow._groupedRecords.push(row);
              }
            });

            const filteredRows = Object.values(
              rowsMapInGroupByMode.current,
            ).filter((row) => !row._isHidden);
            setRowData(filteredRows);

            const columns: ColDef[] = refEntity.fields
              .filter((f) => !f.isSystemField)
              .map((f) => {
                const valueGetter = (params: any) =>
                  getFieldValue(params.data?.[f.name], f);
                return {
                  field: f.name,
                  headerName: f.displayName,
                  sortable: false,
                  filter: false,
                  valueGetter: valueGetter,
                  tooltipValueGetter: valueGetter,
                };
              });
            columns[0].cellRenderer = (
              params: ICellRendererParams<GridRow>,
            ) => {
              if (params.data?._isExpandedRow) {
                return undefined;
              }
              const detailRow =
                rowsMapInGroupByMode.current[`detailRow-${params.data?.Id}`];
              const isExpanded = detailRow ? !detailRow._isHidden : false;
              return CellWithExpandButton({
                cellName: params.value,
                cellId: params.data?.Id,
                isExpanded: isExpanded,
                onToggleExpand: toggleExpand,
              });
            };
            setColumnDefs(columns);
          }
        } finally {
          setLoading(false);
        }
      } else if (!column) {
        setColumnDefs(originalColumnDefs);
        setRowData(deepClone(originalData));
      }
    },
    [
      entity,
      getRecords,
      originalColumnDefs,
      originalData,
      setColumnDefs,
      setRowData,
      toggleExpand,
    ],
  );

  const {
    editedRows,
    handleCellValueChanged: originalHandleCellValueChanged,
    commitUpdates,
    revertAllUpdates,
    revertSingleCellUpdate,
  } = useRowEditing(originalData, setRowData);

  const handleCellValueChanged = useCallback(
    (event: any) => {
      const rowId = event.data.Id;

      // Check if this is a new record (has temp ID)
      if (rowId && rowId.startsWith("temp-")) {
        setNewRecords((prev) => {
          const updated = new Map(prev);
          updated.set(rowId, event.data);
          return updated;
        });
      } else {
        // Handle existing record edits
        originalHandleCellValueChanged(event);
      }
    },
    [originalHandleCellValueChanged],
  );

  const handleCommit = useCallback(async () => {
    try {
      closeDiffDialog();
      await commitUpdates(entity);
    } catch (err) {
      console.error(err);
    }
  }, [closeDiffDialog, commitUpdates, entity]);

  const handleRevertAll = useCallback(() => {
    try {
      closeDiffDialog();
      revertAllUpdates();
    } catch (err) {
      console.error(err);
    }
  }, [closeDiffDialog, revertAllUpdates]);

  const refreshComponent = useCallback(async () => {
    setLoading(true);
    try {
      setSelectedGroupBy("");
      setNewRecords(new Map());
      revertAllUpdates();
      clearCache();
      await fetchEntityRecords();
    } finally {
      setLoading(false);
    }
  }, [clearCache, fetchEntityRecords, revertAllUpdates]);

  const isFullWidthRow = useCallback(
    (params: IsFullWidthRowParams<GridRow>) => {
      return params.rowNode.data?._isExpandedRow === true;
    },
    [],
  );

  const fullWidthCellRenderer = useCallback(
    (props: ICellRendererParams<GridRow>) => {
      return (
        <div className="detail-row-content">
          <DetailPanel
            rowData={props.data?._groupedRecords || []}
            groupByFieldDisplayName={selectedGroupBy}
            groupByFieldId={props.data?.Id}
            entity={entity}
          />
        </div>
      );
    },
    [entity, selectedGroupBy],
  );

  const getRowHeight = useCallback(
    (params: RowHeightParams<GridRow>) => {
      if (!params.data?._isExpandedRow) {
        return undefined; // Let ag-grid auto-calculate for normal rows
      }

      // For detail rows, calculate based on content
      const detailCount = params.data?._groupedRecords?.length || 0;

      // Get the default row height from ag-grid API, fallback to 42px
      const defaultRowHeight =
        params.api.getSizesForCurrentTheme().rowHeight || 42;
      const defaultHeaderHeight =
        params.api.getSizesForCurrentTheme().headerHeight || 42;

      // Calculate: padding + header height + (row count * row height)
      const calculatedHeight =
        customPaddingForExpandedRow +
        defaultHeaderHeight +
        detailCount * defaultRowHeight;

      return calculatedHeight;
    },
    [customPaddingForExpandedRow],
  );

  const getRowClass = useCallback((params: RowClassParams<GridRow>) => {
    return params.data?._isExpandedRow ? "detail-row" : "master-row";
  }, []);

  const getRowId = useCallback((params: GetRowIdParams<GridRow>): string => {
    return params.data.Id;
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    setSelectedRowsCount(selectedRows.length);
  }, [gridApi]);

  const handleAddRow = useCallback(() => {
    if (!gridApi) return;

    // Create a new empty record with all column fields
    const newRecord: any = {};
    columnDefs.forEach((colDef: any) => {
      if (colDef.field && colDef.field !== "Id") {
        newRecord[colDef.field] = "";
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
  }, [columnDefs, gridApi, rowData, setRowData]);

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
      setError(err instanceof Error ? err.message : "Failed to insert records");
    }
  }, [entity, fetchEntityRecords, newRecords, setError]);

  const handleDiscardNewRecords = useCallback(() => {
    if (newRecords.size === 0) return;

    // Confirm before discarding
    const recordText = newRecords.size === 1 ? "row" : "rows";
    const confirmed = window.confirm(
      `Are you sure you want to discard ${newRecords.size} new ${recordText}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    // Remove all new records from the row data
    const newRecordIds = Array.from(newRecords.keys());
    const updatedRowData = rowData.filter(
      (row: any) => !newRecordIds.includes(row.Id),
    );
    setRowData(updatedRowData);

    // Clear new records tracking
    setNewRecords(new Map());
  }, [newRecords, rowData, setRowData]);

  const handleDeleteRecords = useCallback(async () => {
    if (!gridApi) return;

    const selectedNodes: IRowNode[] = gridApi.getSelectedNodes();
    const selectedDataIds = selectedNodes.map((node) => node.data.Id);

    // Confirm before deleting
    const recordText = selectedDataIds.length === 1 ? "record" : "records";
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDataIds.length} ${recordText}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    // Remove selected rows from rowData
    const updatedRowData = rowData.filter(
      (r: any) => !selectedDataIds.includes(r.Id),
    );
    setRowData(updatedRowData);

    // Clear selection
    gridApi.deselectAll();
    setSelectedRowsCount(0);

    try {
      await entity?.delete(selectedDataIds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete entity records",
      );
    }
  }, [entity, gridApi, rowData, setError, setRowData]);

  useEffect(() => {
    if (entityId && hasInitialized.current !== entityId) {
      hasInitialized.current = entityId;
      refreshComponent();
    }
  }, [entityId, refreshComponent]);

  if (loading) {
    return <div className="datatable-loading">Loading...</div>;
  }

  if (error) {
    return <div className="datatable-error">Error: {error}</div>;
  }

  const isMasterDetailMode = !!selectedGroupBy;

  return (
    <div
      className={`datatable-container ${isMasterDetailMode ? "datatable-master-detail" : ""} ${className}`}
    >
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
          key={selectedGroupBy || "default"}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          getRowId={getRowId}
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
          onSelectionChanged={
            !isMasterDetailMode ? onSelectionChanged : undefined
          }
          {...(isMasterDetailMode && {
            getRowHeight,
            getRowClass,
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
