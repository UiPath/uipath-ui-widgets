import {
  saveValidatedDataAsDraftToOrchestrator,
  submitValidatedDataToOrchestrator,
  type IVsSaveValidatedDataAsDraftRequest,
  type IVsSaveValidatedDataRequest,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import type { TaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback } from "react";
import type { Notification } from "./useNotification";

/** The task row carries the folder; fall back to the payload's own FolderId. */
function resolveFolderId(task: TaskGetResponse): number | undefined {
  const data = task.data as DuFramework.ContentValidationData | undefined;
  return task.folderId ?? data?.FolderId;
}

interface TaskMutationsParams {
  uipathSdk: UiPath;
  selectedTask: TaskGetResponse | null;
  /** Close the open task (after submit / report-exception). */
  clearSelection: () => void;
  /** Refresh the pending-task list. */
  refetch: () => Promise<void>;
  notify: (message: string, severity: Notification["severity"]) => void;
}

/**
 * The three save flows wired into `CompactFieldsForm`. The widget performs no
 * persistence and renders no feedback: it emits the payloads, this hook writes
 * them back (via the package's opt-in `submitValidatedDataToOrchestrator` /
 * `saveValidatedDataAsDraftToOrchestrator` helpers) and reports via `notify`. Submit and
 * report-exception also clear the selection and refresh the list; save-as-draft
 * persists edits without completing the task, so it leaves the selection open.
 */
export function useTaskMutations({
  uipathSdk,
  selectedTask,
  clearSelection,
  refetch,
  notify,
}: TaskMutationsParams) {
  const handleSaveValidatedDataRequest = useCallback(
    async (request: IVsSaveValidatedDataRequest) => {
      if (!selectedTask) return;
      const folderId = resolveFolderId(selectedTask);
      if (!folderId) {
        notify("Submit failed: no folder id", "error");
        return;
      }
      const result = await submitValidatedDataToOrchestrator(
        uipathSdk,
        selectedTask.data as DuFramework.ContentValidationData,
        folderId,
        request,
      );
      if (!result.success) {
        console.error("Submit failed:", result.error);
        notify("Submit failed", "error");
        return;
      }
      try {
        await selectedTask.complete({
          type: TaskType.DocumentValidation,
          action: "Completed",
        });
        clearSelection();
        await refetch();
        notify("Document submitted and task completed", "success");
      } catch (err) {
        console.error("Failed to complete task:", err);
        notify("Failed to complete task", "error");
      }
    },
    [uipathSdk, selectedTask, clearSelection, refetch, notify],
  );

  const handleSaveValidatedDataAsDraftRequest = useCallback(
    async (request: IVsSaveValidatedDataAsDraftRequest) => {
      if (!selectedTask) return;
      const folderId = resolveFolderId(selectedTask);
      if (!folderId) {
        notify("Failed to save draft: no folder id", "error");
        return;
      }
      const result = await saveValidatedDataAsDraftToOrchestrator(
        uipathSdk,
        selectedTask.data as DuFramework.ContentValidationData,
        folderId,
        request,
      );
      if (!result.success) {
        console.error("Save draft failed:", result.error);
        notify("Failed to save draft", "error");
        return;
      }
      notify("Draft saved", "success");
    },
    [uipathSdk, selectedTask, notify],
  );

  const handleReportException = useCallback(
    async (documentId: string, reason: string) => {
      if (!selectedTask) return;
      try {
        const response = await new OrchestratorDuModule(
          uipathSdk,
        ).submitExceptionReport(
          selectedTask.id,
          documentId,
          reason || "Reported via Invoice Review Workspace",
          { folderId: selectedTask.folderId },
        );
        if (!response.IsSuccessful) {
          console.error("submitExceptionReport failed:", response.ErrorMessage);
          notify("Failed to report exception", "error");
          return;
        }
        clearSelection();
        await refetch();
        notify("Exception reported", "success");
      } catch (error) {
        console.error("submitExceptionReport threw:", error);
        notify("Failed to report exception", "error");
      }
    },
    [uipathSdk, selectedTask, clearSelection, refetch, notify],
  );

  return {
    handleSaveValidatedDataRequest,
    handleSaveValidatedDataAsDraftRequest,
    handleReportException,
  };
}
