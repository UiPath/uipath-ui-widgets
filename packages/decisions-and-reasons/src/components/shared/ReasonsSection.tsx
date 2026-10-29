import type { FC } from "react";
import { Card } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { NOT_RELEVANT_WHYS } from "../../models/constants";
import { AddReasonForm } from "./AddReasonForm";
import { ReasonRow } from "./ReasonRow";

export const ReasonsSection: FC<{ reasonOptions?: readonly string[] }> = ({
  reasonOptions = NOT_RELEVANT_WHYS,
}) => {
  const { reasons, locked } = useCapture();

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Reasons</h3>
      <div className="rounded-lg border border-border-de-emp">
        {reasons.map((reason) => (
          <ReasonRow
            key={reason.id}
            reason={reason}
            reasonOptions={reasonOptions}
          />
        ))}
      </div>
      {!locked && <AddReasonForm />}
    </Card>
  );
};
