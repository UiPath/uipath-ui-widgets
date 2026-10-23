import { useState } from "react";
import { Badge, Card, cn } from "@uipath/apollo-wind";
import { FactTable } from "./FactTable";
import { RationaleCard } from "./RationaleCard";
import { RecommendationCard } from "./RecommendationCard";
import { OutcomePicker } from "../shared/OutcomePicker";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { FACT_OUTCOMES, FACT_REASONS } from "../../models/constants";
import type { FactRationale, FactWeighingProps } from "../../models/decision";
import { recommendedId } from "../../utils/changes";
import { withFactWeighing } from "../../utils/factWeighing";

const NO_RATIONALE: FactRationale = { tags: [], text: "" };

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
        outcomes.find((o) => o.id === recommendation.outcome)?.id ??
        recommendedId(outcomes),
      proposedBy,
      reasons: [],
    },
    seeds: items.map((i) => ({
      id: i.id,
      label: i.label,
      kind: "fact",
      proposed: i.agentRead ?? "",
    })),
    readOnly,
    reviewerId,
    saved,
    onChange: (p) => onChange?.(withFactWeighing(p, items, rationale)),
    onComplete: (outcome, p) =>
      onComplete(outcome, withFactWeighing(p, items, rationale)),
  });
  const payload = () => withFactWeighing(model.payload(), items, rationale);
  const noun = copy?.outcome ?? "Decision";

  return (
    <div
      ref={(el) => model.setRoot(el)}
      className={cn(
        "uipath-decisions-and-reasons min-w-0 space-y-4 text-sm",
        className,
      )}
    >
      <Card className="space-y-1 p-5" data-signal-evidence="context">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {ruleStatus && <Badge variant="outline">{ruleStatus}</Badge>}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </Card>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <FactTable model={model} items={items} renderField={renderField} />
        <div className="min-w-0 space-y-4">
          <RecommendationCard
            recommendation={recommendation}
            proposedBy={proposedBy}
          />
          <OutcomePicker model={model} noun={noun} />
          <RationaleCard
            model={model}
            options={reasonOptions}
            rationale={rationale}
            payload={payload}
            onRationale={(next) => {
              setRationale(next);
              onChange?.(withFactWeighing(model.payload(), items, next));
            }}
          />
        </div>
      </div>
      {aside}
    </div>
  );
}
