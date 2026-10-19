import{j as e}from"./jsx-runtime-C5WNSv3b.js";import{C as v,a as p,b as o,i as S}from"./ConversationalAgentChat-DxK9ty86.js";import"./button-Bj77BMr1.js";import"./iframe-Bn11Dv7n.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-ByaiwNLC.js";import"./index-Conc35BY.js";import"./index-D4sJBjuh.js";import"./index-Coutzyqy.js";import"./tslib.es6-DOyTwyrN.js";import"./index-vzI2p2F8.js";import"./compiler-runtime-CsLKvkVE.js";import"./index-4yYnNoWY.js";S();const N=[{connectorKey:"google-drive",connectorName:"Google Drive",connectorImage:"https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",resourceKeys:["drive.files"],currentConnectionId:"conn-1",currentConnectionName:"john@example.com",configurationUrl:"https://example.com/config",connectionsUrl:"https://example.com/connections",isConfigurable:!0,connections:[{id:"conn-1",name:"john@example.com",state:o.Enabled,isDefault:!0,personalWorkspace:!0,folderKey:null,folderName:null},{id:"conn-2",name:"work@company.com",state:o.Enabled,isDefault:!1,personalWorkspace:!1,folderKey:"f1",folderName:"Marketing"},{id:"conn-3",name:"shared@team.com",state:o.Expired,isDefault:!1,personalWorkspace:!1,folderKey:"f2",folderName:"Engineering"}]},{connectorKey:"salesforce",connectorName:"Salesforce",connectorImage:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png",resourceKeys:["sf.contacts"],currentConnectionId:null,currentConnectionName:null,isConfigurable:!0,connections:[{id:"conn-4",name:"admin@salesforce.com",state:o.Enabled,isDefault:!1,personalWorkspace:!0,folderKey:null,folderName:null}]},{connectorKey:"outlook",connectorName:"Outlook",resourceKeys:["outlook.mail"],currentConnectionId:"conn-5",currentConnectionName:"shared-outlook@company.com",isConfigurable:!1,connections:[]}],n=(r=N,f=300)=>({getAvailableConnections:()=>new Promise(t=>setTimeout(()=>t([...r]),f)),updateConnectionSelections:(t,k,I)=>new Promise(C=>setTimeout(()=>C(r.map(c=>{const m=I.selections.find(u=>u.connectorKey===c.connectorKey);return m?{...c,currentConnectionId:m.connectionId,currentConnectionName:c.connections.find(u=>u.id===m.connectionId)?.name??null}:c})),f)),getConnectionAuthUrl:()=>new Promise(t=>setTimeout(()=>t({authUrl:"https://accounts.google.com/o/oauth2/v2/auth?fake=1",sessionId:"session-"+Date.now(),expiresTime:Date.now()+3e5}),200)),getConnectionSessionStatus:()=>new Promise(t=>setTimeout(()=>t({status:"pending",connectionId:null,expiresTime:Date.now()+3e5}),200))}),U={title:"Components/ConnectionsSection",component:v,parameters:{layout:"centered",docs:{description:{component:"Settings panel section for managing personal OAuth connections per connector binding."}}},decorators:[r=>e.jsx("div",{style:{width:400,padding:16,background:"var(--background)",borderRadius:8,border:"1px solid var(--border)"},children:e.jsx(r,{})})]},a={args:{conversationalAgent:n(),agentId:1,folderId:2}},s={args:{conversationalAgent:n([]),agentId:1,folderId:2}},i={args:{conversationalAgent:{getAvailableConnections:()=>Promise.reject(new Error("Failed to fetch connections"))},agentId:1,folderId:2}},A=[{connectorKey:"google-drive",connectorName:"Google Drive",connectorImage:"https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",isConfigurable:!0,currentConnectionId:null,currentConnectionName:null},{connectorKey:"salesforce",connectorName:"Salesforce",connectorImage:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png",isConfigurable:!0,currentConnectionId:null,currentConnectionName:null}],E=[{connectorKey:"google-drive",connectorName:"Google Drive",connectorImage:"https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",isConfigurable:!0,currentConnectionId:"conn-1",currentConnectionName:"john@example.com",currentConnectionState:o.Expired},{connectorKey:"salesforce",connectorName:"Salesforce",isConfigurable:!0,currentConnectionId:"conn-2",currentConnectionName:"admin@sf.com",currentConnectionState:o.Failed}],h=[{connectorKey:"google-drive",connectorName:"Google Drive",connectorImage:"https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",isConfigurable:!0,currentConnectionId:"conn-1",currentConnectionName:"john@example.com",currentConnectionState:o.Enabled},{connectorKey:"salesforce",connectorName:"Salesforce",isConfigurable:!0,currentConnectionId:null,currentConnectionName:null}],d={args:{conversationalAgent:n(),agentId:1,folderId:2},render:()=>e.jsx("div",{style:{width:450},children:e.jsx(p,{connectors:A,conversationalAgent:n(),agentId:1,folderId:2,onOpenSettings:()=>alert("Open settings clicked")})})},l={args:{conversationalAgent:n(),agentId:1,folderId:2},render:()=>e.jsx("div",{style:{width:450},children:e.jsx(p,{connectors:E,conversationalAgent:n(),agentId:1,folderId:2,onOpenSettings:()=>alert("Open settings clicked")})})},g={args:{conversationalAgent:n(),agentId:1,folderId:2},render:()=>e.jsx("div",{style:{width:450},children:e.jsx(p,{connectors:h,conversationalAgent:n(),agentId:1,folderId:2,onOpenSettings:()=>alert("Open settings clicked")})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: createMockAgent([]),
    agentId: 1,
    folderId: 2
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: {
      getAvailableConnections: () => Promise.reject(new Error("Failed to fetch connections"))
    } as unknown as ConversationalAgent,
    agentId: 1,
    folderId: 2
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2
  },
  render: () => <div style={{
    width: 450
  }}>
      <ConnectionReadinessCard connectors={READINESS_UNCONNECTED} conversationalAgent={createMockAgent()} agentId={1} folderId={2} onOpenSettings={() => alert("Open settings clicked")} />
    </div>
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2
  },
  render: () => <div style={{
    width: 450
  }}>
      <ConnectionReadinessCard connectors={READINESS_BROKEN} conversationalAgent={createMockAgent()} agentId={1} folderId={2} onOpenSettings={() => alert("Open settings clicked")} />
    </div>
}`,...l.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2
  },
  render: () => <div style={{
    width: 450
  }}>
      <ConnectionReadinessCard connectors={READINESS_MIXED} conversationalAgent={createMockAgent()} agentId={1} folderId={2} onOpenSettings={() => alert("Open settings clicked")} />
    </div>
}`,...g.parameters?.docs?.source}}};const q=["Default","Empty","LoadError","ReadinessSetupNeeded","ReadinessBroken","ReadinessMixed"];export{a as Default,s as Empty,i as LoadError,l as ReadinessBroken,g as ReadinessMixed,d as ReadinessSetupNeeded,q as __namedExportsOrder,U as default};
