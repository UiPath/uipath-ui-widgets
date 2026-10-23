import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { withReasonCapture } from "../utils/withReasonCapture";

const SCHEMA = {
  fields: [
    {
      id: "decision",
      direction: "output",
      controlType: "dropdown",
      defaultValue: "Accept",
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
        component:
          "Takes a QuickForm schema and returns it with one optional Why dropdown under every select field. A rule shows each one only when the value differs from the field's `defaultValue`.",
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
};
