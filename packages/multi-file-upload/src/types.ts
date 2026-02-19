import { UiPath } from "@uipath/uipath-typescript/core";

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
