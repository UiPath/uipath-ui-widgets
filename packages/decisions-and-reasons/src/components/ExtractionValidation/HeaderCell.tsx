import { useId } from "react";
import type { FC } from "react";
import { Label, cn } from "@uipath/apollo-wind";
import type { ReviewPart } from "../../models/capture";
import { isLowConfidence } from "../../utils/confidence";
import { partChanged } from "../../utils/parts";
import { orEmpty } from "../../utils/text";
import { ConfidenceBadge } from "../shared/ConfidenceBadge";
import { ConfirmButton } from "../shared/ConfirmButton";
import { PartReasons } from "../shared/PartReasons";
import { ProposalInput } from "../shared/ProposalInput";

export const HeaderCell: FC<{
  part: ReviewPart;
  reasonOptions: readonly string[];
  showConfidence: boolean;
}> = ({ part, reasonOptions, showConfidence }) => {
  const id = useId();
  const changed = partChanged(part);
  const low = isLowConfidence(part.confidence);

  return (
    <div
      className={cn(
        "space-y-1 rounded-lg border border-transparent p-2",
        low && !part.looked && !changed && "bg-warning-background",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {part.label}
        </Label>
        {showConfidence && part.confidence !== undefined && (
          <ConfidenceBadge confidence={part.confidence} />
        )}
      </div>
      <ProposalInput part={part} id={id} />
      {changed ? (
        <>
          <p className="text-xs text-muted-foreground">
            Proposed: {orEmpty(part.proposed)}
          </p>
          <PartReasons
            part={part}
            question={`${part.label}: why?`}
            options={reasonOptions}
          />
        </>
      ) : (
        <ConfirmButton part={part} idleLabel="Confirm" />
      )}
    </div>
  );
};
