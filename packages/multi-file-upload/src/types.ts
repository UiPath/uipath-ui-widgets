import { UiPath } from "@uipath/uipath-typescript/core";
import { version } from "../package.json";

export interface MultiFileUploadProps {
  sdk: UiPath;
  bucketId: number;
  folderId: number;
  accept?: string;
  maxFileSizeInMb?: number;
  path?: string;
  onUploadError?: (error: Error) => void;
  onUploadSuccess?: (uploadedFiles: File[]) => void;
}

export const TelemetryConstants = {
  ApplicationName: "Widget.MultiFileUpload",
  Version: version,
  Service: {
    UploadFile: "MFU.UploadFile",
  },
  Telemetry: {
    Usage: "MFU.Usage",
    Error: "MFU.Error",
  },
};
