import { telemetryClient } from "@uipath/uipath-typescript/core";
import { version } from "../version";
import { TelemetryEvent, TelemetryStatus } from "../types";

export const trackTelemetry = (
  event: TelemetryEvent,
  status: TelemetryStatus,
  properties?: Record<string, unknown>,
) => {
  telemetryClient.track(event, status, {
    ApplicationName: "Widget.ConversationalAgentChat",
    WidgetVersion: version,
    ...properties,
  });
};
