import type { FC } from "react";
import { Input, Textarea } from "@uipath/apollo-wind";
import { useProposalControl } from "../../hooks/useProposalControl";
import type { ReviewPart } from "../../models/capture";

export const ProposalInput: FC<{
  part: ReviewPart;
  id?: string;
  label?: string;
  rows?: number;
}> = ({ part, id, label, rows }) => {
  const control = useProposalControl(part);
  return rows ? (
    <Textarea id={id} aria-label={label} rows={rows} {...control} />
  ) : (
    <Input id={id} aria-label={label} {...control} />
  );
};
