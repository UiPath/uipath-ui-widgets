import { describe, it, expect, vi, beforeEach } from "vitest";
import { version } from "../../package.json";
import { trackTelemetry } from "../utils/telemetryUtils";
import { TelemetryConstants } from "../types";

const mockTrack = vi.fn();
vi.mock("@uipath/uipath-typescript/core", () => ({
  trackEvent: (...args: unknown[]) => mockTrack(...args),
}));

const APPLICATION_NAME = "Widget.PdfViewer";

describe("telemetryUtils", () => {
  beforeEach(() => {
    mockTrack.mockClear();
  });

  describe("trackTelemetry", () => {
    it("should inject ApplicationName and WidgetVersion", () => {
      trackTelemetry(
        TelemetryConstants.Service.LoadDocument,
        TelemetryConstants.Telemetry.Usage,
      );

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryConstants.Service.LoadDocument,
        TelemetryConstants.Telemetry.Usage,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
        },
      );
    });

    it("should merge additional properties into the payload", () => {
      trackTelemetry(
        TelemetryConstants.Service.LoadDocument,
        TelemetryConstants.Telemetry.Error,
        { SourceType: "bucket", Stage: "fetch", Error: "boom" },
      );

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryConstants.Service.LoadDocument,
        TelemetryConstants.Telemetry.Error,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
          SourceType: "bucket",
          Stage: "fetch",
          Error: "boom",
        },
      );
    });

    it("should pass through the DownloadFile service for both usage and error", () => {
      trackTelemetry(
        TelemetryConstants.Service.DownloadFile,
        TelemetryConstants.Telemetry.Usage,
        { SourceType: "url" },
      );
      trackTelemetry(
        TelemetryConstants.Service.DownloadFile,
        TelemetryConstants.Telemetry.Error,
        { SourceType: "url", Error: "Download failed" },
      );

      expect(mockTrack).toHaveBeenNthCalledWith(
        1,
        TelemetryConstants.Service.DownloadFile,
        TelemetryConstants.Telemetry.Usage,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
          SourceType: "url",
        },
      );
      expect(mockTrack).toHaveBeenNthCalledWith(
        2,
        TelemetryConstants.Service.DownloadFile,
        TelemetryConstants.Telemetry.Error,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
          SourceType: "url",
          Error: "Download failed",
        },
      );
    });
  });

  describe("version", () => {
    it("should export a non-empty semver-like string", () => {
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});
