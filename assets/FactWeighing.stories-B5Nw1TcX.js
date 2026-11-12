import{j as r}from"./jsx-runtime-C5WNSv3b.js";/* empty css                            */import{c as z}from"./compiler-runtime-B41XdyN3.js";import{r as V}from"./iframe-Bh9byxgT.js";import{B as ye}from"./badge-EiGk-JCa.js";import{a as te}from"./card-CRWnTABd.js";import{c as K,B as ie}from"./button-C4enX704.js";import{s as X,u as se,f as ve,r as fe,b as he,O as ke,c as be}from"./useDecisionCapture-CNqXEajz.js";import{A as qe,a as xe}from"./alert-COkPGhX8.js";import{L as we}from"./form-field-hIRz2wKi.js";import{T as Re}from"./textarea-BdgeOup_.js";import{R as je}from"./ReasonTags-DyNIweIY.js";import"./preload-helper-PPVm8Dsz.js";import"./input-BMQwtUTn.js";import"./toggle-C5V6cF9E.js";import"./portal-container-C0bKXk-o.js";import"./index-B9gdMoSG.js";import"./index-DNNFOvnr.js";import"./dropdown-menu-Cm6-_ioq.js";import"./index-lqiv1lgs.js";import"./Combination-DsQqCGeZ.js";import"./tslib.es6-DOyTwyrN.js";import"./circle-CuoprLZn.js";const Ne=[{id:"Strongly fraud",label:"Strongly fraud",side:"fraud"},{id:"Leans fraud",label:"Leans fraud",side:"fraud"},{id:"Not relevant",label:"Not relevant",side:"neutral"},{id:"Leans legitimate",label:"Leans legitimate",side:"legitimate"},{id:"Strongly legitimate",label:"Strongly legitimate",side:"legitimate"}],Te=[{id:"Approve",label:"Approve",description:"Ship the order"},{id:"Decline",label:"Decline",description:"Cancel the order and refund the payment"}],Ae=["Legitimate customer","Legitimate in-store retry","Screen false positive","Promo abuse or reseller ring","Account takeover","Card testing or stolen card","Other"],le="grid grid-cols-[minmax(0,1fr)_7rem_repeat(5,2.75rem)] gap-x-1",Se={fraud:"border-[#8a5a3c] bg-[#8a5a3c]",neutral:"border-muted-foreground bg-muted-foreground",legitimate:"border-[#2f7d4f] bg-[#2f7d4f]"},Ce={fraud:"border-[#8a5a3c]",neutral:"border-muted-foreground",legitimate:"border-[#2f7d4f]"},ue=o=>{const e=z.c(10),{factId:t,factLabel:i,value:a,agentRead:n,disabled:s,onPick:d}=o;let v;e[0]!==n||e[1]!==s||e[2]!==t||e[3]!==i||e[4]!==d||e[5]!==a?(v=Ne.map(l=>{const m=a===l.id,g=n===l.id;return r.jsx("div",{className:"flex justify-center",children:r.jsx("button",{type:"button",role:"radio","aria-checked":m,"aria-label":`${i}: ${l.label}${g?", agent's read":""}`,...X.field(t),disabled:s,onClick:()=>d(l.id),className:K("size-5 rounded-full border bg-transparent border-border-de-emp",g&&K("border-[3px]",Ce[l.side]),m&&K("border-2",Se[l.side]),!s&&"hover:ring-2 hover:ring-primary/25")})},l.id)}),e[0]=n,e[1]=s,e[2]=t,e[3]=i,e[4]=d,e[5]=a,e[6]=v):v=e[6];let u;return e[7]!==i||e[8]!==v?(u=r.jsx("div",{role:"radiogroup","aria-label":i,className:"contents",children:v}),e[7]=i,e[8]=v,e[9]=u):u=e[9],u};ue.__docgenInfo={description:"",methods:[],displayName:"ScaleCell",props:{factId:{required:!0,tsType:{name:"string"},description:""},factLabel:{required:!0,tsType:{name:"string"},description:""},value:{required:!0,tsType:{name:"string"},description:""},agentRead:{required:!0,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},onPick:{required:!0,tsType:{name:"signature",type:"function",raw:"(position: string) => void",signature:{arguments:[{type:{name:"string"},name:"position"}],return:{name:"void"}}},description:""}}};const oe=o=>{const e=z.c(33),{item:t}=o,{findPart:i,locked:a,pick:n}=se();let s;e[0]!==i||e[1]!==t.id?(s=i(t.id),e[0]=i,e[1]=t.id,e[2]=s):s=e[2];const d=s,v=!!t.agentRead;let u;e[3]!==t.id?(u=X.evidence(t.id),e[3]=t.id,e[4]=u):u=e[4];let l;e[5]===Symbol.for("react.memo_cache_sentinel")?(l=K(le,"items-center border-t border-border-de-emp py-2"),e[5]=l):l=e[5];const m=v?"font-semibold":"font-normal";let g;e[6]!==m?(g=K("text-sm",m),e[6]=m,e[7]=g):g=e[7];let f;e[8]!==t.label||e[9]!==g?(f=r.jsx("div",{className:g,children:t.label}),e[8]=t.label,e[9]=g,e[10]=f):f=e[10];let p;e[11]!==t.subtitle?(p=t.subtitle&&r.jsx("div",{className:"text-xs text-muted-foreground",children:t.subtitle}),e[11]=t.subtitle,e[12]=p):p=e[12];let h;e[13]!==f||e[14]!==p?(h=r.jsxs("div",{className:"min-w-0 pr-3",children:[f,p]}),e[13]=f,e[14]=p,e[15]=h):h=e[15];let c;e[16]!==t.value?(c=r.jsx("div",{className:"min-w-0 break-words pr-3 text-right font-mono text-xs",children:t.value}),e[16]=t.value,e[17]=c):c=e[17];const k=d?.looked?d.value:"",x=t.agentRead??"";let y;e[18]!==t.id||e[19]!==n?(y=q=>n(t.id,q),e[18]=t.id,e[19]=n,e[20]=y):y=e[20];let b;e[21]!==t.id||e[22]!==t.label||e[23]!==a||e[24]!==k||e[25]!==x||e[26]!==y?(b=r.jsx(ue,{factId:t.id,factLabel:t.label,value:k,agentRead:x,disabled:a,onPick:y}),e[21]=t.id,e[22]=t.label,e[23]=a,e[24]=k,e[25]=x,e[26]=y,e[27]=b):b=e[27];let R;return e[28]!==b||e[29]!==u||e[30]!==h||e[31]!==c?(R=r.jsxs("div",{...u,className:l,children:[h,c,b]}),e[28]=b,e[29]=u,e[30]=h,e[31]=c,e[32]=R):R=e[32],R};oe.__docgenInfo={description:"",methods:[],displayName:"FactRow",props:{item:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  value: string;
  agentRead?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"subtitle",value:{name:"string",required:!1}},{key:"value",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!1}}]}},description:""}}};const ee=(o,e,t)=>{const i=new Map(o.fields.map(a=>[a.id,a]));return{...o,facts:e.map(a=>{const n=i.get(a.id);return{id:a.id,label:a.label,group:a.group,agentRead:a.agentRead??"",weight:n?.value??"",setBy:n?.setBy??"model"}}),rationale:t}},Fe=(o,e)=>[!o&&"a decision",e===0&&"a reason"].filter(t=>!!t),_e=o=>[...new Set(o.map(e=>e.group))].map(e=>({group:e,items:o.filter(t=>t.group===e)})),de=o=>{const e=z.c(17),{items:t,renderField:i}=o;let a;e[0]!==t.length?(a=r.jsxs("h3",{className:"text-base font-semibold",children:["All facts (",t.length,")"]}),e[0]=t.length,e[1]=a):a=e[1];let n;e[2]===Symbol.for("react.memo_cache_sentinel")?(n=r.jsxs("span",{className:"flex items-center gap-1",children:[r.jsx("span",{className:"size-3 rounded-full border-[3px] border-muted-foreground"}),"Agent's read"]}),e[2]=n):n=e[2];let s;e[3]===Symbol.for("react.memo_cache_sentinel")?(s=r.jsxs("p",{className:"flex items-center gap-3 text-xs text-muted-foreground",children:[n,r.jsxs("span",{className:"flex items-center gap-1",children:[r.jsx("span",{className:"size-3 rounded-full border-2 border-muted-foreground bg-muted-foreground"}),"Yours"]})]}),e[3]=s):s=e[3];let d;e[4]!==a?(d=r.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[a,s]}),e[4]=a,e[5]=d):d=e[5];let v;e[6]===Symbol.for("react.memo_cache_sentinel")?(v=r.jsxs("div",{className:K(le,"items-end pb-1 text-xs font-semibold text-muted-foreground"),children:[r.jsx("span",{children:"Fact"}),r.jsx("span",{className:"pr-3 text-right",children:"Value"}),r.jsx("span",{className:"col-span-2 text-center",children:"Fraud"}),r.jsx("span",{className:"text-center",children:"Not relevant"}),r.jsx("span",{className:"col-span-2 text-center",children:"Legitimate"})]}),e[6]=v):v=e[6];let u;if(e[7]!==t||e[8]!==i){let g;e[10]!==i?(g=f=>{const{group:p,items:h}=f;return r.jsxs(V.Fragment,{children:[r.jsx("div",{className:"pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:p}),h.map(c=>{const k=r.jsx(oe,{item:c});return r.jsx(V.Fragment,{children:i?i(c,k):k},c.id)})]},p)},e[10]=i,e[11]=g):g=e[11],u=_e(t).map(g),e[7]=t,e[8]=i,e[9]=u}else u=e[9];let l;e[12]!==u?(l=r.jsx("div",{className:"overflow-x-auto",children:r.jsxs("div",{className:"min-w-136",children:[v,u]})}),e[12]=u,e[13]=l):l=e[13];let m;return e[14]!==d||e[15]!==l?(m=r.jsxs(te,{className:"space-y-3 p-5",children:[d,l]}),e[14]=d,e[15]=l,e[16]=m):m=e[16],m};de.__docgenInfo={description:"",methods:[],displayName:"FactTable",props:{items:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  value: string;
  agentRead?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"subtitle",value:{name:"string",required:!1}},{key:"value",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!1}}]}}],raw:"FactItem[]"},description:""},renderField:{required:!0,tsType:{name:'FactWeighingProps["renderField"]',raw:'FactWeighingProps["renderField"]'},description:""}}};const Le=2,me=o=>{const e=z.c(52),{options:t,rationale:i,payload:a,onRationale:n}=o,s=V.useId(),[d,v]=V.useState(!1),{spec:u,outcome:l,locked:m,busy:g,error:f,submit:p,state:h}=se();let c,k,x,y,b,R;if(e[0]!==g||e[1]!==f||e[2]!==s||e[3]!==m||e[4]!==n||e[5]!==t||e[6]!==l||e[7]!==i||e[8]!==u.outcomes||e[9]!==h.added.length||e[10]!==p){const F=Fe(l,h.added.length);let A;e[17]!==l||e[18]!==u.outcomes?(A=ve(u.outcomes,l),e[17]=l,e[18]=u.outcomes,e[19]=A):A=e[19];const _=A;c=te,k="space-y-3 p-5",e[20]===Symbol.for("react.memo_cache_sentinel")?(x=r.jsxs("div",{children:[r.jsx("h3",{className:"text-base font-semibold",children:"Rationale"}),r.jsx("p",{className:"text-xs text-muted-foreground",children:"Why this decision? Pick at least one reason."})]}),e[20]=x):x=e[20],e[21]!==t?(y=r.jsx(je,{options:t}),e[21]=t,e[22]=y):y=e[22];let S;e[23]!==s?(S=r.jsx(we,{htmlFor:s,className:"text-xs font-medium text-muted-foreground",children:"Your reason, in your own words"}),e[23]=s,e[24]=S):S=e[24];let w;e[25]!==n||e[26]!==i?(w=G=>n({...i,text:G.target.value}),e[25]=n,e[26]=i,e[27]=w):w=e[27];let C;e[28]!==s||e[29]!==m||e[30]!==i.text||e[31]!==w?(C=r.jsx(Re,{id:s,rows:3,...X.rationale,disabled:m,value:i.text,onChange:w}),e[28]=s,e[29]=m,e[30]=i.text,e[31]=w,e[32]=C):C=e[32],e[33]!==S||e[34]!==C?(b=r.jsxs("div",{className:"space-y-1",children:[S,C]}),e[33]=S,e[34]=C,e[35]=b):b=e[35],R=m?r.jsxs("p",{className:"border-t border-border-de-emp pt-3 text-xs font-semibold",children:["Completed",_&&r.jsxs(r.Fragment,{children:[" as ",_.label]})]}):r.jsxs("div",{className:"space-y-3 border-t border-border-de-emp pt-3",children:[f&&r.jsx(qe,{variant:"destructive",children:r.jsx(xe,{children:f})}),r.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[r.jsx("p",{className:"min-w-0 flex-1 text-xs text-muted-foreground",children:F.length>0&&r.jsxs(r.Fragment,{children:["Still needed: ",F.join(", ")]})}),r.jsx(ie,{disabled:F.length>0||g,onClick:p,children:"Submit"})]})]}),e[0]=g,e[1]=f,e[2]=s,e[3]=m,e[4]=n,e[5]=t,e[6]=l,e[7]=i,e[8]=u.outcomes,e[9]=h.added.length,e[10]=p,e[11]=c,e[12]=k,e[13]=x,e[14]=y,e[15]=b,e[16]=R}else c=e[11],k=e[12],x=e[13],y=e[14],b=e[15],R=e[16];let q;e[36]===Symbol.for("react.memo_cache_sentinel")?(q=()=>v(Ie),e[36]=q):q=e[36];const Y=d?"Hide what gets saved":"Show what gets saved";let j;e[37]!==d||e[38]!==Y?(j=r.jsx(ie,{variant:"link",className:"h-auto p-0 text-xs","aria-expanded":d,onClick:q,children:Y}),e[37]=d,e[38]=Y,e[39]=j):j=e[39];let N;e[40]!==d||e[41]!==a?(N=d&&r.jsx("pre",{className:"max-h-96 overflow-auto rounded-md bg-muted/50 p-2 text-xs",children:JSON.stringify(a(),null,Le)}),e[40]=d,e[41]=a,e[42]=N):N=e[42];let T;return e[43]!==c||e[44]!==k||e[45]!==x||e[46]!==y||e[47]!==b||e[48]!==R||e[49]!==j||e[50]!==N?(T=r.jsxs(c,{className:k,children:[x,y,b,R,j,N]}),e[43]=c,e[44]=k,e[45]=x,e[46]=y,e[47]=b,e[48]=R,e[49]=j,e[50]=N,e[51]=T):T=e[51],T};me.__docgenInfo={description:"",methods:[],displayName:"RationaleCard",props:{options:{required:!0,tsType:{name:"unknown"},description:""},rationale:{required:!0,tsType:{name:"signature",type:"object",raw:"{ text: string }",signature:{properties:[{key:"text",value:{name:"string",required:!0}}]}},description:""},payload:{required:!0,tsType:{name:"signature",type:"function",raw:"() => FactWeighingPayload",signature:{arguments:[],return:{name:"intersection",raw:`ReviewPayload & {
  facts: FactWeight[];
  rationale: FactRationale;
}`,elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"step",value:{name:"number",required:!0}},{key:"what",value:{name:"string",required:!0}},{key:"atSecond",value:{name:"number",required:!0}},{key:"lookedAt",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}}],raw:"CaptureLogEntry[]",required:!0}}]}},{name:"signature",type:"object",raw:`{
  facts: FactWeight[];
  rationale: FactRationale;
}`,signature:{properties:[{key:"facts",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  group: string;
  agentRead: string;
  weight: string;
  setBy: SetBy;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!0}},{key:"weight",value:{name:"string",required:!0}},{key:"setBy",value:{name:"union",raw:'"model" | "reviewer"',elements:[{name:"literal",value:'"model"'},{name:"literal",value:'"reviewer"'}],required:!0}}]}}],raw:"FactWeight[]",required:!0}},{key:"rationale",value:{name:"signature",type:"object",raw:"{ text: string }",signature:{properties:[{key:"text",value:{name:"string",required:!0}}]},required:!0}}]}}]}}},description:""},onRationale:{required:!0,tsType:{name:"signature",type:"function",raw:"(next: FactRationale) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:"{ text: string }",signature:{properties:[{key:"text",value:{name:"string",required:!0}}]}},name:"next"}],return:{name:"void"}}},description:""}}};function Ie(o){return!o}const Pe=({risk:o,confidence:e})=>[{name:"Risk",value:o?.toFixed(2)},{name:"Confidence",value:e}].filter(t=>!!t.value),ge=o=>{const e=z.c(20),{recommendation:t,proposedBy:i}=o,{outcome:a,reason:n,evidence:s}=t;let d;e[0]===Symbol.for("react.memo_cache_sentinel")?(d=X.evidence("recommendation"),e[0]=d):d=e[0];const v=i?`${i} recommends`:"Agent recommends";let u;e[1]!==v?(u=r.jsx("h3",{className:"text-base font-semibold",children:v}),e[1]=v,e[2]=u):u=e[2];let l;e[3]!==a?(l=r.jsx("span",{className:"text-lg font-semibold",children:a}),e[3]=a,e[4]=l):l=e[4];let m;e[5]!==t?(m=Pe(t).map(We),e[5]=t,e[6]=m):m=e[6];let g;e[7]!==l||e[8]!==m?(g=r.jsxs("p",{className:"flex flex-wrap items-baseline gap-x-3 text-sm",children:[l,m]}),e[7]=l,e[8]=m,e[9]=g):g=e[9];let f;e[10]===Symbol.for("react.memo_cache_sentinel")?(f=r.jsx("span",{className:"text-muted-foreground",children:"Reason "}),e[10]=f):f=e[10];let p;e[11]!==n?(p=r.jsxs("p",{className:"text-xs",children:[f,n]}),e[11]=n,e[12]=p):p=e[12];let h;e[13]!==s?(h=s.length>0&&r.jsx("ul",{className:"list-disc space-y-0.5 pl-4 text-xs text-muted-foreground",children:s.map(Oe)}),e[13]=s,e[14]=h):h=e[14];let c;return e[15]!==u||e[16]!==g||e[17]!==p||e[18]!==h?(c=r.jsxs(te,{className:"space-y-2 p-5",...d,children:[u,g,p,h]}),e[15]=u,e[16]=g,e[17]=p,e[18]=h,e[19]=c):c=e[19],c};ge.__docgenInfo={description:"",methods:[],displayName:"RecommendationCard",props:{recommendation:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  outcome: string;
  risk?: number;
  confidence?: string;
  reason: string;
  evidence: string[];
}`,signature:{properties:[{key:"outcome",value:{name:"string",required:!0}},{key:"risk",value:{name:"number",required:!1}},{key:"confidence",value:{name:"string",required:!1}},{key:"reason",value:{name:"string",required:!0}},{key:"evidence",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""}}};function We(o){const{name:e,value:t}=o;return r.jsxs("span",{className:"text-xs text-muted-foreground",children:[e," ",r.jsx("span",{className:"font-semibold text-foreground",children:t})]},e)}function Oe(o){return r.jsx("li",{children:o},o)}const Be={text:""};function ce(o){const e=z.c(73),{title:t,subtitle:i,proposedBy:a,items:n,recommendation:s,ruleStatus:d,outcomes:v,reasonOptions:u,copy:l,aside:m,className:g,renderField:f,readOnly:p,reviewerId:h,saved:c,onChange:k,onComplete:x}=o,y=v===void 0?Te:v,b=u===void 0?Ae:u,R=h===void 0?"":h,[q,Y]=V.useState(Be);let j;e[0]!==y||e[1]!==s?(j=y.find(L=>L.id===s.outcome)?.id??fe(y),e[0]=y,e[1]=s,e[2]=j):j=e[2];let N;e[3]===Symbol.for("react.memo_cache_sentinel")?(N=[],e[3]=N):N=e[3];let T;e[4]!==y||e[5]!==a||e[6]!==j?(T={outcomes:y,recommended:j,proposedBy:a,reasons:N},e[4]=y,e[5]=a,e[6]=j,e[7]=T):T=e[7];let F;e[8]!==n?(F=n.map(Ee),e[8]=n,e[9]=F):F=e[9];let A;e[10]!==n||e[11]!==k||e[12]!==q?(A=L=>k?.(ee(L,n,q)),e[10]=n,e[11]=k,e[12]=q,e[13]=A):A=e[13];let _;e[14]!==n||e[15]!==x||e[16]!==q?(_=(L,pe)=>x(L,ee(pe,n,q)),e[14]=n,e[15]=x,e[16]=q,e[17]=_):_=e[17];let S;e[18]!==p||e[19]!==R||e[20]!==c||e[21]!==T||e[22]!==F||e[23]!==A||e[24]!==_?(S={spec:T,seeds:F,readOnly:p,reviewerId:R,saved:c,onChange:A,onComplete:_},e[18]=p,e[19]=R,e[20]=c,e[21]=T,e[22]=F,e[23]=A,e[24]=_,e[25]=S):S=e[25];const w=he(S);let C;e[26]!==n||e[27]!==w||e[28]!==q?(C=()=>ee(w.payload(),n,q),e[26]=n,e[27]=w,e[28]=q,e[29]=C):C=e[29];const G=C;let J;e[30]!==n||e[31]!==w||e[32]!==k?(J=L=>{Y(L),k?.(ee(w.payload(),n,L))},e[30]=n,e[31]=w,e[32]=k,e[33]=J):J=e[33];const ne=J;let Q;e[34]===Symbol.for("react.memo_cache_sentinel")?(Q=X.evidence("context"),e[34]=Q):Q=e[34];let I;e[35]!==t?(I=r.jsx("h2",{className:"text-lg font-semibold",children:t}),e[35]=t,e[36]=I):I=e[36];let P;e[37]!==d?(P=d&&r.jsx(ye,{variant:"outline",children:d}),e[37]=d,e[38]=P):P=e[38];let W;e[39]!==I||e[40]!==P?(W=r.jsxs("div",{className:"flex items-start justify-between gap-2",children:[I,P]}),e[39]=I,e[40]=P,e[41]=W):W=e[41];let O;e[42]!==i?(O=i&&r.jsx("p",{className:"text-xs text-muted-foreground",children:i}),e[42]=i,e[43]=O):O=e[43];let B;e[44]!==W||e[45]!==O?(B=r.jsxs(te,{className:"space-y-1 p-5",...Q,children:[W,O]}),e[44]=W,e[45]=O,e[46]=B):B=e[46];let E;e[47]!==n||e[48]!==f?(E=r.jsx(de,{items:n,renderField:f}),e[47]=n,e[48]=f,e[49]=E):E=e[49];let D;e[50]!==a||e[51]!==s?(D=r.jsx(ge,{recommendation:s,proposedBy:a}),e[50]=a,e[51]=s,e[52]=D):D=e[52];const ae=l?.outcome??"Decision";let M;e[53]!==ae?(M=r.jsx(ke,{noun:ae}),e[53]=ae,e[54]=M):M=e[54];let H;e[55]!==q||e[56]!==b||e[57]!==ne||e[58]!==G?(H=r.jsx(me,{options:b,rationale:q,payload:G,onRationale:ne}),e[55]=q,e[56]=b,e[57]=ne,e[58]=G,e[59]=H):H=e[59];let U;e[60]!==D||e[61]!==M||e[62]!==H?(U=r.jsxs("div",{className:"min-w-0 space-y-4",children:[D,M,H]}),e[60]=D,e[61]=M,e[62]=H,e[63]=U):U=e[63];let $;e[64]!==E||e[65]!==U?($=r.jsxs("div",{className:"grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]",children:[E,U]}),e[64]=E,e[65]=U,e[66]=$):$=e[66];let Z;return e[67]!==m||e[68]!==g||e[69]!==w||e[70]!==B||e[71]!==$?(Z=r.jsxs(be,{model:w,aside:m,className:g,stacked:!0,children:[B,$]}),e[67]=m,e[68]=g,e[69]=w,e[70]=B,e[71]=$,e[72]=Z):Z=e[72],Z}function Ee(o){return{id:o.id,label:o.label,kind:"fact",proposed:o.agentRead??""}}ce.__docgenInfo={description:"",methods:[],displayName:"FactWeighing",props:{renderField:{required:!1,tsType:{name:"signature",type:"function",raw:"(field: Field, defaultNode: ReactNode) => ReactNode",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  value: string;
  agentRead?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"subtitle",value:{name:"string",required:!1}},{key:"value",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!1}}]}},name:"field"},{type:{name:"ReactNode"},name:"defaultNode"}],return:{name:"ReactNode"}}},description:""},items:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  subtitle?: string;
  value: string;
  agentRead?: string;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"subtitle",value:{name:"string",required:!1}},{key:"value",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!1}}]}}],raw:"FactItem[]"},description:""},recommendation:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  outcome: string;
  risk?: number;
  confidence?: string;
  reason: string;
  evidence: string[];
}`,signature:{properties:[{key:"outcome",value:{name:"string",required:!0}},{key:"risk",value:{name:"number",required:!1}},{key:"confidence",value:{name:"string",required:!1}},{key:"reason",value:{name:"string",required:!0}},{key:"evidence",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}},description:""},ruleStatus:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(payload: FactWeighingPayload) => void",signature:{arguments:[{type:{name:"intersection",raw:`ReviewPayload & {
  facts: FactWeight[];
  rationale: FactRationale;
}`,elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"step",value:{name:"number",required:!0}},{key:"what",value:{name:"string",required:!0}},{key:"atSecond",value:{name:"number",required:!0}},{key:"lookedAt",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}}],raw:"CaptureLogEntry[]",required:!0}}]}},{name:"signature",type:"object",raw:`{
  facts: FactWeight[];
  rationale: FactRationale;
}`,signature:{properties:[{key:"facts",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  group: string;
  agentRead: string;
  weight: string;
  setBy: SetBy;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!0}},{key:"weight",value:{name:"string",required:!0}},{key:"setBy",value:{name:"union",raw:'"model" | "reviewer"',elements:[{name:"literal",value:'"model"'},{name:"literal",value:'"reviewer"'}],required:!0}}]}}],raw:"FactWeight[]",required:!0}},{key:"rationale",value:{name:"signature",type:"object",raw:"{ text: string }",signature:{properties:[{key:"text",value:{name:"string",required:!0}}]},required:!0}}]}}]},name:"payload"}],return:{name:"void"}}},description:""},onComplete:{required:!0,tsType:{name:"signature",type:"function",raw:`(
  outcome: string,
  payload: FactWeighingPayload,
) => Promise<void> | void`,signature:{arguments:[{type:{name:"string"},name:"outcome"},{type:{name:"intersection",raw:`ReviewPayload & {
  facts: FactWeight[];
  rationale: FactRationale;
}`,elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"step",value:{name:"number",required:!0}},{key:"what",value:{name:"string",required:!0}},{key:"atSecond",value:{name:"number",required:!0}},{key:"lookedAt",value:{name:"Array",elements:[{name:"string"}],raw:"string[]",required:!0}}]}}],raw:"CaptureLogEntry[]",required:!0}}]}},{name:"signature",type:"object",raw:`{
  facts: FactWeight[];
  rationale: FactRationale;
}`,signature:{properties:[{key:"facts",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  group: string;
  agentRead: string;
  weight: string;
  setBy: SetBy;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"agentRead",value:{name:"string",required:!0}},{key:"weight",value:{name:"string",required:!0}},{key:"setBy",value:{name:"union",raw:'"model" | "reviewer"',elements:[{name:"literal",value:'"model"'},{name:"literal",value:'"reviewer"'}],required:!0}}]}}],raw:"FactWeight[]",required:!0}},{key:"rationale",value:{name:"signature",type:"object",raw:"{ text: string }",signature:{properties:[{key:"text",value:{name:"string",required:!0}}]},required:!0}}]}}]},name:"payload"}],return:{name:"union",raw:"Promise<void> | void",elements:[{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"},{name:"void"}]}}},description:""}},composes:["Omit"]};const De={title:"Review order ORD1018653",subtitle:"Placed 2026-10-21 14:32 UTC · Customer CUS-5530194",ruleStatus:"Rule table v0: no row matched",proposedBy:"Fraud screening agent",recommendation:{outcome:"Decline",risk:.93,confidence:"high",reason:"Shipping address was used by three other accounts this week and the card failed twice before this attempt.",evidence:["Shipping address shared with 3 accounts in 7 days","2 declined card attempts in the last hour","Account created 4 minutes before the order"]},items:[{id:"order-total",group:"Order",label:"Order total",subtitle:"Typical customer average is 96.00",value:"1,284.00",agentRead:"Leans fraud"},{id:"order-items",group:"Order",label:"Items",value:"6 units, 2 SKUs"},{id:"promo-code",group:"Order",label:"Promo code",subtitle:"Used on 41 orders this month",value:"WELCOME25"},{id:"account-age",group:"Account",label:"Account age",value:"4 minutes",agentRead:"Strongly fraud"},{id:"prior-orders",group:"Account",label:"Prior orders",value:"0",agentRead:"Leans fraud"},{id:"email-domain",group:"Account",label:"Email domain",value:"mailbox-temp.example"},{id:"card-attempts",group:"Payment",label:"Card attempts",subtitle:"Last hour",value:"3 (2 declined)",agentRead:"Strongly fraud"},{id:"billing-match",group:"Payment",label:"Billing address match",value:"Matches card issuer",agentRead:"Leans legitimate"},{id:"device-known",group:"Device and address",label:"Device seen before",value:"No"},{id:"shared-address",group:"Device and address",label:"Shipping address shared",subtitle:"Other accounts, last 7 days",value:"3 accounts",agentRead:"Strongly fraud"},{id:"ip-region",group:"Device and address",label:"IP region",value:"Same region as shipping",agentRead:"Leans legitimate"}]},Me=async()=>{},mr={title:"Components/FactWeighing",parameters:{layout:"padded",docs:{description:{component:"The reviewer weighs each fact on a five-point scale from fraud to legitimate, next to the agent's read, then decides and picks at least one reason from a dropdown, or types their own."}}},tags:["autodocs"]},re={render:()=>r.jsx(ce,{...De,onComplete:Me})};re.parameters={...re.parameters,docs:{...re.parameters?.docs,source:{originalSource:`{
  render: () => <FactWeighing {...FIXTURE_FACTS} onComplete={complete} />
}`,...re.parameters?.docs?.source}}};const gr=["OrderFraudScreen"];export{re as OrderFraudScreen,gr as __namedExportsOrder,mr as default};
