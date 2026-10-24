import type { FC } from "react";
import {
  Badge,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@uipath/apollo-wind";
import { ReasonChips } from "../shared/ReasonChips";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { LOW_CONFIDENCE } from "../../models/constants";
import type {
  DocumentLineItem,
  ReviewPart,
  ValueField,
} from "../../models/decision";
import { partChanged } from "../../utils/changes";

export const LineItems: FC<{
  model: ReviewModel;
  lineItems: DocumentLineItem[];
  partFor: (
    item: DocumentLineItem,
    field: ValueField,
  ) => ReviewPart | undefined;
  reasonOptions: readonly string[];
  showConfidence: boolean;
}> = ({ model, lineItems, partFor, reasonOptions, showConfidence }) => {
  const columns = lineItems[0]?.fields ?? [];
  const corrected = lineItems.flatMap((item) =>
    item.fields
      .map((f) => partFor(item, f))
      .filter((p): p is ReviewPart => !!p && partChanged(p)),
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
          {lineItems.map((item, i) => (
            <TableRow key={item.id} className="align-top">
              <TableCell className="px-1.5 py-1 text-muted-foreground">
                {i + 1}
              </TableCell>
              {item.fields.map((f) => {
                const part = partFor(item, f);
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
                      {showConfidence && part.confidence !== undefined && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "tabular-nums",
                            low && "border-warning-icon bg-warning-background",
                          )}
                        >
                          {part.confidence}%
                        </Badge>
                      )}
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
          <ReasonChips
            question={`${part.label}: why?`}
            options={reasonOptions}
            pick={{ why: part.why, note: part.note }}
            disabled={model.locked}
            onToggle={(why) => model.toggleWhy(part.id, why)}
            onNote={(note) => model.editNote(part.id, note)}
          />
        </div>
      ))}
    </Card>
  );
};
