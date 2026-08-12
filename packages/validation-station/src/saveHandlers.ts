import type {
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import {
  saveValidatedDataAsDraft,
  submitValidatedData,
} from "./saveValidatedDataUtil.js";
import {
  type DuSaveCallbacks,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

/**
 * Builds the save/draft/exception listeners shared by the two save-capable
 * widgets, `ValidationStation` and `CompactFieldsForm`, so their behaviour
 * cannot drift: each persists when it can, tracks the flow once, and emits the
 * request with the outcome attached only when it was the one that saved.
 */
export function createSaveHandlers(
  { sdk, data }: { sdk?: UiPath; data?: DuFramework.ContentValidationData },
  { onSubmit, onSaveAsDraft, onReportException }: DuSaveCallbacks,
) {
  // Everything a write-back needs: an SDK, a payload, and the folder its
  // bucket is scoped to.
  const canPersist = !!sdk && !!data && !!(data.FolderKey || data.FolderId);

  return {
    handleSubmit: (request: IVsSaveValidatedDataRequest) => {
      if (!canPersist) {
        // No outcome to wait for, so the event records the attempt.
        trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Success);
        onSubmit?.(request);
        return;
      }
      submitValidatedData(sdk!, data!, request).then((result) => {
        trackTelemetry(
          TelemetryEvent.Submit,
          result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
        );
        onSubmit?.(request, result);
      });
    },

    handleSaveAsDraft: (request: IVsSaveValidatedDataAsDraftRequest) => {
      if (!canPersist) {
        onSaveAsDraft?.(request);
        return;
      }
      saveValidatedDataAsDraft(sdk!, data!, request).then((result) =>
        onSaveAsDraft?.(request, result),
      );
    },

    // Never persisted by either widget — the host owns it.
    handleException: (request: IVsSaveExceptionReportRequest) => {
      trackTelemetry(TelemetryEvent.ExceptionRequest, TelemetryStatus.Success);
      onReportException?.(request);
    },
  };
}
