import { memo, useMemo } from 'react';
import { GridRow } from '@uipath/datatable/types';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';
import { EntityGetResponse } from '@uipath/uipath-typescript';
import type { ColDef } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './DetailPanel.scss';

interface DetailPanelProps {
  rowData: GridRow[];
  groupByFieldDisplayName: string;
  groupByFieldId: string | undefined;
  entity: EntityGetResponse | undefined;
}

/**
 * Detail panel component for displaying grouped records in master-detail view
 * Memoized to prevent unnecessary re-renders
 */
export const DetailPanel = memo<DetailPanelProps>(
  ({ rowData, groupByFieldDisplayName, entity }) => {
    const columnDefs = useMemo<ColDef<GridRow>[]>(() => {
      if (!entity) return [];

      return entity.fields
        .filter((f) => !f.isSystemField && f.displayName !== groupByFieldDisplayName)
        .map((f) => {
          const valueGetter = (params: { data?: GridRow }) =>
            getFieldValue(params.data?.[f.name], f);
          return {
            field: f.name,
            headerName: f.displayName,
            valueGetter,
            tooltipValueGetter: valueGetter,
          };
        });
    }, [entity, groupByFieldDisplayName]);

    // Show message if no data
    if (!rowData || rowData.length === 0) {
      return (
        <div className="detail-panel">
          <div className="detail-panel-empty">
            No records found in this group
          </div>
        </div>
      );
    }

    return (
      <div className="detail-panel">
        <div className="detail-panel-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            domLayout="autoHeight"
            defaultColDef={{
              sortable: true,
              resizable: true,
              flex: 1,
            }}
            theme={themeQuartz}
          />
        </div>
      </div>
    );
  }
);

DetailPanel.displayName = 'DetailPanel';
