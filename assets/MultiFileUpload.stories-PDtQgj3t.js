import{t as K,U as Y}from"./tslib.es6-CYjveIzL.js";import{j as r}from"./jsx-runtime-C5WNSv3b.js";import{c as Z,a as G,B as X,X as ee}from"./jsep-D6JN1YUz.js";import{r as i}from"./iframe-Bc6JPL_9.js";import{B as te}from"./index-CVv8u541.js";import"./index-Bl9OpAef.js";import"./index-ClLo1Bt5.js";import"./preload-helper-PPVm8Dsz.js";const re=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],se=Z("upload",re);function oe({onFilesChange:l,accept:k,multiple:y=!1,disabled:u=!1,maxSize:m,className:v,showPreview:x=!1,errors:I}){const[a,S]=i.useState([]),[L,b]=i.useState(!1),[T,U]=i.useState(new Map),[E,D]=i.useState([]),f=i.useRef(null),A=e=>{if(!k)return!0;const o=k.split(",").map(s=>s.trim().toLowerCase());for(const s of o)if(s.endsWith("/*")){const t=s.slice(0,-2);if(e.type.toLowerCase().startsWith(t))return!0}else if(s.includes("/")){if(e.type.toLowerCase()===s)return!0}else if(s.startsWith(".")&&e.name.toLowerCase().endsWith(s))return!0;return!1},_=(e,o,s)=>{const t=[],g=y?new Map(s):new Map;for(const n of e){const w=o+t.length;if(!A(n)){g.set(w,"File type not accepted"),t.push(n);continue}if(m&&n.size>m){g.set(w,`Exceeds maximum size of ${C(m)}`),t.push(n);continue}a.some(j=>j.name===n.name&&j.size===n.size)||t.push(n)}return{validFiles:t,errors:g}},W=e=>{if(!e||e.length===0)return;const o=Array.from(e),s=y?a.length:0,{validFiles:t,errors:g}=_(o,s,T);if(t.length===0)return;const n=y?[...a,...t]:t;if(S(n),l?.(n),U(g),x){const w=[];t.forEach(V=>{if(V.type.startsWith("image/")){const j=new FileReader;j.onloadend=()=>{w.push(j.result),w.length===t.filter(Q=>Q.type.startsWith("image/")).length&&D(y?[...E,...w]:w)},j.readAsDataURL(V)}})}},$=e=>{const o=a.filter((s,t)=>t!==e);if(S(o),l?.(o),x){const s=E.filter((t,g)=>g!==e);D(s)}U(s=>{const t=new Map;return s.forEach((g,n)=>{n<e?t.set(n,g):n>e&&t.set(n-1,g)}),t})},H=e=>{e.preventDefault(),e.stopPropagation(),u||b(!0)},h=e=>{e.preventDefault(),e.stopPropagation(),b(!1)},M=e=>{e.preventDefault(),e.stopPropagation()},p=e=>{e.preventDefault(),e.stopPropagation(),b(!1),u||W(e.dataTransfer.files)},F=e=>{W(e.target.files),f.current&&(f.current.value="")},c=()=>{u||f.current?.click()},C=e=>{if(e===0)return"0 Bytes";const o=1024,s=["Bytes","KB","MB","GB"],t=Math.floor(Math.log(e)/Math.log(o));return Math.round(e/o**t*100)/100+" "+s[t]};return r.jsxs("div",{className:G("w-full",v),children:[r.jsxs("div",{className:G("relative flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",L?"border-primary bg-primary/5":"border-input bg-background hover:bg-accent/50",u&&"opacity-50 cursor-not-allowed hover:bg-background"),onDragEnter:H,onDragOver:M,onDragLeave:h,onDrop:p,onClick:c,children:[r.jsx("input",{ref:f,type:"file",className:"hidden",accept:k,multiple:y,disabled:u,onChange:F,"aria-label":"File upload"}),r.jsx(se,{className:"w-8 h-8 mb-2 text-muted-foreground"}),r.jsxs("p",{className:"text-sm text-muted-foreground text-center",children:[r.jsx("span",{className:"font-semibold",children:"Click to upload"})," or drag and drop"]}),k&&r.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:k.split(",").join(", ")}),m&&r.jsxs("p",{className:"text-xs text-muted-foreground",children:["Max size: ",C(m)]})]}),a.length>0&&r.jsx("div",{className:"mt-4 space-y-2",children:a.map((e,o)=>{const s=I?.[e.name]??T.get(o);return r.jsxs("div",{className:G("flex flex-col p-3 rounded-md",s?"bg-destructive/10 border border-destructive/20":"bg-accent/50"),children:[r.jsxs("div",{className:"flex items-center justify-between",children:[r.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[x&&E[o]&&r.jsx("img",{src:E[o],alt:e.name,className:"w-10 h-10 object-cover rounded"}),r.jsxs("div",{className:"flex-1 min-w-0",children:[r.jsx("p",{className:"text-sm font-medium truncate",children:e.name}),r.jsx("p",{className:"text-xs text-muted-foreground",children:C(e.size)})]})]}),r.jsx(X,{variant:"ghost",size:"icon",className:"h-8 w-8","aria-label":`Remove ${e.name}`,onClick:t=>{t.stopPropagation(),$(o)},disabled:u,children:r.jsx(ee,{className:"h-4 w-4"})})]}),s&&r.jsx("p",{className:"text-xs text-destructive mt-2",children:s})]},o)})})]})}const ae="1.0.0",d={ApplicationName:"Widget.MultiFileUpload",Version:ae,Service:{UploadFile:"MFU.UploadFile"},Telemetry:{Usage:"MFU.Usage",Error:"MFU.Error"}},J=({sdk:l,bucketId:k,folderId:y,accept:u,maxFileSizeInMb:m,path:v,onUploadError:x,onUploadSuccess:I})=>{const[a,S]=i.useState([]),[L,b]=i.useState(!1),[T,U]=i.useState({}),[E,D]=i.useState(0),[f,A]=i.useState(!1),_=i.useRef(new te(l)),W=i.useCallback(async()=>{if(!f){A(!0),b(!1),U({});try{const h=v?v.endsWith("/")?v:`${v}/`:"",M=await Promise.allSettled(a.map(c=>_.current.uploadFile({bucketId:k,folderId:y,path:h+c.name,content:c}))),p={},F=[];M.forEach((c,C)=>{const e=a[C];if(c.status==="fulfilled"&&c.value.statusCode===201)F.push(e);else{const o=c.reason?.message||"Upload failed";p[e.name]=o,K.track(d.Service.UploadFile,d.Telemetry.Error,{ApplicationName:d.ApplicationName,WidgetVersion:d.Version,Error:o})}}),K.track(d.Service.UploadFile,d.Telemetry.Usage,{ApplicationName:d.ApplicationName,WidgetVersion:d.Version,TotalFiles:a.length,SuccessCount:F.length,FailureCount:Object.keys(p).length,HasAccept:!!u,HasMaxFileSizeInMb:!!m,HasOnUploadError:!!x,HasOnUploadSuccess:!!I}),Object.keys(p).length===0?(b(!0),I?.(a),S([]),D(c=>c+1)):(U(p),F.length>0&&(S(a.filter(c=>p[c.name])),I?.(F)),x?.(new Error(`${Object.keys(p).length} file(s) failed to upload`)))}catch(h){const M={},p=h.message||"Upload failed";a.forEach(F=>{M[F.name]=p}),U(M),x?.(h),K.track(d.Service.UploadFile,d.Telemetry.Error,{ApplicationName:d.ApplicationName,WidgetVersion:d.Version,Error:p,ErrorType:"uncaught",TotalFiles:a.length})}finally{A(!1)}}},[u,k,a,y,f,m,x,I,v]),$=i.useCallback(h=>{S(h),b(!1),U({})},[]),H=i.useCallback(()=>{S([]),b(!1),U({}),D(h=>h+1)},[]);return r.jsxs("div",{className:"uipath-multi-file-upload w-[400px]",children:[r.jsx(oe,{onFilesChange:$,multiple:!0,maxSize:m?m*1024*1024:void 0,accept:u,errors:T},E),L&&r.jsx("div",{className:"mt-2 text-sm text-green-600",children:"Files uploaded successfully!"}),r.jsxs("div",{className:"flex gap-2 mt-4 justify-center",children:[r.jsx(X,{onClick:W,disabled:a.length===0||f,children:f?"Uploading...":"Upload Files"}),r.jsx(X,{variant:"outline",onClick:H,disabled:a.length===0||f,children:"Clear"})]})]})};J.__docgenInfo={description:"",methods:[],displayName:"MultiFileUpload",props:{sdk:{required:!0,tsType:{name:"UiPath"},description:""},bucketId:{required:!0,tsType:{name:"number"},description:""},folderId:{required:!0,tsType:{name:"number"},description:""},accept:{required:!1,tsType:{name:"string"},description:""},maxFileSizeInMb:{required:!1,tsType:{name:"number"},description:""},path:{required:!1,tsType:{name:"string"},description:""},onUploadError:{required:!1,tsType:{name:"signature",type:"function",raw:"(error: Error) => void",signature:{arguments:[{type:{name:"Error"},name:"error"}],return:{name:"void"}}},description:""},onUploadSuccess:{required:!1,tsType:{name:"signature",type:"function",raw:"(uploadedFiles: File[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"File"}],raw:"File[]"},name:"uploadedFiles"}],return:{name:"void"}}},description:""}}};const N=new Y({baseUrl:"https://mock.uipath.com",orgName:"storybook-org",tenantName:"storybook-tenant",secret:"dummy-secret"}),fe={title:"Components/MultiFileUpload",component:J,parameters:{layout:"centered",docs:{description:{component:`
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
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{sdk:{description:"UiPath SDK instance",control:!1},bucketId:{description:"The ID of the Orchestrator Storage Bucket to upload files to",control:"number"},folderId:{description:"The ID of the folder containing the Storage Bucket",control:"number"},path:{description:'Path prefix for uploaded files (e.g., "uploads/")',control:"text"},onUploadError:{description:"Callback function called when upload fails",action:"uploadError"},onUploadSuccess:{description:"Callback function called when files are successfully uploaded",action:"uploadSuccess"},maxFileSizeInMb:{description:"Maximum file size in megabytes",control:"number"},accept:{description:"Accepted file types (comma-separated MIME types or extensions). See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) for details",control:"text"}}},P={args:{sdk:N,bucketId:1,folderId:1}},z={args:{sdk:N,bucketId:1,folderId:1,accept:"image/*"},parameters:{docs:{description:{story:"Only accepts image files."}}}},B={args:{sdk:N,bucketId:1,folderId:1,maxFileSizeInMb:5},parameters:{docs:{description:{story:"Limits file size to 5MB."}}}},O={args:{sdk:N,bucketId:1,folderId:1,path:"uploads/documents"},parameters:{docs:{description:{story:"Uploads files to a specific path within the bucket."}}}},R={args:{sdk:N,bucketId:1,folderId:1,onUploadError:l=>{console.error("Upload failed:",l),alert(`Upload failed: ${l.message}`)},onUploadSuccess:l=>{console.log("Upload successful:",l),alert(`Successfully uploaded ${l.length} file(s)`)}},parameters:{docs:{description:{story:"Demonstrates error and success callbacks with alerts."}}}},q={args:{sdk:N,bucketId:1,folderId:1,onUploadError:l=>{console.error("Expected error:",l)}},parameters:{docs:{description:{story:"Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist)."}}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1
  }
}`,...P.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};const he=["Default","WithAcceptFilter","WithMaxFileSize","WithPath","WithCallbacks","SimulatedError"];export{P as Default,q as SimulatedError,z as WithAcceptFilter,R as WithCallbacks,B as WithMaxFileSize,O as WithPath,he as __namedExportsOrder,fe as default};
