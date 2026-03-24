import { DateTimePicker } from "@uipath/apollo-wind";
import { ICellRendererParams } from "ag-grid-community";
import { useCallback, useState } from "react";
import { GridRow } from "../types";

export interface DateTimeCellRendererProps extends ICellRendererParams<GridRow> {
  fieldName: string;
}

export const DateTimeCellRenderer = (props: DateTimeCellRendererProps) => {
  const { fieldName, data, node } = props;
  const currentValue = data?.[fieldName];
  const [value, setValue] = useState<Date | undefined>(
    currentValue ? new Date(currentValue) : undefined,
  );

  const handleChange = useCallback(
    (date: Date | undefined) => {
      setValue(date);
      const newValue = date ? date.toISOString() : null;
      node.setDataValue(fieldName, newValue, "dateTimePicker");
    },
    [fieldName, node],
  );

  return (
    <div className="flex h-full w-full items-center">
      <DateTimePicker
        value={value}
        onValueChange={handleChange}
        className="border-none shadow-none"
      />
    </div>
  );
};
