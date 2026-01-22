import './CellWithExpandButton.css';

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
    <div className="expand-button-cell">
      <button
        className={`expand-button ${props.isExpanded ? 'expanded' : ''}`}
        onClick={handleClick}
        aria-label={props.isExpanded ? 'Collapse' : 'Expand'}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="cell-value">{props.cellName}</span>
    </div>
  );
};
