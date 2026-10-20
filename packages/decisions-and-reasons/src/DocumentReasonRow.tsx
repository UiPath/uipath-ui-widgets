import * as React from "react";
import { Input } from "@uipath/apollo-wind";
import { DOCUMENT_REASONS } from "./documentReasons";

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
): React.ReactElement {
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
    <div className="space-y-1.5 rounded-md bg-muted/50 p-2">
      <div className="text-xs text-muted-foreground">
        {fieldLabel}: why? Optional.
      </div>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            aria-pressed={reason === option}
            onClick={() => onReasonChange(reason === option ? null : option)}
            className={`rounded-full border px-3 py-1 text-xs ${
              reason === option
                ? "border-foreground bg-foreground text-background"
                : "bg-card hover:bg-muted"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {reason === "Other" && (
        <Input
          placeholder="A few words"
          value={note}
          disabled={disabled}
          onChange={(event) => onNoteChange?.(event.target.value)}
        />
      )}
    </div>
  );
}
