import {
  Alert,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from "@mui/material";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect } from "react";
import { loadValidationStationWcOnDemand } from "../../duWcLoader";
import PageHeader from "../PageHeader";
import CenteredMessage from "./CenteredMessage";
import ReviewWorkspace from "./ReviewWorkspace";
import { useInvoiceReviewTasks } from "./useInvoiceReviewTasks";

interface InvoiceReviewWorkspacePageProps {
  uipathSdk: UiPath;
}

function InvoiceReviewWorkspacePage({
  uipathSdk,
}: InvoiceReviewWorkspacePageProps) {
  const {
    taskList,
    tasksLoading,
    selectedTaskId,
    selectedTask,
    taskLoading,
    fetchTasks,
    selectTask,
    handleSubmit,
    handleSaveAsDraft,
    handleReportException,
    notification,
    dismissNotification,
  } = useInvoiceReviewTasks(uipathSdk);

  useEffect(() => {
    loadValidationStationWcOnDemand();
  }, []);

  return (
    <>
      <PageHeader widgetId="invoice-review-workspace" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 160px)",
        }}
      >
        {/* Toolbar: pick an invoice-validation task to review. */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 320 }}>
            <InputLabel id="invoice-task-label">
              Document validation task
            </InputLabel>
            <Select
              labelId="invoice-task-label"
              label="Document validation task"
              value={selectedTaskId}
              onChange={(e) => selectTask(e.target.value as number)}
            >
              {taskList.length === 0 ? (
                <MenuItem value="" disabled>
                  {tasksLoading ? "Loading tasks…" : "No pending tasks"}
                </MenuItem>
              ) : (
                taskList.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title} — #{task.id} ({task.status})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
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
                    transform: tasksLoading ? "rotate(360deg)" : "rotate(0deg)",
                  }}
                >
                  ↻
                </Box>
              </IconButton>
            </span>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            variant="outlined"
            label="5 compact components · 1 shared instance-id"
          />
        </Box>

        {/* Workspace */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {selectedTaskId === "" ? (
            <CenteredMessage text="Select a document validation task above to open the review workspace." />
          ) : taskLoading || !selectedTask ? (
            <CenteredMessage text="Loading task…" />
          ) : (
            <ReviewWorkspace
              sdk={uipathSdk}
              task={selectedTask}
              onSubmit={handleSubmit}
              onSaveAsDraft={handleSaveAsDraft}
              onReportException={handleReportException}
            />
          )}
        </Box>
      </Box>

      <Snackbar
        open={notification !== null}
        autoHideDuration={4000}
        onClose={(_event, reason) => {
          // Ignore click-away so a stray click elsewhere doesn't dismiss it;
          // the auto-hide timer and the Alert's close button still work.
          if (reason !== "clickaway") dismissNotification();
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {notification ? (
          <Alert
            onClose={dismissNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              minWidth: 360,
              fontSize: "1.1rem",
              alignItems: "center",
              px: 3,
              py: 1.5,
              boxShadow: 6,
              "& .MuiAlert-icon": { fontSize: "1.8rem" },
            }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

export default InvoiceReviewWorkspacePage;
