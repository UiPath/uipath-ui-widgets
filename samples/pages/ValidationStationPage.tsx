import {
  Box,
  Button,
  Grid,
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
import {
  ValidationStation,
  type SaveValidatedDataResult,
  type SelectAndFocusFieldValueByPath,
  type SetFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { type DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import type {
  RawTaskGetResponse,
  TaskGetResponse,
} from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskStatus, TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadValidationStationWcOnDemand } from "../duWcLoader";
import PageHeader from "./PageHeader";

const TASK_STATUS_TABS = [
  TaskStatus.Pending,
  TaskStatus.Unassigned,
  TaskStatus.Completed,
] as const;

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

interface ValidationStationPageProps {
  uipathSdk: UiPath;
}

function ValidationStationPage({ uipathSdk }: ValidationStationPageProps) {
  const [taskList, setTaskList] = useState<RawTaskGetResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>(
    TaskStatus.Pending,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectAndFocusFieldValueByPath, setSelectAndFocusFieldValueByPath] =
    useState<SelectAndFocusFieldValueByPath | undefined>(undefined);
  const [setFieldValueByPath, setSetFieldValueByPath] = useState<
    SetFieldValueByPath | undefined
  >(undefined);
  const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(
    null,
  );
  const [taskLoading, setTaskLoading] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

  useEffect(() => {
    loadValidationStationWcOnDemand();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const tasksService = new Tasks(uipathSdk);
      const result = await tasksService.getAll();
      setTaskList(
        result.items.filter(
          (task) => task.type === TaskType.DocumentValidation,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  }, [uipathSdk]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmitComplete = useCallback(
    async (result: SaveValidatedDataResult) => {
      if (!result.success) {
        console.error("Submit failed:", result.error);
        return;
      }
      if (!selectedTask) return;
      try {
        await selectedTask.complete({
          type: TaskType.DocumentValidation,
          action: "Completed",
        });
        setSelectedTaskId(null);
        setSelectedTask(null);
        await fetchTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
      }
    },
    [selectedTask, fetchTasks],
  );

  const handleReportException = useCallback(
    async (taskId: number, documentId: string, reason: string) => {
      try {
        const response = await new OrchestratorDuModule(
          uipathSdk,
        ).submitExceptionReport(
          taskId,
          documentId,
          reason || "Reported via Validation Station",
          { folderId: selectedTask?.folderId },
        );
        if (!response.IsSuccessful) {
          console.error("submitExceptionReport failed:", response.ErrorMessage);
        }
        setSelectedTaskId(null);
        setSelectedTask(null);
        await fetchTasks();
      } catch (error) {
        console.error("submitExceptionReport threw:", error);
      }
    },
    [uipathSdk, selectedTask, fetchTasks],
  );

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
        await fetchTasks();
      } catch (error) {
        console.error("Failed to assign task:", error);
      } finally {
        setAssigningTaskId(null);
      }
    },
    [uipathSdk, fetchTasks],
  );

  useEffect(() => {
    if (selectedTaskId == null) return;
    const listTask = taskList.find((t) => t.id === selectedTaskId);
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
  }, [uipathSdk, selectedTaskId, taskList]);

  const filteredTasks = useMemo(
    () => taskList.filter((task) => task.status === activeStatus),
    [taskList, activeStatus],
  );

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
                    onClick={() => fetchTasks()}
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
                        transform: tasksLoading
                          ? "rotate(360deg)"
                          : "rotate(0deg)",
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
                setSelectedTaskId(null);
                setSelectedTask(null);
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
                        onClick={() => {
                          setSelectedTask(null);
                          setSelectedTaskId(task.id);
                        }}
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
          </Grid>
          <Grid size={9} sx={{ height: "100%" }}>
            {selectedTask ? (
              taskLoading ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading task...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      gap: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        setSelectAndFocusFieldValueByPath({
                          path: [
                            { fieldName: "items", valueIndex: 1 },
                            {
                              fieldName: "Items - Quantities",
                              valueIndex: 0,
                            },
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
                      data={
                        selectedTask.data as DuFramework.ContentValidationData
                      }
                      folderId={selectedTask.folderId}
                      selectAndFocusFieldValueByPath={
                        selectAndFocusFieldValueByPath
                      }
                      setFieldValueByPath={setFieldValueByPath}
                      onReportExceptionComplete={(documentId, reason) =>
                        handleReportException(
                          selectedTask.id,
                          documentId,
                          reason,
                        )
                      }
                      onSubmitComplete={handleSubmitComplete}
                    />
                  </Box>
                </Box>
              )
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Select a task from the list
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ValidationStationPage;
