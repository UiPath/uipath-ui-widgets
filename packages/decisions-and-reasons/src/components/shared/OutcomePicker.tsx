import type { FC, ReactNode } from "react";
import { Badge, Button, Card, cn } from "@uipath/apollo-wind";
import { ReasonChips } from "./ReasonChips";
import type { ReviewModel } from "../../hooks/useDecisionCapture";

export const OutcomePicker: FC<{
  model: ReviewModel;
  noun: string;
  children?: ReactNode;
}> = ({ model, noun, children }) => {
  const { spec, outcome, outcomeWhy, locked, choose } = model;
  const chosen = spec.outcomes.find((o) => o.id === outcome);

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
        {noun} <span className="font-normal text-muted-foreground">·</span>
        <span className={cn(!chosen && "font-medium text-muted-foreground")}>
          {chosen ? chosen.label : `No ${noun.toLowerCase()} selected`}
        </span>
        {outcome === spec.recommended && (
          <Badge variant="secondary">Recommended</Badge>
        )}
      </h3>
      <div
        className={cn(
          "grid gap-2",
          spec.outcomes.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {spec.outcomes.map((o) => (
          <Button
            key={o.id}
            data-signal-outcome={o.id}
            data-signal-recommended={o.id === spec.recommended ? "" : undefined}
            variant="outline"
            disabled={locked}
            aria-pressed={outcome === o.id}
            onClick={() => choose(o.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              outcome === o.id
                ? "border-primary ring-2 ring-primary/25"
                : "hover:border-primary/40",
            )}
          >
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {o.label}
              {o.id === spec.recommended && (
                <Badge variant="secondary">Recommended</Badge>
              )}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {o.description}
            </span>
          </Button>
        ))}
      </div>
      {chosen?.reasons && (
        <ReasonChips
          question={`Why ${chosen.label.toLowerCase()}?`}
          options={chosen.reasons}
          pick={outcomeWhy}
          disabled={locked}
          onToggle={model.toggleOutcomeWhy}
          onNote={model.editOutcomeNote}
        />
      )}
      {children}
    </Card>
  );
};
