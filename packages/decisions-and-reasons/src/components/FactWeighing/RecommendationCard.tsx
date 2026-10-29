import type { FC } from "react";
import { Card } from "@uipath/apollo-wind";
import { signal } from "../../utils/signals";
import type { FactRecommendation } from "./types";

const recommendationStats = ({ risk, confidence }: FactRecommendation) =>
  [
    { name: "Risk", value: risk?.toFixed(2) },
    { name: "Confidence", value: confidence },
  ].filter((stat): stat is { name: string; value: string } => !!stat.value);

export const RecommendationCard: FC<{
  recommendation: FactRecommendation;
  proposedBy?: string;
}> = ({ recommendation, proposedBy }) => {
  const { outcome, reason, evidence } = recommendation;

  return (
    <Card className="space-y-2 p-5" {...signal.evidence("recommendation")}>
      <h3 className="text-base font-semibold">
        {proposedBy ? `${proposedBy} recommends` : "Agent recommends"}
      </h3>
      <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
        <span className="text-lg font-semibold">{outcome}</span>
        {recommendationStats(recommendation).map(({ name, value }) => (
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
