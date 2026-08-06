import { describe, it, expect, vi, beforeEach } from "vitest";
import { version } from "../../package.json";
import { trackTelemetry } from "../utils/telemetryUtils";
import { TelemetryService, TelemetryStatus } from "../types";

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
      trackTelemetry(TelemetryService.LoadDocument, TelemetryStatus.Usage);

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryService.LoadDocument,
        TelemetryStatus.Usage,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
        },
      );
    });

    it("should merge additional properties into the payload", () => {
      trackTelemetry(TelemetryService.LoadDocument, TelemetryStatus.Error, {
        SourceType: "bucket",
        Stage: "fetch",
        Error: "boom",
      });

      expect(mockTrack).toHaveBeenCalledWith(
        TelemetryService.LoadDocument,
        TelemetryStatus.Error,
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
      trackTelemetry(TelemetryService.DownloadFile, TelemetryStatus.Usage, {
        SourceType: "url",
      });
      trackTelemetry(TelemetryService.DownloadFile, TelemetryStatus.Error, {
        SourceType: "url",
        Error: "Download failed",
      });

      expect(mockTrack).toHaveBeenNthCalledWith(
        1,
        TelemetryService.DownloadFile,
        TelemetryStatus.Usage,
        {
          ApplicationName: APPLICATION_NAME,
          WidgetVersion: version,
          SourceType: "url",
        },
      );
      expect(mockTrack).toHaveBeenNthCalledWith(
        2,
        TelemetryService.DownloadFile,
        TelemetryStatus.Error,
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
