import { EntityGetResponse } from '@uipath/uipath-typescript';
import { ICellRendererParams } from 'ag-grid-community';
import { useCallback, useRef, createElement } from 'react';
import { CellWithExpandButton } from '@uipath/datatable/components/CellWithExpandButton';
import { DetailPanel } from '@uipath/datatable/components/DetailPanel';
import {
  DETAIL_PANEL_BASE_HEIGHT,
  DETAIL_PANEL_PADDING,
  DETAIL_PANEL_ROW_HEIGHT,
  DETAIL_ROW_PREFIX,
  ROW_HEIGHT_CALC_DELAY,
} from '@uipath/datatable/constants/defaults';
import {
  GridCellRendererParams,
  GridIsFullWidthParams,
  GridRowClassParams,
  GridRowHeightParams,
  GridRowIdParams,
} from '@uipath/datatable/types/grid';

/**
 * Hook to provide memoized ag-Grid callback functions
 *
 * Provides callbacks for:
 * - Row ID generation
 * - Row height calculation
 * - Row class assignment
 * - Full-width row detection
 * - Cell and full-width renderers
 */
export const useGridCallbacks = (
  entity: EntityGetResponse | undefined,
  selectedGroupBy: string,
  expandedRowsRef: React.MutableRefObject<Set<string>>,
  toggleExpand: (rowId: string) => void
) => {
  const rowHeightCache = useRef<Map<string, number>>(new Map());

  const getRowId = useCallback((params: GridRowIdParams): string => {
    if (!params.data) return `row-${Math.random()}`;
    if (params.data._isExpandedRow) {
      return `${DETAIL_ROW_PREFIX}${params.data.Id || params.data.id || Math.random()}`;
    }
    return params.data.Id || params.data.id || `row-${Math.random()}`;
  }, []);

  const getRowHeight = useCallback((params: GridRowHeightParams) => {
    if (!params.data?._isExpandedRow) {
      return undefined; // ag-grid will automatically calc height of parent rows
    }

    const cacheKey = `${DETAIL_ROW_PREFIX}${params.data.Id}`;
    if (rowHeightCache.current.has(cacheKey)) {
      return rowHeightCache.current.get(cacheKey)!;
    }

    // Calculate estimated height
    const detailCount = params.data._groupedRecords?.length || 0;
    const estimatedHeight =
      DETAIL_PANEL_BASE_HEIGHT +
      detailCount * DETAIL_PANEL_ROW_HEIGHT +
      DETAIL_PANEL_PADDING;

    // Schedule re-measure after DOM renders
    setTimeout(() => {
      const row = document.querySelector(`[row-id="${cacheKey}"] .detail-row-content`);
      const actualHeight = row?.getBoundingClientRect().height;
      if (actualHeight && actualHeight > 0) {
        rowHeightCache.current.set(cacheKey, actualHeight);
        // Note: onRowHeightChanged() requires Enterprise edition
        // The grid will use the cached height on next render
      }
    }, ROW_HEIGHT_CALC_DELAY);

    return estimatedHeight;
  }, []);

  const getRowClass = useCallback((params: GridRowClassParams) => {
    return params.data?._isExpandedRow ? 'detail-row' : 'master-row';
  }, []);

  const isFullWidthRow = useCallback((params: GridIsFullWidthParams) => {
    return params.rowNode.data?._isExpandedRow === true;
  }, []);

  const expandButtonCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      if (params.data?._isDetailRow) return null;
      return createElement(CellWithExpandButton, {
        cellName: params.value,
        cellId: params.data.Id,
        isExpanded: expandedRowsRef.current.has(params.data.Id),
        onToggleExpand: toggleExpand,
      });
    },
    [toggleExpand, expandedRowsRef]
  );

  const fullWidthCellRenderer = useCallback(
    (props: GridCellRendererParams) => {
      return createElement(
        'div',
        { className: 'detail-row-content' },
        createElement(DetailPanel, {
          rowData: props.data?._groupedRecords || [],
          groupByFieldDisplayName: selectedGroupBy,
          groupByFieldId: props.data?.Id,
          entity: entity,
        })
      );
    },
    [entity, selectedGroupBy]
  );

  return {
    getRowId,
    getRowHeight,
    getRowClass,
    isFullWidthRow,
    expandButtonCellRenderer,
    fullWidthCellRenderer,
    rowHeightCache,
  };
};
