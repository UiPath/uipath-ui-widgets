import { Alert, Box, Button, Grid, Stack, TextField } from "@mui/material";
import {
  ValidationStation,
  type IVsSaveExceptionReportRequest,
  type IVsSaveValidatedDataRequest,
  type SaveValidatedDataResult,
  type SelectAndFocusFieldValueByPath,
  type SetFieldValueByPath,
  type SetFieldValueByPathResult,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { TaskType } from "@uipath/uipath-typescript/tasks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadValidationStationWcOnDemand } from "../../duWcLoader";
import CenteredText from "./CenteredText";
import PageHeader from "../PageHeader";
import TaskQueueRail from "./TaskQueueRail";
import { useDocumentValidationTasks } from "./useDocumentValidationTasks";

type PathSegment = SetFieldValueByPath["path"][number];

/**
 * The DTO nests a table's rows inside a synthetic `.Body` field, one level
 * below the table field's single value — whereas the element's own path
 * resolution treats a table field's values *as* the rows. So a table segment
 * has to hop through `.Body` to land on the row its `valueIndex` names.
 */
function tableRows(
  field: DuFramework.ResultsDataPoint,
): DuFramework.ResultsValue[] | undefined {
  return (
    field.Values?.[0]?.Components?.find((component) =>
      component.FieldId?.endsWith(".Body"),
    )?.Values ?? undefined
  );
}

/**
 * Reads the value at a path out of an `ExtractionResult`.
 *
 * Each segment names a field and its `valueIndex` picks one of that field's
 * values; the next segment then looks inside that value's `Components`. Tables,
 * field groups and simple fields all resolve this way — only the row lookup
 * differs, see {@link tableRows}.
 *
 * `ResultsDocument.Tables` is not part of this: the element clears it when it
 * builds the DTO and puts tables in `Fields` instead.
 */
function readValueAtPath(
  result: DuFramework.ExtractionResult | undefined,
  path: PathSegment[],
): string | undefined {
  let fields = result?.ResultsDocument?.Fields;
  let value: DuFramework.ResultsValue | undefined;

  for (const segment of path) {
    const field = fields?.find(
      (candidate) => candidate.FieldName === segment.fieldName,
    );
    if (!field) return undefined;
    value =
      field.FieldType === "Table"
        ? tableRows(field)?.[segment.valueIndex]
        : (field.Values?.[segment.valueIndex] ?? undefined);
    if (!value) return undefined;
    fields = value.Components ?? undefined;
  }

  return value?.Value ?? undefined;
}

// Hoisted so the element is not handed a new options object every render.
// `emitDtoStateChanges` is what makes `onExtractionResultChanged` fire at all.
const VS_OPTIONS = { emitDtoStateChanges: true };

/**
 * Reads a typed `ExtractedPathSegment[]`, which the commands take verbatim.
 *
 * Segments are shape-checked because {@link readValueAtPath} walks the path
 * during render — a malformed one would throw there and take the page down.
 * Whether a well-formed path *resolves* is still the element's answer to give,
 * reported through `on*ByPathResult`.
 */
function parsePathSegments(
  input: string,
): { path: PathSegment[] } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return { error: `Invalid JSON: ${String(error)}` };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "Expected a non-empty array of segments." };
  }
  for (const [index, segment] of parsed.entries()) {
    const { fieldName, valueIndex } = (segment ?? {}) as Partial<PathSegment>;
    if (typeof fieldName !== "string" || typeof valueIndex !== "number") {
      return {
        error: `Segment ${index} needs a string "fieldName" and a numeric "valueIndex".`,
      };
    }
  }
  return { path: parsed as PathSegment[] };
}

const PATH_PLACEHOLDER = `[
  { "fieldName": "Paystubs In File", "valueIndex": 3 },
  { "fieldName": "Pay Date", "valueIndex": 0 }
]`;

interface ValidationStationPageProps {
  uipathSdk: UiPath;
}

/**
 * Validation Station in **self-fetching** mode: the widget receives `sdk` +
 * `data` and reads the document straight from the storage-bucket paths on
 * `ContentValidationData`, scoped to the folder that payload names, then owns
 * submit and save-as-draft itself.
 *
 * See `ValidationStationPrefetchedPage` for the same screen with the fetch and
 * the write-back moved into the host.
 */
