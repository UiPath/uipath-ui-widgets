import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { withReasonCapture } from "./reviewModel";

const SCHEMA = {
  fields: [
    {
      id: "decision",
      direction: "output",
      controlType: "dropdown",
      defaultValue: "Approve",
    },
    { id: "claimId", direction: "input", controlType: "text" },
  ],
};

const meta = {
  title: "Components/withReasonCapture",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Takes a QuickForm schema and returns it with one optional "Why?" dropdown under every select field (\`dropdown\`, \`radioGroup\`, \`checkbox\`). A rule shows each one only when the value differs from the field's \`defaultValue\`. Input-direction fields and other controls are left alone.

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-decisions-and-reasons
\`\`\`

## Usage

\`\`\`ts
import { withReasonCapture } from '@uipath/ui-widgets-decisions-and-reasons/preview';

const { schema, added } = withReasonCapture(developerSchema, {
  label: "Why? (optional)",
  whys: ["Wrong", "Outdated", "Other"],
  idFor: (fieldId) => \`why_\${fieldId}\`,
});
\`\`\`

\`schema\` is the input schema with the added fields in place. \`added\` lists only the added fields, in schema order.
`,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddedField: Story = {
  render: () => (
    <pre className="uipath-decisions-and-reasons rounded-lg border border-border-de-emp bg-card p-4 text-xs text-card-foreground">
      {JSON.stringify(withReasonCapture(SCHEMA).added, null, 2)}
    </pre>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The field added under the `decision` dropdown. The `claimId` input field gets none.",
      },
    },
  },
};
