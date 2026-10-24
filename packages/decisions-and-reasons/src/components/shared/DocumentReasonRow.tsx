import * as React from "react";
import { ReasonChips } from "./ReasonChips";
import { DOCUMENT_REASONS } from "../../models/constants";

export interface DocumentReasonRowProps {
  /** Label of the edited field, shown as "<label>: why? Optional." */
  fieldLabel: string;
  /** The chosen reason, or null while it is skipped. */
  reason: string | null;
  /** The short note, used only when the reason is Other. */
  note?: string;
  reasons?: readonly string[];
  disabled?: boolean;
  onReasonChange: (reason: string | null) => void;
  onNoteChange?: (note: string) => void;
}

/** One optional row of reasons that appears under a single edited document field. */
export function DocumentReasonRow(
  props: DocumentReasonRowProps,
): React.ReactElement | null {
  const {
    fieldLabel,
    reason,
    note = "",
    reasons = DOCUMENT_REASONS,
    disabled,
    onReasonChange,
    onNoteChange,
  } = props;

  return (
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
}
