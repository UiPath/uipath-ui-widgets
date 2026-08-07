import { Box, Button, Grid } from "@mui/material";
import {
  ValidationStation,
  type IVsSaveExceptionReportRequest,
  type IVsSaveValidatedDataRequest,
  type SaveValidatedDataResult,
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

interface ValidationStationPageProps {
  uipathSdk: UiPath;
}

/**
 * Validation Station in **self-fetching** mode: the widget receives `sdk` +
 * `data` and reads the document straight from the storage-bucket paths on
 * `ContentValidationData`, then owns submit and save-as-draft itself.
 *
 * See `ValidationStationPrefetchedPage` for the same screen with the fetch and
 * the write-back moved into the host.
 */
function ValidationStationPage({ uipathSdk }: ValidationStationPageProps) {
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

  // `result` is set because the widget has `sdk` + `data` and persisted it.
  const handleSubmit = useCallback(
    async (
      _request: IVsSaveValidatedDataRequest,
      result?: SaveValidatedDataResult,
    ) => {
      if (!result?.success) {
        console.error("Submit failed:", result?.error);
        return;
      }
      if (!selectedTask) return;
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
    [selectedTask, fetchTasks, clearSelection],
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
    if (!selectedTask) {
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
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <ValidationStation
            sdk={uipathSdk}
            data={selectedTask.data as DuFramework.ContentValidationData}
            folderId={selectedTask.folderId}
            selectAndFocusFieldValueByPath={selectAndFocusFieldValueByPath}
            setFieldValueByPath={setFieldValueByPath}
            onSubmit={handleSubmit}
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
      <PageHeader widgetId="validation-station" />
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

export default ValidationStationPage;
