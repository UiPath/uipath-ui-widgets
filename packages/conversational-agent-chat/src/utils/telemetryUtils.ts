import { trackEvent } from "@uipath/uipath-typescript/core";
import { version } from "../version";
import { TelemetryEvent, TelemetryStatus } from "../types";

export const trackTelemetry = (
  event: TelemetryEvent,
  status: TelemetryStatus,
  properties?: Record<string, unknown>,
) => {
  trackEvent(event, status, {
    ApplicationName: "Widget.ConversationalAgentChat",
    WidgetVersion: version,
    ...properties,
  });
};
