import { useId } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Card,
  cn,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind";
import { useUseCaseCapture } from "./reviewModel";
import type { UseCaseCaptureModel } from "./reviewModel";
import {
  ConfidenceBadge,
  LOW_CONFIDENCE,
  OutcomeCard,
  ReasonChips,
  UseCaseRoot,
} from "./UseCaseParts";
import { DOCUMENT_REASONS, DOCUMENT_REJECT_REASONS } from "./types";
import type { PartSeed, UseCasePart, UseCaseProps, UseCaseSpec } from "./types";

export type DocumentField = {
  id: string;
  label: string;
  value: string;
  confidence: number;
};

export type DocumentLineItem = {
  id: string;
  fields: DocumentField[];
};

export type DocumentValidationData = {
  documentId: string;
  documentType: string;
  supplier: string;
  fileName?: string;
  proposedBy?: string;
  recommendedOutcome: "Validate" | "Reject";
  header: DocumentField[];
  lineItems: DocumentLineItem[];
};

const headerId = (f: DocumentField) => `header.${f.id}`;
const lineId = (item: DocumentLineItem, f: DocumentField) =>
  `line.${item.id}.${f.id}`;

const seedsOf = (data: DocumentValidationData): PartSeed[] => [
  ...data.header.map((f) => ({
    id: headerId(f),
    label: f.label,
    kind: "header",
    proposed: f.value,
    confidence: f.confidence,
  })),
  ...data.lineItems.flatMap((item, i) =>
    item.fields.map((f) => ({
      id: lineId(item, f),
      label: `Line ${i + 1} · ${f.label}`,
      kind: "lineItem",
      proposed: f.value,
      confidence: f.confidence,
    })),
  ),
];

const specOf = (
  data: DocumentValidationData,
  seeds: PartSeed[],
): UseCaseSpec => ({
  recommended: data.recommendedOutcome,
  proposedBy: data.proposedBy,
  outcomes: [
    {
      id: "Validate",
      label: "Validate",
      description: "Accept the document and release it for processing.",
    },
    {
      id: "Reject",
      label: "Reject",
      description: "Return the document to the sender without processing it.",
      reasons: DOCUMENT_REJECT_REASONS,
    },
  ],
  reasons: seeds
    .filter((s) => (s.confidence ?? 100) < LOW_CONFIDENCE)
    .map((s) => ({
      id: `low-${s.id}`,
      title: `Low confidence on ${s.label}`,
      detail: `Extracted with ${s.confidence}% confidence.`,
      partId: s.id,
      source: data.proposedBy,
      confidence: s.confidence,
    })),
});

const CorrectionReason: FC<{
  model: UseCaseCaptureModel;
  part: UseCasePart;
}> = ({ model, part }) => (
  <ReasonChips
    question={`${part.label}: why?`}
    options={DOCUMENT_REASONS}
    pick={{ why: part.why, note: part.note }}
    disabled={model.locked}
    onToggle={(why) => model.toggleWhy(part.id, why)}
    onNote={(note) => model.editNote(part.id, note)}
  />
);

