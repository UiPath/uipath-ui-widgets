import type {
  ICsSaveClassificationAsDraftRequest,
  ICsSaveClassificationRequest,
  ICsSaveExceptionReportRequest,
} from "@uipath/du-classification-station-wc";
import type { CsContentValidationData } from "@uipath/du-utils";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { folderScope } from "./bucketArtifactsUtil.js";
import {
  saveClassificationAsDraft,
  submitClassification,
} from "./saveClassificationUtil.js";
import {
  type CsSaveCallbacks,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

/**
 * Builds the save/draft/exception listeners: each persists when it can, tracks
 * the flow once, and emits the request with the outcome attached only when it
 * was the one that saved.
 */
export function createSaveHandlers(
  { sdk, data }: { sdk?: UiPath; data?: CsContentValidationData },
  { onSubmit, onSaveAsDraft, onReportException }: CsSaveCallbacks,
) {
  const canPersist = !!sdk && !!data && !!folderScope(data);

  return {
    handleSubmit: (request: ICsSaveClassificationRequest) => {
      if (!canPersist) {
        // No outcome to wait for, so the event records the attempt.
        trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Success);
        onSubmit?.(request);
        return;
      }
      submitClassification(sdk!, data!, request).then((result) => {
        trackTelemetry(
          TelemetryEvent.Submit,
          result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
        );
        onSubmit?.(request, result);
      });
    },

    handleSaveAsDraft: (request: ICsSaveClassificationAsDraftRequest) => {
      if (!canPersist) {
        onSaveAsDraft?.(request);
        return;
      }
      saveClassificationAsDraft(sdk!, data!, request).then((result) =>
        onSaveAsDraft?.(request, result),
      );
    },

    handleException: (request: ICsSaveExceptionReportRequest) => {
      trackTelemetry(TelemetryEvent.ExceptionRequest, TelemetryStatus.Success);
      onReportException?.(request);
    },
  };
}
