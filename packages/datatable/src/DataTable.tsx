import { useEffect, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { DataTableProps } from './types';
import { ColDef, themeQuartz, CellValueChangedEvent } from 'ag-grid-community';
import { EntityGetResponse, FieldMetaData } from '@uipath/uipath-typescript';
import { DiffDialog } from './DiffDialog';
import './DataTable.scss';

export const DataTable = ({
  sdk,
  entityId,
  className = '',
  pageSize,
  columnConfig,
}: DataTableProps) => {
  const [rowData, setRowData] = useState<unknown[]>([]);
  const [originalData, setOriginalData] = useState<unknown[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editedRows, setEditedRows] = useState<Map<string, any>>(new Map());
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState<EntityGetResponse>();
  const [showDiffDialog, setShowDiffDialog] = useState(false);

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
      setOriginalData(JSON.parse(JSON.stringify(items))); // Deep clone
      setEditedRows(new Map()); // Clear edits on refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
    } finally {
      setLoading(false);
    }
  }, [entityId, sdk, columnConfig]);

  const handleCellValueChanged = (event: CellValueChangedEvent) => {
    const rowId = event.data.Id;
    if (!rowId) return;

    setEditedRows((prev) => {
      const updated = new Map(prev);
      updated.set(rowId, event.data);
      return updated;
    });
  };

  const handleCommitChanges = async () => {
    try {
      const rowsToUpdate = Array.from(editedRows.values());
      await entity?.update(rowsToUpdate);

      // Clear edits and refresh
      setEditedRows(new Map());
      setShowDiffDialog(false);
      await fetchEntityRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit changes');
    }
  };

  const handleCancelChanges = () => {
    // Revert all changes
    setRowData(JSON.parse(JSON.stringify(originalData)));
    setEditedRows(new Map());
    setShowDiffDialog(false);
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

  const getDiffData = () => {
    return Array.from(editedRows.entries()).map(([rowId, editedRow]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = originalData.find((row: any) => row.Id === rowId);
      return { rowId, original, edited: editedRow };
    });
  };

  return (
    <div className={`datatable-container ${className}`}>
      <div className="datatable-toolbar">
        <button onClick={fetchEntityRecords} className="datatable-refresh-button">Refresh</button>
        <button
          onClick={() => setShowDiffDialog(true)}
          className="datatable-diff-button"
          disabled={editedRows.size === 0}
        >
          Show Diff ({editedRows.size})
        </button>
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

      <DiffDialog
        isOpen={showDiffDialog}
        onClose={() => setShowDiffDialog(false)}
        onCommit={handleCommitChanges}
        onCancel={handleCancelChanges}
        diffData={getDiffData()}
      />
    </div>
  );
};
