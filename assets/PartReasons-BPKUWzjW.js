import{j as c}from"./jsx-runtime-C5WNSv3b.js";import{c as y}from"./compiler-runtime-BwYPU46P.js";import{u as k,R as f}from"./useDecisionCapture-DWxNsqPX.js";const q=p=>{const e=y.c(17),{part:n,question:o,options:a,placeholder:u}=p,{locked:l,toggleWhy:d,editNote:g}=k();let r;e[0]!==n.note||e[1]!==n.why?(r={why:n.why,note:n.note},e[0]=n.note,e[1]=n.why,e[2]=r):r=e[2];let t;e[3]!==n.id||e[4]!==d?(t=m=>d(n.id,m),e[3]=n.id,e[4]=d,e[5]=t):t=e[5];let i;e[6]!==g||e[7]!==n.id?(i=m=>g(n.id,m),e[6]=g,e[7]=n.id,e[8]=i):i=e[8];let s;return e[9]!==l||e[10]!==a||e[11]!==u||e[12]!==o||e[13]!==r||e[14]!==t||e[15]!==i?(s=c.jsx(f,{question:o,options:a,pick:r,disabled:l,placeholder:u,onToggle:t,onNote:i}),e[9]=l,e[10]=a,e[11]=u,e[12]=o,e[13]=r,e[14]=t,e[15]=i,e[16]=s):s=e[16],s};q.__docgenInfo={description:"",methods:[],displayName:"PartReasons",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},question:{required:!0,tsType:{name:"string"},description:""},options:{required:!0,tsType:{name:"unknown"},description:""},placeholder:{required:!1,tsType:{name:"string"},description:""}}};export{q as P};
