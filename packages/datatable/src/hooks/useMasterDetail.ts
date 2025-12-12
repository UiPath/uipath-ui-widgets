import { EntityGetResponse, UiPath } from '@uipath/uipath-typescript';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridRow } from '@uipath/datatable/types';
import type { UseMasterDetailReturn } from '@uipath/datatable/types/hooks';
import { deepClone } from '@uipath/datatable/utils/dataUtils';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';

/**
 * Hook to manage master-detail view with grouping functionality
 *
 * Handles:
 * - Group by column selection
 * - Row expansion state
 * - Reference entity data fetching
 * - Column definitions for grouped view
 */
export const useMasterDetail = (
  sdk: UiPath,
  entity: EntityGetResponse | undefined,
  originalData: GridRow[],
  setRowData: React.Dispatch<React.SetStateAction<GridRow[]>>,
  setColumnDefs: React.Dispatch<React.SetStateAction<ColDef[]>>,
  originalColumnDefs: ColDef[],
  expandButtonCellRenderer: (params: ICellRendererParams) => React.ReactNode,
  gridApiRef: React.MutableRefObject<{ api?: { refreshCells?: (params?: unknown) => void } } | null>,
  rowHeightCache: React.MutableRefObject<Map<string, number>>,
  setLoading: (loading: boolean) => void
): UseMasterDetailReturn => {
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refEntityData, setRefEntityData] = useState<GridRow[]>([]);
  const expandedRowsRef = useRef<Set<string>>(new Set());

  // Get groupable columns from entity
  const groupableColumns = useMemo(() => {
    return entity?.fields
      .filter((field) => field.isForeignKey && !field.isSystemField)
      .map((field) => field.displayName || field.name) || [];
  }, [entity]);

  // Sync ref with state for stable cell renderer access
  useEffect(() => {
    expandedRowsRef.current = expandedRows;
  }, [expandedRows]);

  const handleGroupByChange = useCallback((column: string) => {
    setSelectedGroupBy(column);
    setExpandedRows(new Set());
    rowHeightCache.current.clear();
  }, [rowHeightCache]);

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

  // Store expandButtonCellRenderer in a ref to avoid triggering effects when it changes
  const expandButtonCellRendererRef = useRef(expandButtonCellRenderer);

  useEffect(() => {
    expandButtonCellRendererRef.current = expandButtonCellRenderer;
  }, [expandButtonCellRenderer]);

  // Fetch reference entity data when group by is selected
  useEffect(() => {
    const fetchRefEntityData = async () => {
      if (selectedGroupBy && entity) {
        setLoading(true);
        try {
          const refEntityId = entity.fields.find(
            (f) => f.displayName === selectedGroupBy
          )?.referenceEntity?.id;

          if (refEntityId) {
            const refEntity = await sdk.entities.getById(refEntityId);
            const refEntityRecords = (await refEntity.getRecords()).items;
            setRefEntityData(refEntityRecords);

            const columns: ColDef[] = refEntity.fields
              .filter((f) => !f.isSystemField)
              .map((f, index) => {
                const valueGetter = (params: { data?: GridRow }) =>
                  getFieldValue(params.data?.[f.name], f);
                return {
                  field: f.name,
                  headerName: f.displayName,
                  valueGetter,
                  tooltipValueGetter: valueGetter,
                  // Add cellRenderer to first column during creation (no mutation)
                  ...(index === 0 && { cellRenderer: expandButtonCellRendererRef.current }),
                };
              });
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
    // Remove setState functions and expandButtonCellRenderer from dependencies
    // React guarantees setState functions are stable, and we use ref for renderer
  }, [entity, selectedGroupBy, sdk, originalColumnDefs, setLoading, setColumnDefs]);

  // Track previous data to avoid unnecessary updates
  const prevOriginalDataRef = useRef<GridRow[]>([]);
  const prevRefEntityDataRef = useRef<GridRow[]>([]);
  const prevExpandedRowsRef = useRef<Set<string>>(new Set());
  const prevSelectedGroupByRef = useRef<string>('');
  const isMountedRef = useRef(true);

  // Track mount state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Flatten row data with detail rows when expandedRows changes
  useEffect(() => {
    if (selectedGroupBy && refEntityData.length > 0) {
      // Check if data actually changed to prevent infinite loops
      const refDataChanged = refEntityData !== prevRefEntityDataRef.current;
      const expandedChanged = expandedRows !== prevExpandedRowsRef.current;

      if (!refDataChanged && !expandedChanged) {
        return; // No changes, skip update
      }

      prevRefEntityDataRef.current = refEntityData;
      prevExpandedRowsRef.current = expandedRows;

      const newRows: GridRow[] = [];

      refEntityData.forEach((record) => {
        newRows.push(record);

        if (expandedRows.has(record.Id)) {
          const groupByFieldName =
            entity?.fields.find((f) => f.displayName === selectedGroupBy)?.name || '';
          const groupedRecords = originalData.filter(
            (r) => r[groupByFieldName]?.Id === record.Id
          );
          newRows.push({
            ...record,
            _isExpandedRow: true,
            _groupedRecords: groupedRecords,
          });
        }
      });

      setRowData(newRows);

      // Refresh cells to update expand button state (only if still mounted and grid exists)
      // Use setTimeout to ensure grid has rendered before refreshing
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && gridApiRef.current?.api?.refreshCells) {
          try {
            gridApiRef.current.api.refreshCells({ force: true });
          } catch {
            // Silently ignore if grid is destroyed
            console.debug('Grid refresh skipped - grid may be destroyed');
          }
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    } else if (!selectedGroupBy) {
      // Restore original data when switching from grouped to non-grouped mode
      const wasGrouped = prevSelectedGroupByRef.current !== '';
      const dataChanged = originalData !== prevOriginalDataRef.current;

      if (wasGrouped || dataChanged) {
        prevOriginalDataRef.current = originalData;
        prevSelectedGroupByRef.current = '';
        setRowData(deepClone(originalData));
      }
    } else {
      // Update ref when in grouped mode
      prevSelectedGroupByRef.current = selectedGroupBy;
    }
    // Remove setRowData from dependencies - React guarantees setState functions are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRows, refEntityData, selectedGroupBy, originalData, entity?.fields, gridApiRef]);

  return {
    selectedGroupBy,
    expandedRows,
    refEntityData,
    groupableColumns,
    handleGroupByChange,
    toggleExpand,
  };
};
