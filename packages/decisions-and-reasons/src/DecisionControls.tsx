import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Textarea,
} from "@uipath/apollo-wind";
import { ChevronDownIcon, SparklesIcon } from "./icons";
import {
  EvidenceItem,
  FieldValue,
  RelevanceLevel,
  UseCaseField,
} from "./models";
import { DecisionCaptureState } from "./useDecisionCapture";

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

interface SelectOption {
  value: string;
  label: string;
}

const RELEVANCE_OPTIONS: SelectOption[] = RELEVANCE_LEVELS.map((level) => ({
  value: level,
  label: RELEVANCE_LABELS[level],
}));

export function ProposedNote({
  value,
}: {
  value: string | number;
}): React.ReactElement {
  return (
    <span className="text-xs text-[var(--foreground-muted)]">
      Agent proposed: {value}
    </span>
  );
}

function SelectControl(props: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}): React.ReactElement {
  const { label, value, options, onChange } = props;
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`${label}: ${current}`}
          className="h-7 gap-1 rounded-lg px-2.5 text-xs"
        >
          {current}
          <ChevronDownIcon width={12} height={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FieldControl(props: {
  field: UseCaseField;
  value: FieldValue;
  proposed: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}): React.ReactElement {
  const { field, value, proposed, onChange } = props;
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs font-semibold text-[var(--foreground-muted)]">
        {field.label}
      </span>
      {field.type === "select" ? (
        <SelectControl
          label={field.label}
          value={String(value)}
          options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
          onChange={onChange}
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          aria-label={field.label}
          className="rounded-md border border-[var(--ap-wind-border)] bg-transparent px-2.5 py-1.5 font-[inherit] text-[var(--foreground)]"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(
              field.type === "number" ? Number(e.target.value) : e.target.value,
            )
          }
        />
      )}
      {proposed !== undefined && <ProposedNote value={proposed} />}
    </div>
  );
}

export function EvidenceRow(props: {
  item: EvidenceItem;
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { item, dc } = props;
  const outcomes = dc.model?.outcomes ?? [];
  const proposedRelevance = dc.proposedRelevance(item);
  const proposedVerdict = dc.proposedVerdict(item);
  const tags = item.tags ?? [];
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-semibold">{item.title}</span>
        {item.description && (
          <span className="text-[13px] text-[var(--foreground-secondary)]">
            {item.description}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-[var(--surface-selected)] px-2 py-0.5 text-[11px] font-semibold">
            Supports {item.supports}
          </span>
          {tags.length > 0 && (
            <span className="font-mono text-xs text-[var(--foreground-muted)]">
              {tags.join(" · ")}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-3">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-[var(--foreground-muted)]">
            Relevance
          </span>
          <SelectControl
            label={`Relevance of ${item.title}`}
            value={item.relevance}
            options={RELEVANCE_OPTIONS}
            onChange={(v) => dc.setRelevance(item.id, v as RelevanceLevel)}
          />
          {proposedRelevance && (
            <ProposedNote value={RELEVANCE_LABELS[proposedRelevance]} />
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-[var(--foreground-muted)]">
            Verdict
          </span>
          <SelectControl
            label={`Verdict of ${item.title}`}
            value={item.verdict}
            options={outcomes.map((o) => ({ value: o.name, label: o.name }))}
            onChange={(v) => dc.setVerdict(item.id, v)}
          />
          {proposedVerdict && <ProposedNote value={proposedVerdict} />}
        </div>
      </div>
    </div>
  );
}

export function RationaleAndInstruction(props: {
  dc: DecisionCaptureState;
  compact?: boolean;
}): React.ReactElement | null {
  const { dc, compact = false } = props;
  if (!dc.model) {
    return null;
  }
  const minHeight = compact ? "min-h-16" : "min-h-24";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
          Why is this the right decision?{" "}
          <span className="text-[var(--error)]">*</span>
        </span>
        <Textarea
          className={minHeight}
          aria-label="Why is this the right decision?"
          value={dc.rationaleText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dc.setRationaleText(e.target.value)
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
          What should the agent do next time?
        </span>
        <Textarea
          className={minHeight}
          aria-label="What should the agent do next time?"
          placeholder={dc.model.instructionPlaceholder}
          value={dc.instructionText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dc.setInstructionText(e.target.value)
          }
        />
      </div>
    </div>
  );
}

export function OutcomeButtons(props: {
  dc: DecisionCaptureState;
  size?: "sm" | "default";
}): React.ReactElement | null {
  const { dc, size = "default" } = props;
  if (!dc.model) {
    return null;
  }
  const { model } = dc;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {model.outcomes.map((outcome) => (
          <Button
            key={outcome.name}
            variant="outline"
            size={size}
            disabled={!dc.canComplete(outcome.name)}
            onClick={() => dc.complete(outcome.name)}
          >
            {outcome.name}
            {outcome.name === dc.recommendedOutcome && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-1.5 py-px text-[11px] text-[var(--brand)]">
                <SparklesIcon width={10} height={10} />
                Recommended · {model.confidenceScore}%
              </span>
            )}
          </Button>
        ))}
      </div>
      {dc.hint && (
        <span className="text-xs text-[var(--foreground-muted)]">
          {dc.hint}
        </span>
      )}
    </div>
  );
}
