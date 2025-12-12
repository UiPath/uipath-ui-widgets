import { EntityRecord, UiPath } from '@uipath/uipath-typescript';
import { ColDef, RowClassRules } from 'ag-grid-community';

export interface DataTableProps {
  sdk: UiPath;
  entityId: string;
  className?: string;
  pageSize?: number;
  columnConfig?: Record<string, ColDef>;
  rowClassRules?: RowClassRules;
}

export interface GridRow extends EntityRecord {
  _isExpandedRow?: boolean;
  _groupedRecords?: GridRow[];
  _isDetailRow?: boolean;
}
