import type { FC } from "react";
import { Badge, Button, cn } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { NOT_RELEVANT } from "../../models/constants";
import type { ReasonView } from "../../models/capture";
import { outcomeLabel } from "../../utils/outcomes";
import { ReasonChips } from "./ReasonChips";
import { WeightMenu } from "./WeightMenu";

export const ReasonRow: FC<{
  reason: ReasonView;
  reasonOptions: readonly string[];
}> = ({ reason, reasonOptions }) => {
  const {
    spec,
    locked,
    lookAt,
    toggleReasonWhy,
    editReasonNote,
    removeReason,
  } = useCapture();
  const setAside = reason.weight === NOT_RELEVANT;

  return (
    <div
      className={cn(
        "border-b border-border-de-emp p-3 last:border-b-0",
        setAside && "bg-warning-background",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div
          className="min-w-0 flex-1 cursor-default"
          onClick={() => lookAt(reason.id)}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {reason.title}
            <Badge variant="outline">
              Supports {outcomeLabel(spec, reason.supports)}
            </Badge>
          </div>
          {reason.detail && (
            <p className="text-xs text-muted-foreground">{reason.detail}</p>
          )}
        </div>
        <WeightMenu reason={reason} />
      </div>
      {setAside && (
        <div className="mt-2">
          <ReasonChips
            question="Why is it not relevant?"
            options={reasonOptions}
            pick={{ why: reason.why, note: reason.note }}
            disabled={locked}
            placeholder="Say what is off about it"
            onToggle={(why) => toggleReasonWhy(reason.id, why)}
            onNote={(note) => editReasonNote(reason.id, note)}
          />
        </div>
      )}
      {reason.added ? (
        <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          Added by you
          {!locked && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => removeReason(reason.id)}
            >
              Remove
            </Button>
          )}
        </p>
      ) : (
        reason.weight !== reason.proposedWeight && (
          <p className="mt-2 text-xs text-muted-foreground">
            Agent proposed {reason.proposedWeight}
          </p>
        )
      )}
    </div>
  );
};
