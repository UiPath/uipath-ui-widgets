import{j as d}from"./jsx-runtime-C5WNSv3b.js";import{c as m}from"./compiler-runtime-CdRayByh.js";import{B as g}from"./button-SFMwP8Up.js";import{u as c}from"./useDecisionCapture-BMnTNrlA.js";const p=a=>{const e=m.c(8),{part:n,idleLabel:l}=a,{locked:u,lookAt:i}=c();if(u)return null;const o=`Confirm ${n.label}`;let r;e[0]!==i||e[1]!==n.id?(r=()=>i(n.id),e[0]=i,e[1]=n.id,e[2]=r):r=e[2];const s=n.looked?"✓ Confirmed":l;let t;return e[3]!==n.looked||e[4]!==o||e[5]!==r||e[6]!==s?(t=d.jsx(g,{variant:"link","aria-pressed":n.looked,"aria-label":o,className:"h-auto p-0 text-xs",onClick:r,children:s}),e[3]=n.looked,e[4]=o,e[5]=r,e[6]=s,e[7]=t):t=e[7],t};p.__docgenInfo={description:"",methods:[],displayName:"ConfirmButton",props:{part:{required:!0,tsType:{name:"intersection",raw:`ReviewSeed & {
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
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"follows",value:{name:"string",required:!1}},{key:"looked",value:{name:"boolean",required:!0}},{key:"why",value:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}],required:!0}},{key:"note",value:{name:"string",required:!0}}]}}]},description:""},idleLabel:{required:!0,tsType:{name:"string"},description:""}}};export{p as C};
