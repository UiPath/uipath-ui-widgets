import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { configureDocumentViewerWc } from "./loadDocumentViewerWc";
import {
  type DocumentViewerContentData,
  DocumentViewerLanguage,
  type DocumentViewerProps,
} from "./types";

// Served from `public/du-dv-wc` — staged by the `prestorybook` script and
// exposed via `staticDirs` in `.storybook/main.ts`. `includeFonts` because
// Storybook does not load Material Icons globally.
configureDocumentViewerWc({
  deploymentUrl: "/du-dv-wc",
  includeFonts: true,
}).catch((error: unknown) => {
  console.error("Failed to load the document viewer web component:", error);
});

interface DocumentViewerStoryArgs extends Omit<DocumentViewerProps, "sdk"> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const DocumentViewerWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...props
}: DocumentViewerStoryArgs) => {
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

  return <DocumentViewer sdk={sdk} {...props} />;
};

const mockData: DocumentViewerContentData = {
  BucketId: 0,
  // The folder the bucket lives in — fill in one of the two.
  FolderId: undefined,
  FolderKey: "",
  DocumentId: "",
  DocumentObjectModelPath: "",
  EncodedDocumentPath: "",
  TextPath: "",
};

const meta: Meta<typeof DocumentViewerWithSdk> = {
  title: "Components/DocumentViewer",
  component: DocumentViewerWithSdk,
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
A React wrapper for the UiPath Document Understanding document viewer web component — the
viewer of Validation Station and Classification Station, on its own. It holds no extraction
data: link it to a form through \`highlightReference\`, \`passiveReferences\` and
\`onReferenceSelect\`.

Given \`sdk\` + \`data\` (a Validation or Classification Station task's data), it reads the DOM,
the original and the text from the task's storage bucket. Given \`artifacts\`
(\`{ dom, original, text }\`), it makes no HTTP calls.

\`\`\`tsx
import {
  configureDocumentViewerWc,
  DocumentViewer,
} from '@uipath/ui-widgets-document-viewer';

configureDocumentViewerWc({ deploymentUrl: '/du-dv-wc', includeFonts: true });

<DocumentViewer sdk={sdk} data={task.data} highlightReference={selected} />
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
        "The bucket paths of the DOM, the original and the text, and the folder they live in (FolderId or FolderKey).",
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
      options: Object.keys(DocumentViewerLanguage),
      mapping: DocumentViewerLanguage,
    },
    options: { control: "object" },
    goToPage: { control: "object" },
  },
  args: {
    baseUrl: "alpha.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    data: mockData,
    theme: "light",
    language: DocumentViewerLanguage.English,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Fill in the SDK configuration and a task's data in the controls panel to load a document.",
      },
    },
  },
};
