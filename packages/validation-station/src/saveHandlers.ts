import type {
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { selectPayload } from "./payloadSource.js";
import {
  reportProcessedDocumentException,
  saveProcessedDocumentAsDraft,
  submitProcessedDocument,
} from "./processedDocument/save.js";
import type { ProcessedDocument } from "./processedDocument/types.js";
import {
  type SaveValidatedDataResult,
  saveValidatedDataAsDraft,
  submitValidatedData,
} from "./saveValidatedDataUtil.js";
import {
  type DuSaveCallbacks,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

interface Persistence {
  submit: (
    request: IVsSaveValidatedDataRequest,
  ) => Promise<SaveValidatedDataResult>;
  saveAsDraft: (
    request: IVsSaveValidatedDataAsDraftRequest,
  ) => Promise<SaveValidatedDataResult>;
  /** Only a Flow document records an exception. */
  reportException?: (
    request: IVsSaveExceptionReportRequest,
  ) => Promise<SaveValidatedDataResult>;
}

function resolvePersistence(
  sdk: UiPath | undefined,
  dataProp: DuFramework.ContentValidationData | undefined,
  processedDocumentProp: ProcessedDocument | undefined,
): Persistence | null {
  if (!sdk) return null;
  const { data, processedDocument } = selectPayload(
    dataProp,
    processedDocumentProp,
  );
  if (data) {
    return data.FolderKey || data.FolderId
      ? {
          submit: (request) => submitValidatedData(sdk, data, request),
          saveAsDraft: (request) =>
            saveValidatedDataAsDraft(sdk, data, request),
        }
      : null;
  }
  if (processedDocument) {
    return {
      submit: (request) =>
        submitProcessedDocument(sdk, processedDocument, request),
      saveAsDraft: (request) =>
        saveProcessedDocumentAsDraft(sdk, processedDocument, request),
      reportException: (request) =>
        reportProcessedDocumentException(sdk, processedDocument, request),
    };
  }
  return null;
}

/**
 * Builds the save/draft/exception listeners shared by the two save-capable
 * widgets, `ValidationStation` and `CompactFieldsForm`, so their behaviour
 * cannot drift: each persists when it can, tracks the flow once, and emits the
 * request with the outcome attached only when it was the one that saved.
 */
export function createSaveHandlers(
  {
    sdk,
    data,
    processedDocument,
  }: {
    sdk?: UiPath;
    data?: DuFramework.ContentValidationData;
    processedDocument?: ProcessedDocument;
  },
  { onSubmit, onSaveAsDraft, onReportException }: DuSaveCallbacks,
) {
  const persistence = resolvePersistence(sdk, data, processedDocument);

  return {
    handleSubmit: (request: IVsSaveValidatedDataRequest) => {
      if (!persistence) {
        // No outcome to wait for, so the event records the attempt.
        trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Success);
        onSubmit?.(request);
        return;
      }
      persistence.submit(request).then((result) => {
        trackTelemetry(
          TelemetryEvent.Submit,
          result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
        );
        onSubmit?.(request, result);
      });
    },

    handleSaveAsDraft: (request: IVsSaveValidatedDataAsDraftRequest) => {
      if (!persistence) {
        onSaveAsDraft?.(request);
        return;
      }
      persistence
        .saveAsDraft(request)
        .then((result) => onSaveAsDraft?.(request, result));
    },

    handleException: (request: IVsSaveExceptionReportRequest) => {
      if (!persistence?.reportException) {
        trackTelemetry(
          TelemetryEvent.ExceptionRequest,
          TelemetryStatus.Success,
        );
        onReportException?.(request);
        return;
      }
      persistence.reportException(request).then((result) => {
        trackTelemetry(
          TelemetryEvent.ExceptionRequest,
          result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
        );
        onReportException?.(request, result);
      });
    },
  };
}
