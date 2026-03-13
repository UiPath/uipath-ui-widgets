import {
  ChoiceSets,
  Entities,
  EntityGetResponse,
} from "@uipath/uipath-typescript/entities";
import { ColDef } from "ag-grid-community";
import { useCallback, useState } from "react";
import { DateTimeCellRenderer } from "../components/DateTimeCellRenderer";
import { FileCellRenderer } from "../components/FileCellRenderer";
import { GridRow, TelemetryService, TelemetryStatus } from "../types";
import { deepClone } from "../utils/dataUtils";
import {
  ChoiceSetValuesMap,
  createCellEditorSelector,
  createValueSetter,
  getFieldValue,
  isChoiceSetMultiple,
  isChoiceSetSingle,
  isFieldTypeDateTime,
  isFileField,
} from "../utils/fieldUtils";
import { trackTelemetry } from "../utils/telemetryUtils";
import { useChoiceSetCache } from "./useChoiceSetCache";

export const useEntityData = (
  entityService: Entities,
  choiceSetService: ChoiceSets,
  entityId: string,
  columnConfig?: Record<string, ColDef>,
  showIdColumn?: boolean,
) => {
  const [rowData, setRowData] = useState<GridRow[]>([]);
  const [originalData, setOriginalData] = useState<GridRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [originalColumnDefs, setOriginalColumnDefs] = useState<ColDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState<EntityGetResponse>();
  const [choiceSetValuesMap, setChoiceSetValuesMap] =
    useState<ChoiceSetValuesMap>(new Map());
  const { getValues: getChoiceSetValues } = useChoiceSetCache(choiceSetService);

  const fetchEntityRecords = useCallback(async () => {
    try {
      setError(null);

      const fetchedEntity = await entityService.getById(entityId);
      setEntity(fetchedEntity);

      const records = await fetchedEntity.getAllRecords({
        expansionLevel: 2,
        pageSize: 10000,
      });
      const items = records.items;

      if (items.length > 0) {
        let nonSystemFields = fetchedEntity.fields.filter((f) =>
          f.name === "Id" ? showIdColumn : !f.isSystemField,
        );

        // Move Id column to first position if showIdColumn is true
        if (showIdColumn) {
          const idIndex = nonSystemFields.findIndex((f) => f.name === "Id");
          if (idIndex > 0) {
            const idField = nonSystemFields[idIndex];
            nonSystemFields = [
              idField,
              ...nonSystemFields.slice(0, idIndex),
              ...nonSystemFields.slice(idIndex + 1),
            ];
          }
        }

        // Pre-fetch choice set values for all choice set fields
        const choiceSetIds = [
          ...new Set(
            nonSystemFields
              .filter((f) => isChoiceSetSingle(f) || isChoiceSetMultiple(f))
              .map((f) => f.choiceSetId)
              .filter(Boolean),
          ),
        ] as string[];

        const csValuesMap: ChoiceSetValuesMap = new Map();
        await Promise.all(
          choiceSetIds.map(async (csId) => {
            const values = await getChoiceSetValues(csId);
            const numberIdMap = new Map<number, string>();
            for (const item of values) {
              numberIdMap.set(item.numberId, item.displayName);
            }
            csValuesMap.set(csId, numberIdMap);
          }),
        );
        setChoiceSetValuesMap(csValuesMap);

        const columns: ColDef[] = nonSystemFields.map((f) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const valueGetter = (params: any) =>
            getFieldValue(params.data?.[f.name], f, csValuesMap);

          const colDef: ColDef = {
            field: f.name,
            headerName: f.displayName,
            valueGetter: valueGetter,
            tooltipValueGetter: valueGetter,
            valueSetter: createValueSetter(f.name),
            cellEditorSelector: createCellEditorSelector(
              f,
              entityService,
              choiceSetService,
            ),
            ...columnConfig?.[f.displayName],
          };

          if (isFileField(f)) {
            colDef.cellRenderer = FileCellRenderer;
            colDef.cellRendererParams = {
              entityService,
              entityId,
              fieldName: f.name,
            };
            colDef.editable = false;
          } else if (isFieldTypeDateTime(f)) {
            colDef.cellRenderer = DateTimeCellRenderer;
            colDef.cellRendererParams = { fieldName: f.name };
            colDef.minWidth = 300; // This is the default width of datetime picker
            colDef.editable = false;
          }

          return colDef;
        });
        setColumnDefs(columns);
        setOriginalColumnDefs(columns);
      }

      setRowData(items);
      setOriginalData(deepClone(items));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch entity records";
      setError(errorMessage);

      trackTelemetry(TelemetryService.EntityDataLoad, TelemetryStatus.Error, {
        EntityId: entityId,
        Error: errorMessage,
      });
    }
  }, [
    entityService,
    choiceSetService,
    entityId,
    showIdColumn,
    columnConfig,
    getChoiceSetValues,
  ]);

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
    choiceSetValuesMap,
    fetchEntityRecords,
  };
};
