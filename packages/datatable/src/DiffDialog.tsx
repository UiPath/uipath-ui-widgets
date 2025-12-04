import './DiffDialog.scss';

interface DiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => void;
  onCancel: () => void;
  diffData: Array<{
    rowId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    original: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edited: any;
  }>;
}

export const DiffDialog = ({
  isOpen,
  onClose,
  onCommit,
  onCancel,
  diffData,
}: DiffDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="datatable-dialog-overlay">
      <div className="datatable-dialog">
        <div className="datatable-dialog-header">
          <h2>Review Changes</h2>
          <button onClick={onClose} className="datatable-dialog-close">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </button>
        </div>
        <div className="datatable-dialog-content">
          {diffData.map(({ rowId, original, edited }) => (
            <div key={rowId} className="datatable-diff-row">
              <h3>Row ID: {rowId}</h3>
              <table className="datatable-diff-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Original</th>
                    <th>New</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(edited).map((key) => {
                    const originalValue = original?.[key];
                    const editedValue = edited[key];
                    const hasChanged = JSON.stringify(originalValue) !== JSON.stringify(editedValue);

                    return hasChanged ? (
                      <tr key={key} className="datatable-diff-changed">
                        <td>{key}</td>
                        <td className="datatable-diff-old">{originalValue}</td>
                        <td className="datatable-diff-new">{editedValue}</td>
                      </tr>
                    ) : null;
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="datatable-dialog-footer">
          <button onClick={onCancel} className="datatable-button-revert-all">Revert</button>
          <button onClick={onCommit} className="datatable-button-commit">Commit Changes</button>
        </div>
      </div>
    </div>
  );
};
