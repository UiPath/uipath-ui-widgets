import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind";

interface ToolbarProps {
  onRefresh: () => void;
  onShowDiff: () => void;
  onDelete: () => void;
  onAddRow: () => void;
  onInsertRecord: () => void;
  onDiscardNewRecords: () => void;
  onGroupByChange?: (column: string) => void;
  editedRowsCount: number;
  selectedRowsCount: number;
  newRecordsCount: number;
  groupableColumns?: { name: string; displayName: string }[];
  selectedGroupBy?: string;
}

export const Toolbar = ({
  onRefresh,
  onShowDiff,
  onDelete,
  onAddRow,
  onInsertRecord,
  onDiscardNewRecords,
  editedRowsCount,
  selectedRowsCount,
  newRecordsCount,
  groupableColumns = [],
  selectedGroupBy = "",
  onGroupByChange,
}: ToolbarProps) => {
  const hasNewRecords = newRecordsCount > 0;
  const handleGroupByChange = (value: string) => {
    if (onGroupByChange) {
      onGroupByChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="default" onClick={onRefresh}>
        Refresh
      </Button>

      <Button
        variant="default"
        onClick={onShowDiff}
        disabled={editedRowsCount === 0}
      >
        Show Diff ({editedRowsCount})
      </Button>

      <Button variant="default" onClick={onAddRow} disabled={!!selectedGroupBy}>
        Add Row
      </Button>

      {hasNewRecords && (
        <>
          <Button variant="default" onClick={onInsertRecord}>
            Insert Records ({newRecordsCount})
          </Button>
          <Button variant="destructive" onClick={onDiscardNewRecords}>
            Discard
          </Button>
        </>
      )}
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={selectedRowsCount === 0}
      >
        Delete Records ({selectedRowsCount})
      </Button>
      {groupableColumns.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="group-by-select" className="w-full">
            Group by
          </Label>
          <Select value={selectedGroupBy} onValueChange={handleGroupByChange}>
            <SelectTrigger id="group-by-select" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {groupableColumns.map((column) => (
                <SelectItem value={column.name} key={column.name}>
                  {column.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
