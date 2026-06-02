import{j as n}from"./index-yJg_3BbZ.js";import{A as ge,b as pe,C as ve,d as xe,B as re,s as Ae,e as se,f as oe,U as ye}from"./jsep-BMd_HHWK.js";import{r as N}from"./iframe-DWWLR8WO.js";import{c as U}from"./compiler-runtime-BRYx_RS0.js";import{C as Se,t as Z,T as ee,a as te,b as be}from"./ConversationalAgentChat-ByImSCRg.js";import"./index-qJpT_9-h.js";import"./preload-helper-PPVm8Dsz.js";import"./endOfMonth-CsMzRpQk.js";const le=["#7c3aed","#2563eb","#0891b2","#059669","#dc2626","#ea580c","#d97706","#db2777","#0d9488","#475569"];function J(a){return`${a.folderId}-${a.id}`}function we(a){let e=0;for(let t=0;t<a.length;t++)e=(e<<5)-e+a.charCodeAt(t),e|=0;return le[Math.abs(e)%le.length]}const Ce="No description available",Te="Add to favorites",je="Remove from favorites",Ne=a=>{const e=U.c(34),{agent:t,isFavorite:r,onSelect:m,onToggleFavorite:l}=a;let o;e[0]!==t.name?(o=t.name.charAt(0).toUpperCase()||"?",e[0]=t.name,e[1]=o):o=e[1];const i=o;let c;e[2]!==t.name?(c=we(t.name),e[2]=t.name,e[3]=c):c=e[3];const f=c;let g;e[4]!==t||e[5]!==m?(g=()=>m(t),e[4]=t,e[5]=m,e[6]=g):g=e[6];let s;e[7]!==f?(s={backgroundColor:f},e[7]=f,e[8]=s):s=e[8];let y;e[9]!==i||e[10]!==s?(y=n.jsx(ge,{className:"h-12 w-12 rounded-md",children:n.jsx(pe,{className:"rounded-md text-white font-semibold text-base",style:s,children:i})}),e[9]=i,e[10]=s,e[11]=y):y=e[11];let h;e[12]!==t.name?(h=n.jsx("div",{className:"font-semibold truncate",children:t.name}),e[12]=t.name,e[13]=h):h=e[13];const k=t.description||Ce;let d;e[14]!==k?(d=n.jsx(ve,{className:"line-clamp-2 mt-1",children:k}),e[14]=k,e[15]=d):d=e[15];let T;e[16]!==h||e[17]!==d?(T=n.jsxs("div",{className:"flex-1 min-w-0 pr-6",children:[h,d]}),e[16]=h,e[17]=d,e[18]=T):T=e[18];let w;e[19]!==g||e[20]!==y||e[21]!==T?(w=n.jsxs("button",{type:"button",onClick:g,className:"flex items-start gap-3 p-4 w-full text-left cursor-pointer rounded-[inherit] focus:outline-none",children:[y,T]}),e[19]=g,e[20]=y,e[21]=T,e[22]=w):w=e[22];const I=`absolute top-3 right-3 text-lg leading-none rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${r?"text-amber-500":"text-muted-foreground hover:text-foreground"}`;let p;e[23]!==t||e[24]!==l?(p=()=>l(t),e[23]=t,e[24]=l,e[25]=p):p=e[25];const O=r?je:Te,S=r?"★":"☆";let C;e[26]!==I||e[27]!==p||e[28]!==O||e[29]!==S?(C=n.jsx("button",{type:"button",className:I,onClick:p,"aria-label":O,children:S}),e[26]=I,e[27]=p,e[28]=O,e[29]=S,e[30]=C):C=e[30];let j;return e[31]!==w||e[32]!==C?(j=n.jsxs(xe,{className:"relative transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring",children:[w,C]}),e[31]=w,e[32]=C,e[33]=j):j=e[33],j},ne=a=>{const e=U.c(11),{agents:t,onSelect:r,favorites:m,onToggleFavorite:l}=a;let o;if(e[0]!==t||e[1]!==m||e[2]!==r||e[3]!==l){let c;e[5]!==m||e[6]!==r||e[7]!==l?(c=f=>{const g=J(f);return n.jsx(Ne,{agent:f,isFavorite:m.has(g),onSelect:r,onToggleFavorite:l},g)},e[5]=m,e[6]=r,e[7]=l,e[8]=c):c=e[8],o=t.map(c),e[0]=t,e[1]=m,e[2]=r,e[3]=l,e[4]=o}else o=e[4];let i;return e[9]!==o?(i=n.jsx("div",{className:"grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]",children:o}),e[9]=o,e[10]=i):i=e[10],i};ne.__docgenInfo={description:"",methods:[],displayName:"AgentList",props:{agents:{required:!0,tsType:{name:"Array",elements:[{name:"AgentSummary"}],raw:"AgentSummary[]"},description:""},onSelect:{required:!0,tsType:{name:"signature",type:"function",raw:"(agent: AgentSummary) => void",signature:{arguments:[{type:{name:"AgentSummary"},name:"agent"}],return:{name:"void"}}},description:""},favorites:{required:!0,tsType:{name:"Set",elements:[{name:"string"}],raw:"Set<string>"},description:""},onToggleFavorite:{required:!0,tsType:{name:"signature",type:"function",raw:"(agent: AgentSummary) => void",signature:{arguments:[{type:{name:"AgentSummary"},name:"agent"}],return:{name:"void"}}},description:""}}};const ke="uipath-ui-widgets.conv-agent-favorites",ie=a=>{const{orgName:e,tenantName:t}=a.config;return`${ke}:${encodeURIComponent(e)}:${encodeURIComponent(t)}`},_e=a=>{if(typeof window>"u")return new Set;try{const e=window.localStorage.getItem(a);if(!e)return new Set;const t=JSON.parse(e);return new Set(Array.isArray(t)?t.filter(r=>typeof r=="string"):[])}catch{return new Set}},Ee=(a,e)=>{if(!(typeof window>"u"))try{window.localStorage.setItem(a,JSON.stringify(Array.from(e)))}catch{}},Fe=a=>{const e=U.c(7);let t;e[0]!==a?(t=()=>_e(ie(a)),e[0]=a,e[1]=t):t=e[1];const[r,m]=N.useState(t);let l;e[2]!==a?(l=c=>{const f=ie(a);m(g=>{const s=new Set(g);return s.has(c)?s.delete(c):s.add(c),Ee(f,s),s})},e[2]=a,e[3]=l):l=e[3];const o=l;let i;return e[4]!==r||e[5]!==o?(i={favorites:r,toggle:o},e[4]=r,e[5]=o,e[6]=i):i=e[6],i},De="UiPath Agent Chat",Le="Select an agent to start a conversation.",Re="Back",ce="Search agents...",Ue="Favorites",Ie="All Agents",Oe="Agents",Pe="No agents available.",Ke="No agents match your search.",$e="Loading agents...",ze="Reload",de=a=>{const e=U.c(3),{children:t,className:r}=a,l=`mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${r===void 0?"":r}`;let o;return e[0]!==t||e[1]!==l?(o=n.jsx("h3",{className:l,children:t}),e[0]=t,e[1]=l,e[2]=o):o=e[2],o},ue=a=>{const e=U.c(2),{children:t}=a;let r;return e[0]!==t?(r=n.jsx("div",{className:"flex flex-col items-center justify-center gap-4 flex-1 p-6",children:t}),e[0]=t,e[1]=r):r=e[1],r},me=a=>{const e=U.c(56),{sdk:t,locale:r,theme:m,readOnly:l,overrideLabels:o,onAgentSelected:i}=a,c=r===void 0?"en":r,f=m===void 0?"light":m,g=l===void 0?!1:l,[s,y]=N.useState(null),[h,k]=N.useState(null),[d,T]=N.useState(null),[w,I]=N.useState(0),[p,O]=N.useState(""),{favorites:S,toggle:C}=Fe(t);let j;e[0]!==t?(j=()=>{let u=!1;return(async()=>{try{const x=await new be(t).getAll();if(u)return;const A=x.map(qe);y(A),k(null),Z(te.LoadAgents,ee.Success,{agentCount:A.length})}catch(b){const x=b;if(u)return;const A=x instanceof Error?x.message:"Failed to load agents";k(A),Z(te.LoadAgents,ee.Error,{error:A})}})(),()=>{u=!0}},e[0]=t,e[1]=j):j=e[1];let K;e[2]!==w||e[3]!==t?(K=[t,w],e[2]=w,e[3]=t,e[4]=K):K=e[4],N.useEffect(j,K);let $;e[5]!==i?($=u=>{T(u),i?.(u),Z(te.SelectAgent,ee.Success,{agentId:u.id,folderId:u.folderId})},e[5]=i,e[6]=$):$=e[6];const z=$;let q;e[7]===Symbol.for("react.memo_cache_sentinel")?(q=()=>{T(null)},e[7]=q):q=e[7];const he=q;let B;e[8]===Symbol.for("react.memo_cache_sentinel")?(B=()=>{k(null),y(null),I(Be)},e[8]=B):B=e[8];const fe=B;let M;e[9]!==C?(M=u=>C(J(u)),e[9]=C,e[10]=M):M=e[10];const V=M;let Q;e:{if(!s){let v;e[11]===Symbol.for("react.memo_cache_sentinel")?(v={favoriteAgents:[],otherAgents:[]},e[11]=v):v=e[11],Q=v;break e}let u;if(e[12]!==s||e[13]!==S||e[14]!==p){const v=p.trim().toLowerCase(),b=R=>v?R.name.toLowerCase().includes(v)||(R.description?.toLowerCase().includes(v)??!1):!0,x=s.filter(b),A=[],ae=[];for(const R of x)S.has(J(R))?A.push(R):ae.push(R);u={favoriteAgents:A,otherAgents:ae},e[12]=s,e[13]=S,e[14]=p,e[15]=u}else u=e[15];Q=u}const{favoriteAgents:_,otherAgents:P}=Q;if(d){let u;e[16]===Symbol.for("react.memo_cache_sentinel")?(u=n.jsx(re,{variant:"outline",onClick:he,children:Re}),e[16]=u):u=e[16];let v;e[17]!==d.name?(v=n.jsxs("div",{className:"flex items-center gap-2 px-4 py-2 border-b border-border-de-emp",children:[u,n.jsx("span",{className:"font-medium truncate",children:d.name})]}),e[17]=d.name,e[18]=v):v=e[18];let b;e[19]!==d?(b=J(d),e[19]=d,e[20]=b):b=e[20];let x;e[21]!==c||e[22]!==o||e[23]!==g||e[24]!==t||e[25]!==d.folderId||e[26]!==d.id||e[27]!==b||e[28]!==f?(x=n.jsx("div",{className:"flex-1 min-h-0 p-2",children:n.jsx(Se,{sdk:t,agentId:d.id,folderId:d.folderId,locale:c,theme:f,readOnly:g,overrideLabels:o},b)}),e[21]=c,e[22]=o,e[23]=g,e[24]=t,e[25]=d.folderId,e[26]=d.id,e[27]=b,e[28]=f,e[29]=x):x=e[29];let A;return e[30]!==v||e[31]!==x?(A=n.jsxs("div",{className:"flex flex-col h-full overflow-hidden",children:[v,x]}),e[30]=v,e[31]=x,e[32]=A):A=e[32],A}const Y=_.length>0||P.length>0;let G;e[33]===Symbol.for("react.memo_cache_sentinel")?(G=n.jsxs("div",{className:"px-8 pt-8 pb-4 text-center",children:[n.jsx("h2",{className:"text-2xl font-semibold",children:De}),n.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:Le})]}),e[33]=G):G=e[33];let E;e[34]!==p?(E=n.jsx("div",{className:"px-8 pb-4 max-w-2xl w-full mx-auto",children:n.jsx(Ae,{value:p,onChange:O,placeholder:ce,"aria-label":ce})}),e[34]=p,e[35]=E):E=e[35];let F;e[36]!==h?(F=h&&n.jsxs(ue,{children:[n.jsx(se,{variant:"destructive",children:n.jsx(oe,{children:h})}),n.jsx(re,{variant:"outline",onClick:fe,children:ze})]}),e[36]=h,e[37]=F):F=e[37];let D;e[38]!==s||e[39]!==h?(D=!h&&s===null&&n.jsx(ue,{children:n.jsx(se,{children:n.jsx(oe,{children:$e})})}),e[38]=s,e[39]=h,e[40]=D):D=e[40];let L;e[41]!==s||e[42]!==h||e[43]!==_||e[44]!==S||e[45]!==z||e[46]!==V||e[47]!==Y||e[48]!==P||e[49]!==p?(L=!h&&s!==null&&n.jsxs("div",{className:"flex-1 overflow-y-auto px-8 pb-8",children:[!Y&&n.jsx("div",{className:"text-center py-12 text-sm text-muted-foreground",children:p?Ke:Pe}),_.length>0&&n.jsxs(n.Fragment,{children:[n.jsx(de,{className:"mt-4",children:Ue}),n.jsx(ne,{agents:_,onSelect:z,favorites:S,onToggleFavorite:V})]}),P.length>0&&n.jsxs(n.Fragment,{children:[n.jsx(de,{className:_.length>0?"mt-8":"mt-4",children:_.length>0?Ie:Oe}),n.jsx(ne,{agents:P,onSelect:z,favorites:S,onToggleFavorite:V})]})]}),e[41]=s,e[42]=h,e[43]=_,e[44]=S,e[45]=z,e[46]=V,e[47]=Y,e[48]=P,e[49]=p,e[50]=L):L=e[50];let H;return e[51]!==E||e[52]!==F||e[53]!==D||e[54]!==L?(H=n.jsxs("div",{className:"flex flex-col h-full overflow-hidden",children:[G,E,F,D,L]}),e[51]=E,e[52]=F,e[53]=D,e[54]=L,e[55]=H):H=e[55],H};me.__docgenInfo={description:"",methods:[],displayName:"ConversationalAgentPickerChat",props:{sdk:{required:!0,tsType:{name:"UiPath"},description:""},locale:{required:!1,tsType:{name:"union",raw:`| "en"
| "es"
| "pt"
| "de"
| "fr"
| "ja"
| "ko"
| "ru"
| "tr"
| "zh-CN"
| "zh-TW"
| "pt-BR"
| "es-MX"`,elements:[{name:"literal",value:'"en"'},{name:"literal",value:'"es"'},{name:"literal",value:'"pt"'},{name:"literal",value:'"de"'},{name:"literal",value:'"fr"'},{name:"literal",value:'"ja"'},{name:"literal",value:'"ko"'},{name:"literal",value:'"ru"'},{name:"literal",value:'"tr"'},{name:"literal",value:'"zh-CN"'},{name:"literal",value:'"zh-TW"'},{name:"literal",value:'"pt-BR"'},{name:"literal",value:'"es-MX"'}]},description:"",defaultValue:{value:'"en"',computed:!1}},theme:{required:!1,tsType:{name:"union",raw:'"light" | "dark" | "light-hc" | "dark-hc"',elements:[{name:"literal",value:'"light"'},{name:"literal",value:'"dark"'},{name:"literal",value:'"light-hc"'},{name:"literal",value:'"dark-hc"'}]},description:"",defaultValue:{value:'"light"',computed:!1}},readOnly:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},overrideLabels:{required:!1,tsType:{name:"OverrideLabels"},description:""},onAgentSelected:{required:!1,tsType:{name:"signature",type:"function",raw:"(agent: AgentSummary) => void",signature:{arguments:[{type:{name:"AgentSummary"},name:"agent"}],return:{name:"void"}}},description:""}}};function qe(a){return{id:a.id,name:a.name,description:a.description,folderId:a.folderId}}function Be(a){return a+1}const Me=({baseUrl:a,orgName:e,tenantName:t,secret:r,...m})=>{const[l,o]=N.useState({sdk:null,error:null});N.useEffect(()=>{if(!a||!e||!t||!r)return;let f=!1;return(async()=>{try{const s=a.match(/^https?:\/\//)?a:`https://${a}`,y=new ye({baseUrl:s,orgName:e,tenantName:t,secret:r});await y.initialize(),f||o({sdk:y,error:null})}catch(s){f||o({sdk:null,error:s instanceof Error?s.message:"Failed to initialize SDK"})}})(),()=>{f=!0}},[a,e,t,r]);const{sdk:i,error:c}=l;return!a||!e||!t||!r?n.jsx("div",{style:{padding:24,color:"#666"},children:"Please provide baseUrl, orgName, tenantName, and secret in the controls panel below."}):c?n.jsxs("div",{style:{padding:24,color:"#d32f2f"},children:["SDK initialization failed: ",c]}):i?n.jsx(me,{sdk:i,...m}):n.jsx("div",{style:{padding:24},children:"Initializing SDK..."})},Ze={title:"Components/ConversationalAgentPickerChat",component:Me,decorators:[a=>n.jsx("div",{style:{height:"600px"},children:n.jsx(a,{})})],parameters:{layout:"padded",docs:{description:{component:`
A React widget that lists conversational agents available on a given UiPath SDK and mounts \`ConversationalAgentChat\` for the selected agent.

## Features

- Lists all agents accessible to the provided SDK (across folders)
- Click an agent to open a chat with it
- Back button returns to the agent list
- Refetches and resets selection when the SDK prop changes

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-conversational-agent-chat
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { ConversationalAgentPickerChat } from '@uipath/ui-widgets-conversational-agent-chat';
import "@uipath/ui-widgets-conversational-agent-chat/ConversationalAgentChat.css";
import { UiPath } from '@uipath/uipath-typescript/core';

function App() {
  const sdk = new UiPath({
    baseUrl: 'https://cloud.uipath.com',
    orgName: 'your-org',
    tenantName: 'your-tenant',
    secret: 'your-secret'
  });

  await sdk.initialize();

  return (
    <ConversationalAgentPickerChat
      sdk={sdk}
      locale="en"
      theme="light"
      onAgentSelected={(agent) => console.log("picked", agent)}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-react
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{baseUrl:{description:"UiPath API base URL",control:"text",table:{category:"SDK Configuration"}},orgName:{description:"UiPath organization name",control:"text",table:{category:"SDK Configuration"}},tenantName:{description:"UiPath tenant name",control:"text",table:{category:"SDK Configuration"}},secret:{description:"UiPath API secret for authentication",control:"text",table:{category:"SDK Configuration"}},locale:{description:"Locale for the chat UI",control:"select",options:["en","es","pt","de","fr","ja","ko","ru","tr","zh-CN","zh-TW","pt-BR","es-MX"]},theme:{description:"Visual theme for the chat UI",control:"select",options:["light","dark","light-hc","dark-hc"]},readOnly:{description:"When true, disables user input in the chat view",control:"boolean"},overrideLabels:{description:"Override default labels for title, footer disclaimer, and input placeholder in the chat view",control:"object"}},args:{baseUrl:"cloud.uipath.com",orgName:"",tenantName:"",secret:"",locale:"en",theme:"light",readOnly:!1,overrideLabels:void 0}},W={parameters:{docs:{description:{story:"Default picker. Fill in the SDK configuration in the controls panel to load the agent list."}}}},X={args:{theme:"dark"},parameters:{docs:{description:{story:"Picker with the dark theme applied to the chat view."}}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Default picker. Fill in the SDK configuration in the controls panel to load the agent list."
      }
    }
  }
}`,...W.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    theme: "dark"
  },
  parameters: {
    docs: {
      description: {
        story: "Picker with the dark theme applied to the chat view."
      }
    }
  }
}`,...X.parameters?.docs?.source}}};const et=["Default","DarkTheme"];export{X as DarkTheme,W as Default,et as __namedExportsOrder,Ze as default};
