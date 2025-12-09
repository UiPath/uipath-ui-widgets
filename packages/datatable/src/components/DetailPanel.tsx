import { GridRow } from '@uipath/datatable/types';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';
import { EntityGetResponse } from '@uipath/uipath-typescript';
import type { ColDef } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import './DetailPanel.scss';

interface DetailPanelProps {
  rowData: GridRow[];
  groupByFieldDisplayName: string;
  groupByFieldId: string | undefined;
  entity: EntityGetResponse | undefined;
}

export const DetailPanel = ({ rowData, groupByFieldDisplayName, entity }: DetailPanelProps) => {
  const columnDefs = useMemo<ColDef<GridRow>[]>(() => {
    if (!entity) return [];

    const entityFieldsMap = new Map(entity.fields.map(field => [field.name, field]));
    return entity.fields.filter(f => !f.isSystemField && f.displayName !== groupByFieldDisplayName).map((f) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valueGetter = (params: any) => getFieldValue(params.data?.[f.name], entityFieldsMap.get(f.name))
      return{
        field: f.name,
        headerName: f.displayName,
        valueGetter: valueGetter,
        tooltipValueGetter: valueGetter,
      }
    });
  }, [entity, groupByFieldDisplayName])

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
            flex: 1
          }}
          theme={themeQuartz}
        />
      </div>
    </div>
  );
};
