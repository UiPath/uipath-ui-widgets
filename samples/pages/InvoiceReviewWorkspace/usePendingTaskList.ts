import type { UiPath } from "@uipath/uipath-typescript/core";
import type { RawTaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskStatus, TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useState } from "react";

/**
 * The pending / unassigned DocumentValidation tasks created in the last 96h,
 * highest-priority first. `fetchTasks` refreshes the list (also called after a
 * mutation) and runs once on mount.
 */
export function usePendingTaskList(uipathSdk: UiPath) {
  const [taskList, setTaskList] = useState<RawTaskGetResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const tasksService = new Tasks(uipathSdk);
      const sinceIso = new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString();
      const result = await tasksService.getAll({
        filter: `CreationTime ge ${sinceIso} and Type eq '${TaskType.DocumentValidation}' and IsDeleted eq false and (Status eq '${TaskStatus.Pending}' or Status eq '${TaskStatus.Unassigned}')`,
        orderby: "Priority desc,CreationTime asc",
        pageSize: 30,
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

  return { taskList, tasksLoading, fetchTasks };
}
