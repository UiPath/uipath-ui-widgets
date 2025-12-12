import { GridApi } from 'ag-grid-community';
import { useCallback, useState } from 'react';
import type { UseGridApiReturn } from '@uipath/datatable/types/hooks';

/**
 * Hook to manage ag-Grid API instance and row selection
 *
 * Handles:
 * - Grid API initialization
 * - Row selection tracking
 * - Grid ready event
 */
export const useGridApi = (): UseGridApiReturn => {
  const [gridApi, setGridApi] = useState<GridApi>();
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  const onGridReady = useCallback((params: { api: GridApi }) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    setSelectedRowsCount(selectedRows.length);
  }, [gridApi]);

  return {
    gridApi,
    selectedRowsCount,
    onGridReady,
    onSelectionChanged,
  };
};
