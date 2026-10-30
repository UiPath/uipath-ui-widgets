import type { FC } from "react";
import { Button, cn } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import type { ReviewPart } from "../../models/capture";
import { partChanged } from "../../utils/parts";
import { signal } from "../../utils/signals";
import { ConfidenceBadge } from "../shared/ConfidenceBadge";
import { ConfirmButton } from "../shared/ConfirmButton";
import { PartReasons } from "../shared/PartReasons";
import type { TriageLabel } from "./types";

export const LabelRow: FC<{
  label: TriageLabel;
  part: ReviewPart;
  reasonOptions: readonly string[];
  showConfidence: boolean;
}> = ({ label, part, reasonOptions, showConfidence }) => {
  const { locked, pick } = useCapture();

  return (
    <div className="space-y-2 border-b border-border-de-emp p-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{label.label}</span>
        {showConfidence && label.confidence !== undefined && (
          <ConfidenceBadge confidence={label.confidence} />
        )}
      </div>
      <p
        className="text-xs text-muted-foreground"
        {...signal.evidence(label.id)}
      >
        Proposed {label.proposed}: {label.reason}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {label.options.map((option) => (
          <Button
            key={option}
            {...signal.field(label.id)}
            variant="outline"
            size="xs"
            disabled={locked}
            aria-pressed={part.value === option}
            onClick={() => pick(label.id, option)}
            className={cn(
              "gap-1.5",
              part.value === option
                ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                : "hover:border-primary/40",
            )}
          >
            {option}
            {option === label.proposed && (
              <span className="text-muted-foreground">Proposed</span>
            )}
          </Button>
        ))}
      </div>
      {partChanged(part) ? (
        <PartReasons
          part={part}
          question={`Why ${part.value}?`}
          options={label.changeReasons ?? reasonOptions}
        />
      ) : (
        <ConfirmButton part={part} idleLabel="Looks right" />
      )}
    </div>
  );
};
