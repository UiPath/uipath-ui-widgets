import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ContentValidationData } from "@uipath/du-shared-util-mfe";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import { ValidationStation } from "./ValidationStation";
import { ValidationStationLanguage } from "./types";
import type { ValidationStationProps } from "./types";

interface ValidationStationStoryArgs extends Omit<
  ValidationStationProps,
  "sdk"
> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const ValidationStationWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...props
}: ValidationStationStoryArgs) => {
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

  return <ValidationStation sdk={sdk} {...props} />;
};

const mockData: ContentValidationData = {
  BucketName: "",
  BucketId: 0,
  FolderId: 0,
  FolderKey: "",
  DocumentId: "",
  DocumentPath: "",
  EncodedDocumentPath: "",
  TextPath: "",
  DocumentObjectModelPath: "",
  TaxonomyPath: "",
  AutomaticExtractionResultsPath: "",
  ValidatedExtractionResultsPath: "",
  ExtractorPayloadsPath: "",
  ShowOnlyRelevantPageRange: "",
  AdditionalDataPath: "",
  OriginalDocumentFileName: "",
  CustomizationInfoPath: "",
};

const meta = {
  title: "Components/ValidationStation",
  component: ValidationStationWithSdk,
  decorators: [
    (Story) => (
      <div style={{ height: "800px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A React wrapper for the UiPath Document Understanding Validation Station standalone web component.

## Features

- Renders the DU Validation Station for document validation
- Standalone mode: consumer provides document data directly and handles save operations via event callbacks
- Supports light, dark, and high-contrast themes
- Configurable language, read-only mode, and save-as-draft
- Event-driven props for field/table cell manipulation

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-validation-station
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { ValidationStation } from '@uipath/ui-widgets-validation-station';
import "@uipath/ui-widgets-validation-station/ValidationStation.css";
import { UiPath } from '@uipath/uipath-typescript/core';

const sdk = new UiPath({
  baseUrl: 'https://cloud.uipath.com',
  orgName: 'your-org',
  tenantName: 'your-tenant',
  secret: 'your-secret'
});

await sdk.initialize();

function App() {
  return (
    <ValidationStation
      sdk={sdk}
      data={myContentValidationData}
      folderId={12345}
      theme="light"
      language="en"
      save={{ validate: true }}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/du-validation-station-wc
- @uipath/du-shared-util-mfe`,
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
    data: {
      description:
        "ContentValidationData object containing bucket paths, document ID, and folder references.",
      control: "object",
    },
    folderId: {
      description:
        "Storage bucket folder ID. Falls back to data.FolderId if not provided.",
      control: "number",
    },
    theme: {
      description: "Visual theme for the validation station",
      control: "select",
      options: ["light", "dark", "light-hc", "dark-hc"],
    },
    language: {
      description: "Language/locale for the validation station UI",
      control: "select",
      options: Object.keys(ValidationStationLanguage),
      mapping: ValidationStationLanguage,
    },
    isReadonly: {
      description: "When true, the validation station is in read-only mode",
      control: "boolean",
    },
    enableSaveAsDraft: {
      description: "When true, enables the save-as-draft functionality",
      control: "boolean",
    },
    options: {
      description:
        "Additional configuration options for the validation station",
      control: "object",
    },
    save: {
      description: "Trigger save with optional validation",
      control: "object",
    },
    discardChanges: {
      description: "Trigger discard changes",
      control: "object",
    },
  },
  args: {
    baseUrl: "alpha.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    data: mockData,
    folderId: 0,
    theme: "light",
    language: ValidationStationLanguage.English,
    isReadonly: false,
    enableSaveAsDraft: false,
  },
} satisfies Meta<typeof ValidationStationWithSdk>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default standalone validation station. Fill in the SDK configuration and data fields in the controls panel to load a document.",
      },
    },
  },
};
