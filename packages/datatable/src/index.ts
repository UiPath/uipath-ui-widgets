import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowSelectionModule,
  PaginationModule,
  TextEditorModule,
  NumberEditorModule,
  DateEditorModule,
  CheckboxEditorModule,
  SelectEditorModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RenderApiModule
} from 'ag-grid-community';

// Register only the ag-Grid modules actually used in this package
// Features used: row model, filtering, sorting, pagination, selection, editing
ModuleRegistry.registerModules([
  ClientSideRowModelModule, // Required: basic row rendering and data management
  ValidationModule,          // Required: for grid validation
  TextFilterModule,          // Used: filter: true in defaultColDef
  NumberFilterModule,        // Used: filter: true for number columns
  DateFilterModule,          // Used: filter: true for date columns
  RowSelectionModule,        // Used: rowSelection prop in master mode
  PaginationModule,          // Used: pagination={true}
  TextEditorModule,          // Used: editable cells (text)
  NumberEditorModule,        // Used: editable cells (numbers)
  DateEditorModule,          // Used: editable cells (dates)
  CheckboxEditorModule,      // Used: editable cells (booleans)
  SelectEditorModule,        // Used: editable cells (dropdowns)
  RowStyleModule,            // Used: rowClassRules prop for row styling
  ColumnAutoSizeModule,      // Used: sizeColumnsToFit() in useGridApi
  RenderApiModule            // Used: refreshCells() for master-detail updates
]);

// Main component export
export { DataTable } from '@uipath/datatable/DataTable';

// Public types
export type { DataTableProps, GridRow } from '@uipath/datatable/types';
