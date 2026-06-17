/**
 * Allowed attachment types and size constraints for the chat file upload.
 * Superset of all provider-supported formats from the Analyze Files tool.
 * @see https://docs.uipath.com/agents/automation-cloud/latest/user-guide/analyze-files
 */
export const ALLOWED_ATTACHMENTS = {
  multiple: true,
  types: {
    "application/pdf": [".pdf"],
    "text/csv": [".csv"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "text/html": [".html"],
    "text/plain": [".txt"],
    "text/markdown": [".md"],
    "image/gif": [".gif"],
    "image/jpeg": [".jpe", ".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/tiff": [".tiff"],
    "image/webp": [".webp"],
  },
  maxSize: 30 * 1024 * 1024,
};
