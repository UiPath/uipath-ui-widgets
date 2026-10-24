import type { FC } from "react";
import { cn } from "@uipath/apollo-wind";
import type { FieldStatus } from "../../models/decision";

export const CoverageBar: FC<{
  counts: Record<FieldStatus, number>;
  total: number;
  qc: boolean;
}> = ({ counts, total, qc }) => {
  const legend: { key: FieldStatus; label: string; fill: string }[] = [
    {
      key: "validated",
      label: qc ? "agreed" : "validated",
      fill: "bg-success",
    },
    {
      key: "flagged",
      label: qc ? "disputed" : "flagged",
      fill: "bg-warning",
    },
    {
      key: "pending",
      label: qc ? "not audited" : "not reviewed",
      fill: "bg-border",
    },
  ];

  return (
    <div className="space-y-2" data-testid="completion-summary">
      <span className="block text-xs font-semibold tabular-nums">
        {total - counts.pending} of {total} {qc ? "audited" : "reviewed"}
      </span>
      <div
        role="img"
        aria-label={legend.map((l) => `${counts[l.key]} ${l.label}`).join(", ")}
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
      >
        {legend
          .filter((l) => counts[l.key] > 0)
          .map((l) => (
            <div
              key={l.key}
              className={cn("min-w-1", l.fill)}
              style={{ flexGrow: counts[l.key] }}
            />
          ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {legend.map((l) => (
          <span key={l.key} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", l.fill)} />
            <span className="font-medium tabular-nums">{counts[l.key]}</span>
            <span className="text-muted-foreground">{l.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
