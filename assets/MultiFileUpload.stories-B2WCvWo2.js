import{t as J,U as re}from"./index-Dxcz6xcn.js";import{j as t}from"./jsx-runtime-C5WNSv3b.js";import{c as Q,B as Y}from"./button-BQ2LyEX9.js";import{r as l}from"./iframe-BR0eYTGY.js";import{c as te,X as se}from"./x-CjQMzjJb.js";import{B as oe}from"./index-DLnTCYu2.js";import"./preload-helper-PPVm8Dsz.js";const ae=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],ne=te("upload",ae);function ie({id:c,ariaLabel:N,onFilesChange:D,accept:y,multiple:g=!1,disabled:n=!1,maxSize:h,className:S,showPreview:i=!1,errors:w,onBlur:$}){const[u,W]=l.useState([]),[v,T]=l.useState(!1),[C,b]=l.useState(new Map),[U,P]=l.useState([]),I=l.useRef(null),H=e=>{if(!y)return!0;const o=y.split(",").map(s=>s.trim().toLowerCase());for(const s of o)if(s.endsWith("/*")){const r=s.slice(0,-2);if(e.type.toLowerCase().startsWith(r))return!0}else if(s.includes("/")){if(e.type.toLowerCase()===s)return!0}else if(s.startsWith(".")&&e.name.toLowerCase().endsWith(s))return!0;return!1},V=(e,o,s)=>{const r=[],k=g?new Map(s):new Map;for(const a of e){const F=o+r.length;if(!H(a)){k.set(F,"File type not accepted"),r.push(a);continue}if(h&&a.size>h){k.set(F,`Exceeds maximum size of ${G(h)}`),r.push(a);continue}u.some(M=>M.name===a.name&&M.size===a.size)||r.push(a)}return{validFiles:r,errors:k}},m=e=>{if(!e||e.length===0)return;const o=Array.from(e),s=g?u.length:0,{validFiles:r,errors:k}=V(o,s,C);if(r.length===0)return;const a=g?[...u,...r]:r;if(W(a),D?.(a),b(k),i){const F=[];r.forEach(X=>{if(X.type.startsWith("image/")){const M=new FileReader;M.onloadend=()=>{F.push(M.result),F.length===r.filter(ee=>ee.type.startsWith("image/")).length&&P(g?[...U,...F]:F)},M.readAsDataURL(X)}})}},E=e=>{const o=u.filter((s,r)=>r!==e);if(W(o),D?.(o),i){const s=U.filter((r,k)=>k!==e);P(s)}b(s=>{const r=new Map;return s.forEach((k,a)=>{a<e?r.set(a,k):a>e&&r.set(a-1,k)}),r})},f=e=>{e.preventDefault(),e.stopPropagation(),n||T(!0)},x=e=>{e.preventDefault(),e.stopPropagation(),T(!1)},d=e=>{e.preventDefault(),e.stopPropagation()},K=e=>{e.preventDefault(),e.stopPropagation(),T(!1),n||m(e.dataTransfer.files)},z=e=>{m(e.target.files),I.current&&(I.current.value="")},A=()=>{n||I.current?.click()},G=e=>{if(e===0)return"0 Bytes";const o=1024,s=["Bytes","KB","MB","GB"],r=Math.floor(Math.log(e)/Math.log(o));return Math.round(e/o**r*100)/100+" "+s[r]};return t.jsxs("fieldset",{className:Q("m-0 min-w-0 w-full border-0 p-0",S),onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||$?.(e)},children:[t.jsx("input",{ref:I,id:c,type:"file",className:"hidden",accept:y,multiple:g,disabled:n,onChange:z,"aria-label":c?void 0:N??"File upload"}),t.jsxs("div",{role:"button","aria-label":N??"File upload area","aria-disabled":n,tabIndex:n?-1:0,className:Q("relative flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background","future:rounded-xl",v?"border-primary bg-primary/5":"border-input bg-background hover:bg-accent/50 future:border-border future:bg-surface-raised future:hover:bg-surface-overlay",n&&"opacity-50 cursor-not-allowed hover:bg-background future:hover:bg-surface-raised"),onDragEnter:f,onDragOver:d,onDragLeave:x,onDrop:K,onClick:A,onKeyDown:e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),A())},children:[t.jsx(ne,{className:"w-8 h-8 mb-2 text-muted-foreground"}),t.jsxs("p",{className:"text-sm text-muted-foreground text-center",children:[t.jsx("span",{className:"font-semibold",children:"Click to upload"})," or drag and drop"]}),y&&t.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:y.split(",").join(", ")}),h&&t.jsxs("p",{className:"text-xs text-muted-foreground",children:["Max size: ",G(h)]})]}),u.length>0&&t.jsx("div",{className:"mt-4 space-y-2",children:u.map((e,o)=>{const s=w?.[e.name]??C.get(o);return t.jsxs("div",{className:Q("flex flex-col p-3 rounded-md future:rounded-xl",s?"bg-destructive/10 border border-destructive/20":"bg-accent/50 future:bg-surface-raised"),children:[t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[i&&U[o]&&t.jsx("img",{src:U[o],alt:e.name,className:"w-10 h-10 object-cover rounded"}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("p",{className:"text-sm font-medium truncate",children:e.name}),t.jsx("p",{className:"text-xs text-muted-foreground",children:G(e.size)})]})]}),t.jsx(Y,{variant:"ghost",icon:!0,size:"xs","aria-label":`Remove ${e.name}`,onClick:r=>{r.stopPropagation(),E(o)},disabled:n,children:t.jsx(se,{className:"h-4 w-4"})})]}),s&&t.jsx("p",{className:"text-xs text-destructive mt-2",children:s})]},o)})})]})}const le="1.0.0",p={ApplicationName:"Widget.MultiFileUpload",Version:le,Service:{UploadFile:"MFU.UploadFile"},Telemetry:{Usage:"MFU.Usage",Error:"MFU.Error"}},Z=({sdk:c,bucketId:N,folderId:D,accept:y,maxFileSizeInMb:g,path:n,onUploadError:h,onUploadSuccess:S})=>{const[i,w]=l.useState([]),[$,u]=l.useState(!1),[W,v]=l.useState({}),[T,C]=l.useState(0),[b,U]=l.useState(!1),P=l.useRef(new oe(c)),I=l.useCallback(async()=>{if(!b){U(!0),u(!1),v({});try{const m=n?n.endsWith("/")?n:`${n}/`:"",E=await Promise.allSettled(i.map(d=>P.current.uploadFile({bucketId:N,folderId:D,path:m+d.name,content:d}))),f={},x=[];E.forEach((d,K)=>{const z=i[K];if(d.status==="fulfilled"&&d.value.statusCode===201)x.push(z);else{const A=d.reason?.message||"Upload failed";f[z.name]=A,J(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:A})}}),J(p.Service.UploadFile,p.Telemetry.Usage,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,TotalFiles:i.length,SuccessCount:x.length,FailureCount:Object.keys(f).length,HasAccept:!!y,HasMaxFileSizeInMb:!!g,HasOnUploadError:!!h,HasOnUploadSuccess:!!S}),Object.keys(f).length===0?(u(!0),S?.(i),w([]),C(d=>d+1)):(v(f),x.length>0&&(w(i.filter(d=>f[d.name])),S?.(x)),h?.(new Error(`${Object.keys(f).length} file(s) failed to upload`)))}catch(m){const E={},f=m.message||"Upload failed";i.forEach(x=>{E[x.name]=f}),v(E),h?.(m),J(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:f,ErrorType:"uncaught",TotalFiles:i.length})}finally{U(!1)}}},[y,N,i,D,b,g,h,S,n]),H=l.useCallback(m=>{w(m),u(!1),v({})},[]),V=l.useCallback(()=>{w([]),u(!1),v({}),C(m=>m+1)},[]);return t.jsxs("div",{className:"uipath-multi-file-upload w-[400px]",children:[t.jsx(ie,{onFilesChange:H,multiple:!0,maxSize:g?g*1024*1024:void 0,accept:y,errors:W},T),$&&t.jsx("div",{className:"mt-2 text-sm text-green-600",children:"Files uploaded successfully!"}),t.jsxs("div",{className:"flex gap-2 mt-4 justify-center",children:[t.jsx(Y,{onClick:I,disabled:i.length===0||b,children:b?"Uploading...":"Upload Files"}),t.jsx(Y,{variant:"outline",onClick:V,disabled:i.length===0||b,children:"Clear"})]})]})};Z.__docgenInfo={description:"",methods:[],displayName:"MultiFileUpload",props:{sdk:{required:!0,tsType:{name:"UiPath"},description:""},bucketId:{required:!0,tsType:{name:"number"},description:""},folderId:{required:!0,tsType:{name:"number"},description:""},accept:{required:!1,tsType:{name:"string"},description:""},maxFileSizeInMb:{required:!1,tsType:{name:"number"},description:""},path:{required:!1,tsType:{name:"string"},description:""},onUploadError:{required:!1,tsType:{name:"signature",type:"function",raw:"(error: Error) => void",signature:{arguments:[{type:{name:"Error"},name:"error"}],return:{name:"void"}}},description:""},onUploadSuccess:{required:!1,tsType:{name:"signature",type:"function",raw:"(uploadedFiles: File[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"File"}],raw:"File[]"},name:"uploadedFiles"}],return:{name:"void"}}},description:""}}};const j=new re({baseUrl:"https://mock.uipath.com",orgName:"storybook-org",tenantName:"storybook-tenant",secret:"dummy-secret"}),he={title:"Components/MultiFileUpload",component:Z,parameters:{layout:"centered",docs:{description:{component:`
A React multi-file-upload widget for uploading multiple files simultaneously to UiPath Orchestrator's Storage bucket.

## Features

- Upload multiple files simultaneously
- Drag and drop support
- File type validation via accept attribute
- File size validation
- Error handling
- Built on Apollo Wind FileUpload component

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-multi-file-upload
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { MultiFileUpload } from '@uipath/ui-widgets-multi-file-upload';
import "@uipath/ui-widgets-multi-file-upload/MultiFileUpload.css";
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    // SDK configuration
  });

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
  };

  const handleUploadSuccess = (uploadedFiles: File[]) => {
    console.log('Successfully uploaded:', uploadedFiles.map(f => f.name));
  };

  return (
    <MultiFileUpload
      sdk={sdk}
      bucketId={123}
      folderId={456}
      path="uploads/"
      onUploadError={handleUploadError}
      onUploadSuccess={handleUploadSuccess}
      maxFileSizeInMb={10}
      accept=".pdf,.jpg,.png"
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{sdk:{description:"UiPath SDK instance",control:!1},bucketId:{description:"The ID of the Orchestrator Storage Bucket to upload files to",control:"number"},folderId:{description:"The ID of the folder containing the Storage Bucket",control:"number"},path:{description:'Path prefix for uploaded files (e.g., "uploads/")',control:"text"},onUploadError:{description:"Callback function called when upload fails",action:"uploadError"},onUploadSuccess:{description:"Callback function called when files are successfully uploaded",action:"uploadSuccess"},maxFileSizeInMb:{description:"Maximum file size in megabytes",control:"number"},accept:{description:"Accepted file types (comma-separated MIME types or extensions). See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) for details",control:"text"}}},B={args:{sdk:j,bucketId:1,folderId:1}},O={args:{sdk:j,bucketId:1,folderId:1,accept:"image/*"},parameters:{docs:{description:{story:"Only accepts image files."}}}},R={args:{sdk:j,bucketId:1,folderId:1,maxFileSizeInMb:5},parameters:{docs:{description:{story:"Limits file size to 5MB."}}}},q={args:{sdk:j,bucketId:1,folderId:1,path:"uploads/documents"},parameters:{docs:{description:{story:"Uploads files to a specific path within the bucket."}}}},_={args:{sdk:j,bucketId:1,folderId:1,onUploadError:c=>{console.error("Upload failed:",c),alert(`Upload failed: ${c.message}`)},onUploadSuccess:c=>{console.log("Upload successful:",c),alert(`Successfully uploaded ${c.length} file(s)`)}},parameters:{docs:{description:{story:"Demonstrates error and success callbacks with alerts."}}}},L={args:{sdk:j,bucketId:1,folderId:1,onUploadError:c=>{console.error("Expected error:",c)}},parameters:{docs:{description:{story:"Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist)."}}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1
  }
}`,...B.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    accept: "image/*"
  },
  parameters: {
    docs: {
      description: {
        story: "Only accepts image files."
      }
    }
  }
}`,...O.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    maxFileSizeInMb: 5
  },
  parameters: {
    docs: {
      description: {
        story: "Limits file size to 5MB."
      }
    }
  }
}`,...R.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    path: "uploads/documents"
  },
  parameters: {
    docs: {
      description: {
        story: "Uploads files to a specific path within the bucket."
      }
    }
  }
}`,...q.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    onUploadError: error => {
      console.error("Upload failed:", error);
      alert(\`Upload failed: \${error.message}\`);
    },
    onUploadSuccess: files => {
      console.log("Upload successful:", files);
      alert(\`Successfully uploaded \${files.length} file(s)\`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error and success callbacks with alerts."
      }
    }
  }
}`,..._.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    onUploadError: error => {
      console.error("Expected error:", error);
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist)."
      }
    }
  }
}`,...L.parameters?.docs?.source}}};const ke=["Default","WithAcceptFilter","WithMaxFileSize","WithPath","WithCallbacks","SimulatedError"];export{B as Default,L as SimulatedError,O as WithAcceptFilter,_ as WithCallbacks,R as WithMaxFileSize,q as WithPath,ke as __namedExportsOrder,he as default};
