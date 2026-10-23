import type { FC } from "react";
import { Input, Toggle } from "@uipath/apollo-wind";
import type { WhyPick } from "../../models/capture";
import { signal } from "../../utils/signals";
import { CHIP_CLASS } from "./styles";

const OTHER = "Other";

export const ReasonChips: FC<{
  question: string;
  options: readonly string[];
  pick: WhyPick;
  disabled?: boolean;
  onToggle: (why: string) => void;
  onNote: (note: string) => void;
  placeholder?: string;
}> = ({
  question,
  options,
  pick,
  disabled,
  onToggle,
  onNote,
  placeholder = "A few words",
}) => (
  <div className="space-y-1.5 rounded-md bg-muted/50 p-2">
    <div className="text-xs text-muted-foreground">{question} Optional.</div>
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <Toggle
          key={option}
          {...(option === OTHER ? signal.addFactor : signal.rationale)}
          variant="outline"
          size="xs"
          className={CHIP_CLASS}
          disabled={disabled}
          pressed={pick.why === option}
          onPressedChange={() => onToggle(option)}
        >
          {option}
        </Toggle>
      ))}
    </div>
    {pick.why === OTHER && (
      <Input
        {...signal.rationale}
        placeholder={placeholder}
        disabled={disabled}
        value={pick.note}
        onChange={(event) => onNote(event.target.value)}
      />
    )}
  </div>
);
