import type { FC } from "react";
import {
  Button,
  Card,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@uipath/apollo-wind";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { CHIP_CLASS, SCOPES } from "../../models/constants";

export const NextTimeSection: FC<{ model: ReviewModel }> = ({ model }) => {
  const { spec, state, locked } = model;
  const { lesson, scope, conds } = state;
  const { options = [], conditions = [] } = spec.nextTime ?? {};

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Next time</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((l) => (
          <Button
            key={l.id}
            variant="outline"
            disabled={locked}
            aria-pressed={lesson === l.id}
            onClick={() => model.pickLesson(l.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              lesson === l.id
                ? "border-2 border-primary bg-primary/5"
                : "border-dashed hover:border-primary",
            )}
          >
            <span className="text-sm font-semibold">{l.text}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {l.basis}
            </span>
          </Button>
        ))}
      </div>
      {lesson && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Applies to</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="xs"
              disabled={locked}
              value={scope}
              onValueChange={(id) => {
                const next = SCOPES.find((x) => x.id === id);
                if (next) model.chooseScope(next.id);
              }}
            >
              {SCOPES.map((x) => (
                <ToggleGroupItem key={x.id} value={x.id}>
                  {x.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {scope === "like" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Claims that</span>
              {conditions.map((k) => (
                <Toggle
                  key={k.id}
                  variant="outline"
                  size="xs"
                  className={CHIP_CLASS}
                  disabled={locked}
                  pressed={!!conds[k.id]}
                  onPressedChange={() => model.toggleCondition(k.id)}
                >
                  {conds[k.id] ? "✓" : "+"} {k.label}
                </Toggle>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};
