import { UiPath } from "@uipath/uipath-typescript";
import { ColDef } from "ag-grid-community";

export interface DataTableProps {
  sdk: UiPath;
  entityId: string;
  className?: string;
  pageSize?: number;
  columnConfig?: Record<string, ColDef>
}
