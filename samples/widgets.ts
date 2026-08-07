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
    id: "validation-station-prefetched",
    title: "Validation Station (pre-fetched)",
    description:
      "The same review screen, with the document fetched by the app instead of the widget — `fetchDuDocumentArtifacts` loads the artifacts, they are passed straight in, and the app owns the submit and draft write-back.",
  },
  {
    id: "invoice-review-workspace",
    title: "Invoice Review Workspace",
    description:
      "A custom human-in-the-loop review screen composed from the Validation Station compact subcomponents — document viewer, doc-type field, fields form, business rules, and line-items table editor — all linked by a shared instance-id so they mirror one store.",
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
];

export function getWidget(id: string): Widget | undefined {
  return widgets.find((w) => w.id === id);
}
