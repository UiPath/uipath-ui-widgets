import { ColDef, RowSelectionOptions } from 'ag-grid-community';

/**
 * Default column definition for ag-Grid
 */
export const getDefaultColDef = (isEditable: boolean): ColDef => ({
  sortable: true,
  filter: true,
  resizable: true,
  editable: isEditable,
  flex: 1,
  minWidth: 100,
});

/**
 * Row selection configuration for ag-Grid
 */
export const getRowSelection = (): RowSelectionOptions => ({
  mode: 'multiRow' as const,
});
