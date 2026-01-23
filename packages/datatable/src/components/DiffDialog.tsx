/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFieldValue } from '../utils/fieldUtils';
import { EntityGetResponse } from '@uipath/uipath-typescript';
import { useMemo } from 'react';
import './DiffDialog.css';

interface DiffDialogProps {
  entity: EntityGetResponse | undefined;
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => void;
  onRevertAll: () => void;
  onRevertField: (rowId: string, fieldKey: string, originalValue: any) => void;
  diffData: Array<{
    rowId: string;
    original: any;
    edited: any;
  }>;
}

// Helper function to safely convert any value to a displayable string
const valueToString = (value: any): string => {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export const DiffDialog = ({
  entity,
  isOpen,
  onClose,
  onCommit,
  onRevertAll,
  onRevertField,
  diffData,
}: DiffDialogProps) => {
  const fieldsMap = useMemo(() => {
    return new Map(entity?.fields.map(f => [f.name, f]) || []);
  }, [entity]);

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
                    const field = fieldsMap.get(key);

                    return hasChanged ? (
                      <tr key={key} className="datatable-diff-changed">
                        <td>{key}</td>
                        <td className="datatable-diff-old">{field ? getFieldValue(originalValue, field) : valueToString(originalValue)}</td>
                        <td className="datatable-diff-new">
                          <div className="datatable-diff-new-content">
                            <span>{field ? getFieldValue(editedValue, field) : valueToString(editedValue)}</span>
                            <button
                              onClick={() => onRevertField(rowId, key, originalValue)}
                              className="datatable-button-revert-field"
                              title="Revert this field"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : null;
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="datatable-dialog-footer">
          <button onClick={onRevertAll} className="datatable-button-revert-all">Revert</button>
          <button onClick={onCommit} className="datatable-button-commit">Commit Changes</button>
        </div>
      </div>
    </div>
  );
};
