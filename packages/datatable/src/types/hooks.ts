import { EntityGetResponse } from '@uipath/uipath-typescript';
import { ColDef, GridApi } from 'ag-grid-community';
import { GridRow } from './index';

/**
 * Return type for useEntityData hook
 */
export interface UseEntityDataReturn {
  rowData: GridRow[];
  setRowData: React.Dispatch<React.SetStateAction<GridRow[]>>;
  originalData: GridRow[];
  columnDefs: ColDef[];
  setColumnDefs: React.Dispatch<React.SetStateAction<ColDef[]>>;
  originalColumnDefs: ColDef[];
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  entity: EntityGetResponse | undefined;
  fetchEntityRecords: () => Promise<void>;
}

import { CellValueChangedEvent } from 'ag-grid-community';

/**
 * Return type for useRowEditing hook
 */
export interface UseRowEditingReturn {
  editedRows: Map<string, GridRow>;
  handleCellValueChanged: (event: CellValueChangedEvent) => void;
  commitUpdates: (entity: EntityGetResponse | undefined) => Promise<void>;
  revertAllUpdates: () => void;
  revertSingleCellUpdate: (rowId: string, fieldKey: string, originalValue: unknown) => void;
}

/**
 * Return type for useGridApi hook
 */
export interface UseGridApiReturn {
  gridApi: GridApi | undefined;
  selectedRowsCount: number;
  onGridReady: (params: { api: GridApi }) => void;
  onSelectionChanged: () => void;
}

/**
 * Return type for useMasterDetail hook
 */
export interface UseMasterDetailReturn {
  selectedGroupBy: string;
  expandedRows: Set<string>;
  refEntityData: GridRow[];
  groupableColumns: string[];
  handleGroupByChange: (column: string) => void;
  toggleExpand: (rowId: string) => void;
}

/**
 * Return type for useNewRecords hook
 */
export interface UseNewRecordsReturn {
  newRecords: Map<string, GridRow>;
  handleAddRow: () => void;
  handleInsertRecord: () => Promise<void>;
  handleDiscardNewRecords: () => void;
  trackNewRecordChange: (rowId: string, data: GridRow) => void;
}
