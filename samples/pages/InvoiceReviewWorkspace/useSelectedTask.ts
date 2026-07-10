import type { UiPath } from "@uipath/uipath-typescript/core";
import type {
  RawTaskGetResponse,
  TaskGetResponse,
} from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The task the user picked from the list, hydrated with its full
 * ContentValidationData payload. `selectTask` opens one (clearing any stale
 * payload first); `clearSelection` closes it after submit / report-exception.
 */
export function useSelectedTask(
  uipathSdk: UiPath,
  taskList: RawTaskGetResponse[],
) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | "">("");
  const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(
    null,
  );
  const [taskLoading, setTaskLoading] = useState(false);

  const selectTask = useCallback((id: number | "") => {
    setSelectedTask(null);
    setSelectedTaskId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTask(null);
    setSelectedTaskId("");
  }, []);

  // Look up the picked row's folderId without making the list a load trigger —
  // otherwise a background refresh (↻, or post-mutation refetch) would re-run
  // the load below and replace the open task, discarding in-progress edits.
  const taskListRef = useRef(taskList);
  useEffect(() => {
    taskListRef.current = taskList;
  }, [taskList]);

  // Load the full task (with its ContentValidationData payload) on selection.
  // Keyed on the selected id only, so it fires once per selection change.
  useEffect(() => {
    if (selectedTaskId === "") return;
    const listTask = taskListRef.current.find((t) => t.id === selectedTaskId);
    if (!listTask) return;

    let cancelled = false;
    (async () => {
      try {
        setTaskLoading(true);
        const tasksService = new Tasks(uipathSdk);
        const task = await tasksService.getById(
          selectedTaskId,
          { taskType: TaskType.DocumentValidation },
          listTask.folderId,
        );
        if (!cancelled) setSelectedTask(task);
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        if (!cancelled) setTaskLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uipathSdk, selectedTaskId]);

  return {
    selectedTaskId,
    selectedTask,
    taskLoading,
    selectTask,
    clearSelection,
  };
}
