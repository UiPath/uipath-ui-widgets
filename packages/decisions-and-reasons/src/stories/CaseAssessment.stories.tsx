import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { CaseAssessment } from "../components/CaseAssessment/CaseAssessment";
import { FIXTURE_CASE } from "../fixtures/caseAssessment";

const complete = async () => {};

const meta = {
  title: "Components/CaseAssessment",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer weighs the agent's reasons and picks an outcome: reasons with a weight menu and Add a reason, outcome cards, final details that follow the outcome, and a Next time rule with a scope. `show.record` renders the record of how the outcome was reached as a collapsed drawer for demos.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WarrantyClaim: Story = {
  render: () => <CaseAssessment {...FIXTURE_CASE} onComplete={complete} />,
};

export const WithRecord: Story = {
  render: () => (
    <CaseAssessment
      {...FIXTURE_CASE}
      show={{ record: true }}
      reviewerId="reviewer@example.com"
      onComplete={complete}
    />
  ),
};

export const WithTaskTags: Story = {
  render: () => (
    <CaseAssessment
      {...FIXTURE_CASE}
      taskTags={[
        "Water damage",
        "Repeat claimant",
        "Missing photos",
        "Policy exclusion",
        "Goodwill candidate",
      ]}
      onComplete={complete}
    />
  ),
};

export const WithReasonTags: Story = {
  render: () => (
    <CaseAssessment
      {...FIXTURE_CASE}
      defaultReasons={[
        "Manufacturing defect",
        "Installer error",
        "Above plan ceiling",
        "Clean claim history",
      ]}
      onComplete={complete}
    />
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <CaseAssessment
      {...FIXTURE_CASE}
      readOnly
      saved={{ outcome: "ApprovePartial" }}
      onComplete={complete}
    />
  ),
};
