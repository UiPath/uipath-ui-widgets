import { UiPath } from "@uipath/uipath-typescript/core";
import { EntityRecord } from "@uipath/uipath-typescript/entities";
import { ColDef, RowClassRules } from "ag-grid-community";

export interface DataTableProps {
  sdk: UiPath;
  entityId: string;
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

export enum TelemetryService {
  Refresh = "DT.Refresh",
  AddRow = "DT.AddRow",
  DeleteRow = "DT.DeleteRow",
  ShowDiff = "DT.ShowDiff",
  GroupBy = "DT.GroupBy",
  InsertRecords = "DT.InsertRecords",
  DiscardNewRecords = "DT.DiscardNewRecords",
  CommitChanges = "DT.CommitChanges",
  RevertAll = "DT.RevertAll",
  RevertField = "DT.RevertField",
  EntityDataLoad = "DT.EntityDataLoad",
  FileOpen = "DT.FileOpen",
  FileDownload = "DT.FileDownload",
  FileRemove = "DT.FileRemove",
  FileUpload = "DT.FileUpload",
}

export enum TelemetryStatus {
  Success = "DT.Success",
  Error = "DT.Error",
}
