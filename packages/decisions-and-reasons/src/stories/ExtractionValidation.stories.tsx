import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../DecisionsAndReasons.scss";
import { ExtractionValidation } from "../components/ExtractionValidation/ExtractionValidation";
import { DocumentReasonRow } from "../components/shared/DocumentReasonRow";
import { FIXTURE_EXTRACTION } from "../fixtures/extractionValidation";

const complete = async () => {};

const meta = {
  title: "Components/ExtractionValidation",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The reviewer confirms or corrects the values extracted from a document: header fields and line items with confidence (low values are highlighted), one-click confirm or correct with a reason, and Validate or Reject. `aside` renders a viewer beside the form.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Invoice: Story = {
  render: () => (
    <ExtractionValidation {...FIXTURE_EXTRACTION} onComplete={complete} />
  ),
};

export const WithViewerBeside: Story = {
  render: () => (
    <ExtractionValidation
      {...FIXTURE_EXTRACTION}
      aside={
        <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-border-de-emp text-xs text-muted-foreground">
          Document viewer
        </div>
      }
      onComplete={complete}
    />
  ),
};

export const EditedFieldReasonRow: Story = {
  render: () => {
    const [reason, setReason] = React.useState<string | null>(null);
    const [note, setNote] = React.useState("");
    return (
      <DocumentReasonRow
        fieldLabel="PO number"
        reason={reason}
        note={note}
        onReasonChange={setReason}
        onNoteChange={setNote}
      />
    );
  },
};
