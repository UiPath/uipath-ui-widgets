import { useState } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
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
import { useCapture } from "../../hooks/useCapture";
import { EMPTY_VALUE } from "../../models/constants";

const HEADERS = [
  "Part",
  "Proposed",
  "Submitted",
  "How much it changed",
  "Source",
  "Looked at",
  "Scope",
];

export const RecordDrawer: FC<{ reviewerId: string }> = ({ reviewerId }) => {
  const { log, record, elapsedSeconds } = useCapture();
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const last = log[log.length - 1];

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSeconds(elapsedSeconds());
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
              {HEADERS.map((header) => (
                <TableHead key={header} className="h-auto px-1.5 py-1 text-xs">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {record.map((row) => (
              <TableRow key={row.part} className="align-top">
                {[
                  row.part,
                  row.proposed,
                  row.submitted,
                  row.howMuch,
                  row.source || EMPTY_VALUE,
                  row.lookedAt ? "Yes" : "No",
                  row.scope,
                ].map((text, column) => (
                  <TableCell key={HEADERS[column]} className="px-1.5 py-1">
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
            <dd>{seconds}s</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Order of changes:</dt>
            <dd>
              {log.length ? (
                <ol className="flex flex-wrap gap-x-3">
                  {log.map((entry) => (
                    <li key={entry.step}>
                      {entry.step}. {entry.what} ({entry.atSecond}s)
                    </li>
                  ))}
                </ol>
              ) : (
                EMPTY_VALUE
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
                EMPTY_VALUE
              )}
            </dd>
          </div>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
};
