import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { DocumentReasonRow } from "./DocumentReasonRow";

const meta = {
  title: "Components/DocumentReasonRow",
  component: DocumentReasonRow,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
One optional row of reasons that appears under a single edited document field. Only an edited field shows it, and skipping it records nothing.

\`\`\`tsx
{edited && (
  <DocumentReasonRow
    fieldLabel="PO number"
    reason={reason}
    onReasonChange={setReason}
  />
)}
\`\`\`
`,
      },
    },
  },
  args: { fieldLabel: "PO number", reason: null, onReasonChange: () => {} },
} satisfies Meta<typeof DocumentReasonRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Skipped: Story = {
  render: (args) => {
    const [reason, setReason] = React.useState<string | null>(null);
    const [note, setNote] = React.useState("");
    return (
      <DocumentReasonRow
        {...args}
        reason={reason}
        note={note}
        onReasonChange={setReason}
        onNoteChange={setNote}
      />
    );
  },
};
