import {
  Alert,
  Box,
  Button,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  fetchProcessedDocumentArtifacts,
  reportProcessedDocumentException,
  saveProcessedDocumentAsDraft,
  submitProcessedDocument,
  ValidationStation,
  type IxpDocumentArtifacts,
  type ProcessedDocument,
  type SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { useCallback, useEffect, useState } from "react";
import { loadValidationStationWcOnDemand } from "../../duWcLoader";
import CenteredText from "./CenteredText";
import PageHeader from "../PageHeader";

interface ValidationStationFlowPageProps {
  uipathSdk: UiPath;
}

type Mode = "widget" | "host";

interface LogEntry {
  id: number;
  time: string;
  event: string;
  result?: SaveValidatedDataResult;
  payload?: unknown;
}

const describeValidatedData = (request: unknown): string | undefined => {
  const validatedData = (request as { validatedData?: unknown } | null)
    ?.validatedData;
  if (!validatedData || typeof validatedData !== "object") return undefined;
  return "output" in validatedData || "attribution" in validatedData
    ? "IXPExtraction"
    : "UiPath ExtractionResult";
};

let nextLogId = 0;

/** A scratch page for testing a pasted Flow `ProcessedDocument` against a real tenant. */
function ValidationStationFlowPage({
  uipathSdk,
}: ValidationStationFlowPageProps) {
  useEffect(() => {
    loadValidationStationWcOnDemand();
  }, []);

  const [input, setInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("widget");
  // `key` remounts the widget on Reload, so it fetches again.
  const [loaded, setLoaded] = useState<{
    processedDocument: ProcessedDocument;
    key: number;
  } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const append = useCallback((entry: Omit<LogEntry, "id" | "time">) => {
    setLog((entries) => [
      {
        ...entry,
        id: nextLogId++,
        time: new Date().toLocaleTimeString(),
      },
      ...entries,
    ]);
  }, []);

  const load = () => {
    try {
      const parsed: unknown = JSON.parse(input);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Expected a JSON object.");
      }
      setParseError(null);
      // Anything else is the widget's to refuse.
      setLoaded({
        processedDocument: parsed as ProcessedDocument,
        key: Date.now(),
      });
    } catch (error) {
      setParseError(error instanceof Error ? error.message : String(error));
    }
  };

  const reload = () =>
    setLoaded((current) => current && { ...current, key: Date.now() });

  const processedDocument = loaded?.processedDocument;

  // Tagged with its load, so a reload shows the loading state, not the old fetch.
  const [hostFetch, setHostFetch] = useState<{
    key: number;
    artifacts?: IxpDocumentArtifacts;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (mode !== "host" || !loaded) return;
    let cancelled = false;
    fetchProcessedDocumentArtifacts(uipathSdk, loaded.processedDocument)
      .then((artifacts) => {
        if (!cancelled) setHostFetch({ key: loaded.key, artifacts });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setHostFetch({
            key: loaded.key,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, loaded, uipathSdk]);

  const widgetCallbacks = {
    onLoaded: (isLoaded: boolean) => append({ event: `loaded: ${isLoaded}` }),
    onSubmit: (request: unknown, result?: SaveValidatedDataResult) =>
      append({ event: "onSubmit", result, payload: request }),
    onSaveAsDraft: (request: unknown, result?: SaveValidatedDataResult) =>
      append({ event: "onSaveAsDraft", result, payload: request }),
    onReportException: (request: unknown, result?: SaveValidatedDataResult) =>
      append({ event: "onReportException", result, payload: request }),
  };

  const renderWidget = () => {
    if (!loaded || !processedDocument) {
      return <CenteredText>Paste a ProcessedDocument and load it</CenteredText>;
    }

    if (mode === "widget") {
      return (
        <ValidationStation
          key={loaded.key}
          sdk={uipathSdk}
          processedDocument={processedDocument}
          {...widgetCallbacks}
        />
      );
    }

    const current = hostFetch?.key === loaded.key ? hostFetch : null;
    if (current?.error) {
      return (
        <CenteredText color="error.main">
          fetchProcessedDocumentArtifacts failed: {current.error}
        </CenteredText>
      );
    }
    if (!current?.artifacts) {
      return <CenteredText>Fetching document artifacts...</CenteredText>;
    }
    return (
      <ValidationStation
        key={loaded.key}
        artifacts={current.artifacts}
        documentId={processedDocument.metadata?.traceId}
        onLoaded={widgetCallbacks.onLoaded}
        onSubmit={async (request) => {
          const result = await submitProcessedDocument(
            uipathSdk,
            processedDocument,
            request,
          );
          append({
            event: "submitProcessedDocument",
            result,
            payload: request,
          });
        }}
        onSaveAsDraft={async (request) => {
          const result = await saveProcessedDocumentAsDraft(
            uipathSdk,
            processedDocument,
            request,
          );
          append({
            event: "saveProcessedDocumentAsDraft",
            result,
            payload: request,
          });
        }}
        onReportException={async (request) => {
          const result = await reportProcessedDocumentException(
            uipathSdk,
            processedDocument,
            request,
          );
          append({
            event: "reportProcessedDocumentException",
            result,
            payload: request,
          });
        }}
      />
    );
  };

  return (
    <>
      <PageHeader widgetId="validation-station-flow" />
      <Box sx={{ flex: 1, overflow: "auto", height: "calc(100vh - 160px)" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid
            size={4}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              height: "100%",
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="ProcessedDocument JSON"
              multiline
              minRows={8}
              maxRows={16}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              error={!!parseError}
              helperText={parseError}
              slotProps={{
                htmlInput: {
                  spellCheck: false,
                  style: { fontFamily: "monospace", fontSize: 12 },
                },
              }}
            />

            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_event, value: Mode | null) => value && setMode(value)}
            >
              <ToggleButton value="widget">Widget-driven</ToggleButton>
              <ToggleButton value="host">Host-driven</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" size="small" onClick={load}>
                Load
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={reload}
                disabled={!loaded}
              >
                Reload
              </Button>
              <Button
                size="small"
                onClick={() => setLog([])}
                disabled={log.length === 0}
              >
                Clear log
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Save a draft, then Reload: the document should reopen on the
              draft, not on the payload's <code>result</code>.
            </Typography>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Event log
              </Typography>
              {log.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nothing yet.
                </Typography>
              )}
              {log.map((entry) => (
                <Alert
                  key={entry.id}
                  severity={
                    entry.result === undefined
                      ? "info"
                      : entry.result.success
                        ? "success"
                        : "error"
                  }
                  sx={{ mb: 1, "& .MuiAlert-message": { width: "100%" } }}
                >
                  <Typography variant="body2">
                    <strong>{entry.time}</strong> {entry.event}
                    {entry.result &&
                      ` → ${entry.result.success ? "success" : entry.result.error}`}
                  </Typography>
                  {describeValidatedData(entry.payload) && (
                    <Typography variant="caption" component="div">
                      validatedData: {describeValidatedData(entry.payload)}
                    </Typography>
                  )}
                  {entry.payload !== undefined && (
                    <details>
                      <summary>request</summary>
                      <pre
                        style={{
                          fontSize: 11,
                          maxHeight: 240,
                          overflow: "auto",
                          margin: 0,
                        }}
                      >
                        {JSON.stringify(entry.payload, null, 2)}
                      </pre>
                    </details>
                  )}
                </Alert>
              ))}
            </Box>
          </Grid>
          <Grid size={8} sx={{ height: "100%", p: 2, minHeight: 0 }}>
            {renderWidget()}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ValidationStationFlowPage;
