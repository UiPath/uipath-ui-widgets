import { UiPath } from '@uipath/uipath-typescript';

export interface MultiFileUploadProps {
  sdk: UiPath;
  bucketId: number;
  folderId: number;
  accept?: string;
  maxFileSize?: number;
  path?: string;
  onUploadError?: (error: Error) => void;
  onUploadSuccess?: (uploadedFiles: File[]) => void;
}
