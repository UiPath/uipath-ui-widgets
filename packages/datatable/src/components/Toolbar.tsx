import './Toolbar.scss';

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
  groupableColumns?: string[];
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
  selectedGroupBy = '',
  onGroupByChange,
}: ToolbarProps) => {
  const hasNewRecords = newRecordsCount > 0;
  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onGroupByChange) {
      onGroupByChange(e.target.value);
    }
  };

  return (
    <div className="datatable-toolbar">
      <button onClick={onRefresh} className="datatable-toolbar-button datatable-refresh-button">
        Refresh
      </button>
      <button
        onClick={onShowDiff}
        className="datatable-toolbar-button datatable-diff-button"
        disabled={editedRowsCount === 0}
      >
        Show Diff ({editedRowsCount})
      </button>
      <button
        onClick={onAddRow}
        className="datatable-toolbar-button datatable-add-button primary"
        disabled={!!selectedGroupBy}
      >
        Add Row
      </button>
      {hasNewRecords && (
        <>
          <button
            onClick={onInsertRecord}
            className="datatable-toolbar-button datatable-insert-button primary"
          >
            Insert Records ({newRecordsCount})
          </button>
          <button
            onClick={onDiscardNewRecords}
            className="datatable-toolbar-button datatable-discard-button destructive"
          >
            Discard
          </button>
        </>
      )}
      <button
        onClick={onDelete}
        className="datatable-toolbar-button datatable-delete-button destructive"
        disabled={selectedRowsCount === 0}
      >
        Delete Records ({selectedRowsCount})
      </button>
      {groupableColumns.length > 0 && (
        <div className="datatable-group-by-container">
          <label htmlFor="group-by-select" className="datatable-group-by-label">
            Group by:
          </label>
          <select
            id="group-by-select"
            className="datatable-group-by-select"
            value={selectedGroupBy}
            onChange={handleGroupByChange}
          >
            <option value="">None</option>
            {groupableColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
