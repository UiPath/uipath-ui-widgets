import { ENTITY_EXPANSION_LEVEL } from '@uipath/datatable/constants/defaults';
import { GridRow } from '@uipath/datatable/types';
import type { UseEntityDataReturn } from '@uipath/datatable/types/hooks';
import { deepClone } from '@uipath/datatable/utils/dataUtils';
import { getFieldValue } from '@uipath/datatable/utils/fieldUtils';
import { EntityGetResponse, UiPath } from '@uipath/uipath-typescript';
import { ColDef } from 'ag-grid-community';
import { useCallback, useState } from 'react';

/**
 * Hook to manage entity data fetching and column definitions
 *
 * Handles:
 * - Fetching entity metadata and records
 * - Building column definitions from entity fields
 * - Managing original and current data states
 * - Error handling
 */
export const useEntityData = (
  sdk: UiPath,
  entityId: string,
  columnConfig?: Record<string, ColDef>
): UseEntityDataReturn => {
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
        expansionLevel: ENTITY_EXPANSION_LEVEL,
      });
      const items = records.items;

      if (items.length > 0) {
        const nonSystemFields = fetchedEntity.fields.filter((f) => !f.isSystemField);
        const columns: ColDef[] = nonSystemFields.map((f) => {
          const valueGetter = (params: { data?: GridRow }) =>
            getFieldValue(params.data?.[f.name], f);
          return {
            field: f.name,
            headerName: f.displayName,
            valueGetter,
            tooltipValueGetter: valueGetter,
            ...columnConfig?.[f.displayName],
          };
        });
        setColumnDefs(columns);
        setOriginalColumnDefs(columns);
      }

      setRowData(items);
      setOriginalData(deepClone(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
      throw err;
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
