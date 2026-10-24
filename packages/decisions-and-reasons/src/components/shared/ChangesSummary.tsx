import { useState } from "react";
import type { FC } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { KIND_PARTS } from "../../models/constants";
import type { ReviewCopy } from "../../models/decision";

const HEADERS = [
  "Part",
  "Proposed",
  "Submitted",
  "How much it changed",
  "Source",
  "Looked at",
  "Scope",
];

const RecordDrawer: FC<{ model: ReviewModel; reviewerId: string }> = ({
  model,
  reviewerId,
}) => {
  const { log, elapsedSeconds } = model;
  const [open, setOpen] = useState(false);
  const [secs, setSecs] = useState(0);
  const last = log[log.length - 1];

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSecs(elapsedSeconds());
      }}
      className="rounded-lg border border-border-de-emp"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-xs font-semibold text-muted-foreground"
        >
          What gets recorded
          <span className="font-normal">{open ? "Hide" : "Show"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-border-de-emp p-3">
        <Table className="min-w-160 text-xs">
          <TableHeader>
            <TableRow>
              {HEADERS.map((h) => (
                <TableHead key={h} className="h-auto px-1.5 py-1 text-xs">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.payload().record.map((row) => (
              <TableRow key={row.part} className="align-top">
                {[
                  row.part,
                  row.proposed,
                  row.submitted,
                  row.howMuch,
                  row.source || "—",
                  row.lookedAt ? "Yes" : "No",
                  row.scope,
                ].map((text, i) => (
                  <TableCell key={HEADERS[i]} className="px-1.5 py-1">
                    <span className="block max-w-48 truncate" title={text}>
                      {text}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <dl className="space-y-1 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>Reviewer:</dt>
            <dd>{reviewerId || "recorded by Action Center on completion"}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Time on task:</dt>
            <dd>{secs}s</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Order of changes:</dt>
            <dd>
              {log.length ? (
                <ol className="flex flex-wrap gap-x-3">
                  {log.map((e) => (
                    <li key={e.step}>
                      {e.step}. {e.what} ({e.atSecond}s)
                    </li>
                  ))}
                </ol>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>On screen at the last change:</dt>
            <dd>
              {last?.lookedAt.length ? (
                <ul className="flex flex-wrap gap-1">
                  {last.lookedAt.map((label) => (
                    <li key={label}>
                      <Badge variant="outline">{label}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ChangesSummary: FC<{
  model: ReviewModel;
  noun: string;
  copy?: ReviewCopy;
  showRecord?: boolean;
  reviewerId?: string;
}> = ({ model, noun, copy, showRecord = false, reviewerId = "" }) => {
  const { spec, outcome, changes, locked, busy, error, blocker, submit } =
    model;
  const chosen = spec.outcomes.find((o) => o.id === outcome);
  const complete = copy?.complete ?? "Complete";

  return (
    <Card className="space-y-3 p-5">
      <div className="overflow-hidden rounded-lg border border-border-de-emp">
        <div className="border-b border-border-de-emp px-3 py-2 text-sm font-semibold">
          What changed
        </div>
        {changes.length === 0 ? (
          <p className="px-3 py-2.5 text-xs text-muted-foreground">
            Nothing changed from what was proposed.
          </p>
        ) : (
          <ul>
            {changes.map((row) => (
              <li
                key={row.id}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2 border-b border-border-de-emp px-3 py-2 text-xs last:border-b-0"
              >
                <span className="text-muted-foreground">
                  {KIND_PARTS[row.kind]}
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  {row.label && (
                    <span className="font-semibold">{row.label} ·</span>
                  )}
                  {row.from && (
                    <>
                      <span className="max-w-64 truncate text-muted-foreground line-through">
                        {row.from}
                      </span>
                      <span>→</span>
                    </>
                  )}
                  <span className="max-w-64 truncate">{row.to}</span>
                  <span className="ml-auto text-muted-foreground">
                    {row.how}
                    {row.note && <> · {row.note}</>}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {locked ? (
        <p className="border-t border-border-de-emp pt-3 text-xs font-semibold">
          Completed{chosen && <> as {chosen.label}</>}
        </p>
      ) : (
        <div className="space-y-3 border-t border-border-de-emp pt-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <p className="min-w-0 flex-1 text-xs font-semibold">
              {!outcome ? `No ${noun.toLowerCase()} selected.` : blocker}
            </p>
            <Button disabled={!outcome || !!blocker || busy} onClick={submit}>
              {complete}
              {chosen && <> as {chosen.label}</>}
            </Button>
          </div>
        </div>
      )}
      {showRecord && <RecordDrawer model={model} reviewerId={reviewerId} />}
    </Card>
  );
};
