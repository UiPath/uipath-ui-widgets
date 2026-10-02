import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Textarea,
} from "@uipath/apollo-wind";
import {
  ArrowRightIcon,
  CapIcon,
  CheckIcon,
  ChevronDownIcon,
  MarkIcon,
  PenIcon,
  ScaleIcon,
  SparklesIcon,
  WarnIcon,
} from "./icons";
import {
  EvidenceItem,
  INSTRUCTION_SCOPES,
  InstructionScope,
  NOT_RELEVANT_WHYS,
  WEIGHTS,
  Weight,
} from "./models";
import { Change, ChangeKind, DecisionCaptureState } from "./useDecisionCapture";

const CARD =
  "flex flex-col rounded-[18px] border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-[0_2px_16px_2px_rgba(0,0,0,0.05)]";
const MUTED = "text-[var(--foreground-muted)]";
const TONE_WARN =
  "border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]";
const TONE_OK =
  "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)]";
const TONE_BAD =
  "border-[color-mix(in_srgb,var(--error)_30%,transparent)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)]";
const SELECTED_RING =
  "border-[var(--brand)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_18%,transparent)]";

const SCOPE_LABELS: Record<InstructionScope, string> = {
  "this-task": "This task",
  "similar-tasks": "Similar tasks",
  "all-tasks": "All tasks",
};

const KIND_MARK: Record<ChangeKind, { glyph: string; tone: string }> = {
  add: { glyph: "+", tone: TONE_OK },
  rem: { glyph: "−", tone: TONE_BAD },
  mod: { glyph: "○", tone: TONE_WARN },
};

const CHANGE_ICON: Record<Change["part"], React.ReactElement> = {
  Decision: <ScaleIcon width={14} height={14} />,
  Reason: <MarkIcon width={14} height={14} />,
  Rationale: <PenIcon width={14} height={14} />,
  Lesson: <CapIcon width={14} height={14} />,
};

function SectionHead(props: {
  icon: React.ReactElement;
  title: string;
  hint?: string;
  required?: boolean;
}): React.ReactElement {
  const { icon, title, hint, required } = props;
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="m-0 flex items-center gap-2 text-base font-semibold">
        <span className={MUTED}>{icon}</span>
        {title}
        {required && (
          <span className="font-semibold text-[var(--error)]">*</span>
        )}
      </h2>
      {hint && <span className={`text-xs ${MUTED}`}>{hint}</span>}
    </div>
  );
}

export function ProposedNote({
  value,
}: {
  value: string | number;
}): React.ReactElement {
  return (
    <span className={`flex items-center gap-1.5 text-[11px] ${MUTED}`}>
      <span className="text-[var(--warning)]">
        <WarnIcon />
      </span>
      Proposed: {value}
    </span>
  );
}

function WeightBars({ weight }: { weight: Weight | undefined }) {
  const level =
    weight === "High" ? 3 : weight === "Medium" ? 2 : weight === "Low" ? 1 : 0;
  const heights = ["h-1", "h-[7.5px]", "h-[11px]"];
  return (
    <span aria-hidden className="inline-flex h-[11px] items-end gap-[1.5px]">
      {heights.map((height, i) => (
        <i
          key={height}
          className={`block w-[3px] rounded-[1px] ${height} ${
            i < level ? "bg-[var(--brand)]" : "bg-[var(--border-subtle)]"
          }`}
        />
      ))}
    </span>
  );
}

function weightLabel(
  weight: Weight | undefined,
  why: string | undefined,
  note: string,
) {
  if (!weight) {
    return "Set a weight";
  }
  if (weight !== "Not relevant" || !why) {
    return weight;
  }
  return `${weight} · ${why === "Other" ? note.trim() || "Other" : why}`;
}

function WeightMenu(props: {
  item: EvidenceItem;
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { item, dc } = props;
  const weight = dc.weightOf(item);
  const label = weightLabel(weight, dc.whyOf(item), dc.noteOf(item));
  if (dc.locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-medium">
        <WeightBars weight={weight} />
        {label}
      </span>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Weight of ${item.title}: ${label}`}
          className="h-7 min-w-28 justify-start gap-1.5 rounded-lg px-2.5 text-xs font-medium"
        >
          <WeightBars weight={weight} />
          {label}
          <ChevronDownIcon className="ml-auto" width={13} height={13} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {WEIGHTS.map((w) => (
          <DropdownMenuItem
            key={w}
            className={weight === w ? "font-semibold" : ""}
            onSelect={() => dc.setWeight(item, w)}
          >
            <WeightBars weight={w} />
            {w}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WhyStrip(props: {
  item: EvidenceItem;
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { item, dc } = props;
  const why = dc.whyOf(item);
  return (
    <div
      className={`mt-2.5 rounded-[9px] border border-dashed px-3 py-2.5 ${TONE_WARN}`}
    >
      <p className="m-0 mb-1.5 text-xs font-semibold">
        Why is it not relevant?
      </p>
      <div
        role="radiogroup"
        aria-label={`Why ${item.title} is not relevant`}
        className="flex flex-wrap gap-1.5"
      >
        {NOT_RELEVANT_WHYS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={why === option}
            onClick={() => dc.setWhy(item, option)}
            className={`cursor-pointer rounded-full border px-[11px] py-1 text-xs ${
              why === option
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--card)]"
                : "border-[var(--border-subtle)] bg-[var(--card)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {why === "Other" && (
        <Textarea
          className="mt-2 min-h-14 text-xs"
          aria-label={`What is off about ${item.title}`}
          placeholder="Say what is off about it…"
          value={dc.noteOf(item)}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dc.setNote(item, e.target.value)
          }
        />
      )}
    </div>
  );
}

