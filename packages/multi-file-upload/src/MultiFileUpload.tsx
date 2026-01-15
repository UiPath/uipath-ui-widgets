import { Button, FileUpload } from '@uipath/apollo-wind';
import { FC, useCallback, useState } from 'react';
import './MultiFileUpload.css';
import { MultiFileUploadProps } from './types';

const UPLOAD_SUCCESS = 'success';

export const MultiFileUpload: FC<MultiFileUploadProps> = ({
  sdk,
  bucketId,
  folderId,
  accept,
  maxFileSize,
  path,
  onUploadError,
  onUploadSuccess
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [fileUploadKey, setFileUploadKey] = useState(0); // A key to reset the state of FileUpload component. Modify (or simply increment) it on upload/clear to reset the list of files to []. If we wont increment it, then even after uploading files, file list wont clear. And if we re-upload a different set of files, it will append to the old list instead of overriding it.
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async () => {
    if (isUploading) return; // Prevent multiple simultaneous uploads

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // Ensure path ends with '/' if provided
      const basePath = path ? (path.endsWith('/') ? path : `${path}/`) : '';

      // Upload all files and track results individually
      const results = await Promise.allSettled(
        files.map((file) =>
          sdk.buckets.uploadFile({
            bucketId,
            folderId,
            path: basePath + file.name,
            content: file,
          })
        )
      );

      const failedCount = results.filter(r => r.status === 'rejected').length;
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      if (failedCount === 0) {
        // All files uploaded successfully
        setUploadStatus(UPLOAD_SUCCESS);
        onUploadSuccess?.(files);
        setFiles([]);
        setFileUploadKey(prev => prev + 1);
      } else if (successCount === 0) {
        // All files failed
        const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
        const errorMessage = firstError.reason?.message || 'Failed to upload files';
        setUploadStatus(errorMessage);
        onUploadError?.(new Error(errorMessage));
      } else {
        // Partial success
        const errorMessage = `${successCount} file(s) uploaded, ${failedCount} failed`;
        setUploadStatus(errorMessage);
        onUploadError?.(new Error(errorMessage));
      }
    } catch (error) {
      setUploadStatus((error as Error).message || 'Failed to upload files');
      onUploadError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  }, [bucketId, files, folderId, isUploading, onUploadError, onUploadSuccess, path, sdk.buckets]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setUploadStatus(null);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setUploadStatus(null);
    setFileUploadKey(prev => prev + 1);
  }, []);

  return (
    <div className="uipath-multi-file-upload w-[400px]">
      <FileUpload
        key={fileUploadKey}
        onFilesChange={handleFilesChange}
        multiple
        maxSize={maxFileSize}
        accept={accept}
      />
      {uploadStatus && (
        <div className={`mt-2 text-sm ${
          uploadStatus === UPLOAD_SUCCESS
            ? 'text-green-600'
            : uploadStatus.includes('uploaded')
              ? 'text-yellow-600'
              : 'text-red-600'
        }`}>
          {uploadStatus === UPLOAD_SUCCESS ? 'Files uploaded successfully!' : uploadStatus}
        </div>
      )}
      <div className="flex gap-2 mt-4 justify-center">
        <Button onClick={uploadFiles} disabled={files.length === 0 || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={files.length === 0 || isUploading}>
          Clear
        </Button>
      </div>
    </div>
  );
};
