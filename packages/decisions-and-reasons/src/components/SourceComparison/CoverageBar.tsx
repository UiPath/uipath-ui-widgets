import type { FC } from "react";
import { cn } from "@uipath/apollo-wind";
import type { FieldStatus } from "./types";

type CoverageEntry = { status: FieldStatus; label: string; fill: string };

const coverageEntries = (qc: boolean): CoverageEntry[] => [
  {
    status: "validated",
    label: qc ? "agreed" : "validated",
    fill: "bg-success",
  },
  {
    status: "flagged",
    label: qc ? "disputed" : "flagged",
    fill: "bg-warning",
  },
  {
    status: "pending",
    label: qc ? "not audited" : "not reviewed",
    fill: "bg-border",
  },
];

export const CoverageBar: FC<{
  counts: Record<FieldStatus, number>;
  total: number;
  qc: boolean;
}> = ({ counts, total, qc }) => {
  const entries = coverageEntries(qc);

  return (
    <div className="space-y-2" data-testid="completion-summary">
      <span className="block text-xs font-semibold tabular-nums">
        {total - counts.pending} of {total} {qc ? "audited" : "reviewed"}
      </span>
      <div
        role="img"
        aria-label={entries
          .map((entry) => `${counts[entry.status]} ${entry.label}`)
          .join(", ")}
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
      >
        {entries
          .filter((entry) => counts[entry.status] > 0)
          .map((entry) => (
            <div
              key={entry.status}
              className={cn("min-w-1", entry.fill)}
              style={{ flexGrow: counts[entry.status] }}
            />
          ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {entries.map((entry) => (
          <span key={entry.status} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", entry.fill)} />
            <span className="font-medium tabular-nums">
              {counts[entry.status]}
            </span>
            <span className="text-muted-foreground">{entry.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
