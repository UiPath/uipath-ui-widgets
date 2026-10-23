import { useId } from "react";
import type { FC } from "react";
import { Label } from "@uipath/apollo-wind";
import type { ReviewPart } from "../../models/capture";
import { ProposalInput } from "../shared/ProposalInput";

export const CorrectedValue: FC<{ part: ReviewPart; label: string }> = ({
  part,
  label,
}) => {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <ProposalInput part={part} id={id} />
    </div>
  );
};
