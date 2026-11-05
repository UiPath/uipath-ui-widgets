import{j as m}from"./jsx-runtime-C5WNSv3b.js";import{c as g}from"./compiler-runtime-CdRayByh.js";import{I as f}from"./input-BUvFRMBF.js";import{T as p}from"./textarea-BB0xUawe.js";import{u as y,s as v}from"./useDecisionCapture-BMnTNrlA.js";function k(n){const e=g.c(18),{locked:u,lookAt:s,edit:t,settle:o}=y();let r;e[0]!==n.id?(r=v.field(n.id),e[0]=n.id,e[1]=r):r=e[1];let i;e[2]!==s||e[3]!==n.id?(i=()=>s(n.id),e[2]=s,e[3]=n.id,e[4]=i):i=e[4];let l;e[5]!==t||e[6]!==n.id?(l=c=>t(n.id,c.target.value),e[5]=t,e[6]=n.id,e[7]=l):l=e[7];let a;e[8]!==n.id||e[9]!==o?(a=()=>o(n.id),e[8]=n.id,e[9]=o,e[10]=a):a=e[10];let d;return e[11]!==u||e[12]!==n.value||e[13]!==r||e[14]!==i||e[15]!==l||e[16]!==a?(d={...r,disabled:u,value:n.value,onFocus:i,onChange:l,onBlur:a},e[11]=u,e[12]=n.value,e[13]=r,e[14]=i,e[15]=l,e[16]=a,e[17]=d):d=e[17],d}const b=n=>{const e=g.c(5),{part:u,id:s,label:t,rows:o}=n,r=k(u);let i;return e[0]!==r||e[1]!==s||e[2]!==t||e[3]!==o?(i=o?m.jsx(p,{id:s,"aria-label":t,rows:o,...r}):m.jsx(f,{id:s,"aria-label":t,...r}),e[0]=r,e[1]=s,e[2]=t,e[3]=o,e[4]=i):i=e[4],i};b.__docgenInfo={description:"",methods:[],displayName:"ProposalInput",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},id:{required:!1,tsType:{name:"string"},description:""},label:{required:!1,tsType:{name:"string"},description:""},rows:{required:!1,tsType:{name:"number"},description:""}}};export{b as P};
