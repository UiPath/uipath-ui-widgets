import { Box, Typography } from "@mui/material";
import {
  CompactBusinessRules,
  CompactDocTypeField,
  CompactFieldsForm,
  CompactTableEditor,
  DocumentViewer,
  useDuDocumentArtifacts,
  ValidationStationLanguage,
  type CompactFieldsFormProps,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { type DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { TaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { useState } from "react";
import CenteredMessage from "./CenteredMessage";
import Panel from "./Panel";

interface ReviewWorkspaceProps {
  sdk: UiPath;
  task: TaskGetResponse;
  onSubmit: CompactFieldsFormProps["onSubmit"];
  onSaveAsDraft: CompactFieldsFormProps["onSaveAsDraft"];
  onReportException: CompactFieldsFormProps["onReportException"];
}

/**
 * The composed review screen. It fetches the document artifacts **once** via
 * `useDuDocumentArtifacts`, then hands the same artifacts to five compact
 * subcomponents laid out in a custom grid. Every subcomponent carries the same
 * `instanceId`, so they share one store: selecting a field in the form
 * highlights it in the viewer, selecting the line-items table opens the table
 * editor, and rule clicks focus the offending field — no cross-wiring needed.
 *
 * Only the fields form persists: it receives `sdk` + `data` + `folderId` (in
 * addition to the shared artifacts) so its built-in Submit / Save-draft /
 * Report-exception actions round-trip through the SDK. The other four are
 * fed pre-fetched artifacts only.
 */
function ReviewWorkspace({
  sdk,
  task,
  onSubmit,
  onSaveAsDraft,
  onReportException,
}: ReviewWorkspaceProps) {
  const data = task.data as DuFramework.ContentValidationData;
  const folderId = task.folderId;
  const { artifacts, error } = useDuDocumentArtifacts(sdk, data, folderId);
  const [status, setStatus] = useState<string>("");

  if (error)
    return <CenteredMessage text={`Failed to load document: ${error}`} />;
  if (!artifacts) return <CenteredMessage text="Loading document…" />;

  const documentId = data.DocumentId;
  // One shared store for the whole workspace, scoped to this document.
  const instanceId = `invoice-review-${documentId ?? task.id}`;

  // Data every subcomponent shares (fetched once, fed as JS properties).
  const shared = {
    artifacts,
    documentId,
    instanceId,
    theme: "light" as const,
    language: ValidationStationLanguage.English,
    // Not persistent: these panels live in a static grid and are never
    // re-parented, so they don't need the portal-survival path. Leaving it on
    // makes the ref cleanup call forceDestroy() on StrictMode's throwaway
    // unmount, tearing down the Angular element so it never re-renders (blank).
    persistent: false,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          p: 1,
          display: "grid",
          gap: 1,
          gridTemplateColumns: "1.3fr 1fr",
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: `
            "viewer doctype"
            "viewer form"
            "table  rules"
          `,
        }}
      >
        <Panel area="viewer">
          <DocumentViewer {...shared} style={{ height: "100%" }} />
        </Panel>

        <Panel area="doctype" label="Document type">
          <CompactDocTypeField
            {...shared}
            onDocumentTypeChanged={(id) => setStatus(`Document type → ${id}`)}
          />
        </Panel>

        <Panel area="form">
          {/* hideBusinessRules / hideDocumentTypeField: the standalone panels
              below own those surfaces, so the form drops its built-in ones. */}
          <CompactFieldsForm
            {...shared}
            sdk={sdk}
            data={data}
            folderId={folderId}
            options={{
              hideBusinessRules: true,
              hideDocumentTypeField: true,
              emitDtoStateChanges: true,
            }}
            onFieldValueSelected={(d) =>
              setStatus(`Selected field: ${d.Field?.FieldName ?? "?"}`)
            }
            onDirtyChange={(dirty) => dirty && setStatus("Unsaved changes")}
            onSubmit={onSubmit}
            onSaveAsDraft={onSaveAsDraft}
            onReportException={onReportException}
          />
        </Panel>

        <Panel area="table" label="Line items — select a table field to edit">
          <CompactTableEditor
            {...shared}
            onClosed={() => setStatus("Closed table editor")}
          />
        </Panel>

        <Panel area="rules" label="Business rules">
          <CompactBusinessRules
            {...shared}
            onBusinessRuleClick={(rule) =>
              setStatus(`Rule clicked → field ${rule.fieldId}`)
            }
          />
        </Panel>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 0.5,
          borderTop: 1,
          borderColor: "divider",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 28,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Shared store: <code>{instanceId}</code>
        </Typography>
        {status && (
          <Typography variant="caption" color="text.primary">
            · {status}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default ReviewWorkspace;
