import type { FC } from "react";
import { orEmpty } from "../../utils/text";

export const ValuePanel: FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="min-w-0 flex-1 rounded-lg border border-border-de-emp bg-background px-3 py-2">
    <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
    <p className="break-words text-xs">{orEmpty(value)}</p>
  </div>
);
