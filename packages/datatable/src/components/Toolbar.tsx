import './Toolbar.scss';

interface ToolbarProps {
  onRefresh: () => void;
  onShowDiff: () => void;
  editedRowsCount: number;
}

export const Toolbar = ({ onRefresh, onShowDiff, editedRowsCount }: ToolbarProps) => {
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
    </div>
  );
};
