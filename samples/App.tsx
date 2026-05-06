/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type {
  ContentValidationData,
  SelectAndFocusFieldValueByPath,
} from "@uipath/du-shared-util-mfe";
import { ConversationalAgentChat } from "@uipath/ui-widgets-conversational-agent-chat";
import { DataTable } from "@uipath/ui-widgets-datatable";
import { MultiFileUpload } from "@uipath/ui-widgets-multi-file-upload";
import "@uipath/ui-widgets-multi-file-upload/MultiFileUpload.css";
import { ValidationStation } from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { Entities } from "@uipath/uipath-typescript/entities";
import type {
  RawTaskGetResponse,
  TaskGetResponse,
} from "@uipath/uipath-typescript/tasks";
import { Tasks, TaskType } from "@uipath/uipath-typescript/tasks";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

interface AppProps {
  uipathSdk: UiPath;
}

interface Entity {
  id: string;
  name: string;
  displayName: string;
}

function App({ uipathSdk }: AppProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    import.meta.env.VITE_SELECTED_ENTITY_ID,
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    parseInt(import.meta.env.VITE_DEFAULT_TAB || "0"),
  );

  const [taskList, setTaskList] = useState<RawTaskGetResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectAndFocusFieldValueByPath, setSelectAndFocusFieldValueByPath] =
    useState<SelectAndFocusFieldValueByPath | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(
    null,
  );
  const [taskLoading, setTaskLoading] = useState(false);

  const columnConfig = useMemo(
    () => ({
      "Edition Name": {
        sortable: false,
        filter: false,
      },
      "Inventory Left": {
        cellClassRules: {
          "datatable-cell-low-inventory": (params: any) =>
            params.data.inventoryLeft < 3,
        },
      },
    }),
    [],
  );

  const rowClassRules = useMemo(
    () => ({
      "datatable-row-low-inventory": (params: any) =>
        params.data.inventoryLeft < 5,
    }),
    [],
  );

  useEffect(() => {
    if (activeTab !== 0) return;
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const entities = new Entities(uipathSdk);
        const entitiesList = await entities.getAll();
        setEntities(entitiesList);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [activeTab, uipathSdk]);

  useEffect(() => {
    if (activeTab !== 1) return;
    const fetchTasks = async () => {
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
    };
    fetchTasks();
  }, [uipathSdk, activeTab]);

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
    <div className="app-container">
      <div className="app-header">
        <h1>UIPath UI Widgets</h1>
        <p>Explore and manage your data entities with elegance</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="DataTable" />
          <Tab label="Validation Station" />
          <Tab label="Multi File Upload" />
          <Tab label="Conversational Agent" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", height: "calc(100vh - 160px)" }}>
        {activeTab === 0 && (
          <div className="app-grid">
            <div className="entity-sidebar">
              <div className="entity-sidebar-header">Data Entities</div>
              <List
                className="entity-list"
                sx={{ maxHeight: "calc(100vh - 220px)", overflow: "auto" }}
              >
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading entities...</div>
                  </div>
                ) : entities.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No entities found" />
                  </ListItem>
                ) : (
                  entities.map((entity) => (
                    <ListItem
                      key={entity.id}
                      disablePadding
                      className="entity-list-item"
                    >
                      <ListItemButton
                        className="entity-list-button"
                        selected={selectedEntityId === entity.id}
                        onClick={() => setSelectedEntityId(entity.id)}
                      >
                        <ListItemText
                          className="entity-list-text"
                          primary={entity.displayName || entity.name}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
            </div>

            <div className="content-area">
              {selectedEntityId ? (
                <>
                  <div className="content-header">
                    <div className="content-header-icon">📋</div>
                    <h2 className="content-header-title">
                      {entities.find((e) => e.id === selectedEntityId)
                        ?.displayName || "Entity Data"}
                    </h2>
                  </div>
                  <div className="datatable-wrapper">
                    <DataTable
                      sdk={uipathSdk}
                      entityId={selectedEntityId}
                      pageSize={20}
                      columnConfig={columnConfig}
                      rowClassRules={rowClassRules}
                      customPaddingForExpandedRow={80}
                    />
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Select an entity from the sidebar to view its data</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
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
                  <Box sx={{ height: "100%", p: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ ml: 1, mb: 2 }}
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
                    <ValidationStation
                      sdk={uipathSdk}
                      data={
                        selectedTask.data as unknown as ContentValidationData
                      }
                      folderId={selectedTask.folderId}
                      selectAndFocusFieldValueByPath={
                        selectAndFocusFieldValueByPath
                      }
                    />
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
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <MultiFileUpload
              sdk={uipathSdk}
              bucketId={parseInt(import.meta.env.VITE_MFU_BUCKET_ID)}
              folderId={parseInt(import.meta.env.VITE_MFU_BUCKET_FOLDER_ID)}
              maxFileSizeInMb={2}
              accept="image/*"
              onUploadSuccess={(files: File[]) => {
                console.log("Files uploaded:", files);
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
              }}
            />
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ height: 800, p: 2 }}>
            <ConversationalAgentChat
              sdk={uipathSdk}
              agentId={parseInt(import.meta.env.VITE_CONV_AGENT_ID)}
              folderId={parseInt(import.meta.env.VITE_CONV_AGENT_FOLDER_ID)}
            />
          </Box>
        )}
      </Box>
    </div>
  );
}

export default App;
