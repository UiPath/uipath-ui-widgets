import{j as n}from"./jsx-runtime-C5WNSv3b.js";import{r as ue}from"./iframe-CCkhsDGV.js";/* empty css                            */import{c as de}from"./compiler-runtime-CdRayByh.js";import{a as ce}from"./card-D3H7FrKi.js";import{L as Oe}from"./form-field-CTESAaTx.js";import{c as oe}from"./button-SFMwP8Up.js";import{i as pe,C as ke}from"./ConfidenceBadge-DDcr7X0V.js";import{p as qe,d as he,u as Ee,r as Pe,L as Fe,D as we,b as We,s as De,O as _e,c as Me,R as He}from"./useDecisionCapture-BMnTNrlA.js";import{C as Ve}from"./ConfirmButton-CJbQH9yb.js";import{P as xe}from"./PartReasons-BbzBBtYV.js";import{P as Re}from"./ProposalInput-D8Y5x0d7.js";import{c as je,a as $e,b as ve,e as fe,d as Be,T as Ue}from"./table-Dc02mG3f.js";import{C as Xe}from"./CompletionBadge-DYeCTxDd.js";import{C as Ke}from"./ContextHeader-CpYeDU9m.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BbaDf3V7.js";import"./index-kvVkqLY4.js";import"./index-DCAqwLtD.js";import"./badge-CXQpkIOQ.js";import"./input-BUvFRMBF.js";import"./textarea-BB0xUawe.js";import"./alert-DecksOzW.js";import"./collapsible-Bkyww2kK.js";const Te=t=>{const e=de.c(27),{part:r,reasonOptions:i,showConfidence:o}=t,a=ue.useId();let g;e[0]!==r?(g=qe(r),e[0]=r,e[1]=g):g=e[1];const c=g;let d;if(e[2]!==c||e[3]!==r.confidence||e[4]!==r.looked){const y=pe(r.confidence);d=oe("space-y-1 rounded-lg border border-transparent p-2",y&&!r.looked&&!c&&"bg-warning-background"),e[2]=c,e[3]=r.confidence,e[4]=r.looked,e[5]=d}else d=e[5];let m;e[6]!==a||e[7]!==r.label?(m=n.jsx(Oe,{htmlFor:a,className:"text-xs font-medium text-muted-foreground",children:r.label}),e[6]=a,e[7]=r.label,e[8]=m):m=e[8];let f;e[9]!==r.confidence||e[10]!==o?(f=o&&r.confidence!==void 0&&n.jsx(ke,{confidence:r.confidence}),e[9]=r.confidence,e[10]=o,e[11]=f):f=e[11];let p;e[12]!==m||e[13]!==f?(p=n.jsxs("div",{className:"flex items-center justify-between gap-2",children:[m,f]}),e[12]=m,e[13]=f,e[14]=p):p=e[14];let s;e[15]!==a||e[16]!==r?(s=n.jsx(Re,{part:r,id:a}),e[15]=a,e[16]=r,e[17]=s):s=e[17];let l;e[18]!==c||e[19]!==r||e[20]!==i?(l=c?n.jsxs(n.Fragment,{children:[n.jsxs("p",{className:"text-xs text-muted-foreground",children:["Proposed: ",he(r.proposed)]}),n.jsx(xe,{part:r,question:`${r.label}: why?`,options:i})]}):n.jsx(Ve,{part:r,idleLabel:"Confirm"}),e[18]=c,e[19]=r,e[20]=i,e[21]=l):l=e[21];let u;return e[22]!==d||e[23]!==p||e[24]!==s||e[25]!==l?(u=n.jsxs("div",{className:d,children:[p,s,l]}),e[22]=d,e[23]=p,e[24]=s,e[25]=l,e[26]=u):u=e[26],u};Te.__docgenInfo={description:"",methods:[],displayName:"HeaderCell",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""},showConfidence:{required:!0,tsType:{name:"boolean"},description:""}}};const Ce=t=>`header.${t.id}`,ge=(t,e)=>`line.${t}.${e.id}`,Qe=(t,e)=>[...t.map(r=>({id:Ce(r),label:r.label,kind:"header",proposed:r.value,confidence:r.confidence})),...e.flatMap((r,i)=>r.fields.map(o=>({id:ge(r.id,o),label:`Line ${i+1} · ${o.label}`,kind:"lineItem",proposed:o.value,confidence:o.confidence})))],ze=(t,e)=>({id:`low-${t.id}`,title:`Low confidence on ${t.label}`,detail:`Extracted with ${t.confidence}% confidence.`,partId:t.id,source:e,confidence:t.confidence}),be="px-1.5 py-1",Ne="h-auto px-1.5 py-1 text-xs",Ae=t=>{const e=de.c(30),{lineItems:r,reasonOptions:i,showConfidence:o}=t,{findPart:a}=Ee();let g;e[0]!==r[0]?.fields?(g=r[0]?.fields??[],e[0]=r[0]?.fields,e[1]=g):g=e[1];const c=g;let d;if(e[2]!==c||e[3]!==a||e[4]!==r||e[5]!==i||e[6]!==o){let m;e[8]!==a?(m=v=>v.fields.map(x=>a(ge(v.id,x))),e[8]=a,e[9]=m):m=e[9];const f=r.flatMap(m).filter(Ge);let p;e[10]===Symbol.for("react.memo_cache_sentinel")?(p=n.jsx("h3",{className:"text-base font-semibold",children:"Line items"}),e[10]=p):p=e[10];let s;e[11]===Symbol.for("react.memo_cache_sentinel")?(s=n.jsx(je,{className:oe(Ne,"w-8"),children:"#"}),e[11]=s):s=e[11];let l;e[12]!==c?(l=c.map(Je),e[12]=c,e[13]=l):l=e[13];let u;e[14]!==l?(u=n.jsx($e,{children:n.jsxs(ve,{children:[s,l]})}),e[14]=l,e[15]=u):u=e[15];let y;if(e[16]!==a||e[17]!==r||e[18]!==o){let v;e[20]!==a||e[21]!==o?(v=(x,Y)=>n.jsxs(ve,{className:"align-top",children:[n.jsx(fe,{className:oe(be,"text-muted-foreground"),children:Y+1}),x.fields.map(h=>{const k=a(ge(x.id,h));return k?n.jsx(fe,{className:be,children:n.jsxs("div",{className:oe("space-y-1 rounded-md p-1",pe(k.confidence)&&!k.looked&&"bg-warning-background"),children:[n.jsx(Re,{part:k,label:k.label}),o&&k.confidence!==void 0&&n.jsx(ke,{confidence:k.confidence})]})},h.id):null})]},x.id),e[20]=a,e[21]=o,e[22]=v):v=e[22],y=r.map(v),e[16]=a,e[17]=r,e[18]=o,e[19]=y}else y=e[19];let b;e[23]!==y?(b=n.jsx(Be,{children:y}),e[23]=y,e[24]=b):b=e[24];let C;e[25]!==u||e[26]!==b?(C=n.jsxs(Ue,{className:"text-xs",children:[u,b]}),e[25]=u,e[26]=b,e[27]=C):C=e[27];let N;e[28]!==i?(N=v=>n.jsxs("div",{className:"space-y-1",children:[n.jsxs("p",{className:"text-xs text-muted-foreground",children:["Proposed for ",v.label,": ",he(v.proposed)]}),n.jsx(xe,{part:v,question:`${v.label}: why?`,options:i})]},v.id),e[28]=i,e[29]=N):N=e[29],d=n.jsxs(ce,{className:"space-y-3 p-5",children:[p,C,f.map(N)]}),e[2]=c,e[3]=a,e[4]=r,e[5]=i,e[6]=o,e[7]=d}else d=e[7];return d};Ae.__docgenInfo={description:"",methods:[],displayName:"LineItems",props:{lineItems:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ id: string; fields: ValueField[] }",signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"fields",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  value: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}}]}}],raw:"ValueField[]",required:!0}}]}}],raw:"DocumentLineItem[]"},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""},showConfidence:{required:!0,tsType:{name:"boolean"},description:""}}};function Ge(t){return!!t&&qe(t)}function Je(t){return n.jsx(je,{className:Ne,children:t.label},t.id)}const Ye=[{id:"Validate",label:"Validate",description:"Accept the document and release it for processing.",recommended:!0},{id:"Reject",label:"Reject",description:"Return the document to the sender without processing it.",reasons:["Not a supported document","Duplicate submission","Illegible scan","Supplier not recognised","Other"]}];function ye(t){const e=de.c(99),{title:r,subtitle:i,facts:o,proposedBy:a,fields:g,lineItems:c,show:d,copy:m,aside:f,className:p,renderField:s,reasonOptions:l,outcomes:u,readOnly:y,reviewerId:b,saved:C,onChange:N,onComplete:v}=t;let x;e[0]!==o?(x=o===void 0?[]:o,e[0]=o,e[1]=x):x=e[1];const Y=x;let h,k,R,w,j,S,O,q,P,Z,F,A,W;if(e[2]!==m?.outcome||e[3]!==g||e[4]!==a||e[5]!==c||e[6]!==d||e[7]!==l||e[8]!==u||e[9]!==b){h=c===void 0?[]:c;let T;e[23]!==d?(T=d===void 0?{}:d,e[23]=d,e[24]=T):T=e[24],O=T,w=l===void 0?we:l;const L=u===void 0?Ye:u;j=b===void 0?"":b,q=O.confidence!==!1,R=m?.outcome??"Outcome",S=Qe(g,h),k=S.filter(en),Z=We,F=L,e[25]!==L?(A=Pe(L),e[25]=L,e[26]=A):A=e[26],W=a;let E;e[27]!==a?(E=ae=>ze(ae,a),e[27]=a,e[28]=E):E=e[28],P=k.map(E),e[2]=m?.outcome,e[3]=g,e[4]=a,e[5]=c,e[6]=d,e[7]=l,e[8]=u,e[9]=b,e[10]=h,e[11]=k,e[12]=R,e[13]=w,e[14]=j,e[15]=S,e[16]=O,e[17]=q,e[18]=P,e[19]=Z,e[20]=F,e[21]=A,e[22]=W}else h=e[10],k=e[11],R=e[12],w=e[13],j=e[14],S=e[15],O=e[16],q=e[17],P=e[18],Z=e[19],F=e[20],A=e[21],W=e[22];let D;e[29]!==P||e[30]!==F||e[31]!==A||e[32]!==W?(D={outcomes:F,recommended:A,proposedBy:W,reasons:P},e[29]=P,e[30]=F,e[31]=A,e[32]=W,e[33]=D):D=e[33];let ee;e[34]!==N||e[35]!==v||e[36]!==y||e[37]!==j||e[38]!==C||e[39]!==S||e[40]!==D?(ee={spec:D,seeds:S,readOnly:y,reviewerId:j,saved:C,onChange:N,onComplete:v},e[34]=N,e[35]=v,e[36]=y,e[37]=j,e[38]=C,e[39]=S,e[40]=D,e[41]=ee):ee=e[41];const I=Z(ee);let ne;e[42]===Symbol.for("react.memo_cache_sentinel")?(ne=De.evidence("context"),e[42]=ne):ne=e[42];let _;e[43]!==r?(_=n.jsx(Ke,{title:r}),e[43]=r,e[44]=_):_=e[44];let M;e[45]!==a||e[46]!==i?(M=(a||i)&&n.jsxs("p",{className:"text-xs text-muted-foreground",children:[a&&n.jsxs(n.Fragment,{children:["Extracted by ",a]}),i&&n.jsxs(n.Fragment,{children:[" · ",i]})]}),e[45]=a,e[46]=i,e[47]=M):M=e[47];let H;e[48]!==Y?(H=Y.map(Ze),e[48]=Y,e[49]=H):H=e[49];let V;e[50]!==k||e[51]!==q?(V=q&&n.jsxs(n.Fragment,{children:[n.jsxs("span",{className:"mr-1 text-muted-foreground",children:["Below ",Fe,"% confidence"]}),k.length]}),e[50]=k,e[51]=q,e[52]=V):V=e[52];let $;e[53]!==H||e[54]!==V?($=n.jsxs("p",{className:"text-xs",children:[H,V]}),e[53]=H,e[54]=V,e[55]=$):$=e[55];let B;e[56]!==_||e[57]!==M||e[58]!==$?(B=n.jsxs(ce,{className:"space-y-1 p-5",...ne,children:[_,M,$]}),e[56]=_,e[57]=M,e[58]=$,e[59]=B):B=e[59];let re;e[60]===Symbol.for("react.memo_cache_sentinel")?(re=n.jsx("h3",{className:"text-base font-semibold",children:"Header"}),e[60]=re):re=e[60];const me=q&&" Highlighted values have low confidence.";let U;e[61]!==me?(U=n.jsxs("p",{className:"text-xs text-muted-foreground",children:["Confirm each value or correct it.",me]}),e[61]=me,e[62]=U):U=e[62];let X;if(e[63]!==g||e[64]!==I||e[65]!==w||e[66]!==s||e[67]!==q){let T;e[69]!==I||e[70]!==w||e[71]!==s||e[72]!==q?(T=L=>{const E=I.findPart(Ce(L));if(!E)return null;const ae=n.jsx(Te,{part:E,reasonOptions:w,showConfidence:q});return n.jsx(ue.Fragment,{children:s?s(L,ae):ae},L.id)},e[69]=I,e[70]=w,e[71]=s,e[72]=q,e[73]=T):T=e[73],X=g.map(T),e[63]=g,e[64]=I,e[65]=w,e[66]=s,e[67]=q,e[68]=X}else X=e[68];let K;e[74]!==X?(K=n.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:X}),e[74]=X,e[75]=K):K=e[75];let Q;e[76]!==U||e[77]!==K?(Q=n.jsxs(ce,{className:"space-y-3 p-5",children:[re,U,K]}),e[76]=U,e[77]=K,e[78]=Q):Q=e[78];let z;e[79]!==h||e[80]!==w||e[81]!==q?(z=h.length>0&&n.jsx(Ae,{lineItems:h,reasonOptions:w,showConfidence:q}),e[79]=h,e[80]=w,e[81]=q,e[82]=z):z=e[82];let G;e[83]!==R?(G=n.jsx(_e,{noun:R}),e[83]=R,e[84]=G):G=e[84];let J;e[85]!==m||e[86]!==R||e[87]!==j||e[88]!==O.record?(J=n.jsx(Xe,{noun:R,copy:m,showRecord:O.record,reviewerId:j}),e[85]=m,e[86]=R,e[87]=j,e[88]=O.record,e[89]=J):J=e[89];let te;return e[90]!==f||e[91]!==p||e[92]!==I||e[93]!==B||e[94]!==Q||e[95]!==z||e[96]!==G||e[97]!==J?(te=n.jsxs(Me,{model:I,aside:f,className:p,children:[B,Q,z,G,J]}),e[90]=f,e[91]=p,e[92]=I,e[93]=B,e[94]=Q,e[95]=z,e[96]=G,e[97]=J,e[98]=te):te=e[98],te}function Ze(t){return n.jsxs("span",{className:"mr-4",children:[n.jsx("span",{className:"mr-1 text-muted-foreground",children:t.label}),t.value]},t.label)}function en(t){return pe(t.confidence)}ye.__docgenInfo={description:"",methods:[],displayName:"ExtractionValidation",props:{title:{required:!0,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},facts:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ label: string; value: string }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}],raw:"ReviewFact[]"},description:""},excerpt:{required:!1,tsType:{name:"string"},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""},outcomes:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}}]}}],raw:"ValueField[]"},description:""},lineItems:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ id: string; fields: ValueField[] }",signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"fields",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  value: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}},{key:"confidence",value:{name:"number",required:!1}}]}}],raw:"ValueField[]",required:!0}}]}}],raw:"DocumentLineItem[]"},description:""}}};const Ie=t=>{const e=de.c(15),{fieldLabel:r,reason:i,note:o,reasons:a,disabled:g,onReasonChange:c,onNoteChange:d}=t,m=o===void 0?"":o,f=a===void 0?we:a,p=`${r}: why?`;let s;e[0]!==m||e[1]!==i?(s={why:i,note:m},e[0]=m,e[1]=i,e[2]=s):s=e[2];let l;e[3]!==c||e[4]!==i?(l=b=>c(i===b?null:b),e[3]=c,e[4]=i,e[5]=l):l=e[5];let u;e[6]!==d?(u=b=>d?.(b),e[6]=d,e[7]=u):u=e[7];let y;return e[8]!==g||e[9]!==f||e[10]!==p||e[11]!==s||e[12]!==l||e[13]!==u?(y=n.jsx("div",{className:"uipath-decisions-and-reasons",children:n.jsx(He,{question:p,options:f,pick:s,disabled:g,onToggle:l,onNote:u})}),e[8]=g,e[9]=f,e[10]=p,e[11]=s,e[12]=l,e[13]=u,e[14]=y):y=e[14],y};Ie.__docgenInfo={description:"",methods:[],displayName:"DocumentReasonRow",props:{fieldLabel:{required:!0,tsType:{name:"string"},description:""},reason:{required:!0,tsType:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}]},description:""},note:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},reasons:{required:!1,tsType:{name:"unknown"},description:"",defaultValue:{value:`[
  "Extraction misread",
  "Not in the document",
  "Rule doesn't fit",
  "Other",
]`,computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:""},onReasonChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(reason: string | null) => void",signature:{arguments:[{type:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}]},name:"reason"}],return:{name:"void"}}},description:""},onNoteChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(note: string) => void",signature:{arguments:[{type:{name:"string"},name:"note"}],return:{name:"void"}}},description:""}}};const Le={title:"Invoice INV-48213",subtitle:"northfield-inv-48213.pdf",proposedBy:"Document extractor v3",facts:[{label:"Supplier",value:"Northfield Components Ltd"}],fields:[{id:"invoice-number",label:"Invoice number",value:"INV-48213",confidence:99},{id:"invoice-date",label:"Invoice date",value:"2026-09-18",confidence:97},{id:"due-date",label:"Due date",value:"2026-11-02",confidence:72},{id:"po-number",label:"Purchase order",value:"PO-77120",confidence:91},{id:"currency",label:"Currency",value:"USD",confidence:99},{id:"total",label:"Total",value:"4,236.00",confidence:68}],lineItems:[{id:"1",fields:[{id:"description",label:"Description",value:"Hydraulic seal kit",confidence:94},{id:"quantity",label:"Qty",value:"12",confidence:96},{id:"unit-price",label:"Unit price",value:"148.00",confidence:92},{id:"amount",label:"Amount",value:"1,776.00",confidence:95}]},{id:"2",fields:[{id:"description",label:"Description",value:"Cable gland, M20",confidence:90},{id:"quantity",label:"Qty",value:"200",confidence:88},{id:"unit-price",label:"Unit price",value:"6.30",confidence:64},{id:"amount",label:"Amount",value:"1,260.00",confidence:90}]},{id:"3",fields:[{id:"description",label:"Description",value:"Freight and handling",confidence:85},{id:"quantity",label:"Qty",value:"1",confidence:99},{id:"unit-price",label:"Unit price",value:"1,200.00",confidence:93},{id:"amount",label:"Amount",value:"1,200.00",confidence:93}]}]},Se=async()=>{},Tn={title:"Components/ExtractionValidation",parameters:{layout:"padded",docs:{description:{component:"The reviewer confirms or corrects the values extracted from a document: header fields and line items with confidence (low values are highlighted), one-click confirm or correct with a reason, and Validate or Reject. `aside` renders a viewer beside the form."}}},tags:["autodocs"]},ie={render:()=>n.jsx(ye,{...Le,onComplete:Se})},se={render:()=>n.jsx(ye,{...Le,aside:n.jsx("div",{className:"flex h-96 items-center justify-center rounded-lg border border-dashed border-border-de-emp text-xs text-muted-foreground",children:"Document viewer"}),onComplete:Se})},le={render:()=>{const[t,e]=ue.useState(null),[r,i]=ue.useState("");return n.jsx(Ie,{fieldLabel:"PO number",reason:t,note:r,onReasonChange:e,onNoteChange:i})}};ie.parameters={...ie.parameters,docs:{...ie.parameters?.docs,source:{originalSource:`{
  render: () => <ExtractionValidation {...FIXTURE_EXTRACTION} onComplete={complete} />
}`,...ie.parameters?.docs?.source}}};se.parameters={...se.parameters,docs:{...se.parameters?.docs,source:{originalSource:`{
  render: () => <ExtractionValidation {...FIXTURE_EXTRACTION} aside={<div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-border-de-emp text-xs text-muted-foreground">
          Document viewer
        </div>} onComplete={complete} />
}`,...se.parameters?.docs?.source}}};le.parameters={...le.parameters,docs:{...le.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [reason, setReason] = React.useState<string | null>(null);
    const [note, setNote] = React.useState("");
    return <DocumentReasonRow fieldLabel="PO number" reason={reason} note={note} onReasonChange={setReason} onNoteChange={setNote} />;
  }
}`,...le.parameters?.docs?.source}}};const Cn=["Invoice","WithViewerBeside","EditedFieldReasonRow"];export{le as EditedFieldReasonRow,ie as Invoice,se as WithViewerBeside,Cn as __namedExportsOrder,Tn as default};
