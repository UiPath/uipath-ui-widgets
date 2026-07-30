import { trackEvent } from "@uipath/uipath-typescript/core";
import { TelemetryConstants } from "../types";

type TelemetryService =
  (typeof TelemetryConstants.Service)[keyof typeof TelemetryConstants.Service];
type TelemetryStatus =
  (typeof TelemetryConstants.Telemetry)[keyof typeof TelemetryConstants.Telemetry];

/**
 * Emit a widget telemetry event with the shared `ApplicationName` and
 * `WidgetVersion` fields injected, so call sites only pass event-specific
 * properties. Mirrors the datatable widget's `trackTelemetry` helper.
 */
export const trackTelemetry = (
  service: TelemetryService,
  status: TelemetryStatus,
  properties?: Record<string, string | number | boolean>,
) => {
  trackEvent(service, status, {
    ApplicationName: TelemetryConstants.ApplicationName,
    WidgetVersion: TelemetryConstants.Version,
    ...properties,
  });
};
