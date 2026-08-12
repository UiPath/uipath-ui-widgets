import type {
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import type { TaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback } from "react";
import type { Notification } from "./useNotification";

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
 * The three save outcomes wired into `CompactFieldsForm`. The widget renders no
 * feedback of its own, so each handler reports via `notify`; submit and
 * report-exception also clear the selection and refresh the list. Save-as-draft
 * persists edits without completing the task, so it leaves the selection open.
 */
export function useTaskMutations({
  uipathSdk,
  selectedTask,
  clearSelection,
  refetch,
  notify,
}: TaskMutationsParams) {
  const handleSubmit = useCallback(
    async (
      _request: IVsSaveValidatedDataRequest,
      result?: SaveValidatedDataResult,
    ) => {
      if (!result?.success) {
        console.error("Submit failed:", result?.error);
        notify("Submit failed", "error");
        return;
      }
      if (!selectedTask) return;
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
    [selectedTask, clearSelection, refetch, notify],
  );

  const handleSaveAsDraft = useCallback(
    (
      _request: IVsSaveValidatedDataAsDraftRequest,
      result?: SaveValidatedDataResult,
    ) => {
      if (!result?.success) {
        console.error("Save draft failed:", result?.error);
        notify("Failed to save draft", "error");
        return;
      }
      notify("Draft saved", "success");
    },
    [notify],
  );

  const handleReportException = useCallback(
    async (request: IVsSaveExceptionReportRequest) => {
      if (!selectedTask) return;
      const documentId = request.documentId;
      const reason =
        (request.exceptionReport as { Reason?: string } | null)?.Reason ?? "";
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
    handleSubmit,
    handleSaveAsDraft,
    handleReportException,
  };
}
