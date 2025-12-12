import {
  GetRowIdParams,
  ICellRendererParams,
  IsFullWidthRowParams,
  RowClassParams,
  RowHeightParams,
} from 'ag-grid-community';
import { GridRow } from './index';

/**
 * Type aliases for ag-grid callback parameters
 */
export type GridRowIdParams = GetRowIdParams<GridRow>;
export type GridRowHeightParams = RowHeightParams<GridRow>;
export type GridRowClassParams = RowClassParams<GridRow>;
export type GridIsFullWidthParams = IsFullWidthRowParams<GridRow>;
export type GridCellRendererParams = ICellRendererParams<GridRow>;
