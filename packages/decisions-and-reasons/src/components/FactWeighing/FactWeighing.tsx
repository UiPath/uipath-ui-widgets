import { useState } from "react";
import { Badge, Card } from "@uipath/apollo-wind";
import { FactTable } from "./FactTable";
import { RationaleCard } from "./RationaleCard";
import { RecommendationCard } from "./RecommendationCard";
import { FACT_OUTCOMES, FACT_REASONS } from "./defaults";
import { withFactWeighing } from "./facts";
import type { FactRationale, FactWeighingProps } from "./types";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReviewShell } from "../shared/ReviewShell";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { recommendedId } from "../../utils/outcomes";
import { signal } from "../../utils/signals";

const NO_RATIONALE: FactRationale = { text: "" };

export function FactWeighing(props: FactWeighingProps) {
  const {
    title,
    subtitle,
    proposedBy,
    items,
    recommendation,
    ruleStatus,
    outcomes = FACT_OUTCOMES,
    reasonOptions = FACT_REASONS,
    copy,
    aside,
    className,
    renderField,
    readOnly,
    reviewerId = "",
    saved,
    onChange,
    onComplete,
  } = props;
  const [rationale, setRationale] = useState(NO_RATIONALE);
  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended:
        outcomes.find((outcome) => outcome.id === recommendation.outcome)?.id ??
        recommendedId(outcomes),
      proposedBy,
      reasons: [],
    },
    seeds: items.map((item) => ({
      id: item.id,
      label: item.label,
      kind: "fact",
      proposed: item.agentRead ?? "",
    })),
    readOnly,
    reviewerId,
    saved,
    onChange: (payload) =>
      onChange?.(withFactWeighing(payload, items, rationale)),
    onComplete: (outcome, payload) =>
      onComplete(outcome, withFactWeighing(payload, items, rationale)),
  });
  const weighedPayload = () =>
    withFactWeighing(model.payload(), items, rationale);

  const updateRationale = (next: FactRationale) => {
    setRationale(next);
    onChange?.(withFactWeighing(model.payload(), items, next));
  };

  return (
    <ReviewShell model={model} aside={aside} className={className} stacked>
      <Card className="space-y-1 p-5" {...signal.evidence("context")}>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {ruleStatus && <Badge variant="outline">{ruleStatus}</Badge>}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </Card>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <FactTable items={items} renderField={renderField} />
        <div className="min-w-0 space-y-4">
          <RecommendationCard
            recommendation={recommendation}
            proposedBy={proposedBy}
          />
          <OutcomePicker noun={copy?.outcome ?? "Decision"} />
          <RationaleCard
            options={reasonOptions}
            rationale={rationale}
            payload={weighedPayload}
            onRationale={updateRationale}
          />
        </div>
      </div>
    </ReviewShell>
  );
}
