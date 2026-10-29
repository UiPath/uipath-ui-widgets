import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { SourceComparison } from "../components/SourceComparison/SourceComparison";
import {
  FIXTURE_COMPARISON,
  FIXTURE_COMPARISON_QC,
} from "../fixtures/sourceComparison";

const complete = async () => {};

const meta = {
  title: "Components/SourceComparison",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer checks each extracted value against a source of truth: the two values side by side, a match or mismatch mark, a verdict with a corrected value, a citation and a coverage bar that gates Complete. `show.qcLane` adds a second-stage lane that concurs with or disputes the first reviewer.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SupplierPricingAgreement: Story = {
  render: () => (
    <SourceComparison {...FIXTURE_COMPARISON} onComplete={complete} />
  ),
};

export const SecondStageAudit: Story = {
  render: () => (
    <SourceComparison {...FIXTURE_COMPARISON_QC} onComplete={complete} />
  ),
};
