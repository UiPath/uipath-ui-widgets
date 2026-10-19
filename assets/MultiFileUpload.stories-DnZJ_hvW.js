import{t as Q,U as pe}from"./index-Ch67WTrU.js";import{j as r}from"./jsx-runtime-C5WNSv3b.js";import{c as Y,B as Z}from"./button-Bj77BMr1.js";import{r as a}from"./iframe-Bn11Dv7n.js";import{F as me,X as fe}from"./form-field-B0qlqskc.js";import{c as ge}from"./index-Conc35BY.js";import{B as he}from"./index-DagDVgbg.js";import"./index-vzI2p2F8.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D4sJBjuh.js";import"./index-Coutzyqy.js";const be=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],ye=ge("upload",be),ke=a.forwardRef(function({id:d,ariaLabel:j,onFilesChange:N,accept:y,multiple:f=!1,disabled:l=!1,maxSize:g,className:w,showPreview:c=!1,errors:I,onBlur:V,error:k,errorId:K,"aria-invalid":v,"aria-describedby":G,"aria-errormessage":C},x){const A=a.useId(),D=K??`${d??`file-upload-${A.replace(/:/g,"")}`}-error`,W=[G,k?D:void 0].filter(Boolean).join(" "),B=k?!0:v,P=k?D:C,[n,F]=a.useState([]),[m,h]=a.useState(!1),[u,z]=a.useState(new Map),[U,T]=a.useState([]),O=a.useRef(null),se=e=>{if(!y)return!0;const o=y.split(",").map(s=>s.trim().toLowerCase());for(const s of o)if(s.endsWith("/*")){const t=s.slice(0,-2);if(e.type.toLowerCase().startsWith(t))return!0}else if(s.includes("/")){if(e.type.toLowerCase()===s)return!0}else if(s.startsWith(".")&&e.name.toLowerCase().endsWith(s))return!0;return!1},oe=(e,o,s)=>{const t=[],b=f?new Map(s):new Map;for(const i of e){const S=o+t.length;if(!se(i)){b.set(S,"File type not accepted"),t.push(i);continue}if(g&&i.size>g){b.set(S,`Exceeds maximum size of ${X(g)}`),t.push(i);continue}n.some(E=>E.name===i.name&&E.size===i.size)||t.push(i)}return{validFiles:t,errors:b}},ee=e=>{if(!e||e.length===0)return;const o=Array.from(e),s=f?n.length:0,{validFiles:t,errors:b}=oe(o,s,u);if(t.length===0)return;const i=f?[...n,...t]:t;if(F(i),N?.(i),z(b),c){const S=[];t.forEach(J=>{if(J.type.startsWith("image/")){const E=new FileReader;E.onloadend=()=>{S.push(E.result),S.length===t.filter(ue=>ue.type.startsWith("image/")).length&&T(f?[...U,...S]:S)},E.readAsDataURL(J)}})}},ae=e=>{const o=n.filter((s,t)=>t!==e);if(F(o),N?.(o),c){const s=U.filter((t,b)=>b!==e);T(s)}z(s=>{const t=new Map;return s.forEach((b,i)=>{i<e?t.set(i,b):i>e&&t.set(i-1,b)}),t})},ne=e=>{e.preventDefault(),e.stopPropagation(),l||h(!0)},ie=e=>{e.preventDefault(),e.stopPropagation(),h(!1)},le=e=>{e.preventDefault(),e.stopPropagation()},ce=e=>{e.preventDefault(),e.stopPropagation(),h(!1),l||ee(e.dataTransfer.files)},de=e=>{ee(e.target.files),O.current&&(O.current.value="")},re=()=>{l||O.current?.click()},X=e=>{if(e===0)return"0 Bytes";const o=1024,s=["Bytes","KB","MB","GB"],t=Math.floor(Math.log(e)/Math.log(o));return`${Math.round(e/o**t*100)/100} ${s[t]}`};return r.jsxs("fieldset",{ref:x,"data-slot":"file-upload",className:Y("m-0 min-w-0 w-full border-0 p-0",w),onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||V?.(e)},children:[r.jsx("input",{ref:O,id:d,type:"file",className:"hidden",accept:y,multiple:f,disabled:l,onChange:de,"aria-label":d?void 0:j??"File upload","aria-invalid":B,"aria-describedby":W||void 0,"aria-errormessage":P}),r.jsxs("div",{role:"button","aria-label":j??"File upload area","aria-disabled":l,"aria-invalid":B,"aria-describedby":W||void 0,"aria-errormessage":P,tabIndex:l?-1:0,className:Y("relative flex w-full flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors","text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background","aria-invalid:border-error aria-invalid:focus-visible:ring-error future:aria-invalid:border-error future:aria-invalid:ring-1 future:aria-invalid:ring-error/40","future:rounded-xl future:border-border-subtle future:bg-surface-overlay future:hover:bg-surface-hover future:focus-visible:ring-offset-background",m?"border-primary bg-primary/5":"border-input bg-background hover:bg-accent/50",l&&"opacity-50 cursor-not-allowed hover:bg-background future:hover:bg-surface-overlay"),onDragEnter:ne,onDragOver:le,onDragLeave:ie,onDrop:ce,onClick:re,onKeyDown:e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),re())},children:[r.jsx(ye,{className:"mb-2 h-8 w-8 text-muted-foreground future:text-foreground-muted"}),r.jsxs("p",{className:"text-center text-sm text-muted-foreground future:text-foreground-muted",children:[r.jsx("span",{className:"font-semibold",children:"Click to upload"})," or drag and drop"]}),y&&r.jsx("p",{className:"mt-1 text-xs text-muted-foreground future:text-foreground-muted",children:y.split(",").join(", ")}),g&&r.jsxs("p",{className:"text-xs text-muted-foreground future:text-foreground-muted",children:["Max size: ",X(g)]})]}),r.jsx(me,{id:D,children:k}),n.length>0&&r.jsx("div",{className:"mt-4 space-y-2",children:n.map((e,o)=>{const s=I?.[e.name]??u.get(o);return r.jsxs("div",{className:Y("flex flex-col p-3 rounded-md future:rounded-xl",s?"bg-destructive/10 border border-destructive/20":"bg-accent/50 future:bg-surface-raised"),children:[r.jsxs("div",{className:"flex items-center justify-between",children:[r.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[c&&U[o]&&r.jsx("img",{src:U[o],alt:e.name,className:"w-10 h-10 object-cover rounded"}),r.jsxs("div",{className:"flex-1 min-w-0",children:[r.jsx("p",{className:"text-sm font-medium truncate",children:e.name}),r.jsx("p",{className:"text-xs text-muted-foreground",children:X(e.size)})]})]}),r.jsx(Z,{variant:"ghost",icon:!0,size:"xs","aria-label":`Remove ${e.name}`,onClick:t=>{t.stopPropagation(),ae(o)},disabled:l,children:r.jsx(fe,{className:"h-4 w-4"})})]}),s&&r.jsx("p",{className:"text-xs text-destructive mt-2",children:s})]},o)})})]})}),ve="1.0.0",p={ApplicationName:"Widget.MultiFileUpload",Version:ve,Service:{UploadFile:"MFU.UploadFile"},Telemetry:{Usage:"MFU.Usage",Error:"MFU.Error"}},te=({sdk:d,bucketId:j,folderId:N,accept:y,maxFileSizeInMb:f,path:l,onUploadError:g,onUploadSuccess:w})=>{const[c,I]=a.useState([]),[V,k]=a.useState(!1),[K,v]=a.useState({}),[G,C]=a.useState(0),[x,A]=a.useState(!1),D=a.useRef(new he(d)),W=a.useCallback(async()=>{if(!x){A(!0),k(!1),v({});try{const n=l?l.endsWith("/")?l:`${l}/`:"",F=await Promise.allSettled(c.map(u=>D.current.uploadFile({bucketId:j,folderId:N,path:n+u.name,content:u}))),m={},h=[];F.forEach((u,z)=>{const U=c[z];if(u.status==="fulfilled"&&u.value.statusCode===201)h.push(U);else{const T=u.reason?.message||"Upload failed";m[U.name]=T,Q(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:T})}}),Q(p.Service.UploadFile,p.Telemetry.Usage,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,TotalFiles:c.length,SuccessCount:h.length,FailureCount:Object.keys(m).length,HasAccept:!!y,HasMaxFileSizeInMb:!!f,HasOnUploadError:!!g,HasOnUploadSuccess:!!w}),Object.keys(m).length===0?(k(!0),w?.(c),I([]),C(u=>u+1)):(v(m),h.length>0&&(I(c.filter(u=>m[u.name])),w?.(h)),g?.(new Error(`${Object.keys(m).length} file(s) failed to upload`)))}catch(n){const F={},m=n.message||"Upload failed";c.forEach(h=>{F[h.name]=m}),v(F),g?.(n),Q(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:m,ErrorType:"uncaught",TotalFiles:c.length})}finally{A(!1)}}},[y,j,c,N,x,f,g,w,l]),B=a.useCallback(n=>{I(n),k(!1),v({})},[]),P=a.useCallback(()=>{I([]),k(!1),v({}),C(n=>n+1)},[]);return r.jsxs("div",{className:"uipath-multi-file-upload w-[400px]",children:[r.jsx(ke,{onFilesChange:B,multiple:!0,maxSize:f?f*1024*1024:void 0,accept:y,errors:K},G),V&&r.jsx("div",{className:"mt-2 text-sm text-green-600",children:"Files uploaded successfully!"}),r.jsxs("div",{className:"flex gap-2 mt-4 justify-center",children:[r.jsx(Z,{onClick:W,disabled:c.length===0||x,children:x?"Uploading...":"Upload Files"}),r.jsx(Z,{variant:"outline",onClick:P,disabled:c.length===0||x,children:"Clear"})]})]})};te.__docgenInfo={description:"",methods:[],displayName:"MultiFileUpload",props:{sdk:{required:!0,tsType:{name:"UiPath"},description:""},bucketId:{required:!0,tsType:{name:"number"},description:""},folderId:{required:!0,tsType:{name:"number"},description:""},accept:{required:!1,tsType:{name:"string"},description:""},maxFileSizeInMb:{required:!1,tsType:{name:"number"},description:""},path:{required:!1,tsType:{name:"string"},description:""},onUploadError:{required:!1,tsType:{name:"signature",type:"function",raw:"(error: Error) => void",signature:{arguments:[{type:{name:"Error"},name:"error"}],return:{name:"void"}}},description:""},onUploadSuccess:{required:!1,tsType:{name:"signature",type:"function",raw:"(uploadedFiles: File[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"File"}],raw:"File[]"},name:"uploadedFiles"}],return:{name:"void"}}},description:""}}};const M=new pe({baseUrl:"https://mock.uipath.com",orgName:"storybook-org",tenantName:"storybook-tenant",secret:"dummy-secret"}),Te={title:"Components/MultiFileUpload",component:te,parameters:{layout:"centered",docs:{description:{component:`
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
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{sdk:{description:"UiPath SDK instance",control:!1},bucketId:{description:"The ID of the Orchestrator Storage Bucket to upload files to",control:"number"},folderId:{description:"The ID of the folder containing the Storage Bucket",control:"number"},path:{description:'Path prefix for uploaded files (e.g., "uploads/")',control:"text"},onUploadError:{description:"Callback function called when upload fails",action:"uploadError"},onUploadSuccess:{description:"Callback function called when files are successfully uploaded",action:"uploadSuccess"},maxFileSizeInMb:{description:"Maximum file size in megabytes",control:"number"},accept:{description:"Accepted file types (comma-separated MIME types or extensions). See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) for details",control:"text"}}},R={args:{sdk:M,bucketId:1,folderId:1}},_={args:{sdk:M,bucketId:1,folderId:1,accept:"image/*"},parameters:{docs:{description:{story:"Only accepts image files."}}}},$={args:{sdk:M,bucketId:1,folderId:1,maxFileSizeInMb:5},parameters:{docs:{description:{story:"Limits file size to 5MB."}}}},q={args:{sdk:M,bucketId:1,folderId:1,path:"uploads/documents"},parameters:{docs:{description:{story:"Uploads files to a specific path within the bucket."}}}},L={args:{sdk:M,bucketId:1,folderId:1,onUploadError:d=>{console.error("Upload failed:",d),alert(`Upload failed: ${d.message}`)},onUploadSuccess:d=>{console.log("Upload successful:",d),alert(`Successfully uploaded ${d.length} file(s)`)}},parameters:{docs:{description:{story:"Demonstrates error and success callbacks with alerts."}}}},H={args:{sdk:M,bucketId:1,folderId:1,onUploadError:d=>{console.error("Expected error:",d)}},parameters:{docs:{description:{story:"Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist)."}}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1
  }
}`,...R.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}};const Ce=["Default","WithAcceptFilter","WithMaxFileSize","WithPath","WithCallbacks","SimulatedError"];export{R as Default,H as SimulatedError,_ as WithAcceptFilter,L as WithCallbacks,$ as WithMaxFileSize,q as WithPath,Ce as __namedExportsOrder,Te as default};
