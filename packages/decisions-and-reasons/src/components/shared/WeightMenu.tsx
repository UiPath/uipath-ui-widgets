import type { FC } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { WEIGHTS } from "../../models/constants";
import type { ReasonView, Weight } from "../../models/capture";
import { signal } from "../../utils/signals";

const BAR_HEIGHTS = ["h-1", "h-2", "h-3"];

const WeightBars: FC<{ weight: Weight }> = ({ weight }) => {
  const filledBars = Math.max(0, BAR_HEIGHTS.length - WEIGHTS.indexOf(weight));
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-px">
      {BAR_HEIGHTS.map((height, index) => (
        <i
          key={height}
          className={cn(
            "block w-0.5 rounded-[1px]",
            height,
            index < filledBars ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
};

export const WeightMenu: FC<{ reason: ReasonView }> = ({ reason }) => {
  const { locked, root, lookAt, setWeight } = useCapture();

  return (
    <DropdownMenu onOpenChange={(open) => open && lookAt(reason.id)}>
      <DropdownMenuTrigger asChild>
        <Button
          {...signal.field(reason.id)}
          variant="outline"
          size="xs"
          disabled={locked}
          className="min-w-28 justify-start text-xs"
        >
          <WeightBars weight={reason.weight} />
          {reason.weight}
          <span className="ml-auto text-muted-foreground">▾</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52" container={root}>
        {WEIGHTS.map((weight) => (
          <DropdownMenuItem
            key={weight}
            {...signal.field(reason.id)}
            className={cn(
              "gap-2 text-xs",
              reason.weight === weight && "font-semibold",
            )}
            onSelect={() => setWeight(reason.id, weight)}
          >
            <WeightBars weight={weight} />
            {weight}
          </DropdownMenuItem>
        ))}
        {reason.source && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              From {reason.source}
              {reason.confidence !== undefined && <> · {reason.confidence}%</>}
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
