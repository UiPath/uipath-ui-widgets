import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  ValidationStation,
  type SelectAndFocusFieldValueByPath,
  type SetFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type {
  RawTaskGetResponse,
  TaskGetResponse,
} from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskType } from "@uipath/uipath-typescript/tasks";
import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";

interface ValidationStationPageProps {
  uipathSdk: UiPath;
}

function ValidationStationPage({ uipathSdk }: ValidationStationPageProps) {
  const [taskList, setTaskList] = useState<RawTaskGetResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const tasksService = new Tasks(uipathSdk);
        const result = await tasksService.getAll();
        if (cancelled) return;
        setTaskList(
          result.items.filter(
            (task) => task.type === TaskType.DocumentValidation,
          ),
        );
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    };
    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, [uipathSdk]);

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
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tasks
              </Typography>
            </Box>
            <List dense>
              {tasksLoading ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading tasks...
                  </Typography>
                </Box>
              ) : taskList.length === 0 ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks found
                  </Typography>
                </Box>
              ) : (
                taskList.map((task) => (
                  <ListItem key={task.id} disablePadding>
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
                ))
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
