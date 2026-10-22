import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { DocumentValidationCodedActionApp } from "./DocumentValidationCodedActionApp";
import { FIXTURE_INVOICE } from "./use-case-fixtures";

const meta = {
  title: "Components/DocumentValidationCodedActionApp",
  component: DocumentValidationCodedActionApp,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A prop-driven validation of an extracted document. Header fields and line items arrive with a confidence each, and low-confidence values are highlighted. The reviewer confirms a value with one click or corrects it, and a corrected value offers one-tap reasons. Validate and Reject are the outcomes, nothing is pre-selected, and Reject offers reason chips. Every value records whether the model or the reviewer set it.

## Usage

\`\`\`tsx
import { DocumentValidationCodedActionApp } from '@uipath/ui-widgets-decisions-and-reasons/preview';

<DocumentValidationCodedActionApp
  data={taskData}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(outcome, payload) => service.completeTask(outcome, payload)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  args: {
    data: FIXTURE_INVOICE,
    onComplete: async () => {},
  },
  argTypes: {
    data: { control: false },
    onComplete: { control: false },
    onChange: { control: false },
    readOnly: { control: "boolean" },
    reviewerId: { control: "text" },
  },
} satisfies Meta<typeof DocumentValidationCodedActionApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupplierInvoice: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    saved: {
      outcome: "Validate",
      values: { "header.total": "4,236.00", "line.2.unit-price": "6.30" },
    },
  },
};
