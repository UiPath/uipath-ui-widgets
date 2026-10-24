import type { DraftEditingProps } from "../models/decision";

export const FIXTURE_DRAFT: Omit<DraftEditingProps, "onComplete"> = {
  title: "Help channel question HC-20418",
  subtitle: "How do I export last month's usage report?",
  proposedBy: "Support reply agent v1",
  facts: [
    { label: "Channel", value: "Help channel" },
    { label: "Plan", value: "Team plan" },
  ],
  excerpt:
    "Hi, I need last month's usage report as a spreadsheet for my finance team. I can only find a chart on the dashboard. Where do I get the file?",
  fields: [
    {
      id: "reply",
      label: "Reply",
      value:
        "Hi there, thanks for asking. Open Reports, choose Usage, pick last month in the date range and select Export. The file arrives as a spreadsheet within a few minutes and the download link stays valid for 7 days. If the export button is greyed out, your role may not include report access, so ask a workspace admin to add it.",
    },
  ],
};
