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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@uipath/apollo-wind";
import "./DecisionsAndReasons.css";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ScaleIcon,
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
import { SignalsPanel } from "./SignalsPanel";
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

export interface DecisionCaptureProps {
  taskId: string;
  /** Opaque identity string the host supplies — this widget has no identity of its own. */
  capturedBy: string;
  source?: DecisionSource;
  /** An agent's live analysis of this task's evidence, when available. */
  apAnalysis?: AutopilotDecisionAnalysis;
  /** How many reasons to show and submit. Default 3. */
  maxReasons?: number;
  /** Drops the widget's own card frame, for a host that already draws one. */
  embedded?: boolean;
  /** Adds a Signals tab with the live interaction signals written with the decision. Default true. */
  showSignals?: boolean;
  onSubmitted?: (submission: DecisionSubmission) => void;
  onSubmitFailed?: (error: Error) => void;
}

type WidgetTab = "decision" | "signals";

/** The full-card flavor: a HITL task's decision, evidence, amount, rationale and resolution, in one panel. */
export function DecisionCapture(
  props: DecisionCaptureProps,
): React.ReactElement | null {
  const {
    taskId,
    capturedBy,
    source,
    apAnalysis,
    maxReasons = 3,
    embedded = false,
    showSignals = true,
    onSubmitted,
    onSubmitFailed,
  } = props;
  const [activeTab, setActiveTab] = React.useState<WidgetTab>("decision");
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    new Set(),
  );

  const dc = useDecisionCapture({
    taskId,
    capturedBy,
    source,
    apAnalysis,
    maxReasons,
    signalsVisible: showSignals && activeTab === "signals",
    onSubmitted,
    onSubmitFailed,
  });

  if (!dc.model) {
    return null;
  }
  const { model } = dc;

  const hasAmount = model.amount.total > 0 || model.amount.ceiling > 0;
  const recommended = model.isAgentRecommended
    ? model.resolutionOptions.find(
        (o) => o.id === model.agentRecommendedResolutionId,
      )
    : undefined;
  const selectedLabel = model.resolutionOptions.find(
    (o) => o.id === dc.selectedResolutionId,
  )?.label;
  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className={`uipath-decisions-and-reasons flex max-w-full flex-col gap-4 text-sm leading-snug ${
        embedded
          ? ""
          : "rounded-xl border border-[var(--ap-wind-border)] bg-[var(--surface)]"
      } text-[var(--foreground)]`}
      style={embedded ? undefined : { padding: 16 }}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as WidgetTab)}
      >
        {showSignals && (
          <TabsList className="mb-3 self-start">
            <TabsTrigger value="decision">Decision</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="decision" className="mt-0 flex flex-col gap-4">
          <header className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[var(--foreground-secondary)]">
              <ScaleIcon />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Decision
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span
                  className={`text-xl font-semibold ${selectedLabel ? "" : "text-[var(--foreground-secondary)]"}`}
                >
                  {selectedLabel ?? "No resolution selected"}
                </span>
                {recommended && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                      <SparklesIcon /> Agent recommended
                    </span>
                    <span className="text-[13px] font-semibold">
                      {recommended.label}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          model.severity === "negative"
                            ? "var(--error)"
                            : "var(--success)",
                      }}
                    />
                  </div>
                )}
              </div>
              {recommended && (
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[22px] leading-none font-bold">
                    {model.confidenceScore}%
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Confidence score
                  </span>
                  <Progress
                    value={model.confidenceScore}
                    className="h-1.5 w-32"
                  />
                </div>
              )}
            </div>
          </header>

          <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <span className="text-sm font-semibold">Evidence</span>
              <div className="flex text-xs text-[var(--foreground-muted)]">
                <span className="w-28 text-center">Relevance</span>
                <span className="w-28 text-center">Decision</span>
              </div>
            </div>

            {dc.evidence.map((item) => {
              const expanded = !collapsedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="border-b border-[var(--border-subtle)] px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={expanded ? "Collapse" : "Expand"}
                      onClick={() => toggleExpand(item.id)}
                      className="inline-flex cursor-pointer border-0 bg-transparent p-0 text-[var(--foreground-muted)]"
                    >
                      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background:
                          item.supports === "deny"
                            ? "var(--error)"
                            : "var(--success)",
                      }}
                    />
                    <span
                      className="min-w-0 flex-1 truncate font-semibold"
                      title={item.title}
                    >
                      {item.title}
                    </span>
                    <div className="flex w-28 shrink-0 justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 rounded-lg px-2.5 text-xs"
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
                    </div>
                    <div className="flex w-28 shrink-0 justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 rounded-lg px-2.5 text-xs"
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
                            {item.decision === "approve" ? (
                              <CheckIcon />
                            ) : (
                              <XIcon />
                            )}
                            {item.decision === "approve" ? "Approve" : "Deny"}
                            <ChevronDownIcon width={12} height={12} />
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
                  </div>
                  {expanded && (item.description || item.tags.length > 0) && (
                    <div className="mt-1.5 flex flex-col gap-1.5 pr-56 pl-8">
                      {item.description && (
                        <span className="text-[13px] text-[var(--foreground-secondary)]">
                          {item.description}
                        </span>
                      )}
                      {item.tags.length > 0 && (
                        <span className="font-mono text-xs text-[var(--foreground-muted)]">
                          {item.tags.join(" · ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="px-4 py-2.5">
              <Button variant="outline" size="sm" onClick={dc.addEvidence}>
                <PlusIcon /> Add evidence
              </Button>
            </div>
          </section>

          <section
            className={`grid gap-3 ${hasAmount ? "grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" : "grid-cols-1"}`}
          >
            {hasAmount && (
              <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] p-3.5">
                <div className="flex justify-between font-semibold">
                  <span>Amount</span>
                  <span>{formatMoney(model.amount.total)}</span>
                </div>
                <label className="text-xs text-[var(--foreground-muted)]">
                  Refund
                </label>
                <input
                  type="number"
                  aria-label="Refund"
                  className="rounded-md border border-[var(--ap-wind-border)] bg-transparent px-2.5 py-1.5 font-[inherit] text-[var(--foreground)]"
                  value={dc.refund}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    dc.setRefund(Number(e.target.value))
                  }
                />
                <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                  <span>Paid by the customer</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {formatMoney(model.amount.paidByCustomer)}
                  </span>
                </div>
                <Progress
                  value={
                    model.amount.ceiling > 0
                      ? (dc.refund / model.amount.ceiling) * 100
                      : 0
                  }
                  className="h-1.5"
                />
                <span className="text-xs text-[var(--foreground-muted)]">
                  {formatMoney(dc.refund)} / {formatMoney(model.amount.ceiling)}{" "}
                  ceiling
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Rationale <span className="text-[var(--error)]">*</span>
                </span>
                {model.rationale.version && (
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {model.rationale.version}
                  </span>
                )}
              </div>
              <Textarea
                className="min-h-24"
                value={dc.rationaleText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  dc.setRationaleText(e.target.value)
                }
                onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) =>
                  dc.pasted(e.clipboardData.getData("text").length)
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Resolution</span>
            <RadioGroup
              value={dc.selectedResolutionId ?? undefined}
              onValueChange={dc.selectResolution}
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              }}
            >
              {model.resolutionOptions.map((option) => {
                const selected = dc.selectedResolutionId === option.id;
                return (
                  <label
                    key={option.id}
                    onMouseEnter={() => dc.hoverStart(option.id)}
                    onMouseLeave={() => dc.hoverEnd(option.id)}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--surface-selected)]"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <RadioGroupItem value={option.id} className="mt-0.5" />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-1.5 font-semibold">
                        {option.label}
                        {option.id === model.agentRecommendedResolutionId &&
                          model.isAgentRecommended && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-1.5 py-px text-[11px] text-[var(--brand)]">
                              <SparklesIcon width={10} height={10} /> Agent
                              recommended
                            </span>
                          )}
                      </span>
                      {option.description && (
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </section>
        </TabsContent>
        {showSignals && (
          <TabsContent value="signals" className="mt-0">
            <SignalsPanel signals={dc.liveSignals} />
          </TabsContent>
        )}
      </Tabs>

      <footer className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <span className="text-xs text-[var(--foreground-muted)]">
          {dc.statusLine}
        </span>
        <Button variant="default" disabled={!dc.canSubmit} onClick={dc.submit}>
          {dc.submitting ? "Submitting…" : "Submit"}
        </Button>
      </footer>
    </div>
  );
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}
