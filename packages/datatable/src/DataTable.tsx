/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast, Toaster } from "@uipath/apollo-wind";
import { trackTelemetry } from "./utils/telemetryUtils";
import { ChoiceSets, Entities } from "@uipath/uipath-typescript/entities";
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
import { useChoiceSetCache } from "./hooks/useChoiceSetCache";
import { useEntityData } from "./hooks/useEntityData";
import { useEntityRecordsCache } from "./hooks/useEntityRecordsCache";
import { useRowEditing } from "./hooks/useRowEditing";
import type { DataTableProps } from "./types";
import { GridRow, IdColumn, TelemetryService, TelemetryStatus } from "./types";
import { deepClone, getDiffData } from "./utils/dataUtils";
import { getFieldValue } from "./utils/fieldUtils";

const DEFAULT_PADDING_FOR_EXPANDED_ROW = 40;

export const DataTable = ({
  sdk,
  entityId,
  pageSize = 50,
  columnConfig,
  rowClassRules,
  customPaddingForExpandedRow = DEFAULT_PADDING_FOR_EXPANDED_ROW,
  showIdColumn = true,
}: DataTableProps) => {
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [newRecords, setNewRecords] = useState<Map<string, any>>(new Map());
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const entityService = useRef<Entities>(new Entities(sdk));
  const choiceSetService = useRef<ChoiceSets>(new ChoiceSets(sdk));
  const hasInitialized = useRef<string | null>(null);
  const rowsMapInGroupByMode = useRef<Record<string, GridRow>>({});
  const { getRecords, clearCache } = useEntityRecordsCache(
    entityService.current,
  );
  const { clearCache: clearChoiceSetCache } = useChoiceSetCache(
    choiceSetService.current,
  );

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
    choiceSetValuesMap,
    fetchEntityRecords,
  } = useEntityData(
    entityService.current,
    choiceSetService.current,
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
          displayName: field.displayName ?? field.name,
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

      trackTelemetry(TelemetryService.GroupBy, TelemetryStatus.Success, {
        GroupByColumn: column || "none",
      });

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
              if (!params.data || params.data._isExpandedRow) {
                return undefined;
              }
              const detailRow =
                rowsMapInGroupByMode.current[`detailRow-${params.data.Id}`];
              const isExpanded = detailRow ? !detailRow._isHidden : false;
              return CellWithExpandButton({
                cellName: params.value,
                cellId: params.data.Id,
                isExpanded: isExpanded,
                onToggleExpand: toggleExpand,
              });
            };
            setColumnDefs(columns);
          }
        } catch (err) {
          trackTelemetry(TelemetryService.GroupBy, TelemetryStatus.Error, {
            Error: err instanceof Error ? err.message : "Group by failed",
            GroupByColumn: column,
          });
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

  const openDiffDialog = useCallback(() => {
    setShowDiffDialog(true);

    trackTelemetry(TelemetryService.ShowDiff, TelemetryStatus.Success, {
      EditedRowsCount: editedRows.size,
    });
  }, [editedRows.size]);

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

      trackTelemetry(TelemetryService.CommitChanges, TelemetryStatus.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Commit failed";
      toast.error(errorMessage);
      trackTelemetry(TelemetryService.CommitChanges, TelemetryStatus.Error, {
        Error: errorMessage,
      });
    }
  }, [closeDiffDialog, commitUpdates, entity]);

  const handleRevertAll = useCallback(() => {
    try {
      closeDiffDialog();
      revertAllUpdates();

      trackTelemetry(TelemetryService.RevertAll, TelemetryStatus.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Revert failed";
      toast.error(errorMessage);
      trackTelemetry(TelemetryService.RevertAll, TelemetryStatus.Error, {
        Error: errorMessage,
      });
    }
  }, [closeDiffDialog, revertAllUpdates]);

  const handleRevertField = useCallback(
    (rowId: string, fieldKey: string, originalValue: any) => {
      const noRemainingEdits = revertSingleCellUpdate(
        rowId,
        fieldKey,
        originalValue,
      );

      if (noRemainingEdits) {
        closeDiffDialog();
      }

      trackTelemetry(TelemetryService.RevertField, TelemetryStatus.Success);
    },
    [revertSingleCellUpdate, closeDiffDialog],
  );

  const refreshComponent = useCallback(async () => {
    setLoading(true);
    try {
      setSelectedGroupBy("");
      setNewRecords(new Map());
      revertAllUpdates();
      clearCache();
      clearChoiceSetCache();
      await fetchEntityRecords();

      trackTelemetry(TelemetryService.Refresh, TelemetryStatus.Success, {
        HasColumnConfig: !!columnConfig,
        HasRowClassRules: !!rowClassRules,
        HasCustomPaddingForExpandedRow:
          customPaddingForExpandedRow !== DEFAULT_PADDING_FOR_EXPANDED_ROW,
        HasShowIdColumn: showIdColumn,
        PageSize: pageSize,
      });
    } catch (err) {
      trackTelemetry(TelemetryService.Refresh, TelemetryStatus.Error, {
        Error: err instanceof Error ? err.message : "Refresh failed",
      });
    } finally {
      setLoading(false);
    }
  }, [
    clearCache,
    clearChoiceSetCache,
    columnConfig,
    customPaddingForExpandedRow,
    fetchEntityRecords,
    pageSize,
    revertAllUpdates,
    rowClassRules,
    showIdColumn,
  ]);

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
            choiceSetValuesMap={choiceSetValuesMap}
          />
        </div>
      );
    },
    [entity, selectedGroupBy, choiceSetValuesMap],
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

  const pinnedTopRowData = useMemo(
    () => Array.from(newRecords.values()),
    [newRecords],
  );

  const handleAddRow = useCallback(() => {
    if (!gridApi) return;

    // Create a new empty record with all column fields
    const newRecord: any = {};
    columnDefs.forEach((colDef) => {
      if (colDef.field && colDef.field !== IdColumn) {
        newRecord[colDef.field] = "";
      }
    });

    // Add a temporary ID for the new record
    const tempId = `temp-${Date.now()}`;
    newRecord.Id = tempId;

    // Track this as a new record (pinned top rows are driven by newRecords)
    setNewRecords((prev) => {
      const updated = new Map(prev);
      updated.set(tempId, newRecord);
      return updated;
    });

    trackTelemetry(TelemetryService.AddRow, TelemetryStatus.Success, {
      TotalNewRecords: newRecords.size + 1,
    });
  }, [columnDefs, gridApi, newRecords.size]);

  const handleInsertRecord = useCallback(async () => {
    if (!entity || newRecords.size === 0) return;

    const insertCount = newRecords.size;
    try {
      // Get all new records and prepare them for insertion (remove temp IDs)
      const recordsToInsert = Array.from(newRecords.values()).map((record) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Id, ...recordWithoutId } = record;
        // Remove keys with empty string values
        return Object.fromEntries(
          Object.entries(recordWithoutId).filter(([, v]) => v !== ""),
        );
      });

      // Insert via SDK and get back records with real IDs
      const { successRecords, failureRecords } =
        await entity.insertRecords(recordsToInsert);

      // Clear new records tracking (removes pinned top rows)
      setNewRecords(new Map());

      // Add successfully inserted records to the grid
      if (Array.isArray(successRecords) && successRecords.length > 0) {
        setRowData((prev: any[]) => [...successRecords, ...prev]);
        trackTelemetry(
          TelemetryService.InsertRecords,
          TelemetryStatus.Success,
          {
            NewRecordsCount: successRecords.length,
          },
        );
      }

      if (Array.isArray(failureRecords) && failureRecords.length > 0) {
        toast.error(`${failureRecords.length} record(s) failed to insert`);
        trackTelemetry(TelemetryService.InsertRecords, TelemetryStatus.Error, {
          Error: JSON.stringify(failureRecords),
          FailureRecordsCount: failureRecords.length,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to insert records";
      setError(errorMessage);

      trackTelemetry(TelemetryService.InsertRecords, TelemetryStatus.Error, {
        Error: errorMessage,
        NewRecordsCount: insertCount,
      });
    }
  }, [entity, newRecords, setError, setRowData]);

  const handleDiscardNewRecords = useCallback(() => {
    if (newRecords.size === 0) return;

    // Confirm before discarding
    const recordText = newRecords.size === 1 ? "row" : "rows";
    const confirmed = window.confirm(
      `Are you sure you want to discard ${newRecords.size} new ${recordText}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    const discardedCount = newRecords.size;

    // Clear new records tracking (pinned rows will update automatically)
    setNewRecords(new Map());

    trackTelemetry(
      TelemetryService.DiscardNewRecords,
      TelemetryStatus.Success,
      {
        DiscardedRecordsCount: discardedCount,
      },
    );
  }, [newRecords]);

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
      await entity?.deleteRecords(selectedDataIds);

      trackTelemetry(TelemetryService.DeleteRow, TelemetryStatus.Success, {
        DeletedCount: selectedDataIds.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete entity records";
      setError(errorMessage);

      trackTelemetry(TelemetryService.DeleteRow, TelemetryStatus.Error, {
        Error: errorMessage,
        DeletedCount: selectedDataIds.length,
      });
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
      className={`uipath-datatable-container ${isMasterDetailMode ? "datatable-master-detail" : ""}`}
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
            minWidth: 100,
          }}
          pinnedTopRowData={pinnedTopRowData}
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
        onRevertField={handleRevertField}
        diffData={getDiffData(editedRows, originalData)}
        choiceSetValuesMap={choiceSetValuesMap}
      />
      <Toaster position="top-right" />
    </div>
  );
};
