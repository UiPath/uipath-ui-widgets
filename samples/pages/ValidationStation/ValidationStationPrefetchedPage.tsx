import { Box, Button, Grid, Typography } from "@mui/material";
import {
  fetchDuDocumentArtifacts,
  saveValidatedDataAsDraft,
  submitValidatedData,
  ValidationStation,
  type DuDocumentArtifacts,
  type IVsSaveExceptionReportRequest,
  type IVsSaveValidatedDataAsDraftRequest,
  type IVsSaveValidatedDataRequest,
  type SelectAndFocusFieldValueByPath,
  type SetFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { type DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useState } from "react";
import { loadValidationStationWcOnDemand } from "../../duWcLoader";
import CenteredText from "./CenteredText";
import PageHeader from "../PageHeader";
import TaskQueueRail from "./TaskQueueRail";
import { useDocumentValidationTasks } from "./useDocumentValidationTasks";

interface ValidationStationPrefetchedPageProps {
  uipathSdk: UiPath;
}

/**
 * Validation Station in **pre-fetched** mode: this page fetches the artifacts
 * with `fetchDuDocumentArtifacts` and passes them in, and since the widget gets
 * no `sdk`/`data` it neither fetches nor persists — the write-back happens here.
 *
 * The shape to copy when the document does not come from a storage bucket, when
 * the artifacts are already in memory, or when persistence belongs to the host.
 */
function ValidationStationPrefetchedPage({
  uipathSdk,
}: ValidationStationPrefetchedPageProps) {
  const {
    taskList,
    tasksLoading,
    fetchTasks,
    selectedTaskId,
    selectedTask,
    taskLoading,
    selectTask,
    clearSelection,
  } = useDocumentValidationTasks(uipathSdk);

  useEffect(() => {
    loadValidationStationWcOnDemand();
  }, []);

  const [selectAndFocusFieldValueByPath, setSelectAndFocusFieldValueByPath] =
    useState<SelectAndFocusFieldValueByPath | undefined>(undefined);
  const [setFieldValueByPath, setSetFieldValueByPath] = useState<
    SetFieldValueByPath | undefined
  >(undefined);
  // Tagged with the document it belongs to, so switching tasks shows the
  // loading state rather than the previous document's artifacts — without
  // clearing state from inside the effect, which would cascade a render.
  const [fetched, setFetched] = useState<{
    source: DuFramework.ContentValidationData;
    artifacts?: DuDocumentArtifacts;
    error?: string;
  } | null>(null);

  const folderId = selectedTask?.folderId;
  const data = selectedTask?.data as
    | DuFramework.ContentValidationData
    | undefined;

  // One call replaces everything the widget does internally in self-fetching
  // mode: the bucket reads, the unzipping, the validated → automatic fallback.
  useEffect(() => {
    if (!data) return;

    let cancelled = false;
    fetchDuDocumentArtifacts(uipathSdk, data, folderId)
      .then((artifacts) => {
        if (!cancelled) setFetched({ source: data, artifacts });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to fetch document artifacts:", error);
        setFetched({
          source: data,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [uipathSdk, data, folderId]);

  // Ignore a result that belongs to a document the user has moved on from.
  const current = fetched?.source === data ? fetched : null;

  // No `result` from the widget without an SDK, so the write-back is ours;
  // `submitValidatedData` is what the widget would have called.
  const handleSubmit = useCallback(
    async (request: IVsSaveValidatedDataRequest) => {
      if (!selectedTask || !data || folderId == null) return;
      const result = await submitValidatedData(
        uipathSdk,
        data,
        folderId,
        request,
      );
      if (!result.success) {
        console.error("Submit failed:", result.error);
        return;
      }
      try {
        await selectedTask.complete({
          type: TaskType.DocumentValidation,
          action: "Completed",
        });
        clearSelection();
        await fetchTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
      }
    },
    [uipathSdk, selectedTask, data, folderId, fetchTasks, clearSelection],
  );

  /** Draft saves persist the in-progress values without completing the task. */
  const handleSaveAsDraft = useCallback(
    async (request: IVsSaveValidatedDataAsDraftRequest) => {
      if (!data || folderId == null) return;
      const result = await saveValidatedDataAsDraft(
        uipathSdk,
        data,
        folderId,
        request,
      );
      if (!result.success) console.error("Draft save failed:", result.error);
    },
    [uipathSdk, data, folderId],
  );

  const handleReportException = useCallback(
    async (taskId: number, request: IVsSaveExceptionReportRequest) => {
      try {
        const reason =
          (request.exceptionReport as { Reason?: string } | null)?.Reason ?? "";
        const response = await new OrchestratorDuModule(
          uipathSdk,
        ).submitExceptionReport(
          taskId,
          request.documentId,
          reason || "Reported via Validation Station",
          { folderId },
        );
        if (!response.IsSuccessful) {
          console.error("submitExceptionReport failed:", response.ErrorMessage);
        }
        clearSelection();
        await fetchTasks();
      } catch (error) {
        console.error("submitExceptionReport threw:", error);
      }
    },
    [uipathSdk, folderId, fetchTasks, clearSelection],
  );

  const renderDocument = () => {
    if (taskLoading) return <CenteredText>Loading task...</CenteredText>;
    if (!selectedTask || !data) {
      return <CenteredText>Select a task from the list</CenteredText>;
    }
    if (current?.error) {
      return (
        <CenteredText color="error.main">
          Failed to fetch document artifacts: {current.error}
        </CenteredText>
      );
    }
    if (!current?.artifacts) {
      return <CenteredText>Fetching document artifacts...</CenteredText>;
    }

    return (
      <Box
        sx={{
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", gap: 1, flexShrink: 0 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setSelectAndFocusFieldValueByPath({
                path: [
                  { fieldName: "items", valueIndex: 1 },
                  { fieldName: "Items - Quantities", valueIndex: 0 },
                ],
              })
            }
          >
            Focus Item Quantity By Path
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setSetFieldValueByPath({
                path: [{ fieldName: "Vendor Name", valueIndex: 0 }],
                update: { Value: "correct value" },
              })
            }
          >
            Set Vendor Name
          </Button>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1, flexShrink: 0 }}
        >
          Pre-fetched: this page fetched the artifacts and passes them as
          <code> artifacts</code>. The widget has no <code>sdk</code> or
          <code> data</code>, so saves come back here as raw requests.
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <ValidationStation
            artifacts={current.artifacts}
            documentId={data.DocumentId}
            selectAndFocusFieldValueByPath={selectAndFocusFieldValueByPath}
            setFieldValueByPath={setFieldValueByPath}
            onSubmit={handleSubmit}
            onSaveAsDraft={handleSaveAsDraft}
            onReportException={(request) =>
              handleReportException(selectedTask.id, request)
            }
          />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <PageHeader widgetId="validation-station-prefetched" />
      <Box sx={{ flex: 1, overflow: "auto", height: "calc(100vh - 160px)" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid
            size={3}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              height: "100%",
              overflow: "auto",
            }}
          >
            <TaskQueueRail
              uipathSdk={uipathSdk}
              tasks={taskList}
              tasksLoading={tasksLoading}
              selectedTaskId={selectedTaskId}
              onSelectTask={selectTask}
              onReload={fetchTasks}
              onStatusChange={clearSelection}
            />
          </Grid>
          <Grid size={9} sx={{ height: "100%" }}>
            {renderDocument()}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ValidationStationPrefetchedPage;
