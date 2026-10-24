import type { FC } from "react";
import { Card } from "@uipath/apollo-wind";
import type { FactRecommendation } from "../../models/decision";

export const RecommendationCard: FC<{
  recommendation: FactRecommendation;
  proposedBy?: string;
}> = ({ recommendation, proposedBy }) => {
  const { outcome, risk, confidence, reason, evidence } = recommendation;
  const stats = [
    risk !== undefined && ["Risk", risk.toFixed(2)],
    confidence && ["Confidence", confidence],
  ].filter((x): x is string[] => !!x);

  return (
    <Card className="space-y-2 p-5" data-signal-evidence="recommendation">
      <h3 className="text-base font-semibold">
        {proposedBy ? `${proposedBy} recommends` : "Agent recommends"}
      </h3>
      <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
        <span className="text-lg font-semibold">{outcome}</span>
        {stats.map(([name, value]) => (
          <span key={name} className="text-xs text-muted-foreground">
            {name}{" "}
            <span className="font-semibold text-foreground">{value}</span>
          </span>
        ))}
      </p>
      <p className="text-xs">
        <span className="text-muted-foreground">Reason </span>
        {reason}
      </p>
      {evidence.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
          {evidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </Card>
  );
};
