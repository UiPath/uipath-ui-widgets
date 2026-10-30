import type { FC } from "react";
import { cn } from "@uipath/apollo-wind";
import { signal } from "../../utils/signals";
import { FACT_POSITIONS } from "./defaults";
import type { FactSide } from "./types";

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
    {FACT_POSITIONS.map((position) => {
      const mine = value === position.id;
      const theirs = agentRead === position.id;
      return (
        <div key={position.id} className="flex justify-center">
          <button
            type="button"
            role="radio"
            aria-checked={mine}
            aria-label={`${factLabel}: ${position.label}${theirs ? ", agent's read" : ""}`}
            {...signal.field(factId)}
            disabled={disabled}
            onClick={() => onPick(position.id)}
            className={cn(
              "size-5 rounded-full border bg-transparent border-border-de-emp",
              theirs && cn("border-[3px]", SIDE_RING[position.side]),
              mine && cn("border-2", SIDE_TONE[position.side]),
              !disabled && "hover:ring-2 hover:ring-primary/25",
            )}
          />
        </div>
      );
    })}
  </div>
);
