import { Fragment } from "react";
import { Badge, Card } from "@uipath/apollo-wind";
import { ComparisonRow } from "./ComparisonRow";
import { CoverageBar } from "./CoverageBar";
import {
  comparisonGate,
  coverageCounts,
  evidenceReasons,
  fieldStatus,
  idsOf,
  seedsOf,
} from "./comparison";
import {
  AUDIT_OUTCOMES,
  COMPARISON_OUTCOMES,
  COMPARISON_REASONS,
} from "./defaults";
import type { SourceComparisonProps } from "./types";
import { ChangesSummary } from "../shared/ChangesSummary";
import { CompletionBadge } from "../shared/CompletionBadge";
import { OutcomePicker } from "../shared/OutcomePicker";
import { ReviewShell } from "../shared/ReviewShell";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import { partChanged } from "../../utils/parts";
import { recommendedId } from "../../utils/outcomes";
import { signal } from "../../utils/signals";

export function SourceComparison(props: SourceComparisonProps) {
  const {
    title,
    subtitle,
    proposedBy,
    fields,
    show = {},
    copy,
    aside,
    className,
    renderField,
    reasonOptions = COMPARISON_REASONS,
    readOnly,
    reviewerId = "",
    saved,
    onChange,
    onComplete,
    onOpenCitation,
  } = props;
  const qc = show.qcLane === true;
  const outcomes =
    props.outcomes ?? (qc ? AUDIT_OUTCOMES : COMPARISON_OUTCOMES);
  const labels = {
    extracted: copy?.extracted ?? "Extracted value",
    record: copy?.record ?? "Record value",
  };
  const noun = copy?.outcome ?? "Outcome";

  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons: evidenceReasons(fields, proposedBy),
    },
    seeds: seedsOf(fields, qc, labels),
    readOnly,
    reviewerId,
    saved,
    keep: (part) => part.kind === "verdict" || partChanged(part),
    gate: comparisonGate(fields, qc),
    onChange,
    onComplete,
  });

  const statuses = fields.map((field) => ({
    field,
    status: fieldStatus(field, qc, model.looked, model.findPart),
  }));
  const counts = coverageCounts(statuses.map(({ status }) => status));
  const groups = [...new Set(fields.map((field) => field.group))];

  return (
    <ReviewShell model={model} aside={aside} className={className}>
      <Card className="space-y-3 p-5" {...signal.evidence("context")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            {title}
            {subtitle && <> · {subtitle}</>}
          </span>
          <div className="flex gap-2">
            <Badge variant="outline">{qc ? "Audit lane" : "Review lane"}</Badge>
            <CompletionBadge />
          </div>
        </div>
        {proposedBy && (
          <p className="text-xs text-muted-foreground">
            Fields compared by {proposedBy}
          </p>
        )}
        <CoverageBar counts={counts} total={fields.length} qc={qc} />
      </Card>
      {groups.map((group) => {
        const items = statuses.filter(({ field }) => field.group === group);
        const reviewed = items.filter(
          ({ status }) => status !== "pending",
        ).length;
        return (
          <Card key={group} className="space-y-3 p-5">
            <h3 className="flex items-baseline justify-between text-base font-semibold">
              {group}
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {reviewed} of {items.length} {qc ? "audited" : "reviewed"}
              </span>
            </h3>
            {items.map(({ field, status }) => {
              const node = (
                <ComparisonRow
                  field={field}
                  ids={idsOf(field)}
                  status={status}
                  qc={qc}
                  show={show}
                  labels={labels}
                  reasonOptions={reasonOptions}
                  onOpenCitation={onOpenCitation}
                />
              );
              return (
                <Fragment key={field.id}>
                  {renderField ? renderField(field, node) : node}
                </Fragment>
              );
            })}
          </Card>
        );
      })}
      <OutcomePicker noun={noun} />
      <ChangesSummary
        noun={noun}
        copy={copy}
        showRecord={show.record}
        reviewerId={reviewerId}
      />
    </ReviewShell>
  );
}
