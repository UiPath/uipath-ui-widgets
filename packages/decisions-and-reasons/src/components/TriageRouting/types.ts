import type { FieldRenderProps, ReviewProps } from "../../models/props";

export type TriageLabel = {
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons?: string[];
};

export interface TriageRoutingProps
  extends ReviewProps, FieldRenderProps<TriageLabel> {
  labels: TriageLabel[];
}
