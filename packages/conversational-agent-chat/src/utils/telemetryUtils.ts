import { telemetryClient } from "@uipath/uipath-typescript/core";
// Default-import JSON for rsbuild compatibility — named imports of JSON members
// fail in bundlers that treat JSON modules as default-export only.
import pkg from "../../package.json";
const { version } = pkg;
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
