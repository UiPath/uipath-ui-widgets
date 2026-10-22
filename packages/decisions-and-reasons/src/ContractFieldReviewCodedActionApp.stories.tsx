import type { Meta, StoryObj } from "@storybook/react-vite";
import "./DecisionsAndReasons.scss";
import { ContractFieldReviewCodedActionApp } from "./ContractFieldReviewCodedActionApp";
import { FIXTURE_CONTRACT, FIXTURE_CONTRACT_QC } from "./use-case-fixtures";

const meta = {
  title: "Components/ContractFieldReviewCodedActionApp",
  component: ContractFieldReviewCodedActionApp,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A prop-driven field review for a contract audit. Fields are grouped by section, each showing the extracted contract value beside the system-of-record value with a match or mismatch badge and a citation into the source document. The reviewer gives a verdict per field, with a corrected value when either side is wrong, and a one-tap note. An optional second-stage lane concurs with or disputes the first reviewer. A summary bar counts validated, flagged and not reviewed fields. Complete needs every field reviewed; Reject and Bypass need a reason. Every verdict and value records whether the model or the reviewer set it.

## Usage

\`\`\`tsx
import { ContractFieldReviewCodedActionApp } from '@uipath/ui-widgets-decisions-and-reasons/preview';

<ContractFieldReviewCodedActionApp
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
    data: FIXTURE_CONTRACT,
    onComplete: async () => {},
  },
  argTypes: {
    data: { control: false },
    onComplete: { control: false },
    onChange: { control: false },
    onOpenCitation: { control: false },
    readOnly: { control: "boolean" },
    reviewerId: { control: "text" },
  },
} satisfies Meta<typeof ContractFieldReviewCodedActionApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupplierPricingAgreement: Story = {};

export const SecondStageAudit: Story = {
  args: { data: FIXTURE_CONTRACT_QC },
  parameters: {
    docs: {
      description: {
        story:
          "The audit lane starts from the first reviewer's verdicts. Concur keeps them, a different verdict disputes them.",
      },
    },
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    saved: {
      outcome: "Complete",
      values: {
        "rebate-rate:verdict": "Correct",
        "dispensing-fee:verdict": "System value wrong",
        "dispensing-fee:system": "$1.85 per unit",
        "price-cap:verdict": "Extraction wrong",
        "price-cap:contract": "3% per year",
        "term-length:verdict": "Correct",
        "renewal-notice:verdict": "Correct",
        "payment-terms:verdict": "Correct",
      },
      whys: {
        "dispensing-fee:verdict": {
          why: "System record out of date",
          note: "",
        },
        "price-cap:verdict": { why: "Superseded by an amendment", note: "" },
      },
    },
  },
};
