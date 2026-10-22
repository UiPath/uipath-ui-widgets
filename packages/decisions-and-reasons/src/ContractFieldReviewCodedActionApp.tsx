import { useId, useState } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Card,
  cn,
  Input,
  Label,
  ToggleGroup,
  ToggleGroupItem,
} from "@uipath/apollo-wind";
import { partChanged, useUseCaseCapture } from "./reviewModel";
import type { UseCaseCaptureModel } from "./reviewModel";
import {
  ConfidenceBadge,
  OutcomeCard,
  ReasonChips,
  UseCaseRoot,
} from "./UseCaseParts";
import { CONTRACT_NOTE_REASONS, CONTRACT_VERDICTS } from "./types";
import type {
  ContractVerdict,
  PartSeed,
  UseCasePart,
  UseCaseProps,
  UseCaseSpec,
} from "./types";

export type ContractCitation = {
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
};

export type ContractField = {
  id: string;
  section: string;
  label: string;
  contractValue: string;
  systemValue: string;
  confidence?: number;
  evidence?: string;
  citation?: ContractCitation;
  reviewer?: {
    verdict: ContractVerdict;
    contractValue?: string;
    systemValue?: string;
  };
};

export type ContractReviewData = {
  agreementId: string;
  title: string;
  proposedBy?: string;
  mode?: "review" | "qc";
  recommendedOutcome?: string;
  fields: ContractField[];
};

export interface ContractFieldReviewProps extends UseCaseProps<ContractReviewData> {
  onOpenCitation?: (citation: ContractCitation) => void;
}

const NEEDS_REVIEW = "Needs review";

const matches = (f: ContractField) =>
  f.contractValue.trim().toLowerCase() === f.systemValue.trim().toLowerCase();

const idsOf = (f: ContractField) => ({
  verdict: `${f.id}:verdict`,
  contract: `${f.id}:contract`,
  system: `${f.id}:system`,
});

const seedsOf = (data: ContractReviewData): PartSeed[] =>
  data.fields.flatMap((f) => {
    const ids = idsOf(f);
    const qc = data.mode === "qc" && f.reviewer;
    return [
      {
        id: ids.verdict,
        label: f.label,
        kind: "verdict",
        proposed: qc
          ? f.reviewer!.verdict
          : matches(f)
            ? "Correct"
            : NEEDS_REVIEW,
        confidence: f.confidence,
      },
      {
        id: ids.contract,
        label: `${f.label} · contract value`,
        kind: "contractValue",
        proposed: qc
          ? (f.reviewer!.contractValue ?? f.contractValue)
          : f.contractValue,
      },
      {
        id: ids.system,
        label: `${f.label} · system value`,
        kind: "systemValue",
        proposed: qc
          ? (f.reviewer!.systemValue ?? f.systemValue)
          : f.systemValue,
      },
    ];
  });

const specOf = (data: ContractReviewData): UseCaseSpec => {
  const qc = data.mode === "qc";
  return {
    recommended: data.recommendedOutcome ?? "Complete",
    proposedBy: data.proposedBy,
    outcomes: [
      {
        id: "Complete",
        label: qc ? "Complete audit" : "Complete review",
        description: "Every field needs a verdict first.",
      },
      {
        id: qc ? "Fail" : "Reject",
        label: qc ? "Fail" : "Reject",
        description: qc
          ? "The reviewer's verdicts cannot be relied on. Needs a reason."
          : "Stop the review, for example when the documents are unusable. Needs a reason.",
        requiresReason: true,
        reasons: qc
          ? ["Verdicts unreliable", "Systematic extraction issue", "Other"]
          : [
              "Documents incomplete",
              "Wrong agreement uploaded",
              "Unreadable source",
              "Other",
            ],
      },
      {
        id: "Bypass",
        label: "Bypass",
        description: "Close without a full review. Needs a reason.",
        requiresReason: true,
        reasons: [
          "Out of scope",
          "Reviewed outside this task",
          "Escalated to the agreement owner",
          "Other",
        ],
      },
    ],
    reasons: data.fields
      .filter((f) => f.evidence)
      .map((f) => ({
        id: `evidence-${f.id}`,
        title: f.evidence!,
        detail: `${matches(f) ? "Match" : "Mismatch"} on ${f.label}`,
        partId: idsOf(f).verdict,
        source: data.proposedBy,
        confidence: f.confidence,
      })),
  };
};

type FieldStatus = "validated" | "flagged" | "pending";

