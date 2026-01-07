import { Button, FileUpload } from "@uipath/apollo-wind";
import { FC, useCallback, useState } from 'react';
import './MultiFileUpload.scss';
import { MultiFileUploadProps } from './types';

export const MultiFileUpload: FC<MultiFileUploadProps> = ({
  sdk,
  bucketId,
  folderId,
  path,
  onUploadError,
  maxFileSize,
  accept,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const uploadFiles = useCallback(async () => {
    try {
      await Promise.all(
        files.map(file =>
          sdk.buckets.uploadFile({
            bucketId,
            folderId,
            path: (path || '') + file.name,
            content: file
          })
        )
      );
    } catch (error) {
      onUploadError?.(error as Error);
    }
  }, [bucketId, files, folderId, onUploadError, path, sdk.buckets]);

  return (
    <div className="uipath-multi-file-upload">
      <FileUpload onFilesChange={setFiles} multiple maxSize={maxFileSize} accept={accept} />
      <Button onClick={uploadFiles}>Upload Files</Button>
    </div>
  );
};
