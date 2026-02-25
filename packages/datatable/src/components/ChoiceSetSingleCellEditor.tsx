import {
  ChoiceSets,
  ChoiceSetGetResponse,
  FieldMetaData,
} from "@uipath/uipath-typescript/entities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind";
import { CustomCellEditorProps } from "ag-grid-react";
import { JSX, useCallback, useEffect, useState } from "react";
import { useChoiceSetCache } from "../hooks/useChoiceSetCache";
import { GridRow } from "../types";

export interface ChoiceSetSingleCellEditorProps extends CustomCellEditorProps {
  choiceSetService: ChoiceSets;
  field: FieldMetaData;
  entityRecord: GridRow;
}

export const ChoiceSetSingleCellEditor = ({
  choiceSetService,
  field,
  entityRecord,
  onValueChange,
}: ChoiceSetSingleCellEditorProps) => {
  const choiceSetId = field.choiceSetId || field.referenceChoiceSet?.id || "";
  const currentValue = entityRecord[field.name];
  const initialValue =
    typeof currentValue === "number" ? String(currentValue) : "none";

  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [selectItems, setSelectItems] = useState<JSX.Element[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { getValues } = useChoiceSetCache(choiceSetService);

  useEffect(() => {
    const fetchValues = async () => {
      if (!choiceSetId) return;
      const fetchedValues = await getValues(choiceSetId);
      setSelectItems(
        fetchedValues.map((value: ChoiceSetGetResponse) => (
          <SelectItem key={value.id} value={String(value.numberId)}>
            {value.displayName}
          </SelectItem>
        )),
      );
      if (fetchedValues.length > 0) {
        setIsOpen(true);
      }
    };
    fetchValues();
  }, [choiceSetId, getValues]);

  const handleOnChange = useCallback(
    (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange(newValue === "none" ? null : Number(newValue));
    },
    [onValueChange],
  );

  return (
    <div className="h-full">
      <Select
        value={selectedValue}
        onValueChange={handleOnChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="h-full w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {selectItems}
        </SelectContent>
      </Select>
    </div>
  );
};
