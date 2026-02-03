import { GridRow } from '../types';
import { deepClone } from '../utils/dataUtils';
import { getFieldValue, createValueSetter, createCellEditorSelector } from '../utils/fieldUtils';
import { Entities, EntityGetResponse } from "@uipath/uipath-typescript/entities";
import { ColDef } from 'ag-grid-community';
import { useCallback, useState } from 'react';

export const useEntityData = (
  entityService: Entities,
  entityId: string,
  columnConfig?: Record<string, ColDef>,
  showIdColumn?: boolean
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

      const fetchedEntity = await entityService.getById(entityId);
      setEntity(fetchedEntity);

      const records = await fetchedEntity.getRecords({
        expansionLevel: 2,
      });
      const items = records.items;

      if (items.length > 0) {
        let nonSystemFields = fetchedEntity.fields.filter(f =>
          f.name === 'Id' ? showIdColumn : !f.isSystemField
        );

        // Move Id column to first position if showIdColumn is true
        if (showIdColumn) {
          const idIndex = nonSystemFields.findIndex(f => f.name === 'Id');
          if (idIndex > 0) {
            const idField = nonSystemFields[idIndex];
            nonSystemFields = [idField, ...nonSystemFields.slice(0, idIndex), ...nonSystemFields.slice(idIndex + 1)];
          }
        }

        const columns: ColDef[] = nonSystemFields.map((f) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const valueGetter = (params: any) => getFieldValue(params.data?.[f.name], f)
          return {
            field: f.name,
            headerName: f.displayName,
            valueGetter: valueGetter,
            tooltipValueGetter: valueGetter,
            valueSetter: createValueSetter(f.name),
            cellEditorSelector: createCellEditorSelector(f, entityService),
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
  }, [entityService, entityId, showIdColumn, columnConfig]);

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
