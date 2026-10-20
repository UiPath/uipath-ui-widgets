import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Badge, Button, Input, Textarea } from "@uipath/apollo-wind";

type Weight = "High" | "Medium" | "Low" | "Not relevant";
const WEIGHTS: Weight[] = ["High", "Medium", "Low", "Not relevant"];
const WHY = ["Wrong", "Outdated", "Other"];

const DECISIONS = [
  { id: "Approve", t: "Approve in full", d: "Pay the full claim." },
  {
    id: "ApprovePartial",
    t: "Approve partial",
    d: "Pay up to the ceiling and tell the customer which part was covered.",
  },
  {
    id: "Deny",
    t: "Deny",
    d: "Close the claim and explain which part was covered.",
  },
];

const SCOPES = [
  {
    id: "this",
    value: "this-claim",
    label: "Just this claim",
    counts: "Just this claim",
  },
  {
    id: "like",
    value: "similar-claims",
    label: "Claims like this",
    counts: "Counts for claims like this",
  },
  {
    id: "always",
    value: "all-claims",
    label: "Always",
    counts: "Counts for all claims",
  },
];

export type ClaimReason = {
  id: string;
  title: string;
  detail: string;
  supports: string;
  proposedWeight: string;
  source?: string;
  sourceConfidence?: number;
  weight?: string;
  notRelevantWhy?: string;
  notRelevantNote?: string;
};

export type FinalDetailField = {
  id: string;
  label: string;
  kind: string;
  byDecision: Record<string, string>;
  value?: string;
};

export type ClaimData = {
  claimId: string;
  customer: string;
  claimAmount: number;
  planCeiling: number;
  planName?: string;
  proposedBy?: string;
  involvement?: string;
  recommendedDecision: string;
  draftRationale?: string;
  reasons: ClaimReason[];
  rationaleOptions?: string[];
  fields?: FinalDetailField[];
  nextTimeOptions: { id: string; text: string; basis: string }[];
  conditionOptions: { id: string; label: string }[];
  decision?: string;
  rationaleText?: string;
  nextTimeId?: string;
  nextTimeScope?: string;
  nextTimeConditions?: string[];
};

export type CaptureRecordRow = {
  part: string;
  proposed: string;
  submitted: string;
  howMuch: string;
  source: string;
  lookedAt: boolean;
  scope: string;
};
export type CaptureLogEntry = {
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
};

export type ClaimReviewPayload = {
  decision: string | null;
  reasons: ClaimReason[];
  rationaleText: string;
  decidingReasons: string[];
  fields: FinalDetailField[];
  nextTimeId: string;
  nextTimeText: string;
  nextTimeScope: string;
  nextTimeConditions: string[];
  changes: string[];
  record: CaptureRecordRow[];
  reviewerId: string;
  timeOnTaskSeconds: number;
  changeLog: CaptureLogEntry[];
};

type R = ClaimReason & { w: Weight; why: string | null; note: string };

const lev = (a: string, b: string) => {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length][b.length];
};

const Bars = ({ w }: { w: Weight }) => {
  const n = w === "High" ? 3 : w === "Medium" ? 2 : w === "Low" ? 1 : 0;
  return (
    <span className="inline-flex h-3 items-end gap-[1.5px]">
      {[1, 2, 3].map((i) => (
        <i
          key={i}
          style={{ height: i * 4 }}
          className={`block w-[3px] rounded-[1px] ${i <= n ? "bg-primary" : "bg-border"}`}
        />
      ))}
    </span>
  );
};

const Card = ({ children }: { children: ReactNode }) => (
  <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
    {children}
  </section>
);

