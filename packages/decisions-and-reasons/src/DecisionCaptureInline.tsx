import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@uipath/apollo-wind";
import "./DecisionsAndReasons.css";
import {
  CheckIcon,
  ChevronDownIcon,
  SignalIcon,
  SparklesIcon,
  XIcon,
} from "./icons";
import {
  AutopilotDecisionAnalysis,
  DecisionSource,
  DecisionSubmission,
  RelevanceLevel,
} from "./models";
import { useDecisionCapture } from "./useDecisionCapture";

const RELEVANCE_LABELS: Record<RelevanceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  "not-relevant": "Not relevant",
};

const RELEVANCE_LEVELS: RelevanceLevel[] = [
  "high",
  "medium",
  "low",
  "not-relevant",
];

export interface DecisionCaptureInlineProps {
  taskId: string;
  /** Opaque identity string the host supplies — this widget has no identity of its own. */
  capturedBy: string;
  source?: DecisionSource;
  /** An agent's live analysis of this task's evidence, when available. */
  apAnalysis?: AutopilotDecisionAnalysis;
  /** How many reasons to show and submit. Default 3. */
  maxReasons?: number;
  onSubmitted?: (submission: DecisionSubmission) => void;
  onSubmitFailed?: (error: Error) => void;
}

/** The compact-inline flavor: one line plus a disclosure, no floating card — sits in a host banner. */
export function DecisionCaptureInline(
  props: DecisionCaptureInlineProps,
): React.ReactElement | null {
  const {
    taskId,
    capturedBy,
    source,
    apAnalysis,
    maxReasons = 3,
    onSubmitted,
    onSubmitFailed,
  } = props;
  const [open, setOpen] = React.useState(false);

  const dc = useDecisionCapture({
    taskId,
    capturedBy,
    source,
    apAnalysis,
    maxReasons,
    onSubmitted,
    onSubmitFailed,
  });

  if (!dc.model) {
    return null;
  }
  const { model } = dc;

  const recommended = model.isAgentRecommended
    ? model.resolutionOptions.find(
        (o) => o.id === model.agentRecommendedResolutionId,
      )
    : undefined;
  const selectedLabel = model.resolutionOptions.find(
    (o) => o.id === dc.selectedResolutionId,
  )?.label;

  return (
    <div className="uipath-decisions-and-reasons-inline flex flex-col gap-3 text-sm leading-snug text-[var(--foreground)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDownIcon
            className={
              open ? "rotate-180 transition-transform" : "transition-transform"
            }
          />
          {recommended ? (
            <>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                <SparklesIcon /> Agent recommended
              </span>
              <span className="truncate font-semibold">
                {recommended.label}
              </span>
            </>
          ) : (
            <span className="text-[var(--foreground-secondary)]">
              No resolution selected
            </span>
          )}
        </span>
        {recommended && (
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-bold">{model.confidenceScore}%</span>
            <Progress value={model.confidenceScore} className="h-1.5 w-16" />
          </span>
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              Evidence
            </span>
            {dc.evidence.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 last:border-b-0 last:pb-0"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background:
                      item.supports === "deny"
                        ? "var(--error)"
                        : "var(--success)",
                  }}
                />
                <span className="min-w-0 flex-1 truncate" title={item.title}>
                  {item.title}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 rounded-lg px-2 text-xs"
                    >
                      <SignalIcon />
                      {RELEVANCE_LABELS[item.relevance]}
                      <ChevronDownIcon width={12} height={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {RELEVANCE_LEVELS.map((level) => (
                      <DropdownMenuItem
                        key={level}
                        onSelect={() => dc.setRelevance(item.id, level)}
                      >
                        {RELEVANCE_LABELS[level]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 rounded-lg px-2 text-xs"
                      style={{
                        color:
                          item.decision === "approve"
                            ? "var(--success)"
                            : "var(--error)",
                        borderColor:
                          item.decision === "approve"
                            ? "var(--success)"
                            : "var(--error)",
                      }}
                    >
                      {item.decision === "approve" ? <CheckIcon /> : <XIcon />}
                      {item.decision === "approve" ? "Approve" : "Deny"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => dc.setDecision(item.id, "approve")}
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => dc.setDecision(item.id, "deny")}
                    >
                      Deny
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              Rationale <span className="text-[var(--error)]">*</span>
            </span>
            <Textarea
              className="min-h-16"
              value={dc.rationaleText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                dc.setRationaleText(e.target.value)
              }
              onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) =>
                dc.pasted(e.clipboardData.getData("text").length)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              Resolution
            </span>
            <RadioGroup
              value={dc.selectedResolutionId ?? undefined}
              onValueChange={dc.selectResolution}
              className="flex flex-col gap-1.5"
            >
              {model.resolutionOptions.map((option) => {
                const selected = dc.selectedResolutionId === option.id;
                return (
                  <label
                    key={option.id}
                    onMouseEnter={() => dc.hoverStart(option.id)}
                    onMouseLeave={() => dc.hoverEnd(option.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--surface-selected)]"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <RadioGroupItem value={option.id} />
                    <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold">
                      {option.label}
                      {option.id === model.agentRecommendedResolutionId &&
                        model.isAgentRecommended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-1.5 py-px text-[11px] text-[var(--brand)]">
                            <SparklesIcon width={10} height={10} /> Agent
                            recommended
                          </span>
                        )}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-[var(--foreground-muted)]">
              {selectedLabel ? dc.statusLine : "No resolution selected"}
            </span>
            <Button
              variant="default"
              size="sm"
              disabled={!dc.canSubmit}
              onClick={dc.submit}
            >
              {dc.submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