const statusOf = (
  model: UseCaseCaptureModel,
  f: ContractField,
  qc: boolean,
): FieldStatus => {
  const ids = idsOf(f);
  const parts = model.parts.filter((p) => Object.values(ids).includes(p.id));
  const reviewed = !!model.looked[ids.verdict];
  if (!reviewed) return "pending";
  if (qc) return parts.some(partChanged) ? "flagged" : "validated";
  return parts.find((p) => p.id === ids.verdict)?.value === "Correct"
    ? "validated"
    : "flagged";
};

const SummaryBar: FC<{
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
  const decided = total - counts.pending;

  return (
    <div className="space-y-2" data-testid="completion-summary">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold tabular-nums">
          {decided} of {total} {qc ? "audited" : "reviewed"}
        </span>
      </div>
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

const ValuePanel: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 flex-1 rounded-lg border border-border-de-emp bg-background px-3 py-2">
    <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
    <p className="break-words text-xs">{value || "—"}</p>
  </div>
);

const Citation: FC<{
  citation: ContractCitation;
  onOpen?: (c: ContractCitation) => void;
}> = ({ citation, onOpen }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Button
        variant="link"
        aria-expanded={open}
        className="h-auto p-0 text-xs"
        onClick={() => {
          setOpen(!open);
          if (!open) onOpen?.(citation);
        }}
      >
        {citation.document} · page {citation.page}
      </Button>
      {open && (
        <p
          data-signal-evidence="citation"
          className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground"
        >
          {citation.before}
          <mark className="rounded bg-warning-background px-0.5 text-foreground">
            {citation.highlight}
          </mark>
          {citation.after}
        </p>
      )}
    </div>
  );
};

const CorrectedValue: FC<{
  model: UseCaseCaptureModel;
  part: UseCasePart;
  label: string;
}> = ({ model, part, label }) => {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        data-signal-field={part.id}
        disabled={model.locked}
        value={part.value}
        onFocus={() => model.lookAt(part.id)}
        onChange={(e) => model.edit(part.id, e.target.value)}
        onBlur={() => model.settle(part.id)}
      />
    </div>
  );
};

