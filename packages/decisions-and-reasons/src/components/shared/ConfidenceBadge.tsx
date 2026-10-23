import type { FC } from "react";
import { Badge, cn } from "@uipath/apollo-wind";
import { isLowConfidence } from "../../utils/confidence";

export const ConfidenceBadge: FC<{ confidence: number }> = ({ confidence }) => (
  <Badge
    variant="outline"
    className={cn(
      "tabular-nums",
      isLowConfidence(confidence) &&
        "border-warning-icon bg-warning-background",
    )}
  >
    {confidence}%
  </Badge>
);
