import type { FC } from "react";
import { Badge } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";

export const CompletionBadge: FC = () => {
  const { done } = useCapture();
  return <Badge variant="secondary">{done ? "Completed" : "Pending"}</Badge>;
};
