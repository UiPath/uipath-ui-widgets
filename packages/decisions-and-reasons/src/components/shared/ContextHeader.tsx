import type { FC } from "react";
import { CompletionBadge } from "./CompletionBadge";

export const ContextHeader: FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs font-semibold">{title}</span>
    <CompletionBadge />
  </div>
);
