import { ICellRendererParams } from "ag-grid-community";

export const MultilineTextCellRenderer = (params: ICellRendererParams) => {
  return (
    <div className="whitespace-pre-wrap overflow-auto h-full w-full leading-normal">
      {params.value}
    </div>
  );
};
