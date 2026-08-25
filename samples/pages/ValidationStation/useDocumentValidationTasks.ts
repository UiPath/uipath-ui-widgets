import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type {
  RawTaskGetResponse,
  TaskGetResponse,
} from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * The document-validation task queue and the currently open task, shared by the
 * Validation Station sample pages.
 *
 * `getAll()` rows carry no `data`, so the selected task is re-fetched with
 * `getById` to obtain its `ContentValidationData`.
 */
export function useDocumentValidationTasks(uipathSdk: UiPath) {
  const [taskList, setTaskList] = useState<RawTaskGetResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(
    null,
  );
  const [taskLoading, setTaskLoading] = useState(false);

  // The hydration effect below reads the list only to find the selected row's
  // folder, so it must not be a dependency: refreshing the list (the reload
  // button, or assign-to-self) would otherwise re-hydrate the open task,
  // remount the widget and discard whatever the reviewer had typed.
  const taskListRef = useRef(taskList);
  useEffect(() => {
    taskListRef.current = taskList;
  }, [taskList]);

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const tasksService = new Tasks(uipathSdk);
      // Filter server-side: the tenant may hold thousands of tasks of every
      // type, and only document-validation ones open in this widget.
      const result = await tasksService.getAll({
        filter: `Type eq '${TaskType.DocumentValidation}'`,
        orderby: "CreationTime asc",
        pageSize: 100,
      });
      setTaskList(result.items);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  }, [uipathSdk]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectTask = useCallback((taskId: number) => {
    setSelectedTask(null);
    setSelectedTaskId(taskId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
    setSelectedTask(null);
  }, []);

  useEffect(() => {
    if (selectedTaskId == null) return;
    const listTask = taskListRef.current.find((t) => t.id === selectedTaskId);
    if (!listTask) return;

    let cancelled = false;
    const fetchTask = async () => {
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
    };
    fetchTask();
    return () => {
      cancelled = true;
    };
  }, [uipathSdk, selectedTaskId]);

  // The widgets read the bucket folder off `ContentValidationData`. The
  // activity that produces the payload sets FolderId or FolderKey; these sample
  // tasks were created without one, so we fall back to the task's own folder.
  // Memoised on the task, which is state replaced once per selection, so the
  // widgets see a stable reference and do not refetch on every render.
  const contentValidationData = useMemo(() => {
    if (!selectedTask) return undefined;
    const cvd = selectedTask.data as
      | DuFramework.ContentValidationData
      | undefined;
    if (!cvd || cvd.FolderId || cvd.FolderKey) return cvd;
    return { ...cvd, FolderId: selectedTask.folderId };
  }, [selectedTask]);

  return {
    taskList,
    tasksLoading,
    fetchTasks,
    selectedTaskId,
    selectedTask,
    contentValidationData,
    taskLoading,
    selectTask,
    clearSelection,
  };
}
