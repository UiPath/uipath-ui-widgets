import { useId } from "react";
import type { FC } from "react";
import { Badge, Label } from "@uipath/apollo-wind";
import type { Resolution, ReviewPart } from "../../models/capture";
import type { ReviewShow } from "../../models/props";
import { partChanged } from "../../utils/parts";
import { valueResolution } from "../../utils/resolution";
import { PartReasons } from "../shared/PartReasons";
import { ProposalInput } from "../shared/ProposalInput";

const DRAFT_ROWS = 8;

const EDIT_LABEL: Record<Resolution, string> = {
  Kept: "Kept",
  Changed: "Edited",
  Rejected: "Cleared",
  Added: "Kept",
  Untouched: "Kept",
};

export const DraftArea: FC<{
  part: ReviewPart;
  show: ReviewShow;
  reasonOptions: readonly string[];
}> = ({ part, show, reasonOptions }) => {
  const id = useId();
  const changed = partChanged(part);
  const editLabel =
    EDIT_LABEL[valueResolution(part.proposed, part.value, true)];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {part.label}
        </Label>
        <Badge variant={changed ? "outline" : "secondary"}>{editLabel}</Badge>
      </div>
      <ProposalInput part={part} id={id} rows={DRAFT_ROWS} />
      {changed && show.comparison !== false && (
        <div className="space-y-1 rounded-md bg-muted/50 p-2">
          <p className="text-xs font-medium text-muted-foreground">
            Original draft
          </p>
          <p className="whitespace-pre-wrap text-xs">{part.proposed}</p>
        </div>
      )}
      {changed && (
        <PartReasons
          part={part}
          question={`${part.label}: why the edit?`}
          options={reasonOptions}
        />
      )}
    </div>
  );
};
