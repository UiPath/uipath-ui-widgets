import { telemetryClient } from "@uipath/uipath-typescript/core";
import { version } from "../../package.json";
import { TelemetryService, TelemetryStatus } from "../types";

export const trackTelemetry = (
  service: TelemetryService,
  status: TelemetryStatus,
  properties?: Record<string, unknown>,
) => {
  telemetryClient.track(service, status, {
    ApplicationName: "Widget.Datatable",
    WidgetVersion: version,
    ...properties,
  });
};
