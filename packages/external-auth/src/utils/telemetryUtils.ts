import { trackEvent } from "@uipath/uipath-typescript/core";
import { version } from "../../package.json";
import { TelemetryEvent, TelemetryStatus } from "../types";

export const trackTelemetry = (
  event: TelemetryEvent,
  status: TelemetryStatus,
  properties?: Record<string, string | number | boolean>,
) => {
  trackEvent(event, status, {
    ApplicationName: "Widget.ExternalAuth",
    WidgetVersion: version,
    ...properties,
  });
};
