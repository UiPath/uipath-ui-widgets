import type { FC, ReactNode } from "react";
import { Badge, Button, Card, cn } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { findOutcome } from "../../utils/outcomes";
import { signal } from "../../utils/signals";
import { ReasonChips } from "./ReasonChips";

const RECOMMENDED = <Badge variant="secondary">Recommended</Badge>;

export const OutcomePicker: FC<{
  noun: string;
  children?: ReactNode;
}> = ({ noun, children }) => {
  const {
    spec,
    outcome,
    outcomeWhy,
    locked,
    choose,
    toggleOutcomeWhy,
    editOutcomeNote,
  } = useCapture();
  const chosen = findOutcome(spec.outcomes, outcome);

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
        {noun} <span className="font-normal text-muted-foreground">·</span>
        <span className={cn(!chosen && "font-medium text-muted-foreground")}>
          {chosen ? chosen.label : `No ${noun.toLowerCase()} selected`}
        </span>
        {outcome === spec.recommended && RECOMMENDED}
      </h3>
      <div
        className={cn(
          "grid gap-2",
          spec.outcomes.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {spec.outcomes.map((candidate) => {
          const recommended = candidate.id === spec.recommended;
          const selected = outcome === candidate.id;
          return (
            <Button
              key={candidate.id}
              {...signal.outcome(candidate.id, recommended)}
              variant="outline"
              disabled={locked}
              aria-pressed={selected}
              onClick={() => choose(candidate.id)}
              className={cn(
                "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "hover:border-primary/40",
              )}
            >
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {candidate.label}
                {recommended && RECOMMENDED}
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {candidate.description}
              </span>
            </Button>
          );
        })}
      </div>
      {chosen?.reasons && (
        <ReasonChips
          question={`Why ${chosen.label.toLowerCase()}?`}
          options={chosen.reasons}
          pick={outcomeWhy}
          disabled={locked}
          onToggle={toggleOutcomeWhy}
          onNote={editOutcomeNote}
        />
      )}
      {children}
    </Card>
  );
};
