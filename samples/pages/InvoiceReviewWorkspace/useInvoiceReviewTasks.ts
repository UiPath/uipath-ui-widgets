import type { UiPath } from "@uipath/uipath-typescript/core";
import { useNotification } from "./useNotification";
import { usePendingTaskList } from "./usePendingTaskList";
import { useSelectedTask } from "./useSelectedTask";
import { useTaskMutations } from "./useTaskMutations";

export type { Notification } from "./useNotification";

/**
 * Owns the task-review workflow state for the Invoice Review Workspace,
 * composed from four focused hooks: the pending-task list
 * ({@link usePendingTaskList}), the selected/hydrated task
 * ({@link useSelectedTask}), the Submit / Save-as-draft / Report-exception
 * mutations ({@link useTaskMutations}), and toast feedback
 * ({@link useNotification}). The page component just renders what this returns.
 */
export function useInvoiceReviewTasks(uipathSdk: UiPath) {
  const { notification, notify, dismissNotification } = useNotification();
  const { taskList, tasksLoading, fetchTasks } = usePendingTaskList(uipathSdk);
  const {
    selectedTaskId,
    selectedTask,
    taskLoading,
    selectTask,
    clearSelection,
  } = useSelectedTask(uipathSdk, taskList);
  const {
    handleSubmitComplete,
    handleSaveAsDraftComplete,
    handleReportException,
  } = useTaskMutations({
    uipathSdk,
    selectedTask,
    clearSelection,
    refetch: fetchTasks,
    notify,
  });

  return {
    taskList,
    tasksLoading,
    selectedTaskId,
    selectedTask,
    taskLoading,
    fetchTasks,
    selectTask,
    handleSubmitComplete,
    handleSaveAsDraftComplete,
    handleReportException,
    notification,
    dismissNotification,
  };
}
