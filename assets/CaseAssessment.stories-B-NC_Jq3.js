import{j as t}from"./jsx-runtime-C5WNSv3b.js";/* empty css                            */import{c as W}from"./compiler-runtime-CdRayByh.js";import{a as ye}from"./card-D3H7FrKi.js";import{r as ee}from"./iframe-CCkhsDGV.js";import{L as Pe}from"./form-field-CTESAaTx.js";import{c as re,B as O}from"./button-SFMwP8Up.js";import{p as He,E as Fe,u as J,S as ke,T as fe,C as we,s as Y,W as je,N as Ee,o as Te,R as De,a as $e,M as Be,r as Ue,b as Ge,O as Xe,c as ze}from"./useDecisionCapture-BMnTNrlA.js";import{P as xe}from"./ProposalInput-D8Y5x0d7.js";import{C as Ke}from"./CompletionBadge-DYeCTxDd.js";import{C as Ve}from"./ContextHeader-CpYeDU9m.js";import{T as Ye,a as Je}from"./toggle-group-BYlgAanh.js";import{I as Re}from"./input-BUvFRMBF.js";import{B as Qe}from"./badge-CXQpkIOQ.js";import{D as Ze,a as er,d as rr,e as tr,c as nr,b as ar}from"./dropdown-menu-Cae9cB3B.js";import{R as sr}from"./ReasonTags-CgqBm8mz.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BbaDf3V7.js";import"./index-kvVkqLY4.js";import"./index-DCAqwLtD.js";import"./textarea-BB0xUawe.js";import"./alert-DecksOzW.js";import"./collapsible-Bkyww2kK.js";import"./table-Dc02mG3f.js";import"./index-C1yDo2Ww.js";import"./portal-container-C9PwFtAv.js";import"./tslib.es6-DOyTwyrN.js";import"./circle-B0c35hjg.js";const ir=3,Ne=r=>{const e=W.c(23),{field:n,part:a,renderField:u}=r,s=ee.useId(),d=n.kind==="long",i=d&&"sm:col-span-2";let g;e[0]!==i?(g=re("space-y-1",i),e[0]=i,e[1]=g):g=e[1];let p;e[2]!==n.label||e[3]!==s?(p=t.jsx(Pe,{htmlFor:s,className:"text-xs font-medium text-muted-foreground",children:n.label}),e[2]=n.label,e[3]=s,e[4]=p):p=e[4];let l;e[5]!==n.kind||e[6]!==s||e[7]!==d||e[8]!==a?(l=d?t.jsx(xe,{part:a,id:s,rows:ir}):t.jsxs("div",{className:"flex items-center gap-1.5",children:[n.kind==="money"&&t.jsx("span",{className:"text-xs text-muted-foreground",children:"$"}),t.jsx(xe,{part:a,id:s})]}),e[5]=n.kind,e[6]=s,e[7]=d,e[8]=a,e[9]=l):l=e[9];let m;e[10]!==a?(m=He(a)&&t.jsxs("p",{className:"text-xs text-muted-foreground",children:["Proposed: ",a.proposed||Fe]}),e[10]=a,e[11]=m):m=e[11];let o;e[12]!==g||e[13]!==p||e[14]!==l||e[15]!==m?(o=t.jsxs("div",{className:g,children:[p,l,m]}),e[12]=g,e[13]=p,e[14]=l,e[15]=m,e[16]=o):o=e[16];const c=o;let v;e[17]!==n||e[18]!==c||e[19]!==u?(v=u?u(n,c):c,e[17]=n,e[18]=c,e[19]=u,e[20]=v):v=e[20];let y;return e[21]!==v?(y=t.jsx(t.Fragment,{children:v}),e[21]=v,e[22]=y):y=e[22],y};Ne.__docgenInfo={description:"",methods:[],displayName:"FinalField",props:{field:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  kind: string;
  byOutcome: Record<string, string>;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"byOutcome",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!0}}]}},description:""},part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},renderField:{required:!0,tsType:{name:'CaseAssessmentProps["renderField"]',raw:'CaseAssessmentProps["renderField"]'},description:""}}};const Ce=()=>{const r=W.c(29),{spec:e,state:n,locked:a,pickLesson:u,chooseScope:s,toggleCondition:d}=J(),{lesson:i,scope:g,conds:p}=n;let l;r[0]!==e.nextTime?(l=e.nextTime??{},r[0]=e.nextTime,r[1]=l):l=r[1];const{options:m,conditions:o}=l;let c;r[2]!==m?(c=m===void 0?[]:m,r[2]=m,r[3]=c):c=r[3];const v=c;let y;r[4]!==o?(y=o===void 0?[]:o,r[4]=o,r[5]=y):y=r[5];const h=y;let q;r[6]===Symbol.for("react.memo_cache_sentinel")?(q=t.jsx("h3",{className:"flex items-center text-base font-semibold",children:"Next time"}),r[6]=q):q=r[6];let f;if(r[7]!==i||r[8]!==a||r[9]!==v||r[10]!==u){let x;r[12]!==i||r[13]!==a||r[14]!==u?(x=b=>t.jsxs(O,{variant:"outline",disabled:a,"aria-pressed":i===b.id,onClick:()=>u(b.id),className:re("h-auto flex-col items-start justify-start gap-1 whitespace-normal p-3 text-left",i===b.id?"border-2 border-primary bg-primary/5":"border-dashed hover:border-primary"),children:[t.jsx("span",{className:"text-sm font-semibold",children:b.text}),t.jsx("span",{className:"text-xs font-normal text-muted-foreground",children:b.basis})]},b.id),r[12]=i,r[13]=a,r[14]=u,r[15]=x):x=r[15],f=v.map(x),r[7]=i,r[8]=a,r[9]=v,r[10]=u,r[11]=f}else f=r[11];let w;r[16]!==f?(w=t.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:f}),r[16]=f,r[17]=w):w=r[17];let k;r[18]!==s||r[19]!==h||r[20]!==p||r[21]!==i||r[22]!==a||r[23]!==g||r[24]!==d?(k=i&&t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[t.jsx("span",{className:"text-xs text-muted-foreground",children:"Applies to"}),t.jsx(Ye,{type:"single",variant:"outline",size:"xs",disabled:a,value:g,onValueChange:x=>{const b=ke.find(R=>R.id===x);b&&s(b.id)},children:ke.map(lr)})]}),g==="like"&&t.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[t.jsx("span",{className:"text-xs text-muted-foreground",children:"Claims that"}),h.map(x=>t.jsxs(fe,{variant:"outline",size:"xs",className:we,disabled:a,pressed:!!p[x.id],onPressedChange:()=>d(x.id),children:[p[x.id]?"✓":"+"," ",x.label]},x.id))]})]}),r[18]=s,r[19]=h,r[20]=p,r[21]=i,r[22]=a,r[23]=g,r[24]=d,r[25]=k):k=r[25];let j;return r[26]!==w||r[27]!==k?(j=t.jsxs(ye,{className:"space-y-3 p-5",children:[q,w,k]}),r[26]=w,r[27]=k,r[28]=j):j=r[28],j};Ce.__docgenInfo={description:"",methods:[],displayName:"NextTimeSection"};function lr(r){return t.jsx(Je,{value:r.id,children:r.label},r.id)}const Ae=()=>{const r=W.c(29),{spec:e,state:n,addReason:a}=J(),[u,s]=ee.useState(!1),[d,i]=ee.useState(""),[g,p]=ee.useState(""),l=g||n.outcome||e.recommended;let m;r[0]!==d?(m=d.trim(),r[0]=d,r[1]=m):m=r[1];const o=m;let c;r[2]!==a||r[3]!==g||r[4]!==o?(c=()=>{o&&(a(o,g),i(""),p(""),s(!1))},r[2]=a,r[3]=g,r[4]=o,r[5]=c):c=r[5];const v=c;if(!u){let T;return r[6]===Symbol.for("react.memo_cache_sentinel")?(T=t.jsx(O,{...Y.addFactor,variant:"link",className:"h-auto p-0 text-xs",onClick:()=>s(!0),children:"+ Add a reason"}),r[6]=T):T=r[6],T}let y;r[7]===Symbol.for("react.memo_cache_sentinel")?(y=T=>i(T.target.value),r[7]=y):y=r[7];let h;r[8]!==d?(h=t.jsx(Re,{placeholder:"One line: what is the reason",value:d,onChange:y}),r[8]=d,r[9]=h):h=r[9];let q;r[10]===Symbol.for("react.memo_cache_sentinel")?(q=t.jsx("span",{className:"text-xs text-muted-foreground",children:"Supports"}),r[10]=q):q=r[10];let f;if(r[11]!==e.outcomes||r[12]!==l){let T;r[14]!==l?(T=A=>t.jsx(fe,{variant:"outline",size:"xs",className:we,pressed:l===A.id,onPressedChange:()=>p(A.id),children:A.label},A.id),r[14]=l,r[15]=T):T=r[15],f=e.outcomes.map(T),r[11]=e.outcomes,r[12]=l,r[13]=f}else f=r[13];let w;r[16]!==f?(w=t.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[q,f]}),r[16]=f,r[17]=w):w=r[17];const k=!o;let j;r[18]!==v||r[19]!==k?(j=t.jsx(O,{disabled:k,onClick:v,children:"Add reason"}),r[18]=v,r[19]=k,r[20]=j):j=r[20];let x,b;r[21]===Symbol.for("react.memo_cache_sentinel")?(b=t.jsx(O,{variant:"ghost",className:"text-muted-foreground",onClick:()=>s(!1),children:"Cancel"}),x=t.jsx("span",{className:"text-muted-foreground",children:"Starts at High. Change it from the weight menu."}),r[21]=x,r[22]=b):(x=r[21],b=r[22]);let R;r[23]!==j?(R=t.jsxs("div",{className:"flex items-center gap-3 text-xs",children:[j,b,x]}),r[23]=j,r[24]=R):R=r[24];let N;return r[25]!==R||r[26]!==h||r[27]!==w?(N=t.jsxs("div",{className:"space-y-2 rounded-lg border border-dashed border-border-de-emp p-3",children:[h,w,R]}),r[25]=R,r[26]=h,r[27]=w,r[28]=N):N=r[28],N};Ae.__docgenInfo={description:"",methods:[],displayName:"AddReasonForm"};const be=["h-1","h-2","h-3"],qe=r=>{const e=W.c(4),{weight:n}=r,a=Math.max(0,be.length-je.indexOf(n));let u;e[0]!==a?(u=be.map((d,i)=>t.jsx("i",{className:re("block w-0.5 rounded-[1px]",d,i<a?"bg-primary":"bg-border")},d)),e[0]=a,e[1]=u):u=e[1];let s;return e[2]!==u?(s=t.jsx("span",{"aria-hidden":"true",className:"inline-flex h-3 items-end gap-px",children:u}),e[2]=u,e[3]=s):s=e[3],s},We=r=>{const e=W.c(28),{reason:n}=r,{locked:a,root:u,lookAt:s,setWeight:d}=J();let i;e[0]!==s||e[1]!==n.id?(i=h=>h&&s(n.id),e[0]=s,e[1]=n.id,e[2]=i):i=e[2];let g;e[3]!==n.id?(g=Y.field(n.id),e[3]=n.id,e[4]=g):g=e[4];let p;e[5]!==n.weight?(p=t.jsx(qe,{weight:n.weight}),e[5]=n.weight,e[6]=p):p=e[6];let l;e[7]===Symbol.for("react.memo_cache_sentinel")?(l=t.jsx("span",{className:"ml-auto text-muted-foreground",children:"▾"}),e[7]=l):l=e[7];let m;e[8]!==a||e[9]!==n.weight||e[10]!==g||e[11]!==p?(m=t.jsx(Ze,{asChild:!0,children:t.jsxs(O,{...g,variant:"outline",size:"xs",disabled:a,className:"min-w-28 justify-start text-xs",children:[p,n.weight,l]})}),e[8]=a,e[9]=n.weight,e[10]=g,e[11]=p,e[12]=m):m=e[12];let o;e[13]!==n.id||e[14]!==n.weight||e[15]!==d?(o=je.map(h=>t.jsxs(er,{...Y.field(n.id),className:re("gap-2 text-xs",n.weight===h&&"font-semibold"),onSelect:()=>d(n.id,h),children:[t.jsx(qe,{weight:h}),h]},h)),e[13]=n.id,e[14]=n.weight,e[15]=d,e[16]=o):o=e[16];let c;e[17]!==n.confidence||e[18]!==n.source?(c=n.source&&t.jsxs(t.Fragment,{children:[t.jsx(rr,{}),t.jsxs(tr,{className:"text-xs font-normal text-muted-foreground",children:["From ",n.source,n.confidence!==void 0&&t.jsxs(t.Fragment,{children:[" · ",n.confidence,"%"]})]})]}),e[17]=n.confidence,e[18]=n.source,e[19]=c):c=e[19];let v;e[20]!==u||e[21]!==o||e[22]!==c?(v=t.jsxs(nr,{align:"end",className:"min-w-52",container:u,children:[o,c]}),e[20]=u,e[21]=o,e[22]=c,e[23]=v):v=e[23];let y;return e[24]!==i||e[25]!==m||e[26]!==v?(y=t.jsxs(ar,{onOpenChange:i,children:[m,v]}),e[24]=i,e[25]=m,e[26]=v,e[27]=y):y=e[27],y};We.__docgenInfo={description:"",methods:[],displayName:"WeightMenu",props:{reason:{required:!0,tsType:{name:"intersection",raw:`ReviewReason & {
  supports: string;
  weight: Weight;
  proposedWeight: Weight;
  added: boolean;
  why: string | null;
  note: string;
}`,elements:[{name:"signature",type:"object",raw:`{
  id: string;
  title: string;
  detail: string;
  supports?: string;
  weight?: Weight;
  partId?: string;
  source?: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"title",value:{name:"string",required:!0}},{key:"detail",value:{name:"string",required:!0}},{key:"supports",value:{name:"string",required:!1}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"partId",value:{name:"string",required:!1}},{key:"source",value:{name:"string",required:!1}},{key:"confidence",value:{name:"number",required:!1}}]}},{name:"signature",type:"object",raw:`{
  supports: string;
  weight: Weight;
  proposedWeight: Weight;
  added: boolean;
  why: string | null;
  note: string;
}`,signature:{properties:[{key:"supports",value:{name:"string",required:!0}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"proposedWeight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"added",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""}}};const Se=r=>{const e=W.c(45),{reason:n,reasonOptions:a}=r,{spec:u,locked:s,lookAt:d,toggleReasonWhy:i,editReasonNote:g,removeReason:p}=J(),l=n.weight===Ee,m=l&&"bg-warning-background";let o;e[0]!==m?(o=re("border-b border-border-de-emp p-3 last:border-b-0",m),e[0]=m,e[1]=o):o=e[1];let c;e[2]!==d||e[3]!==n.id?(c=()=>d(n.id),e[2]=d,e[3]=n.id,e[4]=c):c=e[4];const v=n.title;let y;e[5]!==n.supports||e[6]!==u?(y=Te(u,n.supports),e[5]=n.supports,e[6]=u,e[7]=y):y=e[7];let h;e[8]!==y?(h=t.jsxs(Qe,{variant:"outline",children:["Supports ",y]}),e[8]=y,e[9]=h):h=e[9];let q;e[10]!==n.title||e[11]!==h?(q=t.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-sm font-semibold",children:[v,h]}),e[10]=n.title,e[11]=h,e[12]=q):q=e[12];let f;e[13]!==n.detail?(f=n.detail&&t.jsx("p",{className:"text-xs text-muted-foreground",children:n.detail}),e[13]=n.detail,e[14]=f):f=e[14];let w;e[15]!==c||e[16]!==q||e[17]!==f?(w=t.jsxs("div",{className:"min-w-0 flex-1 cursor-default",onClick:c,children:[q,f]}),e[15]=c,e[16]=q,e[17]=f,e[18]=w):w=e[18];let k;e[19]!==n?(k=t.jsx(We,{reason:n}),e[19]=n,e[20]=k):k=e[20];let j;e[21]!==k||e[22]!==w?(j=t.jsxs("div",{className:"flex flex-wrap items-start justify-between gap-2",children:[w,k]}),e[21]=k,e[22]=w,e[23]=j):j=e[23];let x;e[24]!==g||e[25]!==s||e[26]!==n.id||e[27]!==n.note||e[28]!==n.why||e[29]!==a||e[30]!==l||e[31]!==i?(x=l&&t.jsx("div",{className:"mt-2",children:t.jsx(De,{question:"Why is it not relevant?",options:a,pick:{why:n.why,note:n.note},disabled:s,placeholder:"Say what is off about it",onToggle:N=>i(n.id,N),onNote:N=>g(n.id,N)})}),e[24]=g,e[25]=s,e[26]=n.id,e[27]=n.note,e[28]=n.why,e[29]=a,e[30]=l,e[31]=i,e[32]=x):x=e[32];let b;e[33]!==s||e[34]!==n.added||e[35]!==n.id||e[36]!==n.proposedWeight||e[37]!==n.weight||e[38]!==p?(b=n.added?t.jsxs("p",{className:"mt-2 flex items-center gap-3 text-xs text-muted-foreground",children:["Added by you",!s&&t.jsx(O,{variant:"link",className:"h-auto p-0 text-xs text-muted-foreground",onClick:()=>p(n.id),children:"Remove"})]}):n.weight!==n.proposedWeight&&t.jsxs("p",{className:"mt-2 text-xs text-muted-foreground",children:["Agent proposed ",n.proposedWeight]}),e[33]=s,e[34]=n.added,e[35]=n.id,e[36]=n.proposedWeight,e[37]=n.weight,e[38]=p,e[39]=b):b=e[39];let R;return e[40]!==j||e[41]!==x||e[42]!==b||e[43]!==o?(R=t.jsxs("div",{className:o,children:[j,x,b]}),e[40]=j,e[41]=x,e[42]=b,e[43]=o,e[44]=R):R=e[44],R};Se.__docgenInfo={description:"",methods:[],displayName:"ReasonRow",props:{reason:{required:!0,tsType:{name:"intersection",raw:`ReviewReason & {
  supports: string;
  weight: Weight;
  proposedWeight: Weight;
  added: boolean;
  why: string | null;
  note: string;
}`,elements:[{name:"signature",type:"object",raw:`{
  id: string;
  title: string;
  detail: string;
  supports?: string;
  weight?: Weight;
  partId?: string;
  source?: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"title",value:{name:"string",required:!0}},{key:"detail",value:{name:"string",required:!0}},{key:"supports",value:{name:"string",required:!1}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"partId",value:{name:"string",required:!1}},{key:"source",value:{name:"string",required:!1}},{key:"confidence",value:{name:"number",required:!1}}]}},{name:"signature",type:"object",raw:`{
  supports: string;
  weight: Weight;
  proposedWeight: Weight;
  added: boolean;
  why: string | null;
  note: string;
}`,signature:{properties:[{key:"supports",value:{name:"string",required:!0}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"proposedWeight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"added",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},reasonOptions:{required:!0,tsType:{name:"unknown"},description:""}}};const Le=r=>{const e=W.c(14),{reasonOptions:n,defaultReasons:a}=r,u=n===void 0?$e:n,{reasons:s,locked:d}=J();let i;e[0]===Symbol.for("react.memo_cache_sentinel")?(i=t.jsx("h3",{className:"flex items-center text-base font-semibold",children:"Reasons"}),e[0]=i):i=e[0];let g;if(e[1]!==u||e[2]!==s){let o;e[4]!==u?(o=c=>t.jsx(Se,{reason:c,reasonOptions:u},c.id),e[4]=u,e[5]=o):o=e[5],g=s.map(o),e[1]=u,e[2]=s,e[3]=g}else g=e[3];let p;e[6]!==g?(p=t.jsx("div",{className:"rounded-lg border border-border-de-emp",children:g}),e[6]=g,e[7]=p):p=e[7];let l;e[8]!==a||e[9]!==d?(l=a?t.jsx(sr,{options:a}):!d&&t.jsx(Ae,{}),e[8]=a,e[9]=d,e[10]=l):l=e[10];let m;return e[11]!==p||e[12]!==l?(m=t.jsxs(ye,{className:"space-y-3 p-5",children:[i,p,l]}),e[11]=p,e[12]=l,e[13]=m):m=e[13],m};Le.__docgenInfo={description:"",methods:[],displayName:"ReasonsSection",props:{reasonOptions:{required:!1,tsType:{name:"unknown"},description:"",defaultValue:{value:'["Wrong", "Outdated", "Other"]',computed:!1}},defaultReasons:{required:!1,tsType:{name:"unknown"},description:""}}};const Me=r=>{const e=W.c(29),{options:n}=r,{state:a,locked:u,toggleTaskTag:s,addTaskTag:d}=J(),[i,g]=ee.useState("");let p,l,m,o,c,v;if(e[0]!==d||e[1]!==i||e[2]!==u||e[3]!==n||e[4]!==a.tags||e[5]!==s){const f=a.tags.filter(k=>!n.includes(k));let w;e[12]!==d||e[13]!==i?(w=()=>{d(i),g("")},e[12]=d,e[13]=i,e[14]=w):w=e[14],l=w,p=ye,c="space-y-3 p-5",e[15]===Symbol.for("react.memo_cache_sentinel")?(v=t.jsxs("div",{children:[t.jsx("h3",{className:"text-base font-semibold",children:"Task tags"}),t.jsx("p",{className:"text-xs text-muted-foreground",children:"Tap the tags that apply. Optional."})]}),e[15]=v):v=e[15],m="flex flex-wrap gap-1.5",o=[...n,...f].map(k=>t.jsx(fe,{...Y.rationale,variant:"outline",size:"xs",className:we,disabled:u,pressed:a.tags.includes(k),onPressedChange:()=>s(k),children:k},k)),e[0]=d,e[1]=i,e[2]=u,e[3]=n,e[4]=a.tags,e[5]=s,e[6]=p,e[7]=l,e[8]=m,e[9]=o,e[10]=c,e[11]=v}else p=e[6],l=e[7],m=e[8],o=e[9],c=e[10],v=e[11];let y;e[16]!==m||e[17]!==o?(y=t.jsx("div",{className:m,children:o}),e[16]=m,e[17]=o,e[18]=y):y=e[18];let h;e[19]!==i||e[20]!==u||e[21]!==l?(h=!u&&t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(Re,{...Y.rationale,"aria-label":"New task tag",placeholder:"Add your own tag",maxLength:Be,value:i,onChange:f=>g(f.target.value),onKeyDown:f=>{f.key==="Enter"&&(f.preventDefault(),l())}}),t.jsx(O,{disabled:!i.trim(),onClick:l,children:"Add tag"})]}),e[19]=i,e[20]=u,e[21]=l,e[22]=h):h=e[22];let q;return e[23]!==p||e[24]!==c||e[25]!==v||e[26]!==y||e[27]!==h?(q=t.jsxs(p,{className:c,children:[v,y,h]}),e[23]=p,e[24]=c,e[25]=v,e[26]=y,e[27]=h,e[28]=q):q=e[28],q};Me.__docgenInfo={description:"",methods:[],displayName:"TaskTags",props:{options:{required:!0,tsType:{name:"unknown"},description:""}}};function Q(r){const e=W.c(73),{title:n,subtitle:a,facts:u,proposedBy:s,outcomes:d,reasons:i,fields:g,nextTime:p,taskTags:l,defaultReasons:m,show:o,copy:c,aside:v,className:y,reasonOptions:h,renderField:q,readOnly:f,reviewerId:w,saved:k,onChange:j,onComplete:x}=r;let b;e[0]!==u?(b=u===void 0?[]:u,e[0]=u,e[1]=b):b=e[1];const R=b;let N;e[2]!==g?(N=g===void 0?[]:g,e[2]=g,e[3]=N):N=e[3];const T=N;let A;e[4]!==o?(A=o===void 0?{}:o,e[4]=o,e[5]=A):A=e[5];const ae=A,I=w===void 0?"":w;let se;e[6]!==d?(se=Ue(d),e[6]=d,e[7]=se):se=e[7];const C=se,ve=ae.nextTime===!1?void 0:p;let _;e[8]!==d||e[9]!==s||e[10]!==i||e[11]!==C||e[12]!==ve?(_={outcomes:d,recommended:C,proposedBy:s,reasons:i,weighted:!0,nextTime:ve},e[8]=d,e[9]=s,e[10]=i,e[11]=C,e[12]=ve,e[13]=_):_=e[13];let P;if(e[14]!==T||e[15]!==C){let S;e[17]!==C?(S=L=>({id:L.id,label:L.label,kind:L.kind,proposed:L.byOutcome[C]??"",byOutcome:L.byOutcome}),e[17]=C,e[18]=S):S=e[18],P=T.map(S),e[14]=T,e[15]=C,e[16]=P}else P=e[16];let ie;e[19]!==j||e[20]!==x||e[21]!==f||e[22]!==I||e[23]!==k||e[24]!==P||e[25]!==_?(ie={spec:_,seeds:P,readOnly:f,reviewerId:I,saved:k,logEdits:!1,onChange:j,onComplete:x},e[19]=j,e[20]=x,e[21]=f,e[22]=I,e[23]=k,e[24]=P,e[25]=_,e[26]=ie):ie=e[26];const M=Ge(ie),{locked:Oe,hasChange:Ie,state:_e,outcome:Z,spec:le}=M,H=c?.outcome??"Decision",he=!!le.nextTime?.options.length&&(Ie||Oe&&!!_e.lesson);let oe;e[27]===Symbol.for("react.memo_cache_sentinel")?(oe=Y.evidence("context"),e[27]=oe):oe=e[27];let F;e[28]!==n?(F=t.jsx(Ve,{title:n}),e[28]=n,e[29]=F):F=e[29];let E;e[30]!==s||e[31]!==a?(E=(s||a)&&t.jsxs("p",{className:"flex gap-1 text-xs text-muted-foreground",children:[s&&t.jsxs("span",{children:["Proposed by ",s]}),a&&t.jsxs("span",{children:["· ",a]})]}),e[30]=s,e[31]=a,e[32]=E):E=e[32];let D;e[33]!==R?(D=R.map(or),e[33]=R,e[34]=D):D=e[34];let $;e[35]!==D?($=t.jsx("div",{className:"grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3",children:D}),e[35]=D,e[36]=$):$=e[36];let B;e[37]!==F||e[38]!==E||e[39]!==$?(B=t.jsxs(ye,{className:"space-y-1 p-5",...oe,children:[F,E,$]}),e[37]=F,e[38]=E,e[39]=$,e[40]=B):B=e[40];let U;e[41]!==m||e[42]!==h?(U=t.jsx(Le,{reasonOptions:h,defaultReasons:m}),e[41]=m,e[42]=h,e[43]=U):U=e[43];let G;e[44]!==l?(G=l&&t.jsx(Me,{options:l}),e[44]=l,e[45]=G):G=e[45];let X;e[46]!==T||e[47]!==M||e[48]!==Z||e[49]!==C||e[50]!==q||e[51]!==le?(X=T.length>0&&t.jsxs("div",{className:"space-y-3 border-t border-border-de-emp pt-3",children:[t.jsxs("p",{className:"text-xs text-muted-foreground",children:["Final details",Z&&Z!==C&&t.jsxs(t.Fragment,{children:[", set for ",Te(le,Z)]}),". Edit any of them."]}),t.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:T.map(S=>{const L=M.findPart(S.id);return L&&t.jsx(Ne,{field:S,part:L,renderField:q},S.id)})})]}),e[46]=T,e[47]=M,e[48]=Z,e[49]=C,e[50]=q,e[51]=le,e[52]=X):X=e[52];let z;e[53]!==H||e[54]!==X?(z=t.jsx(Xe,{noun:H,children:X}),e[53]=H,e[54]=X,e[55]=z):z=e[55];let K;e[56]!==he?(K=he&&t.jsx(Ce,{}),e[56]=he,e[57]=K):K=e[57];let V;e[58]!==c||e[59]!==H||e[60]!==I||e[61]!==ae.record?(V=t.jsx(Ke,{noun:H,copy:c,showRecord:ae.record,reviewerId:I}),e[58]=c,e[59]=H,e[60]=I,e[61]=ae.record,e[62]=V):V=e[62];let ue;return e[63]!==v||e[64]!==y||e[65]!==M||e[66]!==B||e[67]!==U||e[68]!==G||e[69]!==z||e[70]!==K||e[71]!==V?(ue=t.jsxs(ze,{model:M,aside:v,className:y,children:[B,U,G,z,K,V]}),e[63]=v,e[64]=y,e[65]=M,e[66]=B,e[67]=U,e[68]=G,e[69]=z,e[70]=K,e[71]=V,e[72]=ue):ue=e[72],ue}function or(r){return t.jsxs("div",{children:[t.jsx("span",{className:"mr-1 text-muted-foreground",children:r.label}),r.value]},r.label)}Q.__docgenInfo={description:"",methods:[],displayName:"CaseAssessment",props:{title:{required:!0,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},facts:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ label: string; value: string }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"value",value:{name:"string",required:!0}}]}}],raw:"ReviewFact[]"},description:""},excerpt:{required:!1,tsType:{name:"string"},description:""},proposedBy:{required:!1,tsType:{name:"string"},description:""},outcomes:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
  kind: string;
  byOutcome: Record<string, string>;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"byOutcome",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!0}}]}},name:"field"},{type:{name:"ReactNode"},name:"defaultNode"}],return:{name:"ReactNode"}}},description:""},reasons:{required:!0,tsType:{name:"Array",elements:[{name:"intersection",raw:`ReviewReason & {
  supports: string;
  weight: Weight;
}`,elements:[{name:"signature",type:"object",raw:`{
  id: string;
  title: string;
  detail: string;
  supports?: string;
  weight?: Weight;
  partId?: string;
  source?: string;
  confidence?: number;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"title",value:{name:"string",required:!0}},{key:"detail",value:{name:"string",required:!0}},{key:"supports",value:{name:"string",required:!1}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}},{key:"partId",value:{name:"string",required:!1}},{key:"source",value:{name:"string",required:!1}},{key:"confidence",value:{name:"number",required:!1}}]}},{name:"signature",type:"object",raw:`{
  supports: string;
  weight: Weight;
}`,signature:{properties:[{key:"supports",value:{name:"string",required:!0}},{key:"weight",value:{name:"union",raw:'"High" | "Medium" | "Low" | "Not relevant"',elements:[{name:"literal",value:'"High"'},{name:"literal",value:'"Medium"'},{name:"literal",value:'"Low"'},{name:"literal",value:'"Not relevant"'}],required:!0}}]}}]}],raw:"CaseReason[]"},description:""},fields:{required:!1,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  id: string;
  label: string;
  kind: string;
  byOutcome: Record<string, string>;
}`,signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"kind",value:{name:"string",required:!0}},{key:"byOutcome",value:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>",required:!0}}]}}],raw:"CaseField[]"},description:""},nextTime:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  options: NextTimeOption[];
  conditions: NextTimeCondition[];
}`,signature:{properties:[{key:"options",value:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ id: string; text: string; basis: string }",signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"text",value:{name:"string",required:!0}},{key:"basis",value:{name:"string",required:!0}}]}}],raw:"NextTimeOption[]",required:!0}},{key:"conditions",value:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ id: string; label: string }",signature:{properties:[{key:"id",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}}]}}],raw:"NextTimeCondition[]",required:!0}}]}},description:""},taskTags:{required:!1,tsType:{name:"unknown"},description:""},defaultReasons:{required:!1,tsType:{name:"unknown"},description:""}}};const te={title:"Warranty claim WC-2026-1187",subtitle:"Sign-off",proposedBy:"Warranty claims agent v4",facts:[{label:"Customer",value:"Harlow Marine Services"},{label:"Claim",value:"$8,185"},{label:"Plan ceiling",value:"$5,000"}],outcomes:[{id:"Approve",label:"Approve in full",description:"Pay the full claim."},{id:"ApprovePartial",label:"Approve partial",description:"Pay up to the ceiling and tell the customer which part was covered.",blendsReasons:!0},{id:"Deny",label:"Deny",description:"Close the claim and explain which part was covered.",recommended:!0}],reasons:[{id:"r1",title:"A manufacturing defect caused the seal failure",detail:"Lab report LR-2209 traces the failure to batch defect 22-114.",supports:"Approve",weight:"High",source:"Document extractor v3",confidence:91},{id:"r2",title:"Water entered through an unsealed cable gland",detail:"Site photos 14-17 show an installer error, which the plan excludes.",supports:"Deny",weight:"High",source:"Warranty claims agent v4",confidence:72},{id:"r3",title:"The claim is above the plan ceiling",detail:"$8,185 against a $5,000 ceiling for Standard Plus.",supports:"Deny",weight:"Medium",source:"Rule WC-12 v6 (plan ceiling)",confidence:99},{id:"r4",title:"No earlier claims in four years",detail:"On the plan since November 2022 with a clean history.",supports:"Approve",weight:"Low",source:"Customer history service v2",confidence:95}],fields:[{id:"approvedAmount",label:"Approved amount",kind:"money",byOutcome:{Approve:"8185",ApprovePartial:"5000",Deny:"0"}},{id:"goodwillAmount",label:"Goodwill amount",kind:"money",byOutcome:{Approve:"0",ApprovePartial:"1500",Deny:"0"}},{id:"customerMessage",label:"Message to the customer",kind:"long",byOutcome:{Approve:"Your claim of $8,185 is approved in full.",ApprovePartial:"We can cover $5,000 under your plan and add $1,500 as goodwill. The remaining $1,685 is not covered because water entered through an unsealed cable gland.",Deny:"We cannot approve this claim. The seal failure came from a manufacturing defect, which the plan covers, but water also entered through an unsealed cable gland, which it excludes, and the amount is above the $5,000 ceiling."}}],nextTime:{options:[{id:"l1",text:"When a covered defect and an excluded cause occur together, approve the covered part.",basis:"From: your decision differs from the recommendation."},{id:"l2",text:"Weigh an installer error lower when a lab report names a batch defect.",basis:"From: you changed how much a reason counts."}],conditions:[{id:"k1",label:"are above the plan ceiling"},{id:"k2",label:"have two causes"},{id:"k3",label:"have a lab report"}]}},ne=async()=>{},Pr={title:"Components/CaseAssessment",parameters:{layout:"padded",docs:{description:{component:"The reviewer weighs the agent's reasons and picks an outcome: reasons with a weight menu and Add a reason, outcome cards, final details that follow the outcome, and a Next time rule with a scope. `show.record` renders the record of how the outcome was reached as a collapsed drawer for demos."}}},tags:["autodocs"]},de={render:()=>t.jsx(Q,{...te,onComplete:ne})},me={render:()=>t.jsx(Q,{...te,show:{record:!0},reviewerId:"reviewer@example.com",onComplete:ne})},ce={render:()=>t.jsx(Q,{...te,taskTags:["Water damage","Repeat claimant","Missing photos","Policy exclusion","Goodwill candidate"],onComplete:ne})},ge={render:()=>t.jsx(Q,{...te,defaultReasons:["Manufacturing defect","Installer error","Above plan ceiling","Clean claim history"],onComplete:ne})},pe={render:()=>t.jsx(Q,{...te,readOnly:!0,saved:{outcome:"ApprovePartial"},onComplete:ne})};de.parameters={...de.parameters,docs:{...de.parameters?.docs,source:{originalSource:`{
  render: () => <CaseAssessment {...FIXTURE_CASE} onComplete={complete} />
}`,...de.parameters?.docs?.source}}};me.parameters={...me.parameters,docs:{...me.parameters?.docs,source:{originalSource:`{
  render: () => <CaseAssessment {...FIXTURE_CASE} show={{
    record: true
  }} reviewerId="reviewer@example.com" onComplete={complete} />
}`,...me.parameters?.docs?.source}}};ce.parameters={...ce.parameters,docs:{...ce.parameters?.docs,source:{originalSource:`{
  render: () => <CaseAssessment {...FIXTURE_CASE} taskTags={["Water damage", "Repeat claimant", "Missing photos", "Policy exclusion", "Goodwill candidate"]} onComplete={complete} />
}`,...ce.parameters?.docs?.source}}};ge.parameters={...ge.parameters,docs:{...ge.parameters?.docs,source:{originalSource:`{
  render: () => <CaseAssessment {...FIXTURE_CASE} defaultReasons={["Manufacturing defect", "Installer error", "Above plan ceiling", "Clean claim history"]} onComplete={complete} />
}`,...ge.parameters?.docs?.source}}};pe.parameters={...pe.parameters,docs:{...pe.parameters?.docs,source:{originalSource:`{
  render: () => <CaseAssessment {...FIXTURE_CASE} readOnly saved={{
    outcome: "ApprovePartial"
  }} onComplete={complete} />
}`,...pe.parameters?.docs?.source}}};const Hr=["WarrantyClaim","WithRecord","WithTaskTags","WithReasonTags","ReadOnly"];export{pe as ReadOnly,de as WarrantyClaim,ge as WithReasonTags,me as WithRecord,ce as WithTaskTags,Hr as __namedExportsOrder,Pr as default};
