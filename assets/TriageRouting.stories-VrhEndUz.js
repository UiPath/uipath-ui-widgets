import{j as n}from"./jsx-runtime-C5WNSv3b.js";/* empty css                            */import{c as V}from"./compiler-runtime-CdRayByh.js";import{r as Y}from"./iframe-CCkhsDGV.js";import{a as Z}from"./card-D3H7FrKi.js";import{B as ee,c as re}from"./button-SFMwP8Up.js";import{u as ne,s as z,p as ae,r as te,b as ie,O as se,c as oe}from"./useDecisionCapture-BMnTNrlA.js";import{C as le}from"./ConfidenceBadge-DDcr7X0V.js";import{C as ue}from"./ConfirmButton-CJbQH9yb.js";import{P as de}from"./PartReasons-BbzBBtYV.js";import{C as me}from"./CompletionBadge-DYeCTxDd.js";import{R as ge}from"./ReviewSummary-BtaYAxfk.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-CXQpkIOQ.js";import"./input-BUvFRMBF.js";import"./form-field-CTESAaTx.js";import"./index-BbaDf3V7.js";import"./index-kvVkqLY4.js";import"./index-DCAqwLtD.js";import"./alert-DecksOzW.js";import"./collapsible-Bkyww2kK.js";import"./table-Dc02mG3f.js";import"./ContextHeader-CpYeDU9m.js";const J=k=>{const e=V.c(38),{label:r,part:t,reasonOptions:q,showConfidence:h}=k,{locked:a,pick:i}=ne();let o;e[0]!==r.label?(o=n.jsx("span",{className:"text-sm font-semibold",children:r.label}),e[0]=r.label,e[1]=o):o=e[1];let l;e[2]!==r.confidence||e[3]!==h?(l=h&&r.confidence!==void 0&&n.jsx(le,{confidence:r.confidence}),e[2]=r.confidence,e[3]=h,e[4]=l):l=e[4];let m;e[5]!==o||e[6]!==l?(m=n.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[o,l]}),e[5]=o,e[6]=l,e[7]=m):m=e[7];let g;e[8]!==r.id?(g=z.evidence(r.id),e[8]=r.id,e[9]=g):g=e[9];let s;e[10]!==r.proposed||e[11]!==r.reason||e[12]!==g?(s=n.jsxs("p",{className:"text-xs text-muted-foreground",...g,children:["Proposed ",r.proposed,": ",r.reason]}),e[10]=r.proposed,e[11]=r.reason,e[12]=g,e[13]=s):s=e[13];let u;if(e[14]!==r.id||e[15]!==r.options||e[16]!==r.proposed||e[17]!==a||e[18]!==t||e[19]!==i){let f;e[21]!==r.id||e[22]!==r.proposed||e[23]!==a||e[24]!==t||e[25]!==i?(f=p=>n.jsxs(ee,{...z.field(r.id),variant:"outline",size:"xs",disabled:a,"aria-pressed":t.value===p,onClick:()=>i(r.id,p),className:re("gap-1.5",t.value===p?"border-primary bg-primary/5 ring-2 ring-primary/25":"hover:border-primary/40"),children:[p,p===r.proposed&&n.jsx("span",{className:"text-muted-foreground",children:"Proposed"})]},p),e[21]=r.id,e[22]=r.proposed,e[23]=a,e[24]=t,e[25]=i,e[26]=f):f=e[26],u=r.options.map(f),e[14]=r.id,e[15]=r.options,e[16]=r.proposed,e[17]=a,e[18]=t,e[19]=i,e[20]=u}else u=e[20];let y;e[27]!==u?(y=n.jsx("div",{className:"flex flex-wrap gap-1.5",children:u}),e[27]=u,e[28]=y):y=e[28];let c;e[29]!==r.changeReasons||e[30]!==t||e[31]!==q?(c=ae(t)?n.jsx(de,{part:t,question:`Why ${t.value}?`,options:r.changeReasons??q}):n.jsx(ue,{part:t,idleLabel:"Looks right"}),e[29]=r.changeReasons,e[30]=t,e[31]=q,e[32]=c):c=e[32];let R;return e[33]!==m||e[34]!==s||e[35]!==y||e[36]!==c?(R=n.jsxs("div",{className:"space-y-2 border-b border-border-de-emp p-3 last:border-b-0",children:[m,s,y,c]}),e[33]=m,e[34]=s,e[35]=y,e[36]=c,e[37]=R):R=e[37],R};J.__docgenInfo={description:"",methods:[],displayName:"LabelRow",props:{label:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons?: string[];
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"options",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"reason",value:{name:"string",required:!0}},{key:"changeReasons",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!1}}]}},description:""},part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
  value: string;
  follows?: string;
  looked: boolean;
  why: string | null;
  note: string;
}`,elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  kind: string;
  proposed: string;
  confidence?: number;
  source?: string;
  byOutcome?: Record<string, string>;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"source",value:{name:"string",required:!1}},{key:"byOutcome",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!1}}]}},{name:"signature",type:"object",raw:`{
  value: string;
  follows?: string;
  looked: boolean;
  why: string | null;
  note: string;
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""},showConfidence:{required:!0,tsType:{name:"boolean"},description:""}}};const ce=[{id:"Confirm",label:"Confirm",description:"Apply the labels and route the item.",recommended:!0},{id:"SendBack",label:"Send back",description:"Return the item for more information.",reasons:["Missing details","Needs a reply from the requester","Belongs to another process","Other"]}];function Q(k){const e=V.c(63),{title:r,subtitle:t,facts:q,excerpt:h,proposedBy:a,labels:i,show:o,copy:l,aside:m,className:g,renderField:s,reasonOptions:u,outcomes:y,readOnly:c,reviewerId:R,saved:f,onChange:p,onComplete:$}=k;let M;e[0]!==q?(M=q===void 0?[]:q,e[0]=q,e[1]=M):M=e[1];const K=M;let E;e[2]!==o?(E=o===void 0?{}:o,e[2]=o,e[3]=E):E=e[3];const w=E;let F;e[4]!==u?(F=u===void 0?[]:u,e[4]=u,e[5]=F):F=e[5];const B=F,T=y===void 0?ce:y,x=R===void 0?"":R,C=l?.outcome??"Outcome";let j;e[6]!==T?(j=te(T),e[6]=T,e[7]=j):j=e[7];let A;if(e[8]!==i||e[9]!==a){let v;e[11]!==a?(v=d=>({id:`reason-${d.id}`,title:d.reason,detail:`Proposed ${d.label.toLowerCase()}: ${d.proposed}`,partId:d.id,source:a,confidence:d.confidence}),e[11]=a,e[12]=v):v=e[12],A=i.map(v),e[8]=i,e[9]=a,e[10]=A}else A=e[10];let N;e[13]!==T||e[14]!==a||e[15]!==j||e[16]!==A?(N={outcomes:T,recommended:j,proposedBy:a,reasons:A},e[13]=T,e[14]=a,e[15]=j,e[16]=A,e[17]=N):N=e[17];let L;e[18]!==i?(L=i.map(pe),e[18]=i,e[19]=L):L=e[19];let H;e[20]!==p||e[21]!==$||e[22]!==c||e[23]!==x||e[24]!==f||e[25]!==N||e[26]!==L?(H={spec:N,seeds:L,readOnly:c,reviewerId:x,saved:f,onChange:p,onComplete:$},e[20]=p,e[21]=$,e[22]=c,e[23]=x,e[24]=f,e[25]=N,e[26]=L,e[27]=H):H=e[27];const b=ie(H);let P;e[28]!==h||e[29]!==K||e[30]!==a||e[31]!==t||e[32]!==r?(P=n.jsx(ge,{title:r,subtitle:t,proposedBy:a,proposedByVerb:"Labelled by",facts:K,excerpt:h}),e[28]=h,e[29]=K,e[30]=a,e[31]=t,e[32]=r,e[33]=P):P=e[33];let U;e[34]===Symbol.for("react.memo_cache_sentinel")?(U=n.jsx("h3",{className:"text-base font-semibold",children:"Proposed labels"}),e[34]=U):U=e[34];let S;if(e[35]!==i||e[36]!==b||e[37]!==B||e[38]!==s||e[39]!==w.confidence){let v;e[41]!==b||e[42]!==B||e[43]!==s||e[44]!==w.confidence?(v=d=>{const G=b.findPart(d.id);if(!G)return null;const X=n.jsx(J,{label:d,part:G,reasonOptions:B,showConfidence:w.confidence!==!1});return n.jsx(Y.Fragment,{children:s?s(d,X):X},d.id)},e[41]=b,e[42]=B,e[43]=s,e[44]=w.confidence,e[45]=v):v=e[45],S=i.map(v),e[35]=i,e[36]=b,e[37]=B,e[38]=s,e[39]=w.confidence,e[40]=S}else S=e[40];let O;e[46]!==S?(O=n.jsxs(Z,{className:"space-y-3 p-5",children:[U,n.jsx("div",{className:"rounded-lg border border-border-de-emp",children:S})]}),e[46]=S,e[47]=O):O=e[47];let W;e[48]!==C?(W=n.jsx(se,{noun:C}),e[48]=C,e[49]=W):W=e[49];let I;e[50]!==l||e[51]!==C||e[52]!==x||e[53]!==w.record?(I=n.jsx(me,{noun:C,copy:l,showRecord:w.record,reviewerId:x}),e[50]=l,e[51]=C,e[52]=x,e[53]=w.record,e[54]=I):I=e[54];let D;return e[55]!==m||e[56]!==g||e[57]!==b||e[58]!==P||e[59]!==O||e[60]!==W||e[61]!==I?(D=n.jsxs(oe,{model:b,aside:m,className:g,children:[P,O,W,I]}),e[55]=m,e[56]=g,e[57]=b,e[58]=P,e[59]=O,e[60]=W,e[61]=I,e[62]=D):D=e[62],D}function pe(k){return{id:k.id,label:k.label,kind:"classification",proposed:k.proposed,confidence:k.confidence}}Q.__docgenInfo={description:"",methods:[],displayName:"TriageRouting",props:{title:{required:!0,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},facts:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ label: string; value: string }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}],raw:"ReviewFact[]"},description:""},excerpt:{required:!1,tsType:{name:"string"},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""},outcomes:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  requiresReason?: boolean;
  requiresCoverage?: boolean;
  blendsReasons?: boolean;
  reasons?: readonly string[];
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"description",value:{name:"string",required:!0}},{key:"recommended",value:{name:"boolean",required:!1}},{key:"requiresReason",value:{name:"boolean",required:!1}},{key:"requiresCoverage",value:{name:"boolean",required:!1}},{key:"blendsReasons",value:{name:"boolean",required:!1}},{key:"reasons",value:{name:"unknown",required:!1}}]}}],raw:"ReviewOutcome[]"},description:""},reasonOptions:{required:!1,tsType:{name:"unknown"},description:""},show:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  confidence?: boolean;
  citation?: boolean;
  qcLane?: boolean;
  nextTime?: boolean;
  comparison?: boolean;
  record?: boolean;
}`,signature:{properties:[{key:"confidence",value:{name:"boolean",required:!1}},{key:"citation",value:{name:"boolean",required:!1}},{key:"qcLane",value:{name:"boolean",required:!1}},{key:"nextTime",value:{name:"boolean",required:!1}},{key:"comparison",value:{name:"boolean",required:!1}},{key:"record",value:{name:"boolean",required:!1}}]}},description:""},copy:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  outcome?: string;
  complete?: string;
  extracted?: string;
  record?: string;
}`,signature:{properties:[{key:"outcome",value:{name:"string",required:!1}},{key:"complete",value:{name:"string",required:!1}},{key:"extracted",value:{name:"string",required:!1}},{key:"record",value:{name:"string",required:!1}}]}},description:""},aside:{required:!1,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},readOnly:{required:!1,tsType:{name:"boolean"},description:""},reviewerId:{required:!1,tsType:{name:"string"},description:""},saved:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  outcome?: string;
  outcomeWhy?: string;
  values?: Record<string, string>;
  whys?: Record<string, WhyPick>;
  weights?: Record<string, Weight>;
  reasonWhys?: Record<string, WhyPick>;
  lesson?: string;
  scope?: ScopeId;
  conditions?: string[];
  tags?: string[];
}`,signature:{properties:[{key:"outcome",value:{name:"string",required:!1}},{key:"outcomeWhy",value:{name:"string",required:!1}},{key:"values",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!1}},{key:"whys",value:{name:"Record",elements:[{name:"string"},{name:"signature",type:"object",raw:"{ why: string | null; note: string }",signature:{properties:[{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}],raw:"Record<string, WhyPick>",required:!1}},{key:"weights",value:{name:"Record",elements:[{name:"string"},{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}]}],raw:"Record<string, Weight>",required:!1}},{key:"reasonWhys",value:{name:"Record",elements:[{name:"string"},{name:"signature",type:"object",raw:"{ why: string | null; note: string }",signature:{properties:[{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}],raw:"Record<string, WhyPick>",required:!1}},{key:"lesson",value:{name:"string",required:!1}},{key:"scope",value:{name:"union",raw:'"this" | "like" | "always"',elements:[{name:"literal",value:'"this"'},{name:"literal",value:'"like"'},{name:"literal",value:'"always"'}],required:!1}},{key:"conditions",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!1}},{key:"tags",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!1}}]}},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(payload: ReviewPayload) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  decision: string | null;
  reasons: PayloadReason[];
  taskTags: string[];
  rationaleText: string;
  decidingReasons: string[];
  fields: PayloadField[];
  nextTimeId: string;
  nextTimeText: string;
  nextTimeScope: string;
  nextTimeConditions: string[];
  changes: string[];
  record: CaptureRecordRow[];
  reviewerId: string;
  timeOnTaskSeconds: number;
  changeLog: CaptureLogEntry[];
}`,signature:{properties:[{key:"decision",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"reasons",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  title: string;
  detail: string;
  supports: string;
  proposedWeight: Weight;
  weight: Weight;
  source?: string;
  sourceConfidence?: number;
  added?: boolean;
  notRelevantWhy?: string;
  notRelevantNote?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"title",value:{name:"string",required:!0}},{key:"detail",value:{name:"string",required:!0}},{key:"supports",value:{name:"string",required:!0}},{key:"proposedWeight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"source",value:{name:"string",required:!1}},{key:"sourceConfidence",value:{name:"number",required:!1}},{key:"added",value:{name:"boolean",required:!1}},{key:"notRelevantWhy",value:{name:"string",required:!1}},{key:"notRelevantNote",value:{name:"string",required:!1}}]}}],raw:"PayloadReason[]",required:!0}},{key:"taskTags",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"rationaleText",value:{name:"string",required:!0}},{key:"decidingReasons",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"fields",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  kind: string;
  byDecision: Record<string, string>;
  value: string;
  setBy: SetBy;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"byDecision",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"setBy",value:{name:"union",raw:'"model" | "reviewer"',elements:[{name:"literal",value:'"model"'},{name:"literal",value:'"reviewer"'}],required:!0}}]}}],raw:"PayloadField[]",required:!0}},{key:"nextTimeId",value:{name:"string",required:!0}},{key:"nextTimeText",value:{name:"string",required:!0}},{key:"nextTimeScope",value:{name:"string",required:!0}},{key:"nextTimeConditions",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"changes",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"record",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  part: string;
  proposed: string;
  submitted: string;
  howMuch: Resolution;
  source: string;
  lookedAt: boolean;
  scope: string;
}`,signature:{properties:[{key:"part",value:{name:"string",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"submitted",value:{name:"string",required:!0}},{key:"howMuch",value:{name:"union",raw:`| "Kept"
| "Changed"
| "Rejected"
| "Added"
| "Untouched"`,elements:[{name:"literal",value:'"Kept"'},{name:"literal",value:'"Changed"'},{name:"literal",value:'"Rejected"'},{name:"literal",value:'"Added"'},{name:"literal",value:'"Untouched"'}],required:!0}},{key:"source",value:{name:"string",required:!0}},{key:"lookedAt",value:{name:"boolean",required:!0}},{key:"scope",value:{name:"string",required:!0}}]}}],raw:"CaptureRecordRow[]",required:!0}},{key:"reviewerId",value:{name:"string",required:!0}},{key:"timeOnTaskSeconds",value:{name:"number",required:!0}},{key:"changeLog",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
}`,signature:{properties:[{key:"step",value:{name:"number",required:!0}},{key:"what",value:{name:"string",required:!0}},{key:"atSecond",value:{name:"number",required:!0}},{key:"lookedAt",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}}],raw:"CaptureLogEntry[]",required:!0}}]}},name:"payload"}],return:{name:"void"}}},description:""},onComplete:{required:!0,tsType:{name:"signature",type:"function",raw:"(outcome: string, payload: ReviewPayload) => Promise<void> | void",signature:{arguments:[{type:{name:"string"},name:"outcome"},{type:{name:"signature",type:"object",raw:`{
  decision: string | null;
  reasons: PayloadReason[];
  taskTags: string[];
  rationaleText: string;
  decidingReasons: string[];
  fields: PayloadField[];
  nextTimeId: string;
  nextTimeText: string;
  nextTimeScope: string;
  nextTimeConditions: string[];
  changes: string[];
  record: CaptureRecordRow[];
  reviewerId: string;
  timeOnTaskSeconds: number;
  changeLog: CaptureLogEntry[];
}`,signature:{properties:[{key:"decision",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"reasons",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  title: string;
  detail: string;
  supports: string;
  proposedWeight: Weight;
  weight: Weight;
  source?: string;
  sourceConfidence?: number;
  added?: boolean;
  notRelevantWhy?: string;
  notRelevantNote?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"title",value:{name:"string",required:!0}},{key:"detail",value:{name:"string",required:!0}},{key:"supports",value:{name:"string",required:!0}},{key:"proposedWeight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"source",value:{name:"string",required:!1}},{key:"sourceConfidence",value:{name:"number",required:!1}},{key:"added",value:{name:"boolean",required:!1}},{key:"notRelevantWhy",value:{name:"string",required:!1}},{key:"notRelevantNote",value:{name:"string",required:!1}}]}}],raw:"PayloadReason[]",required:!0}},{key:"taskTags",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"rationaleText",value:{name:"string",required:!0}},{key:"decidingReasons",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"fields",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  kind: string;
  byDecision: Record<string, string>;
  value: string;
  setBy: SetBy;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"byDecision",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"setBy",value:{name:"union",raw:'"model" | "reviewer"',elements:[{name:"literal",value:'"model"'},{name:"literal",value:'"reviewer"'}],required:!0}}]}}],raw:"PayloadField[]",required:!0}},{key:"nextTimeId",value:{name:"string",required:!0}},{key:"nextTimeText",value:{name:"string",required:!0}},{key:"nextTimeScope",value:{name:"string",required:!0}},{key:"nextTimeConditions",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"changes",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"record",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  part: string;
  proposed: string;
  submitted: string;
  howMuch: Resolution;
  source: string;
  lookedAt: boolean;
  scope: string;
}`,signature:{properties:[{key:"part",value:{name:"string",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"submitted",value:{name:"string",required:!0}},{key:"howMuch",value:{name:"union",raw:`| "Kept"
| "Changed"
| "Rejected"
| "Added"
| "Untouched"`,elements:[{name:"literal",value:'"Kept"'},{name:"literal",value:'"Changed"'},{name:"literal",value:'"Rejected"'},{name:"literal",value:'"Added"'},{name:"literal",value:'"Untouched"'}],required:!0}},{key:"source",value:{name:"string",required:!0}},{key:"lookedAt",value:{name:"boolean",required:!0}},{key:"scope",value:{name:"string",required:!0}}]}}],raw:"CaptureRecordRow[]",required:!0}},{key:"reviewerId",value:{name:"string",required:!0}},{key:"timeOnTaskSeconds",value:{name:"number",required:!0}},{key:"changeLog",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  step: number;
  what: string;
  atSecond: number;
  lookedAt: string[];
}`,signature:{properties:[{key:"step",value:{name:"number",required:!0}},{key:"what",value:{name:"string",required:!0}},{key:"atSecond",value:{name:"number",required:!0}},{key:"lookedAt",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}}],raw:"CaptureLogEntry[]",required:!0}}]}},name:"payload"}],return:{name:"union",raw:"Promise<void> | void",elements:[{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"},{name:"void"}]}}},description:""},renderField:{required:!1,tsType:{name:"signature",type:"function",raw:"(field: Field, defaultNode: ReactNode) => ReactNode",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons?: string[];
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"options",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"reason",value:{name:"string",required:!0}},{key:"changeReasons",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!1}}]}},name:"field"},{type:{name:"ReactNode"},name:"defaultNode"}],return:{name:"ReactNode"}}},description:""},labels:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  options: string[];
  proposed: string;
  confidence?: number;
  reason: string;
  changeReasons?: string[];
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"options",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}},{key:"proposed",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"reason",value:{name:"string",required:!0}},{key:"changeReasons",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!1}}]}}],raw:"TriageLabel[]"},description:""}}};const ye={title:"Ticket TCK-30418",subtitle:"Cannot export monthly usage report since the update",proposedBy:"Ticket triage agent v2",facts:[{label:"Requester",value:"Finance Operations contact"},{label:"Channel",value:"Email"}],excerpt:"Since last night's update the monthly usage export fails with a timeout. Finance closes the books on Friday and we need the file before then.",labels:[{id:"category",label:"Category",options:["Reporting","Access","Billing","Integration","Other"],proposed:"Reporting",confidence:93,reason:"The request is about exporting a report.",changeReasons:["Root cause is elsewhere","Request covers two areas","Other"]},{id:"priority",label:"Priority",options:["Low","Normal","High","Urgent"],proposed:"Normal",confidence:71,reason:"No outage is described and a workaround may exist.",changeReasons:["Deadline is close","Many users affected","Not blocking anyone","Other"]},{id:"team",label:"Routing team",options:["Reporting support","Platform engineering","Finance systems","Customer success"],proposed:"Reporting support",confidence:84,reason:"Reporting exports are handled by this team.",changeReasons:["Needs an engineer","Customer is at risk","Other"]}]},ve=async()=>{},He={title:"Components/TriageRouting",parameters:{layout:"padded",docs:{description:{component:"The reviewer confirms or changes the labels the agent picked: one row per label with option chips and the agent's reason, and Confirm or Send back."}}},tags:["autodocs"]},_={render:()=>n.jsx(Q,{...ye,onComplete:ve})};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <TriageRouting {...FIXTURE_TRIAGE} onComplete={complete} />
}`,..._.parameters?.docs?.source}}};const Ue=["SupportTicket"];export{_ as SupportTicket,Ue as __namedExportsOrder,He as default};
