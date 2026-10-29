import type { FC } from "react";
import { cn } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { signal } from "../../utils/signals";
import { ScaleCell } from "./ScaleCell";
import { FACT_GRID } from "./defaults";
import type { FactItem } from "./types";

export const FactRow: FC<{ item: FactItem }> = ({ item }) => {
  const { findPart, locked, pick } = useCapture();
  const part = findPart(item.id);
  const cited = !!item.agentRead;

  return (
    <div
      {...signal.evidence(item.id)}
      className={cn(
        FACT_GRID,
        "items-center border-t border-border-de-emp py-2",
      )}
    >
      <div className="min-w-0 pr-3">
        <div className={cn("text-sm", cited ? "font-semibold" : "font-normal")}>
          {item.label}
        </div>
        {item.subtitle && (
          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
        )}
      </div>
      <div className="min-w-0 break-words pr-3 text-right font-mono text-xs">
        {item.value}
      </div>
      <ScaleCell
        factId={item.id}
        factLabel={item.label}
        value={part?.looked ? part.value : ""}
        agentRead={item.agentRead ?? ""}
        disabled={locked}
        onPick={(position) => pick(item.id, position)}
      />
    </div>
  );
};
