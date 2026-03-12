import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@uipath/apollo-wind";
import { Entities } from "@uipath/uipath-typescript/entities";
import { ICellRendererParams } from "ag-grid-community";
import { useCallback, useRef, useState } from "react";
import { getMimeType } from "../utils/fieldUtils";
import { MoreVerticalIcon } from "./icons/MoreVerticalIcon";
import { UploadIcon } from "./icons/UploadIcon";

export interface FileCellRendererProps extends ICellRendererParams {
  entityService: Entities;
  entityId: string;
  fieldName: string;
}

export const FileCellRenderer = (props: FileCellRendererProps) => {
  const { value, data, entityService, entityId, fieldName } = props;

  const [fileName, setFileName] = useState<string | null>(value);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlob = useCallback(async () => {
    return entityService.downloadAttachment(entityId, data.Id, fieldName);
  }, [entityService, entityId, data.Id, fieldName]);

  const handleOpen = useCallback(() => {
    toast.promise(
      fetchBlob()
        .then((blob) => {
          const mimeType = getMimeType(String(fileName || ""));
          const typedBlob = new Blob([blob], { type: mimeType });
          const url = URL.createObjectURL(typedBlob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        })
        .catch((error) => {
          console.error("Failed to open file:", error);
          throw error;
        }),
      {
        loading: "Opening file in new tab",
        success: "File opened",
        error: "Failed to open file",
      },
    );
  }, [fetchBlob, fileName]);

  const handleDownload = useCallback(() => {
    toast.promise(
      fetchBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = String(fileName || "download");
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Failed to download file:", error);
          throw error;
        }),
      {
        loading: "Downloading file",
        success: "File downloaded",
        error: "Failed to download file",
      },
    );
  }, [fetchBlob, fileName]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    toast.promise(
      entityService
        .deleteAttachment(entityId, data.Id, fieldName)
        .then(() => setFileName(null))
        .catch((error) => {
          console.error("Failed to remove file:", error);
          throw error;
        }),
      {
        loading: "Removing file",
        success: "File removed",
        error: "Failed to remove file",
      },
    );
  }, [entityService, entityId, data.Id, fieldName]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      toast.promise(
        entityService
          .uploadAttachment(entityId, data.Id, fieldName, file)
          .then(() => setFileName(file.name))
          .catch((error) => {
            console.error("Failed to upload file:", error);
            throw error;
          })
          .finally(() => {
            setIsUploading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }),
        {
          loading: "Uploading file",
          success: "File uploaded",
          error: "Failed to upload file",
        },
      );
    },
    [data.Id, entityService, entityId, fieldName],
  );

  if (!data?.Id) return null;

  if (fileName) {
    return (
      <div className="flex items-center gap-1 w-full h-full">
        <span className="truncate">{fileName}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 ml-auto"
            >
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpen}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReplace}>Replace</DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <a
      className="flex items-center gap-1 h-full w-full cursor-pointer"
      style={{ color: "var(--color-primary)" }}
      onClick={isUploading ? undefined : handleReplace}
    >
      <UploadIcon />
      {isUploading ? "Uploading..." : "Upload"}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </a>
  );
};
