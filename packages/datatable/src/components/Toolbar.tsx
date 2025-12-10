import './Toolbar.scss';

interface ToolbarProps {
  onRefresh: () => void;
  onShowDiff: () => void;
  onDelete: () => void;
  editedRowsCount: number;
  selectedRowsCount: number;
}

export const Toolbar = ({ onRefresh, onShowDiff, onDelete, editedRowsCount, selectedRowsCount }: ToolbarProps) => {
  return (
    <div className="datatable-toolbar">
      <button onClick={onRefresh} className="datatable-refresh-button">
        Refresh
      </button>
      <button
        onClick={onShowDiff}
        className="datatable-diff-button"
        disabled={editedRowsCount === 0}
      >
        Show Diff ({editedRowsCount})
      </button>
      <button
        onClick={onDelete}
        className="datatable-delete-button"
        disabled={selectedRowsCount === 0}
      >
        Delete Records ({selectedRowsCount})
      </button>
    </div>
  );
};
