import { GridRow } from '@uipath/datatable/types';
import { deepClone } from '@uipath/datatable/utils/dataUtils';
import { getFieldValue, createValueSetter, createCellEditorSelector } from '@uipath/datatable/utils/fieldUtils';
import { EntityGetResponse, UiPath } from '@uipath/uipath-typescript';
import { ColDef } from 'ag-grid-community';
import { useCallback, useState } from 'react';

export const useEntityData = (
  sdk: UiPath,
  entityId: string,
  columnConfig?: Record<string, ColDef>
) => {
  const [rowData, setRowData] = useState<GridRow[]>([]);
  const [originalData, setOriginalData] = useState<GridRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [originalColumnDefs, setOriginalColumnDefs] = useState<ColDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState<EntityGetResponse>();

  const fetchEntityRecords = useCallback(async () => {
    try {
      setError(null);

      const fetchedEntity = await sdk.entities.getById(entityId);
      setEntity(fetchedEntity);

      const records = await fetchedEntity.getRecords({
        expansionLevel: 2,
      });
      const items = records.items;

      if (items.length > 0) {
        const nonSystemFields = fetchedEntity.fields.filter(f => !f.isSystemField);
        const columns: ColDef[] = nonSystemFields.map((f) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const valueGetter = (params: any) => getFieldValue(params.data?.[f.name], f)
          return {
            field: f.name,
            headerName: f.displayName,
            valueGetter: valueGetter,
            tooltipValueGetter: valueGetter,
            valueSetter: createValueSetter(f.name),
            cellEditorSelector: createCellEditorSelector(f, sdk),
            ...columnConfig?.[f.displayName],
          }
        });
        setColumnDefs(columns);
        setOriginalColumnDefs(columns)
      }

      setRowData(items);
      setOriginalData(deepClone(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
      // Error is caught and set in state, no need to re-throw
    }
  }, [entityId, sdk, columnConfig]);

  return {
    rowData,
    setRowData,
    originalData,
    columnDefs,
    setColumnDefs,
    originalColumnDefs,
    error,
    setError,
    entity,
    fetchEntityRecords,
  };
};
