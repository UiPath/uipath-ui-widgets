import { useId } from "react";
import type { FC } from "react";
import { Label, cn } from "@uipath/apollo-wind";
import { EMPTY_VALUE } from "../../models/constants";
import type { ReviewPart } from "../../models/capture";
import { partChanged } from "../../utils/parts";
import { ProposalInput } from "../shared/ProposalInput";
import type { CaseAssessmentProps, CaseField } from "./types";

const LONG_TEXT_ROWS = 3;

export const FinalField: FC<{
  field: CaseField;
  part: ReviewPart;
  renderField: CaseAssessmentProps["renderField"];
}> = ({ field, part, renderField }) => {
  const id = useId();
  const long = field.kind === "long";
  const node = (
    <div className={cn("space-y-1", long && "sm:col-span-2")}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {field.label}
      </Label>
      {long ? (
        <ProposalInput part={part} id={id} rows={LONG_TEXT_ROWS} />
      ) : (
        <div className="flex items-center gap-1.5">
          {field.kind === "money" && (
            <span className="text-xs text-muted-foreground">$</span>
          )}
          <ProposalInput part={part} id={id} />
        </div>
      )}
      {partChanged(part) && (
        <p className="text-xs text-muted-foreground">
          Proposed: {part.proposed || EMPTY_VALUE}
        </p>
      )}
    </div>
  );
  return <>{renderField ? renderField(field, node) : node}</>;
};
