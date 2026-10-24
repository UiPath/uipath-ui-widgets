import { useState } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Toggle,
  cn,
} from "@uipath/apollo-wind";
import { ReasonChips } from "../shared/ReasonChips";
import type { ReviewModel } from "../../hooks/useDecisionCapture";
import { CHIP_CLASS, NOT_RELEVANT_WHYS, WEIGHTS } from "../../models/constants";
import type { ReasonView, Weight } from "../../models/decision";
import { outcomeLabel } from "../../utils/changes";

const BAR_HEIGHTS = ["h-1", "h-2", "h-3"];

const WeightBars: FC<{ weight: Weight }> = ({ weight }) => {
  const n = Math.max(0, 3 - WEIGHTS.indexOf(weight));
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-px">
      {BAR_HEIGHTS.map((height, i) => (
        <i
          key={height}
          className={cn(
            "block w-0.5 rounded-[1px]",
            height,
            i < n ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
};

const WeightMenu: FC<{
  reason: ReasonView;
  model: ReviewModel;
}> = ({ reason: r, model }) => (
  <DropdownMenu onOpenChange={(open) => open && model.lookAt(r.id)}>
    <DropdownMenuTrigger asChild>
      <Button
        data-signal-field={r.id}
        variant="outline"
        size="xs"
        disabled={model.locked}
        className="min-w-28 justify-start text-xs"
      >
        <WeightBars weight={r.weight} />
        {r.weight}
        <span className="ml-auto text-muted-foreground">▾</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="min-w-52"
      container={model.root}
    >
      {WEIGHTS.map((w) => (
        <DropdownMenuItem
          key={w}
          data-signal-field={r.id}
          className={cn("gap-2 text-xs", r.weight === w && "font-semibold")}
          onSelect={() => model.setWeight(r.id, w)}
        >
          <WeightBars weight={w} />
          {w}
        </DropdownMenuItem>
      ))}
      {r.source && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            From {r.source}
            {r.confidence !== undefined && <> · {r.confidence}%</>}
          </DropdownMenuLabel>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const ReasonsSection: FC<{
  model: ReviewModel;
  reasonOptions?: readonly string[];
}> = ({ model, reasonOptions = NOT_RELEVANT_WHYS }) => {
  const { spec, reasons, state, locked } = model;
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [supports, setSupports] = useState("");
  const supportsPick = supports || state.outcome || spec.recommended;

  const submitNew = () => {
    const text = title.trim();
    if (!text) return;
    model.addReason(text, supports);
    setTitle("");
    setSupports("");
    setAdding(false);
  };

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Reasons</h3>
      <div className="rounded-lg border border-border-de-emp">
        {reasons.map((r) => (
          <div
            key={r.id}
            className={cn(
              "border-b border-border-de-emp p-3 last:border-b-0",
              r.weight === "Not relevant" && "bg-warning-background",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div
                className="min-w-0 flex-1 cursor-default"
                onClick={() => model.lookAt(r.id)}
              >
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {r.title}
                  <Badge variant="outline">
                    Supports {outcomeLabel(spec, r.supports)}
                  </Badge>
                </div>
                {r.detail && (
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                )}
              </div>
              <WeightMenu reason={r} model={model} />
            </div>
            {r.weight === "Not relevant" && (
              <div className="mt-2">
                <ReasonChips
                  question="Why is it not relevant?"
                  options={reasonOptions}
                  pick={{ why: r.why, note: r.note }}
                  disabled={locked}
                  placeholder="Say what is off about it"
                  onToggle={(why) => model.toggleReasonWhy(r.id, why)}
                  onNote={(note) => model.editReasonNote(r.id, note)}
                />
              </div>
            )}
            {r.added ? (
              <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                Added by you
                {!locked && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-muted-foreground"
                    onClick={() => model.removeReason(r.id)}
                  >
                    Remove
                  </Button>
                )}
              </p>
            ) : (
              r.weight !== r.proposedWeight && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Agent proposed {r.proposedWeight}
                </p>
              )
            )}
          </div>
        ))}
      </div>
      {!locked &&
        (adding ? (
          <div className="space-y-2 rounded-lg border border-dashed border-border-de-emp p-3">
            <Input
              placeholder="One line: what is the reason"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Supports</span>
              {spec.outcomes.map((o) => (
                <Toggle
                  key={o.id}
                  variant="outline"
                  size="xs"
                  className={CHIP_CLASS}
                  pressed={supportsPick === o.id}
                  onPressedChange={() => setSupports(o.id)}
                >
                  {o.label}
                </Toggle>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Button disabled={!title.trim()} onClick={submitNew}>
                Add reason
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setAdding(false)}
              >
                Cancel
              </Button>
              <span className="text-muted-foreground">
                Starts at High. Change it from the weight menu.
              </span>
            </div>
          </div>
        ) : (
          <Button
            data-signal-add-factor=""
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => setAdding(true)}
          >
            + Add a reason
          </Button>
        ))}
    </Card>
  );
};
