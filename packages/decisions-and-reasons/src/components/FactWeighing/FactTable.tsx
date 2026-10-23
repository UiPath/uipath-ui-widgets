import { Fragment, useState } from "react";
import type { FC } from "react";
import { Button, Card, cn } from "@uipath/apollo-wind";
import { FactRow } from "./FactRow";
import { FACT_GRID } from "./defaults";
import { groupFacts } from "./facts";
import type { FactItem, FactWeighingProps } from "./types";

const TABS = ["all", "cited"] as const;

export const FactTable: FC<{
  items: FactItem[];
  renderField: FactWeighingProps["renderField"];
}> = ({ items, renderField }) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const cited = items.filter((item) => item.agentRead);
  const shown = tab === "all" ? items : cited;
  const tabNames = {
    all: `All facts (${items.length})`,
    cited: `Agent cited (${cited.length})`,
  };

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="flex gap-1">
          {TABS.map((name) => (
            <Button
              key={name}
              role="tab"
              variant="ghost"
              size="sm"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={cn(
                "rounded-none border-b-2 border-transparent",
                tab === name && "border-foreground font-semibold",
              )}
            >
              {tabNames[name]}
            </Button>
          ))}
        </div>
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
          {groupFacts(shown).map(({ group, items: groupItems }) => (
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
