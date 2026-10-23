import { Fragment, useState } from "react";
import type { FC } from "react";
import { Button, Card, cn } from "@uipath/apollo-wind";
import { FactRow } from "./FactRow";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { FACT_GRID } from "../../models/constants";
import type { FactItem, FactWeighingProps } from "../../models/decision";
import { groupFacts } from "../../utils/factWeighing";

const TABS = ["all", "cited"] as const;

export const FactTable: FC<{
  model: ReviewModel;
  items: FactItem[];
  renderField: FactWeighingProps["renderField"];
}> = ({ model, items, renderField }) => {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const cited = items.filter((i) => i.agentRead);
  const shown = tab === "all" ? items : cited;
  const counts = { all: items.length, cited: cited.length };
  const names = {
    all: `All facts (${counts.all})`,
    cited: `Agent cited (${counts.cited})`,
  };

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="flex gap-1">
          {TABS.map((t) => (
            <Button
              key={t}
              role="tab"
              variant="ghost"
              size="sm"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-none border-b-2 border-transparent",
                tab === t && "border-foreground font-semibold",
              )}
            >
              {names[t]}
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
          {groupFacts(shown).map((g) => (
            <Fragment key={g.group}>
              <div className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.group}
              </div>
              {g.items.map((item) => {
                const row = <FactRow model={model} item={item} />;
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
