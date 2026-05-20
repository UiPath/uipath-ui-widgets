import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import { ConversationalAgentPickerChat } from "./ConversationalAgentPickerChat";
import "./ConversationalAgentChat.scss";
import type { ConversationalAgentPickerChatProps } from "./types";

interface ConversationalAgentPickerChatStoryArgs extends Omit<
  ConversationalAgentPickerChatProps,
  "sdk"
> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const ConversationalAgentPickerChatWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...pickerProps
}: ConversationalAgentPickerChatStoryArgs) => {
  const [state, setState] = useState<{
    sdk: UiPath | null;
    error: string | null;
  }>({ sdk: null, error: null });

  useEffect(() => {
    if (!baseUrl || !orgName || !tenantName || !secret) {
      return;
    }

    let cancelled = false;
    const initSdk = async () => {
      try {
        const normalizedBaseUrl = baseUrl.match(/^https?:\/\//)
          ? baseUrl
          : `https://${baseUrl}`;
        const uipath = new UiPath({
          baseUrl: normalizedBaseUrl,
          orgName,
          tenantName,
          secret,
        });
        await uipath.initialize();
        if (!cancelled) {
          setState({ sdk: uipath, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            sdk: null,
            error:
              err instanceof Error ? err.message : "Failed to initialize SDK",
          });
        }
      }
    };

    initSdk();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, orgName, tenantName, secret]);

  const { sdk, error } = state;

  if (!baseUrl || !orgName || !tenantName || !secret) {
    return (
      <div style={{ padding: 24, color: "#666" }}>
        Please provide baseUrl, orgName, tenantName, and secret in the controls
        panel below.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#d32f2f" }}>
        SDK initialization failed: {error}
      </div>
    );
  }

  if (!sdk) {
    return <div style={{ padding: 24 }}>Initializing SDK...</div>;
  }

  return <ConversationalAgentPickerChat sdk={sdk} {...pickerProps} />;
};

const meta = {
  title: "Components/ConversationalAgentPickerChat",
  component: ConversationalAgentPickerChatWithSdk,
  decorators: [
    (Story) => (
      <div style={{ height: "600px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
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
- @uipath/apollo-wind`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    baseUrl: {
      description: "UiPath API base URL",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    orgName: {
      description: "UiPath organization name",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    tenantName: {
      description: "UiPath tenant name",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    secret: {
      description: "UiPath API secret for authentication",
      control: "text",
      table: { category: "SDK Configuration" },
    },
    locale: {
      description: "Locale for the chat UI",
      control: "select",
      options: [
        "en",
        "es",
        "pt",
        "de",
        "fr",
        "ja",
        "ko",
        "ru",
        "tr",
        "zh-CN",
        "zh-TW",
        "pt-BR",
        "es-MX",
      ],
    },
    theme: {
      description: "Visual theme for the chat UI",
      control: "select",
      options: ["light", "dark", "light-hc", "dark-hc"],
    },
    readOnly: {
      description: "When true, disables user input in the chat view",
      control: "boolean",
    },
    overrideLabels: {
      description:
        "Override default labels for title, footer disclaimer, and input placeholder in the chat view",
      control: "object",
    },
  },
  args: {
    baseUrl: "cloud.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    locale: "en",
    theme: "light",
    readOnly: false,
    overrideLabels: undefined,
  },
} satisfies Meta<typeof ConversationalAgentPickerChatWithSdk>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default picker. Fill in the SDK configuration in the controls panel to load the agent list.",
      },
    },
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Picker with the dark theme applied to the chat view.",
      },
    },
  },
};