function ValidationStationPage({ uipathSdk }: ValidationStationPageProps) {
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
    loadValidationStationWcOnDemand();
  }, []);

  const [setFieldValueByPath, setSetFieldValueByPath] = useState<
    SetFieldValueByPath | undefined
  >(undefined);
  const [selectAndFocusFieldValueByPath, setSelectAndFocusFieldValueByPath] =
    useState<SelectAndFocusFieldValueByPath | undefined>(undefined);
  const [fieldPath, setFieldPath] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  // `onExtractionResultChanged` is the host's view of the user's edits, so the
  // value shown below tracks what the document holds right now.
  const [extraction, setExtraction] = useState<
    DuFramework.ExtractionResult | undefined
  >(undefined);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  // Commands need the taxonomy and extraction result, so gate on `onLoaded`.
  // Tracked per task: selecting another document reloads the element, which
  // re-arms the gate on its own.
  const [loadedTaskId, setLoadedTaskId] = useState<number | null>(null);
  const wcLoaded = loadedTaskId !== null && loadedTaskId === selectedTaskId;
  // Taxonomy field names do not always match the labels shown in the document,
  // so `onFieldValueSelected` is how you learn what to type.
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const report = (done: string) => (result: SetFieldValueByPathResult) =>
    setFeedback({
      ok: result.success,
      text: result.success ? done : (result.error ?? "Command rejected."),
    });

  const parsedPath = useMemo(() => parsePathSegments(fieldPath), [fieldPath]);

  const currentValue =
    "path" in parsedPath
      ? readValueAtPath(extraction, parsedPath.path)
      : undefined;

  const selectAnotherTask = useCallback(
    (taskId: number) => {
      setSetFieldValueByPath(undefined);
      setSelectAndFocusFieldValueByPath(undefined);
      setExtraction(undefined);
      setSelectedSegment(null);
      setFeedback(null);
      selectTask(taskId);
    },
    [selectTask],
  );

  const runCommand = (dispatch: (path: PathSegment[]) => void) => {
    if ("error" in parsedPath) {
      setFeedback({ ok: false, text: parsedPath.error });
      return;
    }
    setFeedback(null);
    dispatch(parsedPath.path);
  };

  // `result` is set because the widget has `sdk` + `data` and persisted it.
  const handleSubmit = useCallback(
    async (
      _request: IVsSaveValidatedDataRequest,
      result?: SaveValidatedDataResult,
    ) => {
      if (!result?.success) {
        console.error("Submit failed:", result?.error);
        return;
      }
      if (!selectedTask) return;
      try {
        await selectedTask.complete({
          type: TaskType.DocumentValidation,
          action: "Completed",
        });
        clearSelection();
        await fetchTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
      }
    },
    [selectedTask, fetchTasks, clearSelection],
  );

  const handleReportException = useCallback(
    async (taskId: number, request: IVsSaveExceptionReportRequest) => {
      try {
        const reason =
          (request.exceptionReport as { Reason?: string } | null)?.Reason ?? "";
        const response = await new OrchestratorDuModule(
          uipathSdk,
        ).submitExceptionReport(
          taskId,
          request.documentId,
          reason || "Reported via Validation Station",
          { folderId: selectedTask?.folderId },
        );
        if (!response.IsSuccessful) {
          console.error("submitExceptionReport failed:", response.ErrorMessage);
        }
        clearSelection();
        await fetchTasks();
      } catch (error) {
        console.error("submitExceptionReport threw:", error);
      }
    },
    [uipathSdk, selectedTask, fetchTasks, clearSelection],
  );

  const renderDocument = () => {
    if (taskLoading) return <CenteredText>Loading task...</CenteredText>;
    if (!selectedTask || !contentValidationData) {
      return <CenteredText>Select a task from the list</CenteredText>;
    }

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
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              multiline
              minRows={4}
              label="Path segments (ExtractedPathSegment[])"
              placeholder={PATH_PLACEHOLDER}
              helperText={
                selectedSegment
                  ? `Selected in the document: ${selectedSegment} — click to use`
                  : "The array is passed to setFieldValueByPath verbatim"
              }
              FormHelperTextProps={
                selectedSegment
                  ? {
                      onClick: () => setFieldPath(`[${selectedSegment}]`),
                      sx: { cursor: "pointer", textDecoration: "underline" },
                    }
                  : undefined
              }
              value={fieldPath}
              onChange={(event) => setFieldPath(event.target.value)}
              sx={{
                flex: 2,
                "& textarea": { fontFamily: "monospace", fontSize: 12 },
              }}
            />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <TextField
                size="small"
                label="Value"
                helperText={
                  "path" in parsedPath
                    ? `Current: ${currentValue ?? "not found"}`
                    : undefined
                }
                value={fieldValue}
                onChange={(event) => setFieldValue(event.target.value)}
              />
              <Button
                variant="contained"
                size="small"
                disabled={!wcLoaded || !fieldPath.trim()}
                onClick={() =>
                  runCommand((path) =>
                    setSetFieldValueByPath({
                      path,
                      update: { Value: fieldValue },
                    }),
                  )
                }
              >
                Set value
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={!wcLoaded || !fieldPath.trim()}
                onClick={() =>
                  runCommand((path) =>
                    setSelectAndFocusFieldValueByPath({ path }),
                  )
                }
              >
                Select &amp; focus
              </Button>
            </Stack>
          </Stack>
          {feedback && (
            <Alert
              severity={feedback.ok ? "success" : "error"}
              onClose={() => setFeedback(null)}
              sx={{ mt: 1 }}
            >
              {feedback.text}
            </Alert>
          )}
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <ValidationStation
            sdk={uipathSdk}
            data={contentValidationData}
            options={VS_OPTIONS}
            setFieldValueByPath={setFieldValueByPath}
            selectAndFocusFieldValueByPath={selectAndFocusFieldValueByPath}
            onLoaded={(loaded) => {
              setLoadedTaskId(loaded ? selectedTask.id : null);
              if (loaded) setFeedback(null);
            }}
            onExtractionResultChanged={setExtraction}
            onSetFieldValueByPathResult={report("Value set")}
            onSelectAndFocusFieldValueByPathResult={report(
              "Field selected and focused",
            )}
            onFieldValueSelected={(details) =>
              setSelectedSegment(
                JSON.stringify({
                  fieldName: details.Field.FieldName ?? "",
                  valueIndex: details.FieldValueIndex,
                }),
              )
            }
            onSubmit={handleSubmit}
            onReportException={(request) =>
              handleReportException(selectedTask.id, request)
            }
          />
        </Box>
      </Box>
    );
  };

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

export default ValidationStationPage;
