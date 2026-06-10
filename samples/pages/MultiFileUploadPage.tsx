import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { BucketFile } from "@uipath/uipath-typescript/buckets";
import { Buckets } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { MultiFileUpload } from "@uipath/ui-widgets-multi-file-upload";
import "@uipath/ui-widgets-multi-file-upload/MultiFileUpload.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "./PageHeader";

interface MultiFileUploadPageProps {
  uipathSdk: UiPath;
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function fileNameFromPath(path: string) {
  return path.split("/").filter(Boolean).pop() || path;
}

function MultiFileUploadPage({ uipathSdk }: MultiFileUploadPageProps) {
  const bucketId = useMemo(
    () => parseInt(import.meta.env.VITE_MFU_BUCKET_ID),
    [],
  );
  const folderId = useMemo(
    () => parseInt(import.meta.env.VITE_MFU_BUCKET_FOLDER_ID),
    [],
  );

  const bucketsService = useMemo(() => new Buckets(uipathSdk), [uipathSdk]);

  const [files, setFiles] = useState<BucketFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPath, setBusyPath] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const result = await bucketsService.getFiles(bucketId, { folderId });
      setFiles(result.items.filter((f) => !f.isDirectory));
    } catch (error) {
      console.error("Failed to fetch bucket files:", error);
    } finally {
      setLoading(false);
    }
  }, [bucketsService, bucketId, folderId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file: BucketFile) => {
    try {
      setBusyPath(file.path);
      const { uri, requiresAuth, headers } = await bucketsService.getReadUri({
        bucketId,
        folderId,
        path: file.path,
      });
      if (!requiresAuth) {
        window.open(uri, "_blank", "noopener,noreferrer");
        return;
      }
      const res = await fetch(uri, { headers });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileNameFromPath(file.path);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
    } finally {
      setBusyPath(null);
    }
  };

  const handleDelete = async (file: BucketFile) => {
    if (!window.confirm(`Delete "${fileNameFromPath(file.path)}"?`)) return;
    try {
      setBusyPath(file.path);
      await bucketsService.deleteFile(bucketId, file.path, { folderId });
      await fetchFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setBusyPath(null);
    }
  };

  return (
    <>
      <PageHeader widgetId="multi-file-upload" />
      <Box sx={{ flex: 1, overflow: "hidden", p: 2 }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          <Grid size={8} sx={{ height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Files in bucket
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: "auto" }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 4,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : files.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No files yet. Upload one using the panel on the right.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Size</TableCell>
                          <TableCell align="right" width={120}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {files.map((file) => {
                          const isBusy = busyPath === file.path;
                          return (
                            <TableRow key={file.path} hover>
                              <TableCell sx={{ wordBreak: "break-all" }}>
                                {fileNameFromPath(file.path)}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {file.contentType || "—"}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {formatSize(file.size)}
                              </TableCell>
                              <TableCell align="right">
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="flex-end"
                                >
                                  <Tooltip title="Download">
                                    <span>
                                      <IconButton
                                        size="small"
                                        disabled={isBusy}
                                        onClick={() => handleDownload(file)}
                                        aria-label="Download"
                                      >
                                        <DownloadIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        disabled={isBusy}
                                        onClick={() => handleDelete(file)}
                                        aria-label="Delete"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={4} sx={{ height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Upload files
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                <MultiFileUpload
                  sdk={uipathSdk}
                  bucketId={bucketId}
                  folderId={folderId}
                  maxFileSizeInMb={2}
                  accept="image/*"
                  onUploadSuccess={(uploaded: File[]) => {
                    console.log("Files uploaded:", uploaded);
                    fetchFiles();
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default MultiFileUploadPage;
