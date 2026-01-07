import { UiPath } from '@uipath/uipath-typescript';

export interface MultiFileUploadProps {
  sdk: UiPath;
  bucketId: number;
  folderId: number;
  path?: string;
  onUploadError?: (error: Error) => void;
  maxFileSize?: number;
  accept?: string;
}
