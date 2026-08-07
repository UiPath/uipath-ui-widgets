import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { RawTaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskStatus } from "@uipath/uipath-typescript/tasks";
import { useCallback, useMemo, useState } from "react";

const TASK_STATUS_TABS = [
  TaskStatus.Pending,
  TaskStatus.Unassigned,
  TaskStatus.Completed,
] as const;

/**
 * The signed-in user, read from the OAuth token — the Tasks API assigns by
 * username/email rather than by id.
 */
function getCurrentUserEmail(sdk: UiPath): string | null {
  const token = sdk.getToken();
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload.email ?? payload.preferred_username ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

interface TaskQueueRailProps {
  uipathSdk: UiPath;
  tasks: RawTaskGetResponse[];
  tasksLoading: boolean;
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
  /** Reload the task list — also called after a task is assigned. */
  onReload: () => void | Promise<void>;
  /** Fires when the status tab changes; the page drops its selection. */
  onStatusChange: () => void;
}

/**
 * The document-validation task queue: a status-filtered list with reload and
 * assign-to-self, shared by the Validation Station sample pages. The list is
 * owned by the page (it also drives the widget); only the status tab and the
 * in-flight assignment live here.
 */
function TaskQueueRail({
  uipathSdk,
  tasks,
  tasksLoading,
  selectedTaskId,
  onSelectTask,
  onReload,
  onStatusChange,
}: TaskQueueRailProps) {
  const [activeStatus, setActiveStatus] = useState<TaskStatus>(
    TaskStatus.Pending,
  );
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

  const assignToSelf = useCallback(
    async (taskId: number) => {
      const email = getCurrentUserEmail(uipathSdk);
      if (!email) {
        console.error(
          "Cannot assign: no email/username claim found in OAuth token",
        );
        return;
      }
      try {
        setAssigningTaskId(taskId);
        const tasksService = new Tasks(uipathSdk);
        await tasksService.assign({ taskId, userNameOrEmail: email });
        await onReload();
      } catch (error) {
        console.error("Failed to assign task:", error);
      } finally {
        setAssigningTaskId(null);
      }
    },
    [uipathSdk, onReload],
  );

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.status === activeStatus),
    [tasks, activeStatus],
  );

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Tasks
        </Typography>
        <Tooltip title="Reload tasks">
          <span>
            <IconButton
              size="small"
              onClick={() => onReload()}
              disabled={tasksLoading}
              aria-label="Reload tasks"
            >
              <Box
                component="span"
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  display: "inline-block",
                  transition: "transform 0.4s",
                  transform: tasksLoading ? "rotate(360deg)" : "rotate(0deg)",
                }}
              >
                ↻
              </Box>
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Tabs
        value={activeStatus}
        onChange={(_, value: TaskStatus) => {
          setActiveStatus(value);
          onStatusChange();
        }}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}
      >
        {TASK_STATUS_TABS.map((status) => (
          <Tab
            key={status}
            value={status}
            label={status}
            sx={{ minHeight: 36, fontSize: "0.75rem" }}
          />
        ))}
      </Tabs>
      <List dense>
        {tasksLoading ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Loading tasks...
            </Typography>
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No tasks found
            </Typography>
          </Box>
        ) : (
          filteredTasks.map((task) => {
            const isUnassigned = task.status === TaskStatus.Unassigned;
            const isAssigning = assigningTaskId === task.id;
            return (
              <ListItem
                key={task.id}
                disablePadding
                sx={{
                  "& .assign-self-btn": {
                    opacity: isAssigning ? 1 : 0,
                    transition: "opacity 0.15s",
                  },
                  "&:hover .assign-self-btn": { opacity: 1 },
                }}
                secondaryAction={
                  isUnassigned ? (
                    <Button
                      className="assign-self-btn"
                      size="small"
                      variant="outlined"
                      disabled={isAssigning}
                      onClick={(e) => {
                        e.stopPropagation();
                        assignToSelf(task.id);
                      }}
                      sx={{
                        fontSize: "0.7rem",
                        py: 0,
                        px: 1,
                        minWidth: 0,
                        textTransform: "none",
                      }}
                    >
                      {isAssigning ? "Assigning…" : "Assign to self"}
                    </Button>
                  ) : undefined
                }
              >
                <ListItemButton
                  selected={selectedTaskId === task.id}
                  onClick={() => onSelectTask(task.id)}
                >
                  <ListItemText
                    primary={task.title}
                    secondary={`#${task.id} - ${task.status}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>
    </>
  );
}

export default TaskQueueRail;
