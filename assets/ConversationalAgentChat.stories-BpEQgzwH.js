import{j as t}from"./index-CK8ydUP2.js";import{U as C}from"./jsep-DYtnpPIg.js";import{r as b}from"./iframe-Cp7frwjj.js";import{C as x}from"./ConversationalAgentChat-Dz2U04f6.js";import"./index-Yo7iebyc.js";import"./preload-helper-PPVm8Dsz.js";import"./client-D4in3RFS.js";import"./compiler-runtime-B8QT2ni8.js";import"./endOfMonth-GAPIl5bs.js";const I=({baseUrl:e,orgName:r,tenantName:a,secret:n,...w})=>{const[v,m]=b.useState({sdk:null,error:null});b.useEffect(()=>{if(!e||!r||!a||!n)return;let h=!1;return(async()=>{try{const o=e.match(/^https?:\/\//)?e:`https://${e}`,y=new C({baseUrl:o,orgName:r,tenantName:a,secret:n});await y.initialize(),h||m({sdk:y,error:null})}catch(o){h||m({sdk:null,error:o instanceof Error?o.message:"Failed to initialize SDK"})}})(),()=>{h=!0}},[e,r,a,n]);const{sdk:g,error:f}=v;return!e||!r||!a||!n?t.jsx("div",{style:{padding:24,color:"#666"},children:"Please provide baseUrl, orgName, tenantName, and secret in the controls panel below."}):f?t.jsxs("div",{style:{padding:24,color:"#d32f2f"},children:["SDK initialization failed: ",f]}):g?t.jsx(x,{sdk:g,...w}):t.jsx("div",{style:{padding:24},children:"Initializing SDK..."})},j={title:"Components/ConversationalAgentChat",component:I,decorators:[e=>t.jsx("div",{style:{height:"600px"},children:t.jsx(e,{})})],parameters:{layout:"padded",docs:{description:{component:`
A React chat widget for interacting with UiPath Conversational AI agents.

## Features

- Real-time streaming responses
- File attachment support with drag and drop
- Tool call visualization
- Conversation history management
- Start new conversations or continue existing ones
- Built on Apollo React chat components

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-conversational-agent-chat
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { ConversationalAgentChat } from '@uipath/ui-widgets-conversational-agent-chat';
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
    <ConversationalAgentChat
      sdk={sdk}
      agentId={123}
      folderId={456}
      locale="en"
      theme="light"
      readOnly={false}
      overrideLabels={{
        title: "My Agent",
        footerDisclaimer: "Custom disclaimer",
        inputPlaceholder: "Ask me anything...",
      }}
      firstRunExperience={{
        title: "Welcome!",
        description: "How can I help you today?",
        suggestions: [
          { label: "Get started", prompt: "Help me get started" },
        ],
      }}
      disabledFeatures={{ attachments: true }}
      existingConversationId="optional-conversation-id"
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-react
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{baseUrl:{description:"UiPath API base URL",control:"text",table:{category:"SDK Configuration"}},orgName:{description:"UiPath organization name",control:"text",table:{category:"SDK Configuration"}},tenantName:{description:"UiPath tenant name",control:"text",table:{category:"SDK Configuration"}},secret:{description:"UiPath API secret for authentication",control:"text",table:{category:"SDK Configuration"}},agentId:{description:"ID of the conversational agent to use",control:"number"},folderId:{description:"ID of the folder containing the agent",control:"number"},locale:{description:"Locale for the chat UI",control:"select",options:["en","es","pt","de","fr","ja","ko","ru","tr","zh-CN","zh-TW","pt-BR","es-MX"]},theme:{description:"Visual theme for the chat UI",control:"select",options:["light","dark","light-hc","dark-hc"]},readOnly:{description:"When true, disables user input",control:"boolean"},overrideLabels:{description:"Override default labels for title, footer disclaimer, and input placeholder",control:"object"},existingConversationId:{description:"Load an existing conversation by ID instead of creating a new one on first message",control:"text"},externalUserId:{description:"External User ID sent on the x-uipath-external-user-id header (and matching WebSocket query param). Required when authenticating via an app-scoped external app (client credential grant).",control:"text"},firstRunExperience:{description:"Override the first-run experience. When omitted, derived from agent appearance data.",control:"object"},disabledFeatures:{description:"Override which features are disabled. Merged with defaults (fullScreen, preview, close are always disabled).",control:"object"}},args:{baseUrl:"cloud.uipath.com",orgName:"",tenantName:"",secret:"",agentId:0,folderId:0,locale:"en",theme:"light",readOnly:!1,overrideLabels:void 0,existingConversationId:void 0,externalUserId:void 0,firstRunExperience:void 0,disabledFeatures:void 0}},s={parameters:{docs:{description:{story:"Default conversational agent chat. Fill in the SDK configuration, agent ID, and folder ID in the controls panel to start chatting."}}}},i={args:{theme:"dark"},parameters:{docs:{description:{story:"Chat widget using the dark theme."}}}},c={args:{readOnly:!0},parameters:{docs:{description:{story:"Chat widget in read-only mode with user input disabled."}}}},d={args:{overrideLabels:{title:"Support Assistant",footerDisclaimer:"Responses are AI-generated and may be inaccurate.",inputPlaceholder:"Describe your issue..."}},parameters:{docs:{description:{story:"Chat widget with custom title, footer disclaimer, and input placeholder."}}}},l={args:{existingConversationId:"your-conversation-id-here"},parameters:{docs:{description:{story:"Load an existing conversation by ID. Replace the conversation ID in the controls panel with a real one to test."}}}},p={args:{firstRunExperience:{title:"Welcome to Support",description:"I can help you troubleshoot issues and answer questions.",suggestions:[{label:"Check order status",prompt:"What is the status of my order?"},{label:"Reset password",prompt:"How do I reset my password?"},{label:"Contact support",prompt:"I need to speak with a human agent"}]}},parameters:{docs:{description:{story:"Chat widget with a custom first-run experience including title, description, and suggestion chips."}}}},u={args:{disabledFeatures:{attachments:!0,history:!0,settings:!0,newChat:!0}},parameters:{docs:{description:{story:"Chat widget with attachments, history, settings, and new chat features disabled."}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Default conversational agent chat. Fill in the SDK configuration, agent ID, and folder ID in the controls panel to start chatting."
      }
    }
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    theme: "dark"
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget using the dark theme."
      }
    }
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    readOnly: true
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget in read-only mode with user input disabled."
      }
    }
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    overrideLabels: {
      title: "Support Assistant",
      footerDisclaimer: "Responses are AI-generated and may be inaccurate.",
      inputPlaceholder: "Describe your issue..."
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget with custom title, footer disclaimer, and input placeholder."
      }
    }
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    existingConversationId: "your-conversation-id-here"
  },
  parameters: {
    docs: {
      description: {
        story: "Load an existing conversation by ID. Replace the conversation ID in the controls panel with a real one to test."
      }
    }
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    firstRunExperience: {
      title: "Welcome to Support",
      description: "I can help you troubleshoot issues and answer questions.",
      suggestions: [{
        label: "Check order status",
        prompt: "What is the status of my order?"
      }, {
        label: "Reset password",
        prompt: "How do I reset my password?"
      }, {
        label: "Contact support",
        prompt: "I need to speak with a human agent"
      }]
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget with a custom first-run experience including title, description, and suggestion chips."
      }
    }
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabledFeatures: {
      attachments: true,
      history: true,
      settings: true,
      newChat: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget with attachments, history, settings, and new chat features disabled."
      }
    }
  }
}`,...u.parameters?.docs?.source}}};const O=["Default","DarkTheme","ReadOnly","CustomLabels","ExistingConversation","CustomFirstRun","DisabledFeatures"];export{p as CustomFirstRun,d as CustomLabels,i as DarkTheme,s as Default,u as DisabledFeatures,l as ExistingConversation,c as ReadOnly,O as __namedExportsOrder,j as default};
