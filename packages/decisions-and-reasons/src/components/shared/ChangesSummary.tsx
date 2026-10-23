import type { FC } from "react";
import { Alert, AlertDescription, Button, Card } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { KIND_PARTS } from "../../models/constants";
import type { ChangeRow } from "../../models/capture";
import type { ReviewCopy } from "../../models/props";
import { findOutcome } from "../../utils/outcomes";
import { RecordDrawer } from "./RecordDrawer";

const ChangeItem: FC<{ row: ChangeRow }> = ({ row }) => (
  <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2 border-b border-border-de-emp px-3 py-2 text-xs last:border-b-0">
    <span className="text-muted-foreground">{KIND_PARTS[row.kind]}</span>
    <span className="flex flex-wrap items-center gap-1.5">
      {row.label && <span className="font-semibold">{row.label} ·</span>}
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
);

const ChangesList: FC = () => {
  const { changes } = useCapture();
  return (
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
            <ChangeItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
};

export const ChangesSummary: FC<{
  noun: string;
  copy?: ReviewCopy;
  showRecord?: boolean;
  reviewerId?: string;
}> = ({ noun, copy, showRecord = false, reviewerId = "" }) => {
  const { spec, outcome, locked, busy, error, blocker, submit } = useCapture();
  const chosen = findOutcome(spec.outcomes, outcome);
  const chosenSuffix = chosen && <> as {chosen.label}</>;

  return (
    <Card className="space-y-3 p-5">
      <ChangesList />
      {locked ? (
        <p className="border-t border-border-de-emp pt-3 text-xs font-semibold">
          Completed{chosenSuffix}
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
              {copy?.complete ?? "Complete"}
              {chosenSuffix}
            </Button>
          </div>
        </div>
      )}
      {showRecord && <RecordDrawer reviewerId={reviewerId} />}
    </Card>
  );
};
