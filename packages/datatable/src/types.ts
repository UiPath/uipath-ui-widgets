import { UiPath } from "@uipath/uipath-typescript/core";
import { EntityRecord } from "@uipath/uipath-typescript/entities";
import { ColDef, RowClassRules } from "ag-grid-community";

export interface DataTableProps {
  sdk: UiPath;
  entityId: string;
  className?: string;
  pageSize?: number;
  columnConfig?: Record<string, ColDef>;
  rowClassRules?: RowClassRules;
  customPaddingForExpandedRow?: number;
  showIdColumn?: boolean;
}

export interface GridRow extends EntityRecord {
  _isExpandedRow?: boolean;
  _isHidden?: boolean;
  _groupedRecords?: GridRow[];
}
