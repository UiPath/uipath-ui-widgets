import './Toolbar.scss';

interface ToolbarProps {
  onRefresh: () => void;
  onShowDiff: () => void;
  onDelete: () => void;
  onAddRow: () => void;
  onInsertRecord: () => void;
  onDiscardNewRecords: () => void;
  editedRowsCount: number;
  selectedRowsCount: number;
  newRecordsCount: number;
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
  newRecordsCount
}: ToolbarProps) => {
  const hasNewRecords = newRecordsCount > 0;

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
    </div>
  );
};
