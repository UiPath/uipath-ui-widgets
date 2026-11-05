import{j as i}from"./jsx-runtime-C5WNSv3b.js";/* empty css                            */import{c as Y}from"./compiler-runtime-CdRayByh.js";import{r as ge}from"./iframe-CCkhsDGV.js";import{B as de}from"./badge-CXQpkIOQ.js";import{a as fe}from"./card-D3H7FrKi.js";import{B as qe,c as he}from"./button-SFMwP8Up.js";import{a as Pe,T as Ie}from"./toggle-group-BYlgAanh.js";import{s as ee,d as Ee,p as be,u as Me,r as Le,b as _e,c as $e,O as Be}from"./useDecisionCapture-BMnTNrlA.js";import{C as We}from"./ConfidenceBadge-DDcr7X0V.js";import{P as Fe}from"./PartReasons-BbzBBtYV.js";import{L as Ue}from"./form-field-CTESAaTx.js";import{P as He}from"./ProposalInput-D8Y5x0d7.js";import{C as De,a as Xe}from"./CompletionBadge-DYeCTxDd.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BbaDf3V7.js";import"./index-kvVkqLY4.js";import"./index-DCAqwLtD.js";import"./index-C1yDo2Ww.js";import"./input-BUvFRMBF.js";import"./textarea-BB0xUawe.js";import"./alert-DecksOzW.js";import"./collapsible-Bkyww2kK.js";import"./table-Dc02mG3f.js";const we=s=>{const e=Y.c(17),{citation:r,onOpen:n}=s,[t,a]=ge.useState(!1);let o;e[0]!==r||e[1]!==n||e[2]!==t?(o=()=>{a(!t),t||n?.(r)},e[0]=r,e[1]=n,e[2]=t,e[3]=o):o=e[3];const l=o;let g;e[4]!==r.document||e[5]!==r.page||e[6]!==t||e[7]!==l?(g=i.jsxs(qe,{variant:"link","aria-expanded":t,className:"h-auto p-0 text-xs",onClick:l,children:[r.document," · page ",r.page]}),e[4]=r.document,e[5]=r.page,e[6]=t,e[7]=l,e[8]=g):g=e[8];let d;e[9]!==r.after||e[10]!==r.before||e[11]!==r.highlight||e[12]!==t?(d=t&&i.jsxs("p",{...ee.evidence("citation"),className:"rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground",children:[r.before,i.jsx("mark",{className:"rounded bg-warning-background px-0.5 text-foreground",children:r.highlight}),r.after]}),e[9]=r.after,e[10]=r.before,e[11]=r.highlight,e[12]=t,e[13]=d):d=e[13];let c;return e[14]!==g||e[15]!==d?(c=i.jsxs("div",{className:"space-y-1",children:[g,d]}),e[14]=g,e[15]=d,e[16]=c):c=e[16],c};we.__docgenInfo={description:"",methods:[],displayName:"CitationLink",props:{citation:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]}},description:""},onOpen:{required:!1,tsType:{name:"signature",type:"function",raw:"(citation: ComparisonCitation) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]}},name:"citation"}],return:{name:"void"}}},description:""}}};const xe=s=>{const e=Y.c(9),{part:r,label:n}=s,t=ge.useId();let a;e[0]!==t||e[1]!==n?(a=i.jsx(Ue,{htmlFor:t,className:"text-xs font-medium text-muted-foreground",children:n}),e[0]=t,e[1]=n,e[2]=a):a=e[2];let o;e[3]!==t||e[4]!==r?(o=i.jsx(He,{part:r,id:t}),e[3]=t,e[4]=r,e[5]=o):o=e[5];let l;return e[6]!==a||e[7]!==o?(l=i.jsxs("div",{className:"space-y-1",children:[a,o]}),e[6]=a,e[7]=o,e[8]=l):l=e[8],l};xe.__docgenInfo={description:"",methods:[],displayName:"CorrectedValue",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},label:{required:!0,tsType:{name:"string"},description:""}}};const ce=s=>{const e=Y.c(9),{label:r,value:n}=s;let t;e[0]!==r?(t=i.jsx("p",{className:"mb-1 text-xs font-medium text-muted-foreground",children:r}),e[0]=r,e[1]=t):t=e[1];let a;e[2]!==n?(a=Ee(n),e[2]=n,e[3]=a):a=e[3];let o;e[4]!==a?(o=i.jsx("p",{className:"break-words text-xs",children:a}),e[4]=a,e[5]=o):o=e[5];let l;return e[6]!==t||e[7]!==o?(l=i.jsxs("div",{className:"min-w-0 flex-1 rounded-lg border border-border-de-emp bg-background px-3 py-2",children:[t,o]}),e[6]=t,e[7]=o,e[8]=l):l=e[8],l};ce.__docgenInfo={description:"",methods:[],displayName:"ValuePanel",props:{label:{required:!0,tsType:{name:"string"},description:""},value:{required:!0,tsType:{name:"string"},description:""}}};const ze="Needs review",Ge=["Correct","Extraction wrong","System value wrong"],Ke=["Misread number","Superseded by an amendment","Wrong clause cited","System record out of date","Other"],Ce={id:"Bypass",label:"Bypass",description:"Close without a full review. Needs a reason.",requiresReason:!0,reasons:["Out of scope","Reviewed outside this task","Escalated to the agreement owner","Other"]},Qe=[{id:"Complete",label:"Complete review",description:"Every field needs a verdict first.",recommended:!0,requiresCoverage:!0},{id:"Reject",label:"Reject",description:"Stop the review, for example when the documents are unusable. Needs a reason.",requiresReason:!0,reasons:["Documents incomplete","Wrong agreement uploaded","Unreadable source","Other"]},Ce],Je=[{id:"Complete",label:"Complete audit",description:"Every field needs a verdict first.",recommended:!0,requiresCoverage:!0},{id:"Fail",label:"Fail",description:"The reviewer's verdicts cannot be relied on. Needs a reason.",requiresReason:!0,reasons:["Verdicts unreliable","Systematic extraction issue","Other"]},Ce],Z=s=>({verdict:`${s.id}:verdict`,contract:`${s.id}:contract`,system:`${s.id}:system`}),ke=s=>s.trim().toLowerCase(),pe=s=>ke(s.extractedValue)===ke(s.recordValue),Ye=(s,e,r)=>s.flatMap(n=>{const t=Z(n),a=e?n.reviewer:void 0,o=pe(n)?"Correct":ze;return[{id:t.verdict,label:n.label,kind:"verdict",proposed:a?a.verdict:o,confidence:n.confidence},{id:t.contract,label:`${n.label} · ${r.extracted.toLowerCase()}`,kind:"contractValue",proposed:a?.extractedValue??n.extractedValue},{id:t.system,label:`${n.label} · ${r.record.toLowerCase()}`,kind:"systemValue",proposed:a?.recordValue??n.recordValue}]}),Ze=(s,e)=>s.flatMap(r=>r.evidence?[{id:`evidence-${r.id}`,title:r.evidence,detail:`${pe(r)?"Match":"Mismatch"} on ${r.label}`,partId:Z(r).verdict,source:e,confidence:r.confidence}]:[]),Re=(s,e)=>s==="Extraction wrong"?e.contract:s==="System value wrong"?e.system:null,er=(s,e,r,n)=>{const t=Z(s);return r[t.verdict]?e?Object.values(t).some(o=>{const l=n(o);return!!l&&be(l)})?"flagged":"validated":n(t.verdict)?.value==="Correct"?"validated":"flagged":"pending"},rr=s=>{const e=r=>s.filter(n=>n===r).length;return{validated:e("validated"),flagged:e("flagged"),pending:e("pending")}},tr=(s,e,r)=>{const n=Z(s),t=r(n.verdict);if(!t||e&&t.value===t.proposed)return!1;const a=Re(t.value,n),o=a?r(a):void 0;return!!o&&o.value===o.proposed},nr=(s,e)=>r=>{const n=new Map(r.map(l=>[l.id,l])),t=l=>n.get(l),a=s.filter(l=>!t(Z(l).verdict)?.looked);if(a.length)return`${a.length} ${a.length===1?"field":"fields"} still ${e?"to audit":"to review"}.`;const o=s.find(l=>tr(l,e,t));return o?`Add the corrected value for ${o.label}.`:null},ar={pending:["Not reviewed","Not audited"],validated:["Validated","Agreed"],flagged:["Flagged","Disputed"]},je=s=>{const e=Y.c(85),{field:r,ids:n,status:t,qc:a,show:o,labels:l,reasonOptions:g,onOpenCitation:d}=s,{locked:c,looked:T,getPart:N,pickMany:_}=Me();let x,C,b,k,f,p,u,S,m,v;if(e[0]!==r||e[1]!==N||e[2]!==n||e[3]!==l.extracted||e[4]!==l.record||e[5]!==c||e[6]!==T||e[7]!==d||e[8]!==_||e[9]!==a||e[10]!==o.citation||e[11]!==o.comparison||e[12]!==o.confidence||e[13]!==t){v=N(n.verdict);const w=!!T[n.verdict],h=a?r.reviewer:void 0;let V;e[24]!==r?(V=pe(r),e[24]=r,e[25]=V):V=e[25];const R=V,F=a&&w&&t==="flagged";x=w&&(a?F:v.value!=="Correct");const B=Re(v.value,n),D=B===n.contract?l.extracted:l.record,j=o.comparison!==!1,A=y=>_({[n.verdict]:y,[n.contract]:null,[n.system]:null},n.verdict,`Field: ${r.label}, verdict ${v.value} → ${y}`);C="field-card",b="space-y-3 rounded-lg bg-muted/40 p-4";let O;e[26]!==r.label?(O=i.jsx("span",{className:"text-sm font-semibold",children:r.label}),e[26]=r.label,e[27]=O):O=e[27];let P;e[28]!==R||e[29]!==j?(P=j&&i.jsx(de,{variant:R?"secondary":"outline",children:R?"Match":"Mismatch"}),e[28]=R,e[29]=j,e[30]=P):P=e[30];let I;e[31]!==r.confidence||e[32]!==o.confidence?(I=o.confidence!==!1&&r.confidence!==void 0&&i.jsx(We,{confidence:r.confidence}),e[31]=r.confidence,e[32]=o.confidence,e[33]=I):I=e[33];let E;e[34]!==h?(E=h&&i.jsxs(de,{variant:"outline",children:["Reviewer: ",h.verdict]}),e[34]=h,e[35]=E):E=e[35];const W=ar[t][a?1:0];let M;e[36]!==W?(M=i.jsx("span",{className:"ml-auto text-xs text-muted-foreground",children:W}),e[36]=W,e[37]=M):M=e[37],e[38]!==O||e[39]!==P||e[40]!==I||e[41]!==E||e[42]!==M?(k=i.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[O,P,I,E,M]}),e[38]=O,e[39]=P,e[40]=I,e[41]=E,e[42]=M,e[43]=k):k=e[43],e[44]!==r.extractedValue||e[45]!==r.recordValue||e[46]!==R||e[47]!==l.extracted||e[48]!==l.record||e[49]!==j?(f=j&&i.jsxs("div",{className:"flex items-stretch gap-2",children:[i.jsx(ce,{label:l.extracted,value:r.extractedValue}),i.jsx("span",{"aria-hidden":"true",className:"self-center text-xs font-semibold text-muted-foreground",children:R?"=":"≠"}),i.jsx(ce,{label:l.record,value:r.recordValue})]}),e[44]=r.extractedValue,e[45]=r.recordValue,e[46]=R,e[47]=l.extracted,e[48]=l.record,e[49]=j,e[50]=f):f=e[50],e[51]!==r.evidence||e[52]!==r.id?(p=r.evidence&&i.jsxs("p",{...ee.evidence(r.id),className:"text-xs leading-relaxed text-muted-foreground",children:["Proposed: ",r.evidence]}),e[51]=r.evidence,e[52]=r.id,e[53]=p):p=e[53],e[54]!==r.citation||e[55]!==d||e[56]!==o.citation?(u=o.citation!==!1&&r.citation&&i.jsx(we,{citation:r.citation,onOpen:d}),e[54]=r.citation,e[55]=d,e[56]=o.citation,e[57]=u):u=e[57];let L;e[58]!==A||e[59]!==F||e[60]!==n.verdict||e[61]!==c||e[62]!==w||e[63]!==h?(L=h&&i.jsx(qe,{variant:"outline",size:"xs",...ee.field(n.verdict),disabled:c,"aria-pressed":w&&!F,onClick:()=>A(h.verdict),children:"Concur with reviewer"}),e[58]=A,e[59]=F,e[60]=n.verdict,e[61]=c,e[62]=w,e[63]=h,e[64]=L):L=e[64];let U;e[65]!==A?(U=y=>y&&A(y),e[65]=A,e[66]=U):U=e[66];let q;e[67]!==n.verdict?(q=Ge.map(y=>i.jsx(Pe,{value:y,...ee.field(n.verdict),children:y},y)),e[67]=n.verdict,e[68]=q):q=e[68],S=i.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[L,i.jsx(Ie,{type:"single",variant:"outline",size:"xs",disabled:c,value:w?v.value:"",onValueChange:U,"aria-label":`Verdict for ${r.label}`,children:q})]}),m=w&&B&&i.jsx(xe,{part:N(B),label:`Corrected ${D.toLowerCase()}`}),e[0]=r,e[1]=N,e[2]=n,e[3]=l.extracted,e[4]=l.record,e[5]=c,e[6]=T,e[7]=d,e[8]=_,e[9]=a,e[10]=o.citation,e[11]=o.comparison,e[12]=o.confidence,e[13]=t,e[14]=x,e[15]=C,e[16]=b,e[17]=k,e[18]=f,e[19]=p,e[20]=u,e[21]=S,e[22]=m,e[23]=v}else x=e[14],C=e[15],b=e[16],k=e[17],f=e[18],p=e[19],u=e[20],S=e[21],m=e[22],v=e[23];let $;e[69]!==r.label||e[70]!==x||e[71]!==a||e[72]!==g||e[73]!==v?($=x&&i.jsx(Fe,{part:v,question:`${r.label}: ${a?"why dispute":"note"}?`,options:g}),e[69]=r.label,e[70]=x,e[71]=a,e[72]=g,e[73]=v,e[74]=$):$=e[74];let H;return e[75]!==C||e[76]!==b||e[77]!==k||e[78]!==f||e[79]!==p||e[80]!==u||e[81]!==S||e[82]!==m||e[83]!==$?(H=i.jsxs("div",{"data-testid":C,className:b,children:[k,f,p,u,S,m,$]}),e[75]=C,e[76]=b,e[77]=k,e[78]=f,e[79]=p,e[80]=u,e[81]=S,e[82]=m,e[83]=$,e[84]=H):H=e[84],H};je.__docgenInfo={description:"",methods:[],displayName:"ComparisonRow",props:{field:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  extractedValue: string;
  recordValue: string;
  confidence?: number;
  evidence?: string;
  citation?: ComparisonCitation;
  reviewer?: {
    verdict: ComparisonVerdict;
    extractedValue?: string;
    recordValue?: string;
  };
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"extractedValue",value:{name:"string",required:!0}},{key:"recordValue",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"evidence",value:{name:"string",required:!1}},{key:"citation",value:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]},required:!1}},{key:"reviewer",value:{name:"signature",type:"object",raw:`{
  verdict: ComparisonVerdict;
  extractedValue?: string;
  recordValue?: string;
}`,signature:{properties:[{key:"verdict",value:{name:"union",raw:`| "Correct"
| "Extraction wrong"
| "System value wrong"`,elements:[{name:"literal",value:'"Correct"'},{name:"literal",value:'"Extraction wrong"'},{name:"literal",value:'"System value wrong"'}],required:!0}},{key:"extractedValue",value:{name:"string",required:!1}},{key:"recordValue",value:{name:"string",required:!1}}]},required:!1}}]}},description:""},ids:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  verdict: string;
  contract: string;
  system: string;
}`,signature:{properties:[{key:"verdict",value:{name:"string",required:!0}},{key:"contract",value:{name:"string",required:!0}},{key:"system",value:{name:"string",required:!0}}]}},description:""},status:{required:!0,tsType:{name:"union",raw:'"validated" | "flagged" | "pending"',elements:[{name:"literal",value:'"validated"'},{name:"literal",value:'"flagged"'},{name:"literal",value:'"pending"'}]},description:""},qc:{required:!0,tsType:{name:"boolean"},description:""},show:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  confidence?: boolean;
  citation?: boolean;
  qcLane?: boolean;
  nextTime?: boolean;
  comparison?: boolean;
  record?: boolean;
}`,signature:{properties:[{key:"confidence",value:{name:"boolean",required:!1}},{key:"citation",value:{name:"boolean",required:!1}},{key:"qcLane",value:{name:"boolean",required:!1}},{key:"nextTime",value:{name:"boolean",required:!1}},{key:"comparison",value:{name:"boolean",required:!1}},{key:"record",value:{name:"boolean",required:!1}}]}},description:""},labels:{required:!0,tsType:{name:"Required",elements:[{name:"Pick",elements:[{name:"signature",type:"object",raw:`{
  outcome?: string;
  complete?: string;
  extracted?: string;
  record?: string;
}`,signature:{properties:[{key:"outcome",value:{name:"string",required:!1}},{key:"complete",value:{name:"string",required:!1}},{key:"extracted",value:{name:"string",required:!1}},{key:"record",value:{name:"string",required:!1}}]}},{name:"union",raw:'"extracted" | "record"',elements:[{name:"literal",value:'"extracted"'},{name:"literal",value:'"record"'}]}],raw:'Pick<ReviewCopy, "extracted" | "record">'}],raw:`Required<
  Pick<ReviewCopy, "extracted" | "record">
>`},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""},onOpenCitation:{required:!1,tsType:{name:"signature",type:"function",raw:"(citation: ComparisonCitation) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]}},name:"citation"}],return:{name:"void"}}},description:""}}};const ir=s=>[{status:"validated",label:s?"agreed":"validated",fill:"bg-success"},{status:"flagged",label:s?"disputed":"flagged",fill:"bg-warning"},{status:"pending",label:s?"not audited":"not reviewed",fill:"bg-border"}],Te=s=>{const e=Y.c(30),{counts:r,total:n,qc:t}=s;let a,o,l,g,d,c;if(e[0]!==r||e[1]!==t||e[2]!==n){const _=ir(t);l="space-y-2",g="completion-summary";const x=n-r.pending,C=t?"audited":"reviewed";e[9]!==x||e[10]!==C||e[11]!==n?(d=i.jsxs("span",{className:"block text-xs font-semibold tabular-nums",children:[x," of ",n," ",C]}),e[9]=x,e[10]=C,e[11]=n,e[12]=d):d=e[12];let b;e[13]!==r?(b=u=>`${r[u.status]} ${u.label}`,e[13]=r,e[14]=b):b=e[14];let k;e[15]!==r?(k=u=>r[u.status]>0,e[15]=r,e[16]=k):k=e[16];let f;e[17]!==r?(f=u=>i.jsx("div",{className:he("min-w-1",u.fill),style:{flexGrow:r[u.status]}},u.status),e[17]=r,e[18]=f):f=e[18],c=i.jsx("div",{role:"img","aria-label":_.map(b).join(", "),className:"flex h-2.5 gap-0.5 overflow-hidden rounded-full",children:_.filter(k).map(f)}),a="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs";let p;e[19]!==r?(p=u=>i.jsxs("span",{className:"inline-flex items-center gap-1.5",children:[i.jsx("span",{className:he("size-2 rounded-full",u.fill)}),i.jsx("span",{className:"font-medium tabular-nums",children:r[u.status]}),i.jsx("span",{className:"text-muted-foreground",children:u.label})]},u.status),e[19]=r,e[20]=p):p=e[20],o=_.map(p),e[0]=r,e[1]=t,e[2]=n,e[3]=a,e[4]=o,e[5]=l,e[6]=g,e[7]=d,e[8]=c}else a=e[3],o=e[4],l=e[5],g=e[6],d=e[7],c=e[8];let T;e[21]!==a||e[22]!==o?(T=i.jsx("div",{className:a,children:o}),e[21]=a,e[22]=o,e[23]=T):T=e[23];let N;return e[24]!==l||e[25]!==g||e[26]!==d||e[27]!==c||e[28]!==T?(N=i.jsxs("div",{className:l,"data-testid":g,children:[d,c,T]}),e[24]=l,e[25]=g,e[26]=d,e[27]=c,e[28]=T,e[29]=N):N=e[29],N};Te.__docgenInfo={description:"",methods:[],displayName:"CoverageBar",props:{counts:{required:!0,tsType:{name:"Record",elements:[{name:"union",raw:'"validated" | "flagged" | "pending"',elements:[{name:"literal",value:'"validated"'},{name:"literal",value:'"flagged"'},{name:"literal",value:'"pending"'}]},{name:"number"}],raw:"Record<FieldStatus, number>"},description:""},total:{required:!0,tsType:{name:"number"},description:""},qc:{required:!0,tsType:{name:"boolean"},description:""}}};function ve(s){const e=Y.c(90),{title:r,subtitle:n,proposedBy:t,fields:a,show:o,copy:l,aside:g,className:d,renderField:c,reasonOptions:T,readOnly:N,reviewerId:_,saved:x,onChange:C,onComplete:b,onOpenCitation:k}=s;let f;e[0]!==o?(f=o===void 0?{}:o,e[0]=o,e[1]=f):f=e[1];const p=f,u=T===void 0?Ke:T,S=_===void 0?"":_,m=p.qcLane===!0,v=s.outcomes??(m?Je:Qe),$=l?.extracted??"Extracted value",H=l?.record??"Record value";let w,h,V,R,F;if(e[2]!==l?.outcome||e[3]!==a||e[4]!==v||e[5]!==t||e[6]!==m||e[7]!==$||e[8]!==H){w={extracted:$,record:H},h=l?.outcome??"Outcome",F=_e;let q;e[14]!==v?(q=Le(v),e[14]=v,e[15]=q):q=e[15];let y;e[16]!==a||e[17]!==t?(y=Ze(a,t),e[16]=a,e[17]=t,e[18]=y):y=e[18],e[19]!==v||e[20]!==t||e[21]!==y||e[22]!==q?(V={outcomes:v,recommended:q,proposedBy:t,reasons:y},e[19]=v,e[20]=t,e[21]=y,e[22]=q,e[23]=V):V=e[23],R=Ye(a,m,w),e[2]=l?.outcome,e[3]=a,e[4]=v,e[5]=t,e[6]=m,e[7]=$,e[8]=H,e[9]=w,e[10]=h,e[11]=V,e[12]=R,e[13]=F}else w=e[9],h=e[10],V=e[11],R=e[12],F=e[13];let B;e[24]!==a||e[25]!==m?(B=nr(a,m),e[24]=a,e[25]=m,e[26]=B):B=e[26];let D;e[27]!==C||e[28]!==b||e[29]!==N||e[30]!==S||e[31]!==x||e[32]!==V||e[33]!==R||e[34]!==B?(D={spec:V,seeds:R,readOnly:N,reviewerId:S,saved:x,keep:ur,gate:B,onChange:C,onComplete:b},e[27]=C,e[28]=b,e[29]=N,e[30]=S,e[31]=x,e[32]=V,e[33]=R,e[34]=B,e[35]=D):D=e[35];const j=F(D);let A,O,P,I,E,W;if(e[36]!==g||e[37]!==d||e[38]!==a||e[39]!==w||e[40]!==j||e[41]!==k||e[42]!==t||e[43]!==m||e[44]!==u||e[45]!==c||e[46]!==p||e[47]!==n||e[48]!==r){let q;e[55]!==j||e[56]!==m?(q=Q=>({field:Q,status:er(Q,m,j.looked,j.findPart)}),e[55]=j,e[56]=m,e[57]=q):q=e[57];const y=a.map(q),Se=rr(y.map(lr)),Ve=[...new Set(a.map(or))];A=$e,O=j,P=g,I=d;let re;e[58]===Symbol.for("react.memo_cache_sentinel")?(re=ee.evidence("context"),e[58]=re):re=e[58];let X;e[59]!==n?(X=n&&i.jsxs(i.Fragment,{children:[" · ",n]}),e[59]=n,e[60]=X):X=e[60];let z;e[61]!==X||e[62]!==r?(z=i.jsxs("span",{className:"text-xs font-semibold",children:[r,X]}),e[61]=X,e[62]=r,e[63]=z):z=e[63];const oe=m?"Audit lane":"Review lane";let G;e[64]!==oe?(G=i.jsx(de,{variant:"outline",children:oe}),e[64]=oe,e[65]=G):G=e[65];let te;e[66]===Symbol.for("react.memo_cache_sentinel")?(te=i.jsx(Xe,{}),e[66]=te):te=e[66];let K;e[67]!==G?(K=i.jsxs("div",{className:"flex gap-2",children:[G,te]}),e[67]=G,e[68]=K):K=e[68];let ne;e[69]!==z||e[70]!==K?(ne=i.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[z,K]}),e[69]=z,e[70]=K,e[71]=ne):ne=e[71];let ae;e[72]!==t?(ae=t&&i.jsxs("p",{className:"text-xs text-muted-foreground",children:["Fields compared by ",t]}),e[72]=t,e[73]=ae):ae=e[73],E=i.jsxs(fe,{className:"space-y-3 p-5",...re,children:[ne,ae,i.jsx(Te,{counts:Se,total:a.length,qc:m})]}),W=Ve.map(Q=>{const le=y.filter(ue=>{const{field:J}=ue;return J.group===Q}),Ae=le.filter(sr).length;return i.jsxs(fe,{className:"space-y-3 p-5",children:[i.jsxs("h3",{className:"flex items-baseline justify-between text-base font-semibold",children:[Q,i.jsxs("span",{className:"text-xs font-normal text-muted-foreground tabular-nums",children:[Ae," of ",le.length," ",m?"audited":"reviewed"]})]}),le.map(ue=>{const{field:J,status:Oe}=ue,ye=i.jsx(je,{field:J,ids:Z(J),status:Oe,qc:m,show:p,labels:w,reasonOptions:u,onOpenCitation:k});return i.jsx(ge.Fragment,{children:c?c(J,ye):ye},J.id)})]},Q)}),e[36]=g,e[37]=d,e[38]=a,e[39]=w,e[40]=j,e[41]=k,e[42]=t,e[43]=m,e[44]=u,e[45]=c,e[46]=p,e[47]=n,e[48]=r,e[49]=A,e[50]=O,e[51]=P,e[52]=I,e[53]=E,e[54]=W}else A=e[49],O=e[50],P=e[51],I=e[52],E=e[53],W=e[54];let M;e[74]!==h?(M=i.jsx(Be,{noun:h}),e[74]=h,e[75]=M):M=e[75];let L;e[76]!==l||e[77]!==h||e[78]!==S||e[79]!==p.record?(L=i.jsx(De,{noun:h,copy:l,showRecord:p.record,reviewerId:S}),e[76]=l,e[77]=h,e[78]=S,e[79]=p.record,e[80]=L):L=e[80];let U;return e[81]!==A||e[82]!==O||e[83]!==P||e[84]!==I||e[85]!==E||e[86]!==W||e[87]!==M||e[88]!==L?(U=i.jsxs(A,{model:O,aside:P,className:I,children:[E,W,M,L]}),e[81]=A,e[82]=O,e[83]=P,e[84]=I,e[85]=E,e[86]=W,e[87]=M,e[88]=L,e[89]=U):U=e[89],U}function sr(s){const{status:e}=s;return e!=="pending"}function or(s){return s.group}function lr(s){const{status:e}=s;return e}function ur(s){return s.kind==="verdict"||be(s)}ve.__docgenInfo={description:"",methods:[],displayName:"SourceComparison",props:{title:{required:!0,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},facts:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ label: string; value: string }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}],raw:"ReviewFact[]"},description:""},excerpt:{required:!1,tsType:{name:"string"},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""},outcomes:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
  group: string;
  label: string;
  extractedValue: string;
  recordValue: string;
  confidence?: number;
  evidence?: string;
  citation?: ComparisonCitation;
  reviewer?: {
    verdict: ComparisonVerdict;
    extractedValue?: string;
    recordValue?: string;
  };
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"extractedValue",value:{name:"string",required:!0}},{key:"recordValue",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"evidence",value:{name:"string",required:!1}},{key:"citation",value:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]},required:!1}},{key:"reviewer",value:{name:"signature",type:"object",raw:`{
  verdict: ComparisonVerdict;
  extractedValue?: string;
  recordValue?: string;
}`,signature:{properties:[{key:"verdict",value:{name:"union",raw:`| "Correct"
| "Extraction wrong"
| "System value wrong"`,elements:[{name:"literal",value:'"Correct"'},{name:"literal",value:'"Extraction wrong"'},{name:"literal",value:'"System value wrong"'}],required:!0}},{key:"extractedValue",value:{name:"string",required:!1}},{key:"recordValue",value:{name:"string",required:!1}}]},required:!1}}]}},name:"field"},{type:{name:"ReactNode"},name:"defaultNode"}],return:{name:"ReactNode"}}},description:""},fields:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  group: string;
  label: string;
  extractedValue: string;
  recordValue: string;
  confidence?: number;
  evidence?: string;
  citation?: ComparisonCitation;
  reviewer?: {
    verdict: ComparisonVerdict;
    extractedValue?: string;
    recordValue?: string;
  };
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"group",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"extractedValue",value:{name:"string",required:!0}},{key:"recordValue",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}},{key:"evidence",value:{name:"string",required:!1}},{key:"citation",value:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]},required:!1}},{key:"reviewer",value:{name:"signature",type:"object",raw:`{
  verdict: ComparisonVerdict;
  extractedValue?: string;
  recordValue?: string;
}`,signature:{properties:[{key:"verdict",value:{name:"union",raw:`| "Correct"
| "Extraction wrong"
| "System value wrong"`,elements:[{name:"literal",value:'"Correct"'},{name:"literal",value:'"Extraction wrong"'},{name:"literal",value:'"System value wrong"'}],required:!0}},{key:"extractedValue",value:{name:"string",required:!1}},{key:"recordValue",value:{name:"string",required:!1}}]},required:!1}}]}}],raw:"ComparisonField[]"},description:""},onOpenCitation:{required:!1,tsType:{name:"signature",type:"function",raw:"(citation: ComparisonCitation) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:`{
  document: string;
  page: number;
  before: string;
  highlight: string;
  after: string;
}`,signature:{properties:[{key:"document",value:{name:"string",required:!0}},{key:"page",value:{name:"number",required:!0}},{key:"before",value:{name:"string",required:!0}},{key:"highlight",value:{name:"string",required:!0}},{key:"after",value:{name:"string",required:!0}}]}},name:"citation"}],return:{name:"void"}}},description:""}}};const me={title:"Supplier pricing agreement",subtitle:"SPA-2026-0412",proposedBy:"Contract comparison agent v2",copy:{extracted:"Contract value",record:"System value"},fields:[{id:"rebate-rate",group:"Pricing",label:"Rebate rate",extractedValue:"12.5% of net purchases",recordValue:"12.5% of net purchases",confidence:96,evidence:"Both records state the same rate and the same basis, found in the rebate clause.",citation:{document:"Base agreement",page:14,before:"Section 6.2. The Supplier shall pay a quarterly rebate of ",highlight:"12.5% of net purchases",after:" made by the Buyer during the calendar quarter."}},{id:"handling-fee",group:"Pricing",label:"Handling fee",extractedValue:"$1.85 per unit",recordValue:"$1.95 per unit",confidence:88,evidence:"Amendment 2 lowers the fee to $1.85. The system record still holds the base agreement fee.",citation:{document:"Amendment 2",page:3,before:"Section 4.1 of the Base agreement is replaced: the fee is ",highlight:"$1.85 per unit",after:", effective 1 January."}},{id:"price-cap",group:"Pricing",label:"Annual price increase cap",extractedValue:"4% per year",recordValue:"3% per year",confidence:61,evidence:"The cap appears twice with different figures. The agent could not tell which clause governs.",citation:{document:"Base agreement",page:9,before:"Section 5.4. Unit prices shall not increase by more than ",highlight:"4% per year",after:" without written consent."}},{id:"term-length",group:"Term",label:"Term length",extractedValue:"36 months",recordValue:"36 months",confidence:98,evidence:"The initial term is stated once and agrees with the record.",citation:{document:"Base agreement",page:2,before:"Section 2.1. This agreement runs for an initial term of ",highlight:"36 months",after:" from the effective date."}},{id:"renewal-notice",group:"Term",label:"Renewal notice period",extractedValue:"90 days",recordValue:"60 days",confidence:74,evidence:"The notice period is in the renewal clause. The record shows a shorter period.",citation:{document:"Base agreement",page:2,before:"Section 2.3. Either party may end the term by giving ",highlight:"90 days",after:" written notice before expiry."}},{id:"payment-terms",group:"Payment",label:"Payment terms",extractedValue:"Net 45",recordValue:"Net 45",confidence:93,evidence:"Invoice payment terms match in both records."}]},dr={...me,proposedBy:"First-stage reviewer",show:{qcLane:!0},fields:me.fields.map(s=>s.id==="handling-fee"?{...s,reviewer:{verdict:"System value wrong",recordValue:"$1.85 per unit"}}:s.id==="renewal-notice"?{...s,reviewer:{verdict:"System value wrong",recordValue:"90 days"}}:{...s,reviewer:{verdict:"Correct"}})},Ne=async()=>{},Er={title:"Components/SourceComparison",parameters:{layout:"padded",docs:{description:{component:"The reviewer checks each extracted value against a source of truth: the two values side by side, a match or mismatch mark, a verdict with a corrected value, a citation and a coverage bar that gates Complete. `show.qcLane` adds a second-stage lane that concurs with or disputes the first reviewer."}}},tags:["autodocs"]},ie={render:()=>i.jsx(ve,{...me,onComplete:Ne})},se={render:()=>i.jsx(ve,{...dr,onComplete:Ne})};ie.parameters={...ie.parameters,docs:{...ie.parameters?.docs,source:{originalSource:`{
  render: () => <SourceComparison {...FIXTURE_COMPARISON} onComplete={complete} />
}`,...ie.parameters?.docs?.source}}};se.parameters={...se.parameters,docs:{...se.parameters?.docs,source:{originalSource:`{
  render: () => <SourceComparison {...FIXTURE_COMPARISON_QC} onComplete={complete} />
}`,...se.parameters?.docs?.source}}};const Mr=["SupplierPricingAgreement","SecondStageAudit"];export{se as SecondStageAudit,ie as SupplierPricingAgreement,Mr as __namedExportsOrder,Er as default};
