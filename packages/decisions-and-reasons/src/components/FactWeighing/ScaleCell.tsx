import type { FC } from "react";
import { cn } from "@uipath/apollo-wind";
import { FACT_POSITIONS } from "../../models/constants";
import type { FactSide } from "../../models/decision";

const SIDE_TONE: Record<FactSide, string> = {
  fraud: "border-[#8a5a3c] bg-[#8a5a3c]",
  neutral: "border-muted-foreground bg-muted-foreground",
  legitimate: "border-[#2f7d4f] bg-[#2f7d4f]",
};

const SIDE_RING: Record<FactSide, string> = {
  fraud: "border-[#8a5a3c]",
  neutral: "border-muted-foreground",
  legitimate: "border-[#2f7d4f]",
};

export const ScaleCell: FC<{
  factId: string;
  factLabel: string;
  value: string;
  agentRead: string;
  disabled?: boolean;
  onPick: (position: string) => void;
}> = ({ factId, factLabel, value, agentRead, disabled, onPick }) => (
  <div role="radiogroup" aria-label={factLabel} className="contents">
    {FACT_POSITIONS.map((p) => {
      const mine = value === p.id;
      const theirs = agentRead === p.id;
      return (
        <div key={p.id} className="flex justify-center">
          <button
            type="button"
            role="radio"
            aria-checked={mine}
            aria-label={`${factLabel}: ${p.label}${theirs ? ", agent's read" : ""}`}
            data-signal-field={factId}
            disabled={disabled}
            onClick={() => onPick(p.id)}
            className={cn(
              "size-5 rounded-full border bg-transparent border-border-de-emp",
              theirs && cn("border-[3px]", SIDE_RING[p.side]),
              mine && cn("border-2", SIDE_TONE[p.side]),
              !disabled && "hover:ring-2 hover:ring-primary/25",
            )}
          />
        </div>
      );
    })}
  </div>
);
