import { Button, FileUpload } from "@uipath/apollo-wind";
import { trackEvent } from "@uipath/uipath-typescript/core";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import { FC, useCallback, useRef, useState } from "react";
import "./MultiFileUpload.css";
import { MultiFileUploadProps, TelemetryConstants } from "./types";

export const MultiFileUpload: FC<MultiFileUploadProps> = ({
  sdk,
  bucketId,
  folderId,
  accept,
  maxFileSizeInMb,
  path,
  onUploadError,
  onUploadSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [fileUploadKey, setFileUploadKey] = useState(0); // A key to reset the state of FileUpload component. Modify (or simply increment) it on upload/clear to reset the list of files to []. If we wont increment it, then even after uploading files, file list wont clear. And if we re-upload a different set of files, it will append to the old list instead of overriding it.
  const [isUploading, setIsUploading] = useState(false);
  const storageBucketService = useRef(new BucketService(sdk));

  const uploadFiles = useCallback(async () => {
    if (isUploading) return; // Prevent multiple simultaneous uploads

    setIsUploading(true);
    setUploadSuccess(false);
    setFileErrors({});

    try {
      // Ensure path ends with '/' if provided
      const basePath = path ? (path.endsWith("/") ? path : `${path}/`) : "";

      // Upload all files and track results individually
      const results = await Promise.allSettled(
        files.map((file) =>
          storageBucketService.current.uploadFile({
            bucketId,
            folderId,
            path: basePath + file.name,
            content: file,
          }),
        ),
      );

      const errors: Record<string, string> = {};
      const successfulFiles: File[] = [];

      results.forEach((result, index) => {
        const file = files[index];
        if (result.status === "fulfilled" && result.value.statusCode === 201) {
          successfulFiles.push(file);
        } else {
          const errorMessage =
            (result as PromiseRejectedResult).reason?.message ||
            "Upload failed";
          errors[file.name] = errorMessage;

          // Telemetry: Log individual file upload error
          trackEvent(
            TelemetryConstants.Service.UploadFile,
            TelemetryConstants.Telemetry.Error,
            {
              ApplicationName: TelemetryConstants.ApplicationName,
              WidgetVersion: TelemetryConstants.Version,
              Error: errorMessage,
            },
          );
        }
      });

      // Telemetry: Log upload results summary
      trackEvent(
        TelemetryConstants.Service.UploadFile,
        TelemetryConstants.Telemetry.Usage,
        {
          ApplicationName: TelemetryConstants.ApplicationName,
          WidgetVersion: TelemetryConstants.Version,
          TotalFiles: files.length,
          SuccessCount: successfulFiles.length,
          FailureCount: Object.keys(errors).length,
          HasAccept: !!accept,
          HasMaxFileSizeInMb: !!maxFileSizeInMb,
          HasOnUploadError: !!onUploadError,
          HasOnUploadSuccess: !!onUploadSuccess,
        },
      );

      if (Object.keys(errors).length === 0) {
        // All files uploaded successfully
        setUploadSuccess(true);
        onUploadSuccess?.(files);
        setFiles([]);
        setFileUploadKey((prev) => prev + 1);
      } else {
        // Some or all files failed
        setFileErrors(errors);

        if (successfulFiles.length > 0) {
          // Partial success - keep only failed files
          setFiles(files.filter((f) => errors[f.name]));
          onUploadSuccess?.(successfulFiles);
        }

        onUploadError?.(
          new Error(`${Object.keys(errors).length} file(s) failed to upload`),
        );
      }
    } catch (error) {
      // Unexpected error - mark all files as failed
      const errors: Record<string, string> = {};
      const errorMessage = (error as Error).message || "Upload failed";
      files.forEach((file) => {
        errors[file.name] = errorMessage;
      });
      setFileErrors(errors);
      onUploadError?.(error as Error);

      // Telemetry: Log uncaught error
      trackEvent(
        TelemetryConstants.Service.UploadFile,
        TelemetryConstants.Telemetry.Error,
        {
          ApplicationName: TelemetryConstants.ApplicationName,
          WidgetVersion: TelemetryConstants.Version,
          Error: errorMessage,
          ErrorType: "uncaught",
          TotalFiles: files.length,
        },
      );
    } finally {
      setIsUploading(false);
    }
  }, [
    accept,
    bucketId,
    files,
    folderId,
    isUploading,
    maxFileSizeInMb,
    onUploadError,
    onUploadSuccess,
    path,
  ]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setUploadSuccess(false);
    setFileErrors({});
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setUploadSuccess(false);
    setFileErrors({});
    setFileUploadKey((prev) => prev + 1);
  }, []);

  return (
    <div className="uipath-multi-file-upload w-[400px]">
      <FileUpload
        key={fileUploadKey}
        onFilesChange={handleFilesChange}
        multiple
        maxSize={maxFileSizeInMb ? maxFileSizeInMb * 1024 * 1024 : undefined}
        accept={accept}
        errors={fileErrors}
      />
      {uploadSuccess && (
        <div className="mt-2 text-sm text-green-600">
          Files uploaded successfully!
        </div>
      )}
      <div className="flex gap-2 mt-4 justify-center">
        <Button
          onClick={uploadFiles}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={files.length === 0 || isUploading}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
