import { useState } from "react";
import type { FC, ReactNode } from "react";
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
import { decisionLabel, lookedLabel, scopeById } from "./reviewModel";
import type { DecisionCaptureCodedActionAppModel } from "./reviewModel";
import { KIND_PARTS, SCOPES } from "./types";
import type { ChangeRow, RecordEntry, ReviewEvent } from "./types";

const HEADERS = [
  "Part",
  "Proposed",
  "Submitted",
  "How much it changed",
  "Source",
  "Looked at",
  "Scope",
];

const RecordClipped: FC<{ text: string }> = ({ text }) => (
  <span className="block max-w-48 truncate" title={text}>
    {text || "—"}
  </span>
);

const Outcome: FC<{ weight: string; reason: string | null }> = ({
  weight,
  reason,
}) => (
  <>
    {weight}
    {reason && <> · {reason}</>}
  </>
);

const EntryValue: FC<{
  entry: RecordEntry;
  side: "proposed" | "submitted";
  model: DecisionCaptureCodedActionAppModel;
}> = ({ entry, side, model }) => {
  if (entry.kind === "decision") {
    const id = entry[side];
    return id ? <>{decisionLabel(id)}</> : <>—</>;
  }
  if (entry.kind === "reason") {
    if (side === "proposed") return entry.proposed ?? <>—</>;
    return <Outcome {...entry.submitted} />;
  }
  if (entry.kind === "field") return <RecordClipped text={entry[side]} />;
  if (side === "proposed")
    return entry.proposed ? <>{entry.proposed} drafts</> : <>—</>;
  const lesson = model.data.nextTimeOptions.find(
    (x) => x.id === entry.submitted,
  );
  return lesson ? <RecordClipped text={lesson.text} /> : <>—</>;
};

const EntrySource: FC<{ entry: RecordEntry }> = ({ entry }) => {
  const { source } = entry;
  if (!source) return <>—</>;
  if (source.kind === "reviewer") return <>Reviewer</>;
  if (source.kind === "followsDecision") return <>Follows decision</>;
  return (
    <>
      {source.name}
      {source.confidence !== undefined && <> · {source.confidence}%</>}
    </>
  );
};

const EventText: FC<{
  event: ReviewEvent;
  model: DecisionCaptureCodedActionAppModel;
}> = ({ event, model }) => {
  const lesson = model.data.nextTimeOptions.find(
    (x) => x.id === event.targetId,
  );
  if (event.kind === "decision")
    return <>Decision: {decisionLabel(event.targetId)}</>;
  if (event.kind === "weight")
    return (
      <>
        Reason weight: {event.label}, {event.from} → {event.to}
      </>
    );
  if (event.kind === "why")
    return (
      <>
        Why not relevant: {event.label}, {event.to}
      </>
    );
  if (event.kind === "reasonAdded")
    return (
      <>
        Reason added: {event.label}, supports {decisionLabel(event.to ?? "")}
      </>
    );
  if (event.kind === "reasonRemoved") return <>Reason removed: {event.label}</>;
  if (event.kind === "nextTime")
    return (
      <>
        Next time {event.to ? "picked" : "cleared"}: {lesson?.text}
      </>
    );
  return <>Scope: {SCOPES.find((x) => x.id === event.to)?.label}</>;
};

const Detail: FC<{ term: string; children: ReactNode }> = ({
  term,
  children,
}) => (
  <div className="flex flex-wrap items-baseline gap-x-1.5">
    <dt>{term}</dt>
    <dd>{children}</dd>
  </div>
);

