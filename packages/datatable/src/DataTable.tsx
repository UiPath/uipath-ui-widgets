import { useEffect, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { DataTableProps } from './types';
import { ColDef, themeQuartz, CellValueChangedEvent } from 'ag-grid-community';
import { EntityGetResponse, FieldMetaData } from '@uipath/uipath-typescript';
import './DataTable.css';

export const DataTable = ({
  sdk,
  entityId,
  className = '',
  pageSize,
  columnConfig,
}: DataTableProps) => {
  const [rowData, setRowData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState<EntityGetResponse>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldValue = (value: any, field: FieldMetaData | undefined) => {
    if (field?.isForeignKey) {
      const referenceFieldName = field.referenceField?.definition?.name;
      return referenceFieldName ? value?.[referenceFieldName] : value;
    }
    return value;
  };

  const fetchEntityRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedEntity = await sdk.entities.getById(entityId);
      setEntity(fetchedEntity);
      const entityFieldsMap = new Map(fetchedEntity.fields.map(field => [field.name, field]));

      const records = await fetchedEntity.getRecords({
        expansionLevel: 2,
      });
      const items = records.items;

      if (items.length > 0) {
        const columns: ColDef[] = fetchedEntity.fields.filter(f => !f.isSystemField).map((f) => ({
          field: f.name,
          headerName: f.displayName,
          valueGetter: (params) => getFieldValue(params.data?.[f.name], entityFieldsMap.get(f.name)),
          tooltipValueGetter: (params) => getFieldValue(params.data?.[f.name], entityFieldsMap.get(f.name)),
          ...columnConfig?.[f.displayName],
        }));
        setColumnDefs(columns);
      }

      setRowData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
    } finally {
      setLoading(false);
    }
  }, [entityId, sdk, columnConfig]);

  const handleCellValueChanged = async (event: CellValueChangedEvent) => {
    try {
      const updatedRow = event.data;
      await entity?.update([updatedRow]);
    } catch (err) {
      event.node.setDataValue(event.colDef.field!, event.oldValue);
      setError(err instanceof Error ? err.message : 'Failed to update record');
    }
  };

  useEffect(() => {
    if (entityId && sdk) {
      fetchEntityRecords();
    }
  }, [entityId, sdk, fetchEntityRecords]);


  if (loading) {
    return <div className="datatable-loading">Loading...</div>;
  }

  if (error) {
    return <div className="datatable-error">Error: {error}</div>;
  }

  if (!rowData || rowData.length === 0) {
    return <div className="datatable-empty">No data available</div>;
  }

  return (
    <div className={`datatable-container ${className}`}>
      <div className="datatable-toolbar">
        <button onClick={fetchEntityRecords} className="datatable-refresh-button">Refresh</button>
      </div>
      <div className="datatable-grid-wrapper">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={pageSize || 50}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            editable: true,
            flex: 1,
            minWidth: 100,
          }}
          theme={themeQuartz}
          onCellValueChanged={handleCellValueChanged}
        />
      </div>
    </div>
  );
};
