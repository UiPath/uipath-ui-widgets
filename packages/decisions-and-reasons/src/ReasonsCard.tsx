import { useState } from "react";
import type { FC } from "react";
import {
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@uipath/apollo-wind";
import { Chip } from "./DocumentReasonRow";
import type { DecisionCaptureCodedActionAppModel } from "./reviewModel";
import { supportsLabel, weightBars } from "./reviewModel";
import { DECISIONS, WEIGHTS, WHY } from "./types";
import type { Weight } from "./types";

const BAR_HEIGHTS = ["h-1", "h-2", "h-3"];

export const WeightBars: FC<{ w: Weight }> = ({ w }) => {
  const n = weightBars(w);
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

export const ReasonsCard: FC<{ model: DecisionCaptureCodedActionAppModel }> = ({
  model,
}) => {
  const {
    agent,
    root,
    state,
    locked,
    lookAt,
    setWeight,
    toggleWhy,
    editReasonNote,
    addReason,
    removeReason,
  } = model;
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSupports, setNewSupports] = useState("");
  const supportsPick = newSupports || state.decision || agent;

  const submitNew = () => {
    const title = newTitle.trim();
    if (!title) return;
    addReason(title, newSupports);
    setNewTitle("");
    setNewSupports("");
    setAdding(false);
  };

  return (
    <Card className="space-y-3 p-5">
      <h3 className="flex items-center text-base font-semibold">Reasons</h3>
      <div className="rounded-lg border border-border-de-emp">
        {state.rs.map((r, i) => {
          const flagged = r.w === "Not relevant";
          return (
            <div
              key={r.id}
              className={cn(
                "border-b border-border-de-emp p-3 last:border-b-0",
                flagged && "bg-warning-background",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div
                  className="min-w-0 flex-1 cursor-default"
                  onClick={() => lookAt(r.id)}
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {r.title}
                    <Badge variant="outline">
                      Supports {supportsLabel(r.supports)}
                    </Badge>
                  </div>
                  {r.detail && (
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  )}
                </div>
                <DropdownMenu onOpenChange={(open) => open && lookAt(r.id)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-signal-field={r.id}
                      variant="outline"
                      size="xs"
                      disabled={locked}
                      className="min-w-28 justify-start text-xs"
                    >
                      <WeightBars w={r.w} />
                      {r.w}
                      <span className="ml-auto text-muted-foreground">▾</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-52"
                    container={root}
                  >
                    {WEIGHTS.map((w) => (
                      <DropdownMenuItem
                        key={w}
                        data-signal-field={r.id}
                        className={cn(
                          "gap-2 text-xs",
                          r.w === w && "font-semibold",
                        )}
                        onSelect={() => setWeight(i, w)}
                      >
                        <WeightBars w={w} />
                        {w}
                      </DropdownMenuItem>
                    ))}
                    {r.source && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          From {r.source}
                          {r.sourceConfidence !== undefined && (
                            <> · {r.sourceConfidence}%</>
                          )}
                        </DropdownMenuLabel>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {flagged && (
                <div className="mt-2 space-y-2 rounded-lg border border-dashed border-warning-icon bg-warning-background p-3">
                  <p className="flex items-center gap-1 text-xs font-semibold">
                    Why is it not relevant?
                    <span className="font-normal text-muted-foreground">
                      Optional
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {WHY.map((w) => (
                      <Chip
                        key={w}
                        disabled={locked}
                        pressed={r.why === w}
                        onToggle={() => toggleWhy(i, w)}
                      >
                        {w}
                      </Chip>
                    ))}
                  </div>
                  {r.why === "Other" && (
                    <Input
                      data-signal-rationale=""
                      disabled={locked}
                      placeholder="Say what is off about it"
                      value={r.note}
                      onChange={(e) => editReasonNote(i, e.target.value)}
                    />
                  )}
                </div>
              )}
              {r.added ? (
                <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  Added by you
                  {!locked && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-muted-foreground"
                      onClick={() => removeReason(i)}
                    >
                      Remove
                    </Button>
                  )}
                </p>
              ) : (
                r.w !== r.proposedWeight && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Agent proposed {r.proposedWeight}
                  </p>
                )
              )}
            </div>
          );
        })}
      </div>
      {!locked &&
        (adding ? (
          <div className="space-y-2 rounded-lg border border-dashed border-border-de-emp p-3">
            <Input
              placeholder="One line: what is the reason"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Supports</span>
              {DECISIONS.map((d) => (
                <Chip
                  key={d.id}
                  pressed={supportsPick === d.id}
                  onToggle={() => setNewSupports(d.id)}
                >
                  {d.t}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Button disabled={!newTitle.trim()} onClick={submitNew}>
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
