import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { DataTableProps } from './types';
import { ColDef, themeMaterial } from 'ag-grid-community';

export const DataTable = ({
  sdk,
  entityId,
  className = '',
  pageSize,
}: DataTableProps) => {
  const [rowData, setRowData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntityRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const options = {
          expansionLevel: 1,
          ...(pageSize && { pageSize }),
        };

        const entity = await sdk.entities.getById(entityId);
        const records = await entity.getRecords(options);
        const items = records.items;

        if (items.length > 0) {
          const columns: ColDef[] = entity.fields.filter(f => !f.isSystemField).map((f) => ({
            field: f.name,
            headerName: f.displayName,
            sortable: true,
            filter: true,
            resizable: true,
          }));
          setColumnDefs(columns);
        }

        setRowData(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
      } finally {
        setLoading(false);
      }
    };

    if (entityId && sdk) {
      fetchEntityRecords();
    }
  }, [entityId, sdk, pageSize]);

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
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={!!pageSize}
        paginationPageSize={pageSize || 50}
        defaultColDef={{
          flex: 1,
          minWidth: 100,
        }}
        theme={themeMaterial}
      />
    </div>
  );
};