const FieldCard: FC<{
  model: UseCaseCaptureModel;
  field: ContractField;
  qc: boolean;
  status: FieldStatus;
  onOpenCitation?: (c: ContractCitation) => void;
}> = ({ model, field, qc, status, onOpenCitation }) => {
  const ids = idsOf(field);
  const part = (id: string) => model.parts.find((p) => p.id === id)!;
  const verdict = part(ids.verdict);
  const contract = part(ids.contract);
  const system = part(ids.system);
  const reviewed = !!model.looked[ids.verdict];
  const reviewer = qc ? field.reviewer : undefined;
  const isMatch = matches(field);
  const disputed = qc && reviewed && status === "flagged";
  const needsNote = reviewed && (qc ? disputed : verdict.value !== "Correct");

  const choose = (v: string) =>
    model.pickMany(
      { [ids.verdict]: v, [ids.contract]: null, [ids.system]: null },
      ids.verdict,
      `Field: ${field.label}, verdict ${verdict.value} → ${v}`,
    );

  return (
    <div
      data-testid="field-card"
      className="space-y-3 rounded-lg bg-muted/40 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{field.label}</span>
        <Badge variant={isMatch ? "secondary" : "outline"}>
          {isMatch ? "Match" : "Mismatch"}
        </Badge>
        <ConfidenceBadge value={field.confidence} />
        {reviewer && (
          <Badge variant="outline">Reviewer: {reviewer.verdict}</Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {status === "pending"
            ? qc
              ? "Not audited"
              : "Not reviewed"
            : status === "validated"
              ? qc
                ? "Agreed"
                : "Validated"
              : qc
                ? "Disputed"
                : "Flagged"}
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <ValuePanel label="Contract value" value={field.contractValue} />
        <span
          aria-hidden="true"
          className="self-center text-xs font-semibold text-muted-foreground"
        >
          {isMatch ? "=" : "≠"}
        </span>
        <ValuePanel label="System record" value={field.systemValue} />
      </div>
      {field.evidence && (
        <p
          data-signal-evidence={field.id}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          Proposed: {field.evidence}
        </p>
      )}
      {field.citation && (
        <Citation citation={field.citation} onOpen={onOpenCitation} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {qc && reviewer && (
          <Button
            variant="outline"
            size="xs"
            data-signal-field={ids.verdict}
            disabled={model.locked}
            aria-pressed={reviewed && !disputed}
            onClick={() => choose(reviewer.verdict)}
          >
            Concur with reviewer
          </Button>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          size="xs"
          disabled={model.locked}
          value={reviewed ? verdict.value : ""}
          onValueChange={(v) => v && choose(v)}
          aria-label={`Verdict for ${field.label}`}
        >
          {CONTRACT_VERDICTS.map((v) => (
            <ToggleGroupItem key={v} value={v} data-signal-field={ids.verdict}>
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {verdict.value === "Extraction wrong" && reviewed && (
        <CorrectedValue
          model={model}
          part={contract}
          label="Corrected contract value"
        />
      )}
      {verdict.value === "System value wrong" && reviewed && (
        <CorrectedValue
          model={model}
          part={system}
          label="Corrected system value"
        />
      )}
      {needsNote && (
        <ReasonChips
          question={`${field.label}: ${qc ? "why dispute" : "note"}?`}
          options={CONTRACT_NOTE_REASONS}
          pick={{ why: verdict.why, note: verdict.note }}
          disabled={model.locked}
          onToggle={(why) => model.toggleWhy(ids.verdict, why)}
          onNote={(note) => model.editNote(ids.verdict, note)}
        />
      )}
    </div>
  );
};

export function ContractFieldReviewCodedActionApp(
  props: ContractFieldReviewProps,
) {
  const { data, readOnly, reviewerId, saved, onChange, onComplete } = props;
  const qc = data.mode === "qc";
  const model = useUseCaseCapture({
    spec: specOf(data),
    seeds: seedsOf(data),
    readOnly,
    reviewerId,
    saved,
    keep: (p) => p.kind === "verdict" || partChanged(p),
    gate: (parts, outcome) => {
      if (outcome !== "Complete") return null;
      const open = data.fields.filter(
        (f) => !parts.find((p) => p.id === idsOf(f).verdict)?.looked,
      );
      if (open.length)
        return `${open.length} ${open.length === 1 ? "field" : "fields"} still ${qc ? "to audit" : "to review"}.`;
      const missing = data.fields.find((f) => {
        const ids = idsOf(f);
        const vp = parts.find((p) => p.id === ids.verdict);
        if (!vp || (qc && vp.value === vp.proposed)) return false;
        const need =
          vp.value === "Extraction wrong"
            ? ids.contract
            : vp.value === "System value wrong"
              ? ids.system
              : null;
        const p = parts.find((x) => x.id === need);
        return !!p && p.value === p.proposed;
      });
      return missing ? `Add the corrected value for ${missing.label}.` : null;
    },
    onChange,
    onComplete,
  });

  const statuses = data.fields.map((f) => ({
    field: f,
    status: statusOf(model, f, qc),
  }));
  const counts = statuses.reduce<Record<FieldStatus, number>>(
    (acc, s) => ({ ...acc, [s.status]: acc[s.status] + 1 }),
    { validated: 0, flagged: 0, pending: 0 },
  );
  const sections = [...new Set(data.fields.map((f) => f.section))];

  return (
    <UseCaseRoot model={model}>
      <Card className="space-y-3 p-5" data-signal-evidence="context">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            {data.title} · {data.agreementId}
          </span>
          <div className="flex gap-2">
            <Badge variant="outline">{qc ? "Audit lane" : "Review lane"}</Badge>
            <Badge variant="secondary">
              {model.done ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>
        {data.proposedBy && (
          <p className="text-xs text-muted-foreground">
            Fields compared by {data.proposedBy}
          </p>
        )}
        <SummaryBar counts={counts} total={data.fields.length} qc={qc} />
      </Card>
      {sections.map((section) => {
        const inSection = statuses.filter((s) => s.field.section === section);
        const done = inSection.filter((s) => s.status !== "pending").length;
        return (
          <Card key={section} className="space-y-3 p-5">
            <h3 className="flex items-baseline justify-between text-base font-semibold">
              {section}
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {done} of {inSection.length} {qc ? "audited" : "reviewed"}
              </span>
            </h3>
            {inSection.map(({ field, status }) => (
              <FieldCard
                key={field.id}
                model={model}
                field={field}
                qc={qc}
                status={status}
                onOpenCitation={props.onOpenCitation}
              />
            ))}
          </Card>
        );
      })}
      <OutcomeCard model={model} />
    </UseCaseRoot>
  );
}
