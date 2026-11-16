import { Alert, Box, Grid } from "@mui/material";
import {
  ClassificationStation,
  type CsContentValidationData,
  type ICsSaveClassificationRequest,
  type ICsSaveExceptionReportRequest,
  type SaveClassificationResult,
  type SplitClassifications,
} from "@uipath/ui-widgets-classification-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useState } from "react";
import { loadClassificationStationWcOnDemand } from "../duWcLoader";
import PageHeader from "./PageHeader";
import CenteredText from "./ValidationStation/CenteredText";
import TaskQueueRail from "./ValidationStation/TaskQueueRail";
import { useDocumentValidationTasks } from "./ValidationStation/useDocumentValidationTasks";

interface ClassificationStationPageProps {
  uipathSdk: UiPath;
}

/**
 * Classification Station in **self-fetching** mode: the widget receives `sdk`
 * + `data` and reads the file straight from the storage-bucket paths on the
 * task's `CsContentValidationData`, then writes submits and drafts back to
 * `ValidatedClassificationResultsPath` itself. Completing the task and
 * reporting an exception stay with the page.
 */
function ClassificationStationPage({
  uipathSdk,
}: ClassificationStationPageProps) {
  const {
    taskList,
    tasksLoading,
    fetchTasks,
    selectedTaskId,
    selectedTask,
    contentValidationData,
    taskLoading,
    selectTask,
    clearSelection,
  } = useDocumentValidationTasks<CsContentValidationData>(
    uipathSdk,
    TaskType.DocumentClassification,
  );

  useEffect(() => {
    loadClassificationStationWcOnDemand();
  }, []);

  // The split as the reviewer edits it, from `onSplitClassifications`.
  const [split, setSplit] = useState<SplitClassifications | null>(null);
  const [dirty, setDirty] = useState(false);

  const selectAnotherTask = useCallback(
    (taskId: number) => {
      setSplit(null);
      setDirty(false);
      selectTask(taskId);
    },
    [selectTask],
  );

  // `result` is set because the widget has `sdk` + `data` and persisted it.
  const handleSubmit = useCallback(
    async (
      _request: ICsSaveClassificationRequest,
      result?: SaveClassificationResult,
    ) => {
      if (!result?.success) {
        console.error("Submit failed:", result?.error);
        return;
      }
      if (!selectedTask) return;
      try {
        await selectedTask.complete({
          type: TaskType.DocumentClassification,
          action: "Completed",
        });
        clearSelection();
        await fetchTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
      }
    },
    [selectedTask, fetchTasks, clearSelection],
  );

  const handleReportException = useCallback(
    async (taskId: number, request: ICsSaveExceptionReportRequest) => {
      try {
        const response = await new OrchestratorDuModule(
          uipathSdk,
        ).submitExceptionReport(
          taskId,
          request.documentId,
          request.exceptionReport.Reason ||
            "Reported via Classification Station",
          { folderId: selectedTask?.folderId },
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
    [uipathSdk, selectedTask, fetchTasks, clearSelection],
  );

  const renderDocument = () => {
    if (taskLoading) return <CenteredText>Loading task...</CenteredText>;
    if (!selectedTask || !contentValidationData) {
      return <CenteredText>Select a task from the list</CenteredText>;
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
        <Alert severity={dirty ? "warning" : "info"} sx={{ mb: 2 }}>
          {split && split.split.length > 0
            ? split.split
                .map((s) => `${s.documentTypeId}: pages ${s.pageRange}`)
                .join(" · ")
            : "The current split appears here as the reviewer edits it."}
          {dirty ? " (unsaved)" : ""}
        </Alert>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <ClassificationStation
            sdk={uipathSdk}
            data={contentValidationData}
            onSplitClassifications={setSplit}
            onDirtyChange={setDirty}
            onSubmit={handleSubmit}
            onSaveAsDraft={(_request, result) =>
              result?.success
                ? setDirty(false)
                : console.error("Draft save failed:", result?.error)
            }
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
      <PageHeader widgetId="classification-station" />
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
              onSelectTask={selectAnotherTask}
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

export default ClassificationStationPage;
