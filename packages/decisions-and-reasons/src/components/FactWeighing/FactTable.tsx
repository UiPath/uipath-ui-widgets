import { Fragment } from "react";
import type { FC } from "react";
import { Card, cn } from "@uipath/apollo-wind";
import { FactRow } from "./FactRow";
import { FACT_GRID } from "./defaults";
import { groupFacts } from "./facts";
import type { FactItem, FactWeighingProps } from "./types";

export const FactTable: FC<{
  items: FactItem[];
  renderField: FactWeighingProps["renderField"];
}> = ({ items, renderField }) => {
  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">All facts ({items.length})</h3>
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border-[3px] border-muted-foreground" />
            Agent's read
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full border-2 border-muted-foreground bg-muted-foreground" />
            Yours
          </span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-136">
          <div
            className={cn(
              FACT_GRID,
              "items-end pb-1 text-xs font-semibold text-muted-foreground",
            )}
          >
            <span>Fact</span>
            <span className="pr-3 text-right">Value</span>
            <span className="col-span-2 text-center">Fraud</span>
            <span className="text-center">Not relevant</span>
            <span className="col-span-2 text-center">Legitimate</span>
          </div>
          {groupFacts(items).map(({ group, items: groupItems }) => (
            <Fragment key={group}>
              <div className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </div>
              {groupItems.map((item) => {
                const row = <FactRow item={item} />;
                return (
                  <Fragment key={item.id}>
                    {renderField ? renderField(item, row) : row}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
};
