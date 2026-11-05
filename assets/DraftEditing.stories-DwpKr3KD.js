import{j as n}from"./jsx-runtime-C5WNSv3b.js";/* empty css                            */import{c as J}from"./compiler-runtime-CdRayByh.js";import{r as Q}from"./iframe-CCkhsDGV.js";import{a as re}from"./card-D3H7FrKi.js";import{B as ne}from"./badge-CXQpkIOQ.js";import{L as te}from"./form-field-CTESAaTx.js";import{p as ae,v as ie,r as se,b as oe,O as le,c as ue}from"./useDecisionCapture-BMnTNrlA.js";import{P as de}from"./PartReasons-BbzBBtYV.js";import{P as me}from"./ProposalInput-D8Y5x0d7.js";import{C as ge}from"./CompletionBadge-DYeCTxDd.js";import{R as ce}from"./ReviewSummary-BtaYAxfk.js";import"./preload-helper-PPVm8Dsz.js";import"./button-SFMwP8Up.js";import"./index-BbaDf3V7.js";import"./index-kvVkqLY4.js";import"./index-DCAqwLtD.js";import"./input-BUvFRMBF.js";import"./textarea-BB0xUawe.js";import"./alert-DecksOzW.js";import"./collapsible-Bkyww2kK.js";import"./table-Dc02mG3f.js";import"./ContextHeader-CpYeDU9m.js";const pe=8,ye={Kept:"Kept",Changed:"Edited",Rejected:"Cleared",Added:"Kept",Untouched:"Kept"},Y=g=>{const e=J.c(27),{part:r,show:k,reasonOptions:c}=g,o=Q.useId();let i;e[0]!==r?(i=ae(r),e[0]=r,e[1]=i):i=e[1];const t=i,p=ye[ie(r.proposed,r.value,!0)];let s;e[2]!==o||e[3]!==r.label?(s=n.jsx(te,{htmlFor:o,className:"text-xs font-medium text-muted-foreground",children:r.label}),e[2]=o,e[3]=r.label,e[4]=s):s=e[4];const q=t?"outline":"secondary";let l;e[5]!==p||e[6]!==q?(l=n.jsx(ne,{variant:q,children:p}),e[5]=p,e[6]=q,e[7]=l):l=e[7];let a;e[8]!==s||e[9]!==l?(a=n.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[s,l]}),e[8]=s,e[9]=l,e[10]=a):a=e[10];let d;e[11]!==o||e[12]!==r?(d=n.jsx(me,{part:r,id:o,rows:pe}),e[11]=o,e[12]=r,e[13]=d):d=e[13];let m;e[14]!==t||e[15]!==r.proposed||e[16]!==k?(m=t&&k.comparison!==!1&&n.jsxs("div",{className:"space-y-1 rounded-md bg-muted/50 p-2",children:[n.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Original draft"}),n.jsx("p",{className:"whitespace-pre-wrap text-xs",children:r.proposed})]}),e[14]=t,e[15]=r.proposed,e[16]=k,e[17]=m):m=e[17];let u;e[18]!==t||e[19]!==r||e[20]!==c?(u=t&&n.jsx(de,{part:r,question:`${r.label}: why the edit?`,options:c}),e[18]=t,e[19]=r,e[20]=c,e[21]=u):u=e[21];let f;return e[22]!==a||e[23]!==d||e[24]!==m||e[25]!==u?(f=n.jsxs("div",{className:"space-y-2",children:[a,d,m,u]}),e[22]=a,e[23]=d,e[24]=m,e[25]=u,e[26]=f):f=e[26],f};Y.__docgenInfo={description:"",methods:[],displayName:"DraftArea",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},show:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  confidence?: boolean;
  citation?: boolean;
  qcLane?: boolean;
  nextTime?: boolean;
  comparison?: boolean;
  record?: boolean;
}`,signature:{properties:[{key:"confidence",value:{name:"boolean",required:!1}},{key:"citation",value:{name:"boolean",required:!1}},{key:"qcLane",value:{name:"boolean",required:!1}},{key:"nextTime",value:{name:"boolean",required:!1}},{key:"comparison",value:{name:"boolean",required:!1}},{key:"record",value:{name:"boolean",required:!1}}]}},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""}}};const ve=["Wrong tone","Missing a step","Factual error","Too long","Other"],ke=[{id:"Send",label:"Send",description:"Send the text as it stands, with any edits you made.",recommended:!0},{id:"Revise",label:"Revise",description:"Return the draft to the agent to write again.",reasons:["Wrong tone","Missing information","Too long","Other"]},{id:"Reject",label:"Reject",description:"Do not send anything. Needs a reason.",requiresReason:!0,reasons:["Off topic","Answer is incorrect","A person should answer","Other"]}];function V(g){const e=J.c(57),{title:r,subtitle:k,facts:c,excerpt:o,proposedBy:i,fields:t,show:p,copy:s,aside:q,className:l,renderField:a,reasonOptions:d,outcomes:m,readOnly:u,reviewerId:f,saved:B,onChange:U,onComplete:K}=g;let I;e[0]!==c?(I=c===void 0?[]:c,e[0]=c,e[1]=I):I=e[1];const X=I;let L;e[2]!==p?(L=p===void 0?{}:p,e[2]=p,e[3]=L):L=e[3];const y=L,O=d===void 0?ve:d,w=m===void 0?ke:m,h=f===void 0?"":f,b=s?.outcome??"Outcome";let R;e[4]!==w?(R=se(w),e[4]=w,e[5]=R):R=e[5];let W;e[6]===Symbol.for("react.memo_cache_sentinel")?(W=[],e[6]=W):W=e[6];let x;e[7]!==w||e[8]!==i||e[9]!==R?(x={outcomes:w,recommended:R,proposedBy:i,reasons:W},e[7]=w,e[8]=i,e[9]=R,e[10]=x):x=e[10];let T;e[11]!==t?(T=t.map(qe),e[11]=t,e[12]=T):T=e[12];let P;e[13]!==U||e[14]!==K||e[15]!==u||e[16]!==h||e[17]!==B||e[18]!==T||e[19]!==x?(P={spec:x,seeds:T,readOnly:u,reviewerId:h,saved:B,onChange:U,onComplete:K},e[13]=U,e[14]=K,e[15]=u,e[16]=h,e[17]=B,e[18]=T,e[19]=x,e[20]=P):P=e[20];const v=oe(P);let j;e[21]!==o||e[22]!==X||e[23]!==i||e[24]!==k||e[25]!==r?(j=n.jsx(ce,{title:r,subtitle:k,proposedBy:i,proposedByVerb:"Drafted by",facts:X,excerpt:o}),e[21]=o,e[22]=X,e[23]=i,e[24]=k,e[25]=r,e[26]=j):j=e[26];let E,D;e[27]===Symbol.for("react.memo_cache_sentinel")?(E=n.jsx("h3",{className:"text-base font-semibold",children:"Draft"}),D=n.jsx("p",{className:"text-xs text-muted-foreground",children:"Edit the text if it needs changing. The original is kept."}),e[27]=E,e[28]=D):(E=e[27],D=e[28]);let A;if(e[29]!==t||e[30]!==v||e[31]!==O||e[32]!==a||e[33]!==y){let H;e[35]!==v||e[36]!==O||e[37]!==a||e[38]!==y?(H=$=>{const z=v.findPart($.id);if(!z)return null;const G=n.jsx(Y,{part:z,show:y,reasonOptions:O});return n.jsx(Q.Fragment,{children:a?a($,G):G},$.id)},e[35]=v,e[36]=O,e[37]=a,e[38]=y,e[39]=H):H=e[39],A=t.map(H),e[29]=t,e[30]=v,e[31]=O,e[32]=a,e[33]=y,e[34]=A}else A=e[34];let C;e[40]!==A?(C=n.jsxs(re,{className:"space-y-4 p-5",children:[E,D,A]}),e[40]=A,e[41]=C):C=e[41];let N;e[42]!==b?(N=n.jsx(le,{noun:b}),e[42]=b,e[43]=N):N=e[43];let S;e[44]!==s||e[45]!==b||e[46]!==h||e[47]!==y.record?(S=n.jsx(ge,{noun:b,copy:s,showRecord:y.record,reviewerId:h}),e[44]=s,e[45]=b,e[46]=h,e[47]=y.record,e[48]=S):S=e[48];let F;return e[49]!==q||e[50]!==l||e[51]!==v||e[52]!==j||e[53]!==C||e[54]!==N||e[55]!==S?(F=n.jsxs(ue,{model:v,aside:q,className:l,children:[j,C,N,S]}),e[49]=q,e[50]=l,e[51]=v,e[52]=j,e[53]=C,e[54]=N,e[55]=S,e[56]=F):F=e[56],F}function qe(g){return{id:g.id,label:g.label,kind:"long",proposed:g.value,confidence:g.confidence}}V.__docgenInfo={description:"",methods:[],displayName:"DraftEditing",props:{title:{required:!0,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},facts:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ label: string; value: string }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}],raw:"ReviewFact[]"},description:""},excerpt:{required:!1,tsType:{name:"string"},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""},outcomes:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
  value: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}}]}},name:"field"},{type:{name:"ReactNode"},name:"defaultNode"}],return:{name:"ReactNode"}}},description:""},fields:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  value: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}}]}}],raw:"ValueField[]"},description:""}}};const Z={title:"Help channel question HC-20418",subtitle:"How do I export last month's usage report?",proposedBy:"Support reply agent v1",facts:[{label:"Channel",value:"Help channel"},{label:"Plan",value:"Team plan"}],excerpt:"Hi, I need last month's usage report as a spreadsheet for my finance team. I can only find a chart on the dashboard. Where do I get the file?",fields:[{id:"reply",label:"Reply",value:"Hi there, thanks for asking. Open Reports, choose Usage, pick last month in the date range and select Export. The file arrives as a spreadsheet within a few minutes and the download link stays valid for 7 days. If the export button is greyed out, your role may not include report access, so ask a workspace admin to add it."}]},ee=async()=>{},Be={title:"Components/DraftEditing",parameters:{layout:"padded",docs:{description:{component:"The reviewer accepts, edits or rewrites text the agent wrote. The draft sits in an editable area with the original kept, an indicator says whether it is kept, lightly edited or rewritten, reason chips say why it was edited, and the outcomes are Send, Revise and Reject."}}},tags:["autodocs"]},M={render:()=>n.jsx(V,{...Z,onComplete:ee})},_={render:()=>n.jsx(V,{...Z,readOnly:!0,saved:{outcome:"Send"},onComplete:ee})};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <DraftEditing {...FIXTURE_DRAFT} onComplete={complete} />
}`,...M.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <DraftEditing {...FIXTURE_DRAFT} readOnly saved={{
    outcome: "Send"
  }} onComplete={complete} />
}`,..._.parameters?.docs?.source}}};const Ue=["HelpChannelReply","ReadOnly"];export{M as HelpChannelReply,_ as ReadOnly,Ue as __namedExportsOrder,Be as default};
