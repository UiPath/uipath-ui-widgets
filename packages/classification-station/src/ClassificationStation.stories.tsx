import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import { ClassificationStation } from "./ClassificationStation";
import { configureClassificationStationWc } from "./loadClassificationStationWc";
import {
  ClassificationStationLanguage,
  type ClassificationStationProps,
  type CsContentValidationData,
} from "./types";

// Served from `public/du-cs-wc` — staged by the `prestorybook` script and
// exposed via `staticDirs` in `.storybook/main.ts`. `includeFonts` because
// Storybook does not load Material Icons globally.
configureClassificationStationWc({
  deploymentUrl: "/du-cs-wc",
  includeFonts: true,
}).catch((error: unknown) => {
  console.error(
    "Failed to load the Classification Station web component:",
    error,
  );
});

interface ClassificationStationStoryArgs extends Omit<
  ClassificationStationProps,
  "sdk"
> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const ClassificationStationWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...props
}: ClassificationStationStoryArgs) => {
  const [state, setState] = useState<{
    sdk: UiPath | null;
    error: string | null;
  }>({ sdk: null, error: null });

  useEffect(() => {
    if (!baseUrl || !orgName || !tenantName || !secret) return;

    let cancelled = false;
    const initSdk = async () => {
      try {
        const uipath = new UiPath({
          baseUrl: /^https?:\/\//.test(baseUrl)
            ? baseUrl
            : `https://${baseUrl}`,
          orgName,
          tenantName,
          secret,
        });
        await uipath.initialize();
        if (!cancelled) setState({ sdk: uipath, error: null });
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
  if (!sdk) return <div style={{ padding: 24 }}>Initializing SDK...</div>;

  return <ClassificationStation sdk={sdk} {...props} />;
};

const mockData: CsContentValidationData = {
  BucketName: "",
  BucketId: 0,
  // The folder the bucket lives in — fill in one of the two.
  FolderId: undefined,
  FolderKey: "",
  DocumentId: "",
  DocumentPath: "",
  EncodedDocumentPath: "",
  TextPath: "",
  DocumentObjectModelPath: "",
  TaxonomyPath: "",
  AutomaticClassificationResultsPath: "",
  ValidatedClassificationResultsPath: "",
  CustomizationInfoPath: "",
  ExtractorPayloadsPath: "",
  ShowOnlyRelevantPageRange: "false",
  AdditionalDataPath: "",
  OriginalDocumentFileName: "",
};

const meta: Meta<typeof ClassificationStationWithSdk> = {
  title: "Components/ClassificationStation",
  component: ClassificationStationWithSdk,
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
A React wrapper for the UiPath Document Understanding Classification Station standalone web component:
page thumbnails, the document viewer and the split/classify form.

Given \`sdk\` + \`data\` (a classification task's \`CsContentValidationData\`), it reads the
artifacts from the task's storage bucket and writes submits and drafts back to
\`ValidatedClassificationResultsPath\`. Given \`artifacts\`, it makes no HTTP calls.

\`\`\`tsx
import {
  configureClassificationStationWc,
  ClassificationStation,
} from '@uipath/ui-widgets-classification-station';

configureClassificationStationWc({ deploymentUrl: '/du-cs-wc', includeFonts: true });

<ClassificationStation
  sdk={sdk}
  data={task.data}
  onSubmit={(request, result) => result?.success && completeTask(request.classification)}
/>
\`\`\``,
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
        "CsContentValidationData: the bucket paths, document ID, and the folder they live in (FolderId or FolderKey).",
      control: "object",
    },
    theme: {
      control: "select",
      options: [
        "light",
        "dark",
        "light-hc",
        "dark-hc",
        "future-light",
        "future-dark",
      ],
    },
    language: {
      control: "select",
      options: Object.keys(ClassificationStationLanguage),
      mapping: ClassificationStationLanguage,
    },
    isReadonly: { control: "boolean" },
    enableSaveAsDraft: { control: "boolean" },
    supportNotClassifiedGroups: { control: "boolean" },
    documentViewerOptions: { control: "object" },
  },
  args: {
    baseUrl: "alpha.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    data: mockData,
    theme: "light",
    language: ClassificationStationLanguage.English,
    isReadonly: false,
    enableSaveAsDraft: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Fill in the SDK configuration and a classification task's data in the controls panel to load a file.",
      },
    },
  },
};
