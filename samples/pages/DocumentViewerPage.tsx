import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import {
  DocumentViewer,
  type DocumentViewerSelection,
  type GoToPage,
} from "@uipath/ui-widgets-document-viewer";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { useCallback, useEffect, useState } from "react";
import { loadDocumentViewerWcOnDemand } from "../duWcLoader";
import PageHeader from "./PageHeader";
import CenteredText from "./ValidationStation/CenteredText";
import TaskQueueRail from "./ValidationStation/TaskQueueRail";
import { useDocumentValidationTasks } from "./ValidationStation/useDocumentValidationTasks";

// Hoisted so the element is not handed a new options object every render.
const VIEWER_OPTIONS = {
  floatingButtonsOptions: { hideSwitchPanelSidesButton: true },
};

interface DocumentViewerPageProps {
  uipathSdk: UiPath;
}

/**
 * The document viewer on its own, over the document-validation task queue:
 * given `sdk` + a task's `ContentValidationData`, it reads only the DOM, the
 * original and the text from the bucket. The page drives it through
 * `goToPage` and reads the reviewer's selection from `onReferenceSelect` —
 * the selection's `reference` is what a form would store as a value's
 * `Reference`, and `highlightReference` takes it back.
 */
function DocumentViewerPage({ uipathSdk }: DocumentViewerPageProps) {
  const {
    taskList,
    tasksLoading,
    fetchTasks,
    selectedTaskId,
    selectedTask,
    contentValidationData,
    taskLoading,
    selectTask,
    clearSelection,
  } = useDocumentValidationTasks(uipathSdk);

  useEffect(() => {
    loadDocumentViewerWcOnDemand();
  }, []);

  const [goToPage, setGoToPage] = useState<GoToPage | undefined>(undefined);
  const [page, setPage] = useState<{ current: number; count: number } | null>(
    null,
  );
  const [selection, setSelection] = useState<DocumentViewerSelection | null>(
    null,
  );
  const [pinned, setPinned] = useState<DocumentViewerSelection | null>(null);

  const selectAnotherTask = useCallback(
    (taskId: number) => {
      setGoToPage(undefined);
      setPage(null);
      setSelection(null);
      setPinned(null);
      selectTask(taskId);
    },
    [selectTask],
  );

  // A new object for every navigation: the same one does not navigate again.
  const navigate = (target: GoToPage["target"]) => setGoToPage({ target });

  const renderDocument = () => {
    if (taskLoading) return <CenteredText>Loading task...</CenteredText>;
    if (!selectedTask || !contentValidationData) {
      return <CenteredText>Select a task from the list</CenteredText>;
    }

    const hasSelection = !!selection && selection.text.length > 0;

    return (
      <Box
        sx={{
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("first")}
          >
            First
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("previous")}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("next")}
          >
            Next
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("last")}
          >
            Last
          </Button>
          <Typography variant="body2" color="text.secondary">
            {page ? `Page ${page.current} of ${page.count}` : ""}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="contained"
            disabled={!hasSelection}
            onClick={() => setPinned(selection)}
          >
            Pin selection
          </Button>
          <Button
            size="small"
            disabled={!pinned}
            onClick={() => setPinned(null)}
          >
            Clear pin
          </Button>
        </Stack>
        <Alert severity="info" sx={{ mb: 2 }}>
          {hasSelection
            ? `Selected: “${selection.text}”`
            : "Select words in the document; pin a selection to keep it highlighted."}
          {pinned ? ` · Pinned: “${pinned.text}”` : ""}
        </Alert>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <DocumentViewer
            sdk={uipathSdk}
            data={contentValidationData}
            options={VIEWER_OPTIONS}
            goToPage={goToPage}
            highlightReference={pinned?.reference ?? null}
            onPageCountChange={(count) =>
              setPage((p) => ({ current: p?.current ?? 1, count }))
            }
            onCurrentPageChange={(current) =>
              setPage((p) => ({ current, count: p?.count ?? 0 }))
            }
            onReferenceSelect={setSelection}
          />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <PageHeader widgetId="document-viewer" />
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
            <TaskQueueRail
              uipathSdk={uipathSdk}
              tasks={taskList}
              tasksLoading={tasksLoading}
              selectedTaskId={selectedTaskId}
              onSelectTask={selectAnotherTask}
              onReload={fetchTasks}
              onStatusChange={clearSelection}
            />
          </Grid>
          <Grid size={9} sx={{ height: "100%" }}>
            {renderDocument()}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default DocumentViewerPage;
