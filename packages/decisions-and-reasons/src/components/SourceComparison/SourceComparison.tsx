import { Fragment } from "react";
import { Badge, Card, cn } from "@uipath/apollo-wind";
import { CoverageBar } from "./CoverageBar";
import { ComparisonRow } from "./ComparisonRow";
import type { ComparisonIds } from "./ComparisonRow";
import { ChangesSummary } from "../shared/ChangesSummary";
import { OutcomePicker } from "../shared/OutcomePicker";
import { useDecisionCapture } from "../../hooks/useDecisionCapture";
import {
  AUDIT_OUTCOMES,
  NEEDS_REVIEW,
  COMPARISON_OUTCOMES,
  COMPARISON_REASONS,
} from "../../models/constants";
import type {
  FieldStatus,
  ReviewPart,
  ReviewSeed,
  ComparisonField,
  SourceComparisonProps,
} from "../../models/decision";
import { partChanged, recommendedId } from "../../utils/changes";

const idsOf = (f: ComparisonField): ComparisonIds => ({
  verdict: `${f.id}:verdict`,
  contract: `${f.id}:contract`,
  system: `${f.id}:system`,
});

const matches = (f: ComparisonField) =>
  f.extractedValue.trim().toLowerCase() === f.recordValue.trim().toLowerCase();

const seedsOf = (
  fields: ComparisonField[],
  qc: boolean,
  extracted: string,
  record: string,
): ReviewSeed[] =>
  fields.flatMap((f) => {
    const ids = idsOf(f);
    const lane = qc ? f.reviewer : undefined;
    return [
      {
        id: ids.verdict,
        label: f.label,
        kind: "verdict",
        proposed: lane ? lane.verdict : matches(f) ? "Correct" : NEEDS_REVIEW,
        confidence: f.confidence,
      },
      {
        id: ids.contract,
        label: `${f.label} · ${extracted.toLowerCase()}`,
        kind: "contractValue",
        proposed: lane?.extractedValue ?? f.extractedValue,
      },
      {
        id: ids.system,
        label: `${f.label} · ${record.toLowerCase()}`,
        kind: "systemValue",
        proposed: lane?.recordValue ?? f.recordValue,
      },
    ];
  });

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
  const reasons = fields
    .filter((f) => f.evidence)
    .map((f) => ({
      id: `evidence-${f.id}`,
      title: f.evidence!,
      detail: `${matches(f) ? "Match" : "Mismatch"} on ${f.label}`,
      partId: idsOf(f).verdict,
      source: proposedBy,
      confidence: f.confidence,
    }));

  const model = useDecisionCapture({
    spec: {
      outcomes,
      recommended: recommendedId(outcomes),
      proposedBy,
      reasons,
    },
    seeds: seedsOf(fields, qc, labels.extracted, labels.record),
    readOnly,
    reviewerId,
    saved,
    keep: (p: ReviewPart) => p.kind === "verdict" || partChanged(p),
    gate: (parts) => {
      const part = (id: string) => parts.find((p) => p.id === id);
      const open = fields.filter((f) => !part(idsOf(f).verdict)?.looked);
      if (open.length)
        return `${open.length} ${open.length === 1 ? "field" : "fields"} still ${qc ? "to audit" : "to review"}.`;
      const missing = fields.find((f) => {
        const ids = idsOf(f);
        const vp = part(ids.verdict);
        if (!vp || (qc && vp.value === vp.proposed)) return false;
        const need =
          vp.value === "Extraction wrong"
            ? ids.contract
            : vp.value === "System value wrong"
              ? ids.system
              : null;
        const p = need ? part(need) : undefined;
        return !!p && p.value === p.proposed;
      });
      return missing ? `Add the corrected value for ${missing.label}.` : null;
    },
    onChange,
    onComplete,
  });

  const statusOf = (f: ComparisonField): FieldStatus => {
    const ids = idsOf(f);
    if (!model.looked[ids.verdict]) return "pending";
    const own = model.parts.filter((p) => Object.values(ids).includes(p.id));
    if (qc) return own.some(partChanged) ? "flagged" : "validated";
    return own.find((p) => p.id === ids.verdict)?.value === "Correct"
      ? "validated"
      : "flagged";
  };
  const statuses = fields.map((f) => ({ field: f, status: statusOf(f) }));
  const counts = statuses.reduce<Record<FieldStatus, number>>(
    (acc, s) => ({ ...acc, [s.status]: acc[s.status] + 1 }),
    { validated: 0, flagged: 0, pending: 0 },
  );
  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <div
      ref={(el) => model.setRoot(el)}
      className={cn(
        "uipath-decisions-and-reasons min-w-0 text-sm",
        aside && "grid items-start gap-4 lg:grid-cols-2",
        className,
      )}
    >
      <div className="min-w-0 space-y-4">
        <Card className="space-y-3 p-5" data-signal-evidence="context">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold">
              {title}
              {subtitle && <> · {subtitle}</>}
            </span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {qc ? "Audit lane" : "Review lane"}
              </Badge>
              <Badge variant="secondary">
                {model.done ? "Completed" : "Pending"}
              </Badge>
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
          const items = statuses.filter((s) => s.field.group === group);
          const reviewed = items.filter((s) => s.status !== "pending").length;
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
                    model={model}
                    field={field}
                    ids={idsOf(field)}
                    status={status}
                    qc={qc}
                    show={show}
                    copy={labels}
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
        <OutcomePicker model={model} noun={copy?.outcome ?? "Outcome"} />
        <ChangesSummary
          model={model}
          noun={copy?.outcome ?? "Outcome"}
          copy={copy}
          showRecord={show.record}
          reviewerId={reviewerId}
        />
      </div>
      {aside}
    </div>
  );
}
