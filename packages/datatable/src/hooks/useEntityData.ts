import { EntityGetResponse, UiPath } from '@uipath/uipath-typescript';
import { ColDef } from 'ag-grid-community';
import { useCallback, useState } from 'react';
import { deepClone } from '@uipath/datatable/utils/dataUtils';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';

export const useEntityData = (
  sdk: UiPath,
  entityId: string,
  columnConfig?: Record<string, ColDef>
) => {
  const [rowData, setRowData] = useState<unknown[]>([]);
  const [originalData, setOriginalData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState<EntityGetResponse>();

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
        const nonSystemFields = fetchedEntity.fields.filter(f => !f.isSystemField);
        const columns: ColDef[] = nonSystemFields.map((f) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const valueGetter = (params: any) => getFieldValue(params.data?.[f.name], entityFieldsMap.get(f.name))
          return {
            field: f.name,
            headerName: f.displayName,
            valueGetter: valueGetter,
            tooltipValueGetter: valueGetter,
            ...columnConfig?.[f.displayName],
          }
        });
        setColumnDefs(columns);
      }

      setRowData(items);
      setOriginalData(deepClone(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
    } finally {
      setLoading(false);
    }
  }, [entityId, sdk, columnConfig]);

  return {
    rowData,
    setRowData,
    originalData,
    setOriginalData,
    columnDefs,
    loading,
    error,
    setError,
    entity,
    fetchEntityRecords,
  };
};
