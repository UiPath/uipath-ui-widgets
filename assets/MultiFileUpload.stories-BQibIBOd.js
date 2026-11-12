import{t as J,U as ue}from"./index-3txPJ6m9.js";import{j as r}from"./jsx-runtime-C5WNSv3b.js";import{c as Q,B as Z}from"./button-C4enX704.js";import{r as s}from"./iframe-Bh9byxgT.js";import{U as pe,f as Y,i as me}from"./file-validation-BhFXJmrf.js";import{F as fe}from"./form-field-hIRz2wKi.js";import{X as ge}from"./x-B8J05KxC.js";import{B as he}from"./index-D3PUNNL5.js";import"./index-vzI2p2F8.js";import"./preload-helper-PPVm8Dsz.js";import"./portal-container-C0bKXk-o.js";import"./index-B9gdMoSG.js";import"./index-DNNFOvnr.js";const be=s.forwardRef(function({id:l,ariaLabel:M,onFilesChange:N,accept:y,multiple:f=!1,disabled:n=!1,maxSize:g,className:w,showPreview:i=!1,errors:I,onBlur:K,error:k,errorId:L,"aria-invalid":v,"aria-describedby":X,"aria-errormessage":A},x){const C=s.useId(),D=L??`${l??`file-upload-${C.replace(/:/g,"")}`}-error`,P=[X,k?D:void 0].filter(Boolean).join(" "),W=k?!0:v,z=k?D:A,[o,F]=s.useState([]),[m,h]=s.useState(!1),[c,B]=s.useState(new Map),[U,T]=s.useState([]),O=s.useRef(null),se=(e,d,u)=>{const t=[],b=f?new Map(u):new Map;for(const a of e){const S=d+t.length;if(!me(a,y)){b.set(S,"File type not accepted"),t.push(a);continue}if(g&&a.size>g){b.set(S,`Exceeds maximum size of ${Y(g)}`),t.push(a);continue}o.some(E=>E.name===a.name&&E.size===a.size)||t.push(a)}return{validFiles:t,errors:b}},ee=e=>{if(!e||e.length===0)return;const d=Array.from(e),u=f?o.length:0,{validFiles:t,errors:b}=se(d,u,c);if(t.length===0)return;const a=f?[...o,...t]:t;if(F(a),N?.(a),B(b),i){const S=[];t.forEach(G=>{if(G.type.startsWith("image/")){const E=new FileReader;E.onloadend=()=>{S.push(E.result),S.length===t.filter(de=>de.type.startsWith("image/")).length&&T(f?[...U,...S]:S)},E.readAsDataURL(G)}})}},oe=e=>{const d=o.filter((u,t)=>t!==e);if(F(d),N?.(d),i){const u=U.filter((t,b)=>b!==e);T(u)}B(u=>{const t=new Map;return u.forEach((b,a)=>{a<e?t.set(a,b):a>e&&t.set(a-1,b)}),t})},ae=e=>{e.preventDefault(),e.stopPropagation(),n||h(!0)},ne=e=>{e.preventDefault(),e.stopPropagation(),h(!1)},ie=e=>{e.preventDefault(),e.stopPropagation()},le=e=>{e.preventDefault(),e.stopPropagation(),h(!1),n||ee(e.dataTransfer.files)},ce=e=>{ee(e.target.files),O.current&&(O.current.value="")},re=()=>{n||O.current?.click()};return r.jsxs("fieldset",{ref:x,"data-slot":"file-upload",className:Q("m-0 min-w-0 w-full border-0 p-0",w),onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||K?.(e)},children:[r.jsx("input",{ref:O,id:l,type:"file",className:"hidden",accept:y,multiple:f,disabled:n,onChange:ce,"aria-label":l?void 0:M??"File upload","aria-invalid":W,"aria-describedby":P||void 0,"aria-errormessage":z}),r.jsxs("div",{role:"button","aria-label":M??"File upload area","aria-disabled":n,"aria-invalid":W,"aria-describedby":P||void 0,"aria-errormessage":z,tabIndex:n?-1:0,className:Q("relative flex w-full flex-col items-center justify-center min-h-32 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors","text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background","aria-invalid:border-error aria-invalid:focus-visible:ring-error future:aria-invalid:border-error future:aria-invalid:ring-1 future:aria-invalid:ring-error/40","future:rounded-xl future:border-border-subtle future:bg-surface-overlay future:hover:bg-surface-hover future:focus-visible:ring-offset-background",m?"border-primary bg-primary/5":"border-input bg-background hover:bg-accent/50",n&&"opacity-50 cursor-not-allowed hover:bg-background future:hover:bg-surface-overlay"),onDragEnter:ae,onDragOver:ie,onDragLeave:ne,onDrop:le,onClick:re,onKeyDown:e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),re())},children:[r.jsx(pe,{className:"mb-2 h-8 w-8 shrink-0 text-muted-foreground future:text-foreground-muted"}),r.jsxs("p",{className:"text-center text-sm text-muted-foreground future:text-foreground-muted",children:[r.jsx("span",{className:"font-semibold",children:"Click to upload"})," or drag and drop"]}),y&&r.jsx("p",{className:"mt-1 text-xs text-muted-foreground future:text-foreground-muted",children:y.split(",").join(", ")}),g&&r.jsxs("p",{className:"text-xs text-muted-foreground future:text-foreground-muted",children:["Max size: ",Y(g)]})]}),r.jsx(fe,{id:D,children:k}),o.length>0&&r.jsx("div",{className:"mt-4 space-y-2",children:o.map((e,d)=>{const u=I?.[e.name]??c.get(d);return r.jsxs("div",{className:Q("flex flex-col p-3 rounded-md future:rounded-xl",u?"bg-destructive/10 border border-destructive/20":"bg-accent/50 future:bg-surface-raised"),children:[r.jsxs("div",{className:"flex items-center justify-between",children:[r.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[i&&U[d]&&r.jsx("img",{src:U[d],alt:e.name,className:"w-10 h-10 object-cover rounded"}),r.jsxs("div",{className:"flex-1 min-w-0",children:[r.jsx("p",{className:"text-sm font-medium truncate",children:e.name}),r.jsx("p",{className:"text-xs text-muted-foreground",children:Y(e.size)})]})]}),r.jsx(Z,{variant:"ghost",icon:!0,size:"xs","aria-label":`Remove ${e.name}`,onClick:t=>{t.stopPropagation(),oe(d)},disabled:n,children:r.jsx(ge,{className:"h-4 w-4"})})]}),u&&r.jsx("p",{className:"text-xs text-destructive mt-2",children:u})]},d)})})]})}),ke="1.0.0",p={ApplicationName:"Widget.MultiFileUpload",Version:ke,Service:{UploadFile:"MFU.UploadFile"},Telemetry:{Usage:"MFU.Usage",Error:"MFU.Error"}},te=({sdk:l,bucketId:M,folderId:N,accept:y,maxFileSizeInMb:f,path:n,onUploadError:g,onUploadSuccess:w})=>{const[i,I]=s.useState([]),[K,k]=s.useState(!1),[L,v]=s.useState({}),[X,A]=s.useState(0),[x,C]=s.useState(!1),D=s.useRef(new he(l)),P=s.useCallback(async()=>{if(!x){C(!0),k(!1),v({});try{const o=n?n.endsWith("/")?n:`${n}/`:"",F=await Promise.allSettled(i.map(c=>D.current.uploadFile({bucketId:M,folderId:N,path:o+c.name,content:c}))),m={},h=[];F.forEach((c,B)=>{const U=i[B];if(c.status==="fulfilled"&&c.value.statusCode===201)h.push(U);else{const T=c.reason?.message||"Upload failed";m[U.name]=T,J(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:T})}}),J(p.Service.UploadFile,p.Telemetry.Usage,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,TotalFiles:i.length,SuccessCount:h.length,FailureCount:Object.keys(m).length,HasAccept:!!y,HasMaxFileSizeInMb:!!f,HasOnUploadError:!!g,HasOnUploadSuccess:!!w}),Object.keys(m).length===0?(k(!0),w?.(i),I([]),A(c=>c+1)):(v(m),h.length>0&&(I(i.filter(c=>m[c.name])),w?.(h)),g?.(new Error(`${Object.keys(m).length} file(s) failed to upload`)))}catch(o){const F={},m=o.message||"Upload failed";i.forEach(h=>{F[h.name]=m}),v(F),g?.(o),J(p.Service.UploadFile,p.Telemetry.Error,{ApplicationName:p.ApplicationName,WidgetVersion:p.Version,Error:m,ErrorType:"uncaught",TotalFiles:i.length})}finally{C(!1)}}},[y,M,i,N,x,f,g,w,n]),W=s.useCallback(o=>{I(o),k(!1),v({})},[]),z=s.useCallback(()=>{I([]),k(!1),v({}),A(o=>o+1)},[]);return r.jsxs("div",{className:"uipath-multi-file-upload w-[400px]",children:[r.jsx(be,{onFilesChange:W,multiple:!0,maxSize:f?f*1024*1024:void 0,accept:y,errors:L},X),K&&r.jsx("div",{className:"mt-2 text-sm text-green-600",children:"Files uploaded successfully!"}),r.jsxs("div",{className:"flex gap-2 mt-4 justify-center",children:[r.jsx(Z,{onClick:P,disabled:i.length===0||x,children:x?"Uploading...":"Upload Files"}),r.jsx(Z,{variant:"outline",onClick:z,disabled:i.length===0||x,children:"Clear"})]})]})};te.__docgenInfo={description:"",methods:[],displayName:"MultiFileUpload",props:{sdk:{required:!0,tsType:{name:"UiPath"},description:""},bucketId:{required:!0,tsType:{name:"number"},description:""},folderId:{required:!0,tsType:{name:"number"},description:""},accept:{required:!1,tsType:{name:"string"},description:""},maxFileSizeInMb:{required:!1,tsType:{name:"number"},description:""},path:{required:!1,tsType:{name:"string"},description:""},onUploadError:{required:!1,tsType:{name:"signature",type:"function",raw:"(error: Error) => void",signature:{arguments:[{type:{name:"Error"},name:"error"}],return:{name:"void"}}},description:""},onUploadSuccess:{required:!1,tsType:{name:"signature",type:"function",raw:"(uploadedFiles: File[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"File"}],raw:"File[]"},name:"uploadedFiles"}],return:{name:"void"}}},description:""}}};const j=new ue({baseUrl:"https://mock.uipath.com",orgName:"storybook-org",tenantName:"storybook-tenant",secret:"dummy-secret"}),Te={title:"Components/MultiFileUpload",component:te,parameters:{layout:"centered",docs:{description:{component:`
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
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{sdk:{description:"UiPath SDK instance",control:!1},bucketId:{description:"The ID of the Orchestrator Storage Bucket to upload files to",control:"number"},folderId:{description:"The ID of the folder containing the Storage Bucket",control:"number"},path:{description:'Path prefix for uploaded files (e.g., "uploads/")',control:"text"},onUploadError:{description:"Callback function called when upload fails",action:"uploadError"},onUploadSuccess:{description:"Callback function called when files are successfully uploaded",action:"uploadSuccess"},maxFileSizeInMb:{description:"Maximum file size in megabytes",control:"number"},accept:{description:"Accepted file types (comma-separated MIME types or extensions). See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) for details",control:"text"}}},R={args:{sdk:j,bucketId:1,folderId:1}},_={args:{sdk:j,bucketId:1,folderId:1,accept:"image/*"},parameters:{docs:{description:{story:"Only accepts image files."}}}},$={args:{sdk:j,bucketId:1,folderId:1,maxFileSizeInMb:5},parameters:{docs:{description:{story:"Limits file size to 5MB."}}}},q={args:{sdk:j,bucketId:1,folderId:1,path:"uploads/documents"},parameters:{docs:{description:{story:"Uploads files to a specific path within the bucket."}}}},V={args:{sdk:j,bucketId:1,folderId:1,onUploadError:l=>{console.error("Upload failed:",l),alert(`Upload failed: ${l.message}`)},onUploadSuccess:l=>{console.log("Upload successful:",l),alert(`Successfully uploaded ${l.length} file(s)`)}},parameters:{docs:{description:{story:"Demonstrates error and success callbacks with alerts."}}}},H={args:{sdk:j,bucketId:1,folderId:1,onUploadError:l=>{console.error("Expected error:",l)}},parameters:{docs:{description:{story:"Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist)."}}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}};const Ae=["Default","WithAcceptFilter","WithMaxFileSize","WithPath","WithCallbacks","SimulatedError"];export{R as Default,H as SimulatedError,_ as WithAcceptFilter,V as WithCallbacks,$ as WithMaxFileSize,q as WithPath,Ae as __namedExportsOrder,Te as default};
