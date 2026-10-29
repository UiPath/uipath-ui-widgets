import type { FC } from "react";
import {
  Button,
  Card,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import { SCOPES } from "../../models/constants";
import { CHIP_CLASS } from "./styles";

export const NextTimeSection: FC = () => {
  const { spec, state, locked, pickLesson, chooseScope, toggleCondition } =
    useCapture();
  const { lesson, scope, conds } = state;
  const { options = [], conditions = [] } = spec.nextTime ?? {};

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Next time</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            disabled={locked}
            aria-pressed={lesson === option.id}
            onClick={() => pickLesson(option.id)}
            className={cn(
              "h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",
              lesson === option.id
                ? "border-2 border-primary bg-primary/5"
                : "border-dashed hover:border-primary",
            )}
          >
            <span className="text-sm font-semibold">{option.text}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {option.basis}
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
                const next = SCOPES.find((candidate) => candidate.id === id);
                if (next) chooseScope(next.id);
              }}
            >
              {SCOPES.map((candidate) => (
                <ToggleGroupItem key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {scope === "like" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Claims that</span>
              {conditions.map((condition) => (
                <Toggle
                  key={condition.id}
                  variant="outline"
                  size="xs"
                  className={CHIP_CLASS}
                  disabled={locked}
                  pressed={!!conds[condition.id]}
                  onPressedChange={() => toggleCondition(condition.id)}
                >
                  {conds[condition.id] ? "✓" : "+"} {condition.label}
                </Toggle>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};
