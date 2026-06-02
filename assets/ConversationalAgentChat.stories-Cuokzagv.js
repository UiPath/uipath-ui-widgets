import{j as t}from"./index-yJg_3BbZ.js";import{U as I}from"./jsep-BMd_HHWK.js";import{r as b}from"./iframe-DWWLR8WO.js";import{C as x}from"./ConversationalAgentChat-ByImSCRg.js";import"./index-qJpT_9-h.js";import"./preload-helper-PPVm8Dsz.js";import"./compiler-runtime-BRYx_RS0.js";import"./endOfMonth-CsMzRpQk.js";const D=({baseUrl:e,orgName:r,tenantName:a,secret:n,...C})=>{const[v,g]=b.useState({sdk:null,error:null});b.useEffect(()=>{if(!e||!r||!a||!n)return;let m=!1;return(async()=>{try{const o=e.match(/^https?:\/\//)?e:`https://${e}`,w=new I({baseUrl:o,orgName:r,tenantName:a,secret:n});await w.initialize(),m||g({sdk:w,error:null})}catch(o){m||g({sdk:null,error:o instanceof Error?o.message:"Failed to initialize SDK"})}})(),()=>{m=!0}},[e,r,a,n]);const{sdk:f,error:y}=v;return!e||!r||!a||!n?t.jsx("div",{style:{padding:24,color:"#666"},children:"Please provide baseUrl, orgName, tenantName, and secret in the controls panel below."}):y?t.jsxs("div",{style:{padding:24,color:"#d32f2f"},children:["SDK initialization failed: ",y]}):f?t.jsx(x,{sdk:f,...C}):t.jsx("div",{style:{padding:24},children:"Initializing SDK..."})},E={title:"Components/ConversationalAgentChat",component:D,decorators:[e=>t.jsx("div",{style:{height:"600px"},children:t.jsx(e,{})})],parameters:{layout:"padded",docs:{description:{component:`
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
- @uipath/apollo-wind`}}},tags:["autodocs"],argTypes:{baseUrl:{description:"UiPath API base URL",control:"text",table:{category:"SDK Configuration"}},orgName:{description:"UiPath organization name",control:"text",table:{category:"SDK Configuration"}},tenantName:{description:"UiPath tenant name",control:"text",table:{category:"SDK Configuration"}},secret:{description:"UiPath API secret for authentication",control:"text",table:{category:"SDK Configuration"}},agentId:{description:"ID of the conversational agent to use",control:"number"},folderId:{description:"ID of the folder containing the agent",control:"number"},locale:{description:"Locale for the chat UI",control:"select",options:["en","es","pt","de","fr","ja","ko","ru","tr","zh-CN","zh-TW","pt-BR","es-MX"]},theme:{description:"Visual theme for the chat UI",control:"select",options:["light","dark","light-hc","dark-hc"]},readOnly:{description:"When true, disables user input",control:"boolean"},overrideLabels:{description:"Override default labels for title, footer disclaimer, and input placeholder",control:"object"},existingConversationId:{description:"Load an existing conversation by ID instead of creating a new one on first message",control:"text"},firstRunExperience:{description:"Override the first-run experience. When omitted, derived from agent appearance data.",control:"object"},disabledFeatures:{description:"Override which features are disabled. Merged with defaults (fullScreen, preview, close are always disabled).",control:"object"}},args:{baseUrl:"cloud.uipath.com",orgName:"",tenantName:"",secret:"",agentId:0,folderId:0,locale:"en",theme:"light",readOnly:!1,overrideLabels:void 0,existingConversationId:void 0,firstRunExperience:void 0,disabledFeatures:void 0}},s={parameters:{docs:{description:{story:"Default conversational agent chat. Fill in the SDK configuration, agent ID, and folder ID in the controls panel to start chatting."}}}},i={args:{theme:"dark"},parameters:{docs:{description:{story:"Chat widget using the dark theme."}}}},c={args:{locale:"ja"},parameters:{docs:{description:{story:"Chat widget with Japanese locale."}}}},d={args:{readOnly:!0},parameters:{docs:{description:{story:"Chat widget in read-only mode with user input disabled."}}}},l={args:{overrideLabels:{title:"Support Assistant",footerDisclaimer:"Responses are AI-generated and may be inaccurate.",inputPlaceholder:"Describe your issue..."}},parameters:{docs:{description:{story:"Chat widget with custom title, footer disclaimer, and input placeholder."}}}},p={args:{existingConversationId:"your-conversation-id-here"},parameters:{docs:{description:{story:"Load an existing conversation by ID. Replace the conversation ID in the controls panel with a real one to test."}}}},u={args:{firstRunExperience:{title:"Welcome to Support",description:"I can help you troubleshoot issues and answer questions.",suggestions:[{label:"Check order status",prompt:"What is the status of my order?"},{label:"Reset password",prompt:"How do I reset my password?"},{label:"Contact support",prompt:"I need to speak with a human agent"}]}},parameters:{docs:{description:{story:"Chat widget with a custom first-run experience including title, description, and suggestion chips."}}}},h={args:{disabledFeatures:{attachments:!0,history:!0,settings:!0,newChat:!0}},parameters:{docs:{description:{story:"Chat widget with attachments, history, settings, and new chat features disabled."}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
    locale: "ja"
  },
  parameters: {
    docs: {
      description: {
        story: "Chat widget with Japanese locale."
      }
    }
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};const O=["Default","DarkTheme","Japanese","ReadOnly","CustomLabels","ExistingConversation","CustomFirstRun","DisabledFeatures"];export{u as CustomFirstRun,l as CustomLabels,i as DarkTheme,s as Default,h as DisabledFeatures,p as ExistingConversation,c as Japanese,d as ReadOnly,O as __namedExportsOrder,E as default};
