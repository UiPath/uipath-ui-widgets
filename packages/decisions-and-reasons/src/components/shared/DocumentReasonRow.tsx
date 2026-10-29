import type { FC } from "react";
import { DOCUMENT_REASONS } from "../../models/constants";
import { ReasonChips } from "./ReasonChips";

export interface DocumentReasonRowProps {
  fieldLabel: string;
  reason: string | null;
  note?: string;
  reasons?: readonly string[];
  disabled?: boolean;
  onReasonChange: (reason: string | null) => void;
  onNoteChange?: (note: string) => void;
}

export const DocumentReasonRow: FC<DocumentReasonRowProps> = ({
  fieldLabel,
  reason,
  note = "",
  reasons = DOCUMENT_REASONS,
  disabled,
  onReasonChange,
  onNoteChange,
}) => (
  <div className="uipath-decisions-and-reasons">
    <ReasonChips
      question={`${fieldLabel}: why?`}
      options={reasons}
      pick={{ why: reason, note }}
      disabled={disabled}
      onToggle={(option) => onReasonChange(reason === option ? null : option)}
      onNote={(text) => onNoteChange?.(text)}
    />
  </div>
);
