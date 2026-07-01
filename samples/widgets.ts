export interface Widget {
  id: string;
  title: string;
  description: string;
}

export const widgets: Widget[] = [
  {
    id: "datatable",
    title: "DataTable",
    description:
      "Browse and edit UiPath Data Service entities with sorting, filtering, grouping, and inline editing.",
  },
  {
    id: "validation-station",
    title: "Validation Station",
    description:
      "Review document understanding tasks side-by-side with the source document and apply field-level corrections.",
  },
  {
    id: "multi-file-upload",
    title: "Multi File Upload",
    description:
      "Upload multiple files in parallel to a UiPath Storage Bucket with progress tracking and validation.",
  },
  {
    id: "conversational-agent-chat",
    title: "Conversational Agent Chat",
    description:
      "Embed a chat experience for any UiPath Conversational Agent with streaming responses.",
  },
  {
    id: "connectors",
    title: "Connectors",
    description:
      "Browse Integration Service connectors, pick a connection, then build and execute a dynamic form for any connector activity.",
  },
  {
    id: "slack-message",
    title: "Send Slack Message",
    description:
      "Send a direct or channel message through an Integration Service Slack connection.",
  },
];

export function getWidget(id: string): Widget | undefined {
  return widgets.find((w) => w.id === id);
}