const HeaderCell: FC<{ model: UseCaseCaptureModel; part: UseCasePart }> = ({
  model,
  part,
}) => {
  const id = useId();
  const changed = part.value !== part.proposed;
  const low = (part.confidence ?? 100) < LOW_CONFIDENCE;

  return (
    <div
      className={cn(
        "space-y-1 rounded-lg border border-transparent p-2",
        low && !part.looked && !changed && "bg-warning-background",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {part.label}
        </Label>
        <ConfidenceBadge value={part.confidence} />
      </div>
      <Input
        id={id}
        data-signal-field={part.id}
        disabled={model.locked}
        value={part.value}
        onFocus={() => model.lookAt(part.id)}
        onChange={(e) => model.edit(part.id, e.target.value)}
        onBlur={() => model.settle(part.id)}
      />
      {changed ? (
        <>
          <p className="text-xs text-muted-foreground">
            Proposed: {part.proposed || "—"}
          </p>
          <CorrectionReason model={model} part={part} />
        </>
      ) : (
        !model.locked && (
          <Button
            variant="link"
            aria-pressed={part.looked}
            aria-label={`Confirm ${part.label}`}
            className="h-auto p-0 text-xs"
            onClick={() => model.lookAt(part.id)}
          >
            {part.looked ? "✓ Confirmed" : "Confirm"}
          </Button>
        )
      )}
    </div>
  );
};

const LineItems: FC<{
  model: UseCaseCaptureModel;
  data: DocumentValidationData;
}> = ({ model, data }) => {
  const columns = data.lineItems[0]?.fields ?? [];
  const byId = new Map(model.parts.map((p) => [p.id, p]));
  const corrected = data.lineItems.flatMap((item) =>
    item.fields
      .map((f) => byId.get(lineId(item, f)))
      .filter((p): p is UseCasePart => !!p && p.value !== p.proposed),
  );

  return (
    <Card className="space-y-3 p-5">
      <h3 className="text-base font-semibold">Line items</h3>
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="h-auto w-8 px-1.5 py-1 text-xs">#</TableHead>
            {columns.map((c) => (
              <TableHead key={c.id} className="h-auto px-1.5 py-1 text-xs">
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.lineItems.map((item, i) => (
            <TableRow key={item.id} className="align-top">
              <TableCell className="px-1.5 py-1 text-muted-foreground">
                {i + 1}
              </TableCell>
              {item.fields.map((f) => {
                const part = byId.get(lineId(item, f));
                if (!part) return null;
                const low = (part.confidence ?? 100) < LOW_CONFIDENCE;
                return (
                  <TableCell key={f.id} className="px-1.5 py-1">
                    <div
                      className={cn(
                        "space-y-1 rounded-md p-1",
                        low && !part.looked && "bg-warning-background",
                      )}
                    >
                      <Input
                        aria-label={part.label}
                        data-signal-field={part.id}
                        disabled={model.locked}
                        value={part.value}
                        onFocus={() => model.lookAt(part.id)}
                        onChange={(e) => model.edit(part.id, e.target.value)}
                        onBlur={() => model.settle(part.id)}
                      />
                      <ConfidenceBadge value={part.confidence} />
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {corrected.map((part) => (
        <div key={part.id} className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Proposed for {part.label}: {part.proposed || "—"}
          </p>
          <CorrectionReason model={model} part={part} />
        </div>
      ))}
    </Card>
  );
};

export function DocumentValidationCodedActionApp(
  props: UseCaseProps<DocumentValidationData>,
) {
  const { data, readOnly, reviewerId, saved, onChange, onComplete } = props;
  const seeds = seedsOf(data);
  const model = useUseCaseCapture({
    spec: specOf(data, seeds),
    seeds,
    readOnly,
    reviewerId,
    saved,
    onChange,
    onComplete,
  });
  const byId = new Map(model.parts.map((p) => [p.id, p]));
  const lowCount = seeds.filter(
    (s) => (s.confidence ?? 100) < LOW_CONFIDENCE,
  ).length;

  return (
    <UseCaseRoot model={model}>
      <Card className="space-y-1 p-5" data-signal-evidence="context">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            {data.documentType} {data.documentId}
          </span>
          <Badge variant="secondary">
            {model.done ? "Completed" : "Pending"}
          </Badge>
        </div>
        {data.proposedBy && (
          <p className="text-xs text-muted-foreground">
            Extracted by {data.proposedBy}
            {data.fileName && <> · {data.fileName}</>}
          </p>
        )}
        <p className="text-xs">
          <span className="mr-1 text-muted-foreground">Supplier</span>
          {data.supplier}
          <span className="ml-4 mr-1 text-muted-foreground">
            Below {LOW_CONFIDENCE}% confidence
          </span>
          {lowCount}
        </p>
      </Card>
      <Card className="space-y-3 p-5">
        <h3 className="text-base font-semibold">Header</h3>
        <p className="text-xs text-muted-foreground">
          Confirm each value or correct it. Highlighted values have low
          confidence.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.header.map((f) => {
            const part = byId.get(headerId(f));
            return part && <HeaderCell key={f.id} model={model} part={part} />;
          })}
        </div>
      </Card>
      <LineItems model={model} data={data} />
      <OutcomeCard model={model} />
    </UseCaseRoot>
  );
}
