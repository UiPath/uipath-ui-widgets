import { UiPath } from "@uipath/uipath-typescript";

export interface DataTableProps {
  sdk: UiPath;
  entityId: string;
  className?: string;
  pageSize?: number;
}
