import * as React from "react";
import type { FC, ReactNode } from "react";
import { Input, Toggle } from "@uipath/apollo-wind";
import { DOCUMENT_REASONS } from "./types";

interface ChipProps {
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const Chip: FC<ChipProps> = ({
  pressed,
  disabled,
  onToggle,
  children,
}) => (
  <Toggle
    variant="outline"
    size="xs"
    pressed={pressed}
    disabled={disabled}
    onPressedChange={onToggle}
    className="rounded-full px-3 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
  >
    {children}
  </Toggle>
);

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
    <div className="uipath-decisions-and-reasons space-y-1.5 rounded-md bg-muted/50 p-2">
      <div className="text-xs text-muted-foreground">
        {fieldLabel}: why? Optional.
      </div>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((option) => (
          <Chip
            key={option}
            pressed={reason === option}
            disabled={disabled}
            onToggle={() => onReasonChange(reason === option ? null : option)}
          >
            {option}
          </Chip>
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
