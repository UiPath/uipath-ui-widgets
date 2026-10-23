import type { FC } from "react";
import { Card } from "@uipath/apollo-wind";
import type { ReviewFact } from "../../models/props";
import { signal } from "../../utils/signals";
import { ContextHeader } from "./ContextHeader";

export const ReviewSummary: FC<{
  title: string;
  subtitle?: string;
  proposedBy?: string;
  proposedByVerb: string;
  facts: ReviewFact[];
  excerpt?: string;
}> = ({ title, subtitle, proposedBy, proposedByVerb, facts, excerpt }) => (
  <Card className="space-y-1 p-5" {...signal.evidence("context")}>
    <ContextHeader title={title} />
    {proposedBy && (
      <p className="text-xs text-muted-foreground">
        {proposedByVerb} {proposedBy}
      </p>
    )}
    {subtitle && <p className="text-sm font-semibold">{subtitle}</p>}
    {facts.length > 0 && (
      <p className="text-xs text-muted-foreground">
        {facts.map((fact) => fact.value).join(" · ")}
      </p>
    )}
    {excerpt && <p className="rounded-md bg-muted/50 p-2 text-xs">{excerpt}</p>}
  </Card>
);
