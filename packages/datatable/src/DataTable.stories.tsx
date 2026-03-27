import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";
import "./DataTable.scss";
import { DataTable } from "./DataTable";
import type { DataTableProps } from "./types";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableStoryArgs extends Omit<DataTableProps, "sdk"> {
  baseUrl: string;
  orgName: string;
  tenantName: string;
  secret: string;
}

const DataTableWithSdk = ({
  baseUrl,
  orgName,
  tenantName,
  secret,
  ...dataTableProps
}: DataTableStoryArgs) => {
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

  return <DataTable sdk={sdk} {...dataTableProps} />;
};

const meta = {
  title: "Components/DataTable",
  component: DataTableWithSdk,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A React data table widget for viewing and editing UiPath Data Fabric entity records.

## Features

- CRUD Operations: Full support for Create, Read, Update, Delete
- Master-Detail View: Group data by foreign key relationships
- Inline Editing: Edit cells directly with support for different field types
- Choice Set Support: Single and multi-select choice set fields
- Foreign Key Display: Resolved display names for reference fields
- Diff Viewer: Review changes before committing
- Pagination: Efficient data pagination via ag-Grid

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-datatable
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { DataTable } from '@uipath/ui-widgets-datatable';
import "@uipath/ui-widgets-datatable/DataTable.css";
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    baseUrl: "https://cloud.uipath.com",
    orgName: "my-org",
    tenantName: "my-tenant",
    secret: "my-secret",
  });

  await sdk.initialize();

  return (
    <DataTable
      sdk={sdk}
      entityId="your-entity-id"
      pageSize={50}
      showIdColumn={true}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-wind
- ag-grid-community
- ag-grid-react`,
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
    entityId: {
      description: "The UUID of the Data Fabric entity to display",
      control: "text",
      type: { name: "string", required: true },
    },
    pageSize: {
      description: "Number of rows per page in the ag-Grid pagination",
      control: "number",
    },
    showIdColumn: {
      description: "Whether to show the Id column in the grid",
      control: "boolean",
    },
    columnConfig: {
      description:
        "Optional column configuration overrides keyed by field display name. See [ag-grid Column Properties](https://www.ag-grid.com/react-data-grid/column-properties/) for available options.",
      control: "object",
    },
    rowClassRules: {
      description:
        "ag-Grid row class rules for conditional row styling. See [ag-grid Row Styles](https://www.ag-grid.com/react-data-grid/row-styles/) for available options.",
      control: "object",
    },
    customPaddingForExpandedRow: {
      description:
        "Custom padding (in pixels) for expanded rows in group-by mode",
      control: "number",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "600px", width: "100%", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    baseUrl: "cloud.uipath.com",
    orgName: "",
    tenantName: "",
    secret: "",
    entityId: "",
  },
} satisfies Meta<typeof DataTableWithSdk>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Basic DataTable. Fill in the SDK configuration and entity ID in the controls panel to load data.",
      },
    },
  },
};

export const CustomPageSize: Story = {
  args: {
    pageSize: 20,
  },
  parameters: {
    docs: {
      description: {
        story: "DataTable with a custom page size of 10 rows per page.",
      },
    },
  },
};

export const HiddenIdColumn: Story = {
  args: {
    showIdColumn: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "DataTable with the Id column hidden. Only user-defined fields are displayed.",
      },
    },
  },
};

export const CustomColumnConfig: Story = {
  args: {
    columnConfig: {
      Id: {
        width: 200,
      },

      Name: {
        width: 250,
        pinned: "left",
      },

      Status: {
        width: 120,

        cellStyle: {
          fontWeight: "bold",
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "DataTable with custom column configuration. Columns are configured by their display name with custom widths, pinning, and cell styles.",
      },
    },
  },
};
