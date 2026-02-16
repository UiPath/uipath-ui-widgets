import { Button } from "@uipath/apollo-wind";

interface CellWithExpandButtonProps {
  cellName: string;
  cellId: string;
  isExpanded: boolean;
  onToggleExpand: (rowId: string) => void;
}

export const CellWithExpandButton = (props: CellWithExpandButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggleExpand(props.cellId);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 transition-transform ${props.isExpanded ? "rotate-90" : ""}`}
        onClick={handleClick}
        aria-label={props.isExpanded ? "Collapse" : "Expand"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <span>{props.cellName}</span>
    </div>
  );
};
