import { ChoiceSets, FieldMetaData } from "@uipath/uipath-typescript/entities";
import { MultiSelect } from "@uipath/apollo-wind";
import { CustomCellEditorProps } from "ag-grid-react";
import { useCallback, useEffect, useState } from "react";
import { useChoiceSetCache } from "../hooks/useChoiceSetCache";
import { GridRow } from "../types";

export interface ChoiceSetMultipleCellEditorProps extends CustomCellEditorProps {
  choiceSetService: ChoiceSets;
  field: FieldMetaData;
  entityRecord: GridRow;
}

export const ChoiceSetMultipleCellEditor = ({
  choiceSetService,
  field,
  entityRecord,
  onValueChange,
}: ChoiceSetMultipleCellEditorProps) => {
  const choiceSetId = field.choiceSetId || field.referenceChoiceSet?.id || "";
  const currentValue = entityRecord[field.name];

  const parseInitialSelected = (): string[] => {
    if (!currentValue) return [];
    if (Array.isArray(currentValue)) {
      return currentValue.map((v: number) => String(v));
    }
    return [];
  };

  const [selected, setSelected] = useState<string[]>(parseInitialSelected());
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    [],
  );
  const { getValues } = useChoiceSetCache(choiceSetService);

  useEffect(() => {
    const fetchValues = async () => {
      if (!choiceSetId) return;
      const fetchedValues = await getValues(choiceSetId);
      setOptions(
        fetchedValues.map((v) => ({
          label: v.displayName,
          value: String(v.numberId),
        })),
      );
    };
    fetchValues();
  }, [choiceSetId, getValues]);

  const handleChange = useCallback(
    (newSelected: string[]) => {
      setSelected(newSelected);
      onValueChange(newSelected.map(Number));
    },
    [onValueChange],
  );

  return (
    <div className="ag-allow-overflow">
      <MultiSelect
        options={options}
        selected={selected}
        onChange={handleChange}
        placeholder="Select values..."
      />
    </div>
  );
};
