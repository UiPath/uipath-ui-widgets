import { CustomCellEditorProps } from "ag-grid-react";
import { useCallback, useEffect, useRef } from "react";

export const MultilineTextCellEditor = ({
  value,
  onValueChange,
}: CustomCellEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onValueChange(e.target.value);
    },
    [onValueChange],
  );

  return (
    <textarea
      ref={textareaRef}
      defaultValue={value ?? ""}
      onChange={handleChange}
      className="w-full h-[200%] px-2 py-1 bg-background leading-normal"
    />
  );
};