function ReasonRow(props: {
  item: EvidenceItem;
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { item, dc } = props;
  const weight = dc.weightOf(item);
  const flagged = weight === "Not relevant";
  const unanswered = flagged && !dc.whyOf(item);
  const proposed = dc.proposedWeight(item);
  return (
    <div
      className={`border-b border-[color-mix(in_srgb,var(--border-subtle)_60%,transparent)] px-3.5 py-3 last:border-b-0 ${
        flagged ? "bg-[color-mix(in_srgb,var(--warning)_6%,transparent)]" : ""
      } ${
        unanswered && !dc.locked ? "shadow-[inset_3px_0_0_var(--warning)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-semibold">{item.title}</p>
          {item.description && (
            <p className={`m-0 mt-0.5 text-xs ${MUTED}`}>{item.description}</p>
          )}
        </div>
        {item.supports && (
          <span
            className={`inline-flex shrink-0 items-center rounded-full border border-[var(--border-subtle)] bg-[var(--muted)] px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap ${MUTED}`}
          >
            Supports {item.supports}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        <span className={`text-[11px] font-light ${MUTED}`}>Weight</span>
        <WeightMenu item={item} dc={dc} />
      </div>
      {flagged && !dc.locked && <WhyStrip item={item} dc={dc} />}
      {proposed && (
        <div className="mt-1.5">
          <ProposedNote value={proposed} />
        </div>
      )}
    </div>
  );
}

export function DecisionSection({
  dc,
}: {
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { model } = dc;
  const outcomes = model?.outcomes ?? [];
  const proposed = dc.validProposed;
  const confidence = model?.proposalConfidence;
  const badge =
    confidence === undefined ? "Proposed" : `Proposed · ${confidence}%`;
  const override = !!dc.outcome && !!proposed && dc.outcome !== proposed;
  return (
    <section className={CARD}>
      <SectionHead
        icon={<ScaleIcon />}
        title="Decision"
        hint={
          dc.locked
            ? "As filed."
            : "Pick one. The proposed one is marked, never pre-selected."
        }
      />
      <div className="mt-3 h-px bg-[var(--border-subtle)]" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`text-lg font-semibold ${dc.outcome ? "" : MUTED}`}>
          {dc.outcome ?? "No decision selected"}
        </span>
        {dc.outcome && proposed ? (
          <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10.5px] font-semibold">
            {override ? "Override" : "As proposed"}
          </span>
        ) : (
          proposed && (
            <span className="text-[13px] font-semibold">{proposed}</span>
          )
        )}
      </div>
      {dc.proposedOutcomeNote && (
        <div className="mt-1.5">
          <ProposedNote value={dc.proposedOutcomeNote} />
        </div>
      )}
      {outcomes.length === 0 ? (
        <p className={`m-0 mt-2.5 text-xs ${MUTED}`}>
          No outcomes were sent with this task.
        </p>
      ) : (
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {outcomes.map((o) => {
            const on = dc.outcome === o.name;
            return (
              <button
                key={o.name}
                type="button"
                aria-pressed={on}
                disabled={dc.locked}
                onClick={() => dc.setOutcome(o.name)}
                className={`relative cursor-pointer rounded-xl border bg-[var(--card)] px-3.5 py-3 text-left transition-shadow disabled:cursor-default ${
                  on ? SELECTED_RING : "border-[var(--border-subtle)]"
                }`}
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold">
                  <span
                    aria-hidden
                    className={`grid size-3.5 shrink-0 place-items-center rounded-full border-[1.5px] ${
                      on
                        ? "border-[var(--brand)]"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    {on && (
                      <span className="size-[7px] rounded-full bg-[var(--brand)]" />
                    )}
                  </span>
                  {o.name}
                  {o.name === proposed && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap">
                      <span className="text-[var(--brand)]">
                        <SparklesIcon />
                      </span>
                      {badge}
                    </span>
                  )}
                </span>
                {o.description && (
                  <span className={`mt-0.5 block text-xs ${MUTED}`}>
                    {o.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ReasonsSection({
  dc,
}: {
  dc: DecisionCaptureState;
}): React.ReactElement {
  const evidence = dc.model?.evidence ?? [];
  return (
    <section className={CARD}>
      <SectionHead
        icon={<MarkIcon />}
        title="Reasons"
        hint={
          dc.locked
            ? "As filed."
            : "Set a weight. True unless you say otherwise."
        }
      />
      {evidence.length === 0 ? (
        <p className={`m-0 mt-2.5 text-xs ${MUTED}`}>
          No reasons were sent with this task.
        </p>
      ) : (
        <div className="mt-2.5 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          {evidence.map((item) => (
            <ReasonRow key={item.id} item={item} dc={dc} />
          ))}
        </div>
      )}
    </section>
  );
}

export function RationaleSection({
  dc,
}: {
  dc: DecisionCaptureState;
}): React.ReactElement {
  const [draft, setDraft] = React.useState("");
  const required = dc.departed;
  const add = () => {
    dc.addOwn(draft);
    setDraft("");
  };
  return (
    <section className={CARD}>
      <SectionHead
        icon={<PenIcon />}
        title="Rationale"
        required={required && !dc.locked}
        hint={
          required
            ? "Required once you depart from the proposal."
            : "Optional when you agree."
        }
      />
      {dc.rationaleBank.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-[7px]">
          {dc.rationaleBank.map((text) => {
            const on = dc.picked.includes(text);
            return (
              <button
                key={text}
                type="button"
                aria-pressed={on}
                disabled={dc.locked}
                onClick={() => dc.togglePicked(text)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 py-[5px] text-xs disabled:cursor-default ${
                  on
                    ? "bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] font-semibold"
                    : "bg-[var(--muted)] font-medium"
                }`}
              >
                {on && <CheckIcon />}
                {text}
              </button>
            );
          })}
        </div>
      )}
      {!dc.locked && (
        <div className="mt-2.5 flex items-center gap-2">
          <Input
            aria-label="Add your own"
            placeholder="Add your own…"
            className="h-8 text-xs"
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={draft.trim().length === 0}
            onClick={add}
          >
            Add
          </Button>
        </div>
      )}
      {required && dc.picked.length === 0 && !dc.locked && (
        <p className="m-0 mt-2 text-[11px] text-[var(--error)]">
          Pick at least one, or add your own.
        </p>
      )}
    </section>
  );
}

export function TeachSection({
  dc,
}: {
  dc: DecisionCaptureState;
}): React.ReactElement {
  const options = dc.model?.instructionOptions ?? [];
  if (!dc.departed && !dc.locked) {
    return (
      <section className={CARD}>
        <SectionHead
          icon={<CapIcon />}
          title="Teach the process"
          hint="Nothing to teach."
        />
        <p className={`m-0 mt-2 text-[11px] ${MUTED}`}>
          You kept everything that was proposed, so there is no lesson in this
          one.
        </p>
      </section>
    );
  }
  const showText =
    dc.lessonIndex !== null ||
    options.length === 0 ||
    (dc.locked && dc.instructionText.length > 0);
  return (
    <section className={CARD}>
      <SectionHead
        icon={<CapIcon />}
        title="Teach the process"
        required={!dc.locked}
        hint={dc.locked ? "As filed." : "Pick the lesson for next time."}
      />
      {options.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-2">
          {options.map((text, i) => {
            const on = dc.lessonIndex === i;
            return (
              <button
                key={text}
                type="button"
                aria-pressed={on}
                disabled={dc.locked}
                onClick={() => dc.pickLesson(i)}
                className={`cursor-pointer rounded-[10px] border bg-[var(--muted)] px-3.5 py-3 text-left text-[13px] disabled:cursor-default ${
                  on ? SELECTED_RING : "border-[var(--border-subtle)]"
                }`}
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
      {showText && (
        <Textarea
          className="mt-2.5 min-h-14 text-xs"
          aria-label="Lesson"
          placeholder="Write the lesson in one sentence…"
          disabled={dc.locked}
          value={dc.instructionText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dc.setInstructionText(e.target.value)
          }
        />
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className={`text-[11px] font-light ${MUTED}`}>Applies to</span>
        <div
          role="radiogroup"
          aria-label="Applies to"
          className="inline-flex rounded-lg bg-[var(--muted)] p-0.5"
        >
          {INSTRUCTION_SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              role="radio"
              aria-checked={dc.scope === scope}
              disabled={dc.locked}
              onClick={() => dc.setScope(scope)}
              className={`cursor-pointer rounded-md border-0 px-2.5 py-[5px] text-xs font-medium disabled:cursor-default ${
                dc.scope === scope
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : `bg-transparent ${MUTED}`
              }`}
            >
              {SCOPE_LABELS[scope]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChangeRow({ change }: { change: Change }): React.ReactElement {
  const mark = KIND_MARK[change.kind];
  return (
    <div className="grid grid-cols-[14px_74px_18px_minmax(0,1fr)] items-center gap-2.5 border-b border-[color-mix(in_srgb,var(--border-subtle)_50%,transparent)] px-3.5 py-[9px] text-xs last:border-b-0">
      <span className={MUTED}>{CHANGE_ICON[change.part]}</span>
      <span className={MUTED}>{change.part}</span>
      <span
        className={`inline-grid size-[18px] place-items-center rounded-md border text-[11px] leading-none font-bold ${mark.tone}`}
      >
        {mark.glyph}
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-[5px]">
        {change.subject && (
          <span className="font-semibold">{change.subject} ·</span>
        )}
        {change.from && (
          <>
            <span className={`line-through ${MUTED}`}>{change.from}</span>
            <span className={MUTED}>
              <ArrowRightIcon />
            </span>
          </>
        )}
        <span>{change.to}</span>
      </span>
    </div>
  );
}

export function ChangesRail({
  dc,
}: {
  dc: DecisionCaptureState;
}): React.ReactElement {
  const { filed, departed, changes, missing } = dc;
  const proposed = dc.validProposed;
  const noteText = filed
    ? "Recorded. Nothing further to do."
    : missing.length > 0
      ? `Missing: ${missing.join(", ")}.`
      : departed
        ? `Departs from the proposal · ${changes.length} change${changes.length === 1 ? "" : "s"}.`
        : "One click. No rationale needed when you agree.";
  const title = filed
    ? "Filed"
    : dc.agree && proposed
      ? `Agree · ${proposed}`
      : "Record decision";
  const sub = `Decision, reasons${dc.picked.length > 0 ? ", rationale" : ""}${departed ? " and a lesson" : ""}`;
  return (
    <div className="flex flex-col gap-4">
      {filed && (
        <section className={`${CARD} gap-3`}>
          <div className="flex items-start gap-2.5">
            <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-[var(--success)] text-white">
              <CheckIcon width={11} height={11} />
            </span>
            <div className="min-w-0 flex-1 text-[15px] font-semibold">
              {dc.outcome} recorded
            </div>
          </div>
        </section>
      )}
      <section className={`${CARD} gap-3`}>
        <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          <div className="border-b border-[color-mix(in_srgb,var(--border-subtle)_60%,transparent)] px-3.5 py-[9px] text-sm font-semibold">
            What changed
          </div>
          {changes.length === 0 ? (
            <p
              className={`m-0 flex items-start gap-2 px-3.5 py-[11px] text-xs ${MUTED}`}
            >
              <span className="mt-0.5 text-[var(--success)]">
                <CheckIcon width={14} height={14} />
              </span>
              <span>
                The decision and the reasons are as the process proposed them.
              </span>
            </p>
          ) : (
            changes.map((change) => (
              <ChangeRow
                key={`${change.part}-${change.subject ?? ""}`}
                change={change}
              />
            ))
          )}
        </div>
        <div className="border-t border-[color-mix(in_srgb,var(--border-subtle)_70%,transparent)] pt-3.5">
          <Button
            disabled={filed || !dc.canComplete}
            onClick={dc.complete}
            className="h-auto w-full flex-col items-start gap-px rounded-[10px] px-5 py-[11px]"
          >
            <span className="text-[13px] leading-tight font-semibold">
              {title}
            </span>
            {!filed && (
              <span className="text-xs leading-tight font-normal opacity-85">
                {sub}
              </span>
            )}
          </Button>
          <p className={`m-0 mt-2 text-[11px] ${MUTED}`}>{noteText}</p>
        </div>
      </section>
    </div>
  );
}

export function DecisionBody(props: {
  dc: DecisionCaptureState;
  layout: "split" | "stacked";
}): React.ReactElement {
  const { dc, layout } = props;
  return (
    <div
      className={
        layout === "split"
          ? "grid grid-cols-1 items-start gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_340px]"
          : "flex flex-col gap-4"
      }
    >
      <div className="flex min-w-0 flex-col gap-4">
        <DecisionSection dc={dc} />
        <ReasonsSection dc={dc} />
        <RationaleSection dc={dc} />
        <TeachSection dc={dc} />
      </div>
      <div className={layout === "split" ? "sticky top-4" : ""}>
        <ChangesRail dc={dc} />
      </div>
    </div>
  );
}
