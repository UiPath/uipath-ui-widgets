import { GridRow } from "../types";
import { getFieldValue, ChoiceSetValuesMap } from "../utils/fieldUtils";
import { EntityGetResponse } from "@uipath/uipath-typescript";
import type { ColDef } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import "./DetailPanel.css";

interface DetailPanelProps {
  rowData: GridRow[];
  groupByFieldDisplayName: string;
  groupByFieldId: string | undefined;
  entity: EntityGetResponse | undefined;
  choiceSetValuesMap?: ChoiceSetValuesMap;
}

export const DetailPanel = ({
  rowData,
  groupByFieldDisplayName,
  entity,
  choiceSetValuesMap,
}: DetailPanelProps) => {
  const columnDefs = useMemo<ColDef<GridRow>[]>(() => {
    if (!entity) return [];

    const entityFieldsMap = new Map(
      entity.fields.map((field) => [field.name, field]),
    );
    return entity.fields
      .filter(
        (f) => !f.isSystemField && f.displayName !== groupByFieldDisplayName,
      )
      .map((f) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueGetter = (params: any) =>
          getFieldValue(
            params.data?.[f.name],
            entityFieldsMap.get(f.name),
            choiceSetValuesMap,
          );
        return {
          field: f.name,
          headerName: f.displayName,
          valueGetter: valueGetter,
          tooltipValueGetter: valueGetter,
        };
      });
  }, [entity, groupByFieldDisplayName, choiceSetValuesMap]);

  return (
    <div className="detail-panel">
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
  );
};
