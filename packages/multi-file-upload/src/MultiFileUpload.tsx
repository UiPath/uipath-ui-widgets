import { Button, FileUpload } from '@uipath/apollo-wind';
import { BucketService } from '@uipath/uipath-typescript/buckets';
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
      const storageBucketService = new BucketService(sdk);
      const results = await Promise.allSettled(
        files.map((file) =>
          storageBucketService.uploadFile({
            bucketId,
            folderId,
            path: basePath + file.name,
            content: file,
          })
        )
      );

      const failedUploads: Array<{ file: File; error: string }> = [];
      const successfulFiles: File[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.statusCode === 201) {
          successfulFiles.push(files[index]);
        } else {
          failedUploads.push({
            file: files[index],
            error: (result as PromiseRejectedResult).reason?.message || 'Unknown error'
          });
        }
      });

      if (failedUploads.length === 0) {
        // All files uploaded successfully
        setUploadStatus(UPLOAD_SUCCESS);
        onUploadSuccess?.(files);
        setFiles([]);
        setFileUploadKey(prev => prev + 1);
      } else {
        // Some or all files failed
        const errorDetails = failedUploads.map(f => `${f.file.name}: ${f.error}`).join('; ');

        let errorMessage: string;
        if (successfulFiles.length === 0) {
          // All files failed
          errorMessage = `Failed to upload all files. ${errorDetails}`;
        } else {
          // Partial success
          errorMessage = `${successfulFiles.length} file(s) uploaded successfully. ${failedUploads.length} failed: ${errorDetails}`;
          // Remove successfully uploaded files, keep only failed ones
          setFiles(failedUploads.map(f => f.file));
          onUploadSuccess?.(successfulFiles);
        }

        setUploadStatus(errorMessage);
        onUploadError?.(new Error(errorMessage));
      }
    } catch (error) {
      setUploadStatus((error as Error).message || 'Failed to upload files');
      onUploadError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  }, [bucketId, files, folderId, isUploading, onUploadError, onUploadSuccess, path, sdk]);

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