export const RecordDrawer: FC<{
  model: DecisionCaptureCodedActionAppModel;
  reviewerId: string;
}> = ({ model, reviewerId }) => {
  const { data, log, recordRows, elapsedSeconds } = model;
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
            {recordRows().map((entry) => (
              <TableRow key={entry.id} className="align-top">
                <TableCell className="px-1.5 py-1">
                  {KIND_PARTS[entry.kind]}
                  {entry.label && <>: {entry.label}</>}
                </TableCell>
                <TableCell className="px-1.5 py-1 text-muted-foreground">
                  <EntryValue entry={entry} side="proposed" model={model} />
                </TableCell>
                <TableCell className="px-1.5 py-1">
                  <EntryValue entry={entry} side="submitted" model={model} />
                </TableCell>
                <TableCell className="px-1.5 py-1">{entry.howMuch}</TableCell>
                <TableCell className="px-1.5 py-1 text-muted-foreground">
                  <EntrySource entry={entry} />
                </TableCell>
                <TableCell className="px-1.5 py-1">
                  {entry.lookedAt ? "Yes" : "No"}
                </TableCell>
                <TableCell className="px-1.5 py-1">
                  {entry.scope ? scopeById(entry.scope).counts : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <dl className="space-y-1 text-xs text-muted-foreground">
          <Detail term="Reviewer:">
            {reviewerId || "recorded by Action Center on completion"}
          </Detail>
          <Detail term="Time on task:">{secs}s</Detail>
          <Detail term="Order of changes:">
            {log.length ? (
              <ol className="flex flex-wrap gap-x-3">
                {log.map((event, i) => (
                  <li key={i}>
                    {i + 1}. <EventText event={event} model={model} /> (
                    {event.at}s)
                  </li>
                ))}
              </ol>
            ) : (
              "—"
            )}
          </Detail>
          <Detail term="On screen at the last change:">
            {last?.looked.length ? (
              <ul className="flex flex-wrap gap-1">
                {last.looked.map((id) => (
                  <li key={id}>
                    <Badge variant="outline">{lookedLabel(data, id)}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Detail>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
};

const Struck: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-muted-foreground line-through">{children}</span>
);

const ChangeClipped: FC<{ text: string }> = ({ text }) => (
  <span className="max-w-64 truncate" title={text}>
    {text || "—"}
  </span>
);

const ChangeValues: FC<{ row: ChangeRow }> = ({ row }) => {
  if (row.kind === "decision")
    return (
      <>
        <Struck>{decisionLabel(row.from)}</Struck>
        <span>→</span>
        <span>{decisionLabel(row.to)}</span>
      </>
    );
  if (row.kind === "reason")
    return (
      <>
        {row.from && (
          <>
            <Struck>{row.from}</Struck>
            <span>→</span>
          </>
        )}
        {row.howMuch === "Added" && <span>Added ·</span>}
        <span>{row.to.weight}</span>
        {row.howMuch !== "Added" && row.to.reason && (
          <span>· {row.to.reason}</span>
        )}
      </>
    );
  if (row.kind === "field")
    return (
      <>
        <span className="text-muted-foreground line-through">
          <ChangeClipped text={row.from} />
        </span>
        <span>→</span>
        <ChangeClipped text={row.to} />
      </>
    );
  return (
    <>
      <span>Applies to</span>
      {row.to.scope === "like" ? (
        <>
          <span>claims that</span>
          {row.to.conditions.length ? (
            <ul className="flex flex-wrap gap-1">
              {row.to.conditions.map((c) => (
                <li key={c}>
                  <Badge variant="outline">{c}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <span>(no condition)</span>
          )}
        </>
      ) : (
        <span className="lowercase">{scopeById(row.to.scope).label}</span>
      )}
    </>
  );
};

export const ChangesCard: FC<{
  model: DecisionCaptureCodedActionAppModel;
  showRecord: boolean;
  reviewerId: string;
}> = ({ model, showRecord, reviewerId }) => {
  const { state, changes, locked, busy, error, submit } = model;
  const { decision } = state;
  const blocked = !decision;

  return (
    <Card className="space-y-3 p-5">
      <div className="overflow-hidden rounded-lg border border-border-de-emp">
        <div className="border-b border-border-de-emp px-3 py-2 text-sm font-semibold">
          What changed
        </div>
        {changes.length === 0 ? (
          <p className="px-3 py-2.5 text-xs text-muted-foreground">
            No changes made to the recommended decision.
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
                  <ChangeValues row={row} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {row.howMuch}
                    {row.kind === "decision" && (
                      <> · {scopeById(row.scope).counts}</>
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!locked && (
        <div className="space-y-3 border-t border-border-de-emp pt-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {blocked && (
              <p className="min-w-0 flex-1 text-xs font-semibold">
                No decision selected.
              </p>
            )}
            <Button disabled={blocked || busy} onClick={submit}>
              Complete{decision && <> as {decisionLabel(decision)}</>}
            </Button>
          </div>
        </div>
      )}
      {locked && (
        <p className="border-t border-border-de-emp pt-3 text-xs font-semibold">
          Completed{decision && <> as {decisionLabel(decision)}</>}
        </p>
      )}
      {showRecord && <RecordDrawer model={model} reviewerId={reviewerId} />}
    </Card>
  );
};
