import type { FC } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import type { ReviewPart } from "../../models/capture";
import { isLowConfidence } from "../../utils/confidence";
import { partChanged } from "../../utils/parts";
import { orEmpty } from "../../utils/text";
import { ConfidenceBadge } from "../shared/ConfidenceBadge";
import { PartReasons } from "../shared/PartReasons";
import { ProposalInput } from "../shared/ProposalInput";
import { lineId } from "./extraction";
import type { DocumentLineItem } from "./types";

const CELL_CLASS = "px-1.5 py-1";
const HEAD_CLASS = "h-auto px-1.5 py-1 text-xs";

export const LineItems: FC<{
  lineItems: DocumentLineItem[];
  reasonOptions: readonly string[];
  showConfidence: boolean;
}> = ({ lineItems, reasonOptions, showConfidence }) => {
  const { findPart } = useCapture();
  const columns = lineItems[0]?.fields ?? [];
  const corrected = lineItems
    .flatMap((item) =>
      item.fields.map((field) => findPart(lineId(item.id, field))),
    )
    .filter((part): part is ReviewPart => !!part && partChanged(part));

  return (
    <Card className="space-y-3 p-5">
      <h3 className="text-base font-semibold">Line items</h3>
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className={cn(HEAD_CLASS, "w-8")}>#</TableHead>
            {columns.map((column) => (
              <TableHead key={column.id} className={HEAD_CLASS}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={item.id} className="align-top">
              <TableCell className={cn(CELL_CLASS, "text-muted-foreground")}>
                {index + 1}
              </TableCell>
              {item.fields.map((field) => {
                const part = findPart(lineId(item.id, field));
                if (!part) return null;
                return (
                  <TableCell key={field.id} className={CELL_CLASS}>
                    <div
                      className={cn(
                        "space-y-1 rounded-md p-1",
                        isLowConfidence(part.confidence) &&
                          !part.looked &&
                          "bg-warning-background",
                      )}
                    >
                      <ProposalInput part={part} label={part.label} />
                      {showConfidence && part.confidence !== undefined && (
                        <ConfidenceBadge confidence={part.confidence} />
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
            Proposed for {part.label}: {orEmpty(part.proposed)}
          </p>
          <PartReasons
            part={part}
            question={`${part.label}: why?`}
            options={reasonOptions}
          />
        </div>
      ))}
    </Card>
  );
};