const Pill = ({
  on,
  onClick,
  children,
  disabled,
}: {
  on?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs ${on ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted"}`}
  >
    {children}
  </button>
);

const byD = (m: Record<string, string> | undefined, d: string) =>
  m?.[d] ?? m?.[d.charAt(0).toLowerCase() + d.slice(1)] ?? "";
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const supportsLabel = (s: string) =>
  s === "ApprovePartial" ? "Approve partial" : s;
const stepsApart = (a: string, b: string) =>
  Math.abs(WEIGHTS.indexOf(a as Weight) - WEIGHTS.indexOf(b as Weight));
const weightHow = (from: string, to: string) =>
  from === to
    ? "Kept"
    : to === "Not relevant"
      ? "Rejected"
      : stepsApart(from, to) > 1
        ? "Rewritten"
        : "Lightly edited";

export function ClaimReview({
  data,
  readOnly = false,
  reviewerId = "",
  onChange,
  onComplete,
}: {
  data: ClaimData;
  readOnly?: boolean;
  reviewerId?: string;
  onChange?: (p: ClaimReviewPayload) => void;
  onComplete: (decision: string, p: ClaimReviewPayload) => Promise<void> | void;
}) {
  const agent = data.recommendedDecision;
  const draft = data.draftRationale ?? "";
  const [decision, setDecision] = useState<string | null>(
    readOnly ? (data.decision ?? null) : null,
  );
  const [rs, setRs] = useState<R[]>(() =>
    data.reasons.map((r) => ({
      ...r,
      w: ((readOnly ? r.weight : undefined) ?? r.proposedWeight) as Weight,
      why: readOnly ? (r.notRelevantWhy ?? null) : null,
      note: readOnly ? (r.notRelevantNote ?? "") : "",
    })),
  );
  const [menu, setMenu] = useState<number | null>(null);
  const [looked, setLooked] = useState<Record<string, boolean>>({});
  const [own, setOwn] = useState("");
  const [manual, setManual] = useState<string | null>(
    readOnly ? (data.rationaleText ?? null) : null,
  );
  const [editing, setEditing] = useState(false);
  const [fieldVals, setFieldVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (readOnly ? (data.fields ?? []) : [])
        .filter((f) => f.value !== undefined)
        .map((f) => [f.id, f.value as string]),
    ),
  );
  const [lesson, setLesson] = useState<string | null>(
    readOnly ? (data.nextTimeId ?? null) : null,
  );
  const [scope, setScope] = useState(
    readOnly
      ? (SCOPES.find((x) => x.value === data.nextTimeScope)?.id ?? "like")
      : "like",
  );
  const [conds, setConds] = useState<Record<string, boolean>>(() =>
    readOnly
      ? Object.fromEntries(
          (data.nextTimeConditions ?? []).map((c) => [
            data.conditionOptions.find((k) => k.label === c)?.id ?? c,
            true,
          ]),
        )
      : Object.fromEntries(
          data.conditionOptions.slice(0, 2).map((k) => [k.id, true]),
        ),
  );
  const [done, setDone] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [secs, setSecs] = useState(0);
  const [log, setLog] = useState<CaptureLogEntry[]>([]);
  const start = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const t = setInterval(
      () => setSecs(Math.round((Date.now() - start.current) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [done]);

  const lookAt = (id: string) =>
    setLooked((o) => (o[id] ? o : { ...o, [id]: true }));
  const label = (id: string) => DECISIONS.find((d) => d.id === id)?.t ?? id;
  const fields = data.fields ?? [];
  const fieldValue = (f: FinalDetailField, d: string | null = decision) =>
    fieldVals[f.id] ?? byD(f.byDecision, d ?? agent);
  const fieldProposed = (f: FinalDetailField) => byD(f.byDecision, agent);
  const fieldHow = (f: FinalDetailField, v: string) => {
    const pr = fieldProposed(f);
    if (v === pr) return looked[`f:${f.id}`] ? "Kept" : "Untouched";
    if (!v.trim()) return "Rejected";
    return lev(pr, v) / Math.max(pr.length, v.length, 1) <= 0.3
      ? "Lightly edited"
      : "Rewritten";
  };
  const matches = (supports: string, d: string) =>
    d === "ApprovePartial" ? true : supports === d;
  const compose = (d: string | null, rr: R[]) => {
    if (!d) return draft;
    const live = rr.filter(
      (r) => r.w !== "Not relevant" && matches(r.supports, d),
    );
    const top = live.filter((r) => r.w === "High");
    const deciders = (top.length ? top : live.slice(0, 2)).map((r) => r.title);
    const off = rr.filter((r) => r.w === "Not relevant").map((r) => r.title);
    return `${label(d)}. ${deciders.length ? `Decided by: ${deciders.join("; ")}.` : ""}${off.length ? ` Set aside as not relevant: ${off.join("; ")}.` : ""}`.trim();
  };
  const decidingIds = (d: string | null, rr: R[]) => {
    if (!d) return [];
    const live = rr.filter(
      (r) => r.w !== "Not relevant" && matches(r.supports, d),
    );
    const top = live.filter((r) => r.w === "High");
    return (top.length ? top : live.slice(0, 2)).map((r) => r.id);
  };
  const text = manual ?? compose(decision, rs);
  const rationaleHow =
    text === draft
      ? "Kept"
      : lev(draft, text) / Math.max(draft.length, text.length, 1) <= 0.3
        ? "Lightly edited"
        : "Rewritten";
  const rationaleEdited = text !== draft;
  const weightChanges = rs.filter((r) => r.w !== r.proposedWeight);
  const hasChange =
    (decision !== null && decision !== agent) || weightChanges.length > 0;
  const blocked = !decision;
  const scopeObj = SCOPES.find((x) => x.id === scope)!;
  const condText = data.conditionOptions
    .filter((k) => conds[k.id])
    .map((k) => k.label)
    .join(" and ");
  const scopeText =
    scope === "like"
      ? `claims that ${condText || "(no condition)"}`
      : scopeObj.label.toLowerCase();

  const changes: {
    part: string;
    subj?: string;
    from?: string;
    to: string;
    how?: string;
  }[] = [];
  if (decision && decision !== agent)
    changes.push({
      part: "Decision",
      from: label(agent),
      to: label(decision),
      how: `Rejected · ${scopeObj.counts}`,
    });
  weightChanges.forEach((r) =>
    changes.push({
      part: "Reason",
      subj: r.title,
      from: r.proposedWeight,
      to:
        r.w +
        (r.w === "Not relevant" && r.why
          ? ` · ${r.why === "Other" ? r.note || "Other" : r.why}`
          : ""),
      how: weightHow(r.proposedWeight, r.w),
    }),
  );
  fields.forEach((f) => {
    const v = fieldValue(f);
    const cut = (x: string) =>
      x.length > 60 ? `${x.slice(0, 60)}...` : x || "—";
    if (fieldVals[f.id] !== undefined && v !== fieldProposed(f))
      changes.push({
        part: "Field",
        subj: f.label,
        from: cut(fieldProposed(f)),
        to: cut(v),
        how: fieldHow(f, v),
      });
  });
  if (rationaleEdited)
    changes.push({
      part: "Rationale",
      to: manual !== null ? "Edited by you" : "Composed from your reasons",
      how: rationaleHow,
    });
  if (own.trim())
    changes.push({ part: "Rationale", to: "Note added", how: "Added" });
  if (lesson)
    changes.push({
      part: "Next time",
      to: `Applies to ${scopeText}`,
      how: "Kept",
    });

  const record = (
    over: {
      decision?: string | null;
      rs?: R[];
      manual?: string | null;
      fieldVals?: Record<string, string>;
      lesson?: string | null;
    } = {},
  ): CaptureRecordRow[] => {
    const d = over.decision !== undefined ? over.decision : decision;
    const rr = over.rs ?? rs;
    const mn = over.manual !== undefined ? over.manual : manual;
    const tx = mn ?? compose(d, rr);
    const fv = over.fieldVals ?? fieldVals;
    const l = over.lesson !== undefined ? over.lesson : lesson;
    const rows: CaptureRecordRow[] = [];
    rows.push({
      part: "Decision",
      proposed: label(agent),
      submitted: d ? label(d) : "—",
      howMuch: !d ? "Untouched" : d === agent ? "Kept" : "Rejected",
      source: data.proposedBy ?? "",
      lookedAt: !!d,
      scope: d && d !== agent ? scopeObj.counts : "—",
    });
    rr.forEach((r) =>
      rows.push({
        part: `Reason: ${r.title}`,
        proposed: r.proposedWeight,
        submitted:
          r.w +
          (r.w === "Not relevant" && r.why
            ? ` · ${r.why === "Other" ? r.note || "Other" : r.why}`
            : ""),
        howMuch:
          r.w !== r.proposedWeight
            ? weightHow(r.proposedWeight, r.w)
            : looked[r.id]
              ? "Kept"
              : "Untouched",
        source: r.source
          ? `${r.source}${r.sourceConfidence !== undefined ? ` · ${r.sourceConfidence}%` : ""}`
          : "",
        lookedAt: !!looked[r.id] || r.w !== r.proposedWeight,
        scope: r.w !== r.proposedWeight ? scopeObj.counts : "—",
      }),
    );
    fields.forEach((f) => {
      const v = fv[f.id] ?? byD(f.byDecision, d ?? agent);
      const pr = fieldProposed(f);
      const how =
        v === pr
          ? looked[`f:${f.id}`]
            ? "Kept"
            : "Untouched"
          : !v.trim()
            ? "Rejected"
            : lev(pr, v) / Math.max(pr.length, v.length, 1) <= 0.3
              ? "Lightly edited"
              : "Rewritten";
      rows.push({
        part: `Field: ${f.label}`,
        proposed: pr || "—",
        submitted: v || "—",
        howMuch: how,
        source:
          fv[f.id] === undefined && d && d !== agent
            ? "Follows decision"
            : (data.proposedBy ?? ""),
        lookedAt: !!looked[`f:${f.id}`] || fv[f.id] !== undefined,
        scope: v !== pr ? scopeObj.counts : "—",
      });
    });
    rows.push({
      part: "Rationale",
      proposed: draft || "—",
      submitted: tx,
      howMuch:
        tx === draft
          ? editing || looked.rationale
            ? "Kept"
            : "Untouched"
          : draft &&
              lev(draft, tx) / Math.max(draft.length, tx.length, 1) <= 0.3
            ? "Lightly edited"
            : "Rewritten",
      source:
        mn !== null
          ? (data.proposedBy ?? "")
          : d
            ? "Composed from your reasons"
            : (data.proposedBy ?? ""),
      lookedAt: tx !== draft || editing || !!looked.rationale,
      scope: tx !== draft ? scopeObj.counts : "—",
    });
    const lo = data.nextTimeOptions.find((x) => x.id === l);
    rows.push({
      part: "Next time",
      proposed: data.nextTimeOptions.length
        ? `${data.nextTimeOptions.length} drafts`
        : "—",
      submitted: lo ? lo.text : "—",
      howMuch: lo ? "Kept" : "Untouched",
      source: data.proposedBy ?? "",
      lookedAt: !!lo,
      scope: lo ? scopeObj.counts : "—",
    });
    return rows;
  };

  const payload = (
    over: Partial<{
      decision: string | null;
      rs: R[];
      own: string;
      manual: string | null;
      fieldVals: Record<string, string>;
      lesson: string | null;
      scope: string;
      conds: Record<string, boolean>;
    }> = {},
  ): ClaimReviewPayload => {
    const d = over.decision !== undefined ? over.decision : decision;
    const rr = over.rs ?? rs;
    const mn = over.manual !== undefined ? over.manual : manual;
    const fv = over.fieldVals ?? fieldVals;
    const tx = mn ?? compose(d, rr);
    const l = over.lesson !== undefined ? over.lesson : lesson;
    const sc = over.scope ?? scope;
    const cd = over.conds ?? conds;
    const lessonObj = data.nextTimeOptions.find((x) => x.id === l);
    return {
      decision: d,
      reasons: rr.map((r) => {
        const item: ClaimReason = {
          id: r.id,
          title: r.title,
          detail: r.detail,
          supports: r.supports,
          proposedWeight: r.proposedWeight,
          weight: r.w,
        };
        if (r.source) item.source = r.source;
        if (r.sourceConfidence !== undefined)
          item.sourceConfidence = r.sourceConfidence;
        if (r.w === "Not relevant" && r.why) {
          item.notRelevantWhy = r.why;
          if (r.why === "Other") item.notRelevantNote = r.note;
        }
        return item;
      }),
      rationaleText: [tx, (over.own ?? own).trim()].filter(Boolean).join("\n"),
      decidingReasons: decidingIds(d, rr),
      fields: fields.map((f) => ({
        ...f,
        value: fv[f.id] ?? byD(f.byDecision, d ?? agent),
      })),
      nextTimeId: l ?? "",
      nextTimeText: lessonObj?.text ?? "",
      nextTimeScope: l ? (SCOPES.find((x) => x.id === sc)?.value ?? "") : "",
      nextTimeConditions:
        l && sc === "like"
          ? data.conditionOptions.filter((k) => cd[k.id]).map((k) => k.label)
          : [],
      changes: changes.map(
        (c) =>
          `${c.part}${c.subj ? ` · ${c.subj}` : ""}: ${c.from ? `${c.from} → ` : ""}${c.to}${c.how ? ` (${c.how})` : ""}`,
      ),
      record: record({
        decision: d,
        rs: rr,
        manual: mn,
        fieldVals: fv,
        lesson: l,
      }),
      reviewerId,
      timeOnTaskSeconds: Math.round((Date.now() - start.current) / 1000),
      changeLog: log,
    };
  };
  const emit = (over: Parameters<typeof payload>[0]) =>
    onChange?.(payload(over));
  const note = (what: string) =>
    setLog((o) => [
      ...o,
      {
        step: o.length + 1,
        what,
        atSecond: Math.round((Date.now() - start.current) / 1000),
        lookedAt: Object.keys(looked).map(
          (k) => data.reasons.find((r) => r.id === k)?.title ?? k,
        ),
      },
    ]);

  const setR = (i: number, p: Partial<R>, what: string) => {
    const next = rs.map((r, j) => (j === i ? { ...r, ...p } : r));
    setRs(next);
    note(what);
    emit({ rs: next });
  };
  const choose = (id: string) => {
    setDecision(id);
    note(`Decision: ${label(id)}`);
    emit({ decision: id });
  };
  const submit = async () => {
    if (!decision) return;
    setBusy(true);
    try {
      await onComplete(decision, payload());
      setDone(true);
    } finally {
      setBusy(false);
    }
  };
  const locked = done || readOnly;
  const rows = record();

  return (
    <div className="min-w-0 space-y-4 text-sm">
      <section className="space-y-1 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">
            Warranty claim {data.claimId}
          </span>
          <Badge variant="secondary">{done ? "Completed" : "Pending"}</Badge>
        </div>
        {data.proposedBy && (
          <p className="text-[11px] text-muted-foreground">
            Proposed by {data.proposedBy}
            {data.involvement ? ` · ${data.involvement}` : ""}
          </p>
        )}
        <div className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Customer </span>
            {data.customer}
          </div>
          <div>
            <span className="text-muted-foreground">Claim </span>
            {money(data.claimAmount)}
          </div>
          <div>
            <span className="text-muted-foreground">Plan ceiling </span>
            {money(data.planCeiling)}
          </div>
        </div>
      </section>

      <Card>
        <h3 className="flex items-center text-base font-semibold">Reasons</h3>
        <div className="rounded-xl border">
          {rs.map((r, i) => {
            const flagged = r.w === "Not relevant";
            return (
              <div
                key={r.id}
                className={`relative border-b p-3 last:border-b-0 ${flagged ? "bg-amber-500/5" : ""} ${menu === i ? "z-10" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div
                    className="min-w-0 flex-1 cursor-default"
                    onClick={() => lookAt(r.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
                      {r.title}
                      <Badge variant="outline">
                        Supports {supportsLabel(r.supports)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        lookAt(r.id);
                        setMenu(menu === i ? null : i);
                      }}
                      className="inline-flex min-w-28 items-center gap-2 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                    >
                      <Bars w={r.w} />
                      {r.w}
                      <span className="ml-auto text-muted-foreground">▾</span>
                    </button>
                    {menu === i && (
                      <div className="absolute right-0 z-20 mt-1 min-w-52 rounded-lg border bg-card p-1 shadow-lg">
                        {WEIGHTS.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              setR(
                                i,
                                { w, why: w === "Not relevant" ? r.why : null },
                                `Reason weight: ${r.title}, ${r.w} → ${w}`,
                              );
                              setMenu(null);
                            }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted ${r.w === w ? "font-semibold" : ""}`}
                          >
                            <Bars w={w} />
                            {w}
                          </button>
                        ))}
                        {r.source && (
                          <div className="mt-1 border-t px-2 py-1.5 text-[11px] text-muted-foreground">
                            From {r.source}
                            {r.sourceConfidence !== undefined
                              ? ` · ${r.sourceConfidence}%`
                              : ""}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {flagged && (
                  <div className="mt-2 space-y-2 rounded-lg border border-dashed border-amber-500/60 bg-amber-500/5 p-3">
                    <p className="flex items-center text-xs font-semibold">
                      Why is it not relevant?{" "}
                      <span className="ml-1 font-normal text-muted-foreground">
                        Optional
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {WHY.map((w) => (
                        <Pill
                          key={w}
                          disabled={locked}
                          on={r.why === w}
                          onClick={() =>
                            setR(
                              i,
                              { why: r.why === w ? null : w },
                              `Why not relevant: ${r.title}, ${w}`,
                            )
                          }
                        >
                          {w}
                        </Pill>
                      ))}
                    </div>
                    {r.why === "Other" && (
                      <Input
                        disabled={locked}
                        placeholder="Say what is off about it"
                        value={r.note}
                        onChange={(e) =>
                          setRs((o) =>
                            o.map((x, j) =>
                              j === i ? { ...x, note: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    )}
                  </div>
                )}
                {r.w !== r.proposedWeight && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Agent proposed {r.proposedWeight}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
          Decision <span className="font-normal text-muted-foreground">·</span>
          <span className={decision ? "" : "font-medium text-muted-foreground"}>
            {decision ? label(decision) : "No decision selected"}
          </span>
          {decision === agent && <Badge variant="secondary">Recommended</Badge>}
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {DECISIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={locked}
              onClick={() => choose(d.id)}
              className={`space-y-1 rounded-xl border p-3 text-left ${decision === d.id ? "border-primary ring-2 ring-primary/25" : "hover:border-primary/40"}`}
            >
              <span className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
                {d.t}
                {d.id === agent && (
                  <Badge variant="secondary">Recommended</Badge>
                )}
              </span>
              <span className="block text-xs text-muted-foreground">{d.d}</span>
            </button>
          ))}
        </div>
        {fields.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Final details
              {decision && decision !== agent
                ? `, set for ${label(decision)}`
                : ""}
              . Edit any of them.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => {
                const v = fieldValue(f);
                const pr = fieldProposed(f);
                const long = f.kind === "long";
                return (
                  <div
                    key={f.id}
                    className={`space-y-1 ${long ? "sm:col-span-2" : ""}`}
                  >
                    <label className="text-xs font-medium text-muted-foreground">
                      {f.label}
                    </label>
                    {long ? (
                      <Textarea
                        rows={3}
                        disabled={locked}
                        value={v}
                        onFocus={() => lookAt(`f:${f.id}`)}
                        onChange={(e) =>
                          setFieldVals((o) => ({
                            ...o,
                            [f.id]: e.target.value,
                          }))
                        }
                        onBlur={() => emit({})}
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {f.kind === "money" && (
                          <span className="text-xs text-muted-foreground">
                            $
                          </span>
                        )}
                        <Input
                          disabled={locked}
                          value={v}
                          onFocus={() => lookAt(`f:${f.id}`)}
                          onChange={(e) =>
                            setFieldVals((o) => ({
                              ...o,
                              [f.id]: e.target.value,
                            }))
                          }
                          onBlur={() => emit({})}
                        />
                      </div>
                    )}
                    {fieldVals[f.id] !== undefined && v !== pr && (
                      <p className="text-[11px] text-muted-foreground">
                        Proposed: {pr || "—"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-base font-semibold">Rationale</h3>
        <p className="text-xs text-muted-foreground">
          Built from the reasons you weighted and the decision you chose.
        </p>
        {editing && !locked ? (
          <Textarea
            rows={4}
            value={text}
            onChange={(e) => setManual(e.target.value)}
            onBlur={() => {
              note(`Rationale ${manual === null ? "unchanged" : "edited"}`);
              emit({});
            }}
          />
        ) : (
          <p className="text-[13px]">{text}</p>
        )}
        {!locked && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => {
                setEditing((e) => !e);
                lookAt("rationale");
              }}
            >
              {editing ? "Done" : "Edit"}
            </button>
            {manual !== null && (
              <button
                type="button"
                className="text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => {
                  setManual(null);
                  note("Rationale reset to the reasons");
                  emit({ manual: null });
                }}
              >
                Reset to my reasons
              </button>
            )}
          </div>
        )}
        {!locked && (
          <Input
            placeholder="Add a note"
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            onBlur={() => emit({})}
          />
        )}
        {locked && own && <p className="text-xs">{own}</p>}
      </Card>

      {(hasChange || (locked && lesson)) && data.nextTimeOptions.length > 0 && (
        <Card>
          <h3 className="flex items-center text-base font-semibold">
            Next time
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.nextTimeOptions.map((l) => (
              <button
                key={l.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  const next = lesson === l.id ? null : l.id;
                  setLesson(next);
                  note(`Next time ${next ? "picked" : "cleared"}: ${l.text}`);
                  emit({ lesson: next });
                }}
                className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left ${lesson === l.id ? "border-2 border-primary bg-primary/5" : "border border-dashed border-muted-foreground/50 hover:border-primary"}`}
              >
                <span className="text-[13px] font-semibold">{l.text}</span>
                <span className="text-[11px] text-muted-foreground">
                  {l.basis}
                </span>
              </button>
            ))}
          </div>
          {lesson && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Applies to
                </span>
                <div className="inline-flex rounded-lg bg-muted p-0.5">
                  {SCOPES.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        setScope(x.id);
                        note(`Scope: ${x.label}`);
                        emit({ scope: x.id });
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${scope === x.id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>
              {scope === "like" && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Claims that
                  </span>
                  {data.conditionOptions.map((k) => (
                    <Pill
                      key={k.id}
                      disabled={locked}
                      on={!!conds[k.id]}
                      onClick={() => {
                        const next = { ...conds, [k.id]: !conds[k.id] };
                        setConds(next);
                        emit({ conds: next });
                      }}
                    >
                      {conds[k.id] ? "✓" : "+"} {k.label}
                    </Pill>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      <Card>
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b px-3 py-2 text-sm font-semibold">
            What changed
          </div>
          {changes.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              No changes made to the recommended decision.
            </p>
          ) : (
            changes.map((c, i) => (
              <div
                key={i}
                className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 border-b px-3 py-2 text-xs last:border-b-0"
              >
                <span className="text-muted-foreground">{c.part}</span>
                <span className="flex flex-wrap items-center gap-1.5">
                  {c.subj && <span className="font-semibold">{c.subj} ·</span>}
                  {c.from && (
                    <span className="text-muted-foreground line-through">
                      {c.from}
                    </span>
                  )}
                  {c.from && <span>→</span>}
                  <span>{c.to}</span>
                  {c.how && (
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {c.how}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
        {!locked && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-3">
            {blocked && (
              <p className="min-w-0 flex-1 text-xs font-semibold">
                No decision selected.
              </p>
            )}
            <Button disabled={blocked || busy} onClick={submit}>
              {decision ? `Complete as ${label(decision)}` : "Complete"}
            </Button>
          </div>
        )}
        {locked && (
          <p className="border-t pt-3 text-xs font-semibold">
            {decision ? `Completed as ${label(decision)}` : "Completed"}
          </p>
        )}

        <div className="rounded-xl border">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
          >
            What gets recorded
            <span className="font-normal">{open ? "Hide" : "Show"}</span>
          </button>
          {open && (
            <div className="space-y-3 border-t p-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[11px]">
                  <thead className="text-muted-foreground">
                    <tr>
                      {[
                        "Part",
                        "Proposed",
                        "Submitted",
                        "How much it changed",
                        "Source",
                        "Looked at",
                        "Scope",
                      ].map((h) => (
                        <th key={h} className="px-1.5 py-1 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((x) => (
                      <tr key={x.part} className="align-top">
                        <td className="px-1.5 py-1">{x.part}</td>
                        <td className="px-1.5 py-1 text-muted-foreground">
                          {x.proposed.length > 40
                            ? `${x.proposed.slice(0, 40)}...`
                            : x.proposed}
                        </td>
                        <td className="px-1.5 py-1">
                          {x.submitted.length > 40
                            ? `${x.submitted.slice(0, 40)}...`
                            : x.submitted}
                        </td>
                        <td className="px-1.5 py-1">{x.howMuch}</td>
                        <td className="px-1.5 py-1 text-muted-foreground">
                          {x.source || "—"}
                        </td>
                        <td className="px-1.5 py-1">
                          {x.lookedAt ? "Yes" : "No"}
                        </td>
                        <td className="px-1.5 py-1">{x.scope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div>
                  Reviewer:{" "}
                  {reviewerId || "recorded by Action Center on completion"} ·
                  Time on task: {secs}s
                </div>
                <div>
                  Order of changes:{" "}
                  {log.length
                    ? log
                        .map((e) => `${e.step}. ${e.what} (${e.atSecond}s)`)
                        .join(" · ")
                    : "none yet"}
                </div>
                <div>
                  On screen at the last change:{" "}
                  {log.length && log[log.length - 1].lookedAt.length
                    ? log[log.length - 1].lookedAt.join(", ")
                    : "no reason opened"}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
