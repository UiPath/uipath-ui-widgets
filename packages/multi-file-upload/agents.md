# Multi-File-Upload - Architecture

## Overview

A React component for uploading multiple files simultaneously to a UiPath Orchestrator Storage Bucket. Built on Apollo Wind's FileUpload component with drag-and-drop support, per-file error tracking, and partial success handling.

## Component Structure

### Main Component

- **MultiFileUpload** (`MultiFileUpload.tsx`) - Single functional component that orchestrates the entire upload workflow. No custom hooks or services — all logic is self-contained.

### Props

| Prop              | Type                              | Required | Description                                 |
| ----------------- | --------------------------------- | -------- | ------------------------------------------- |
| `sdk`             | `UiPath`                          | Yes      | UiPath SDK instance                         |
| `bucketId`        | `number`                          | Yes      | Orchestrator Storage Bucket ID              |
| `folderId`        | `number`                          | Yes      | Folder containing the bucket                |
| `accept`          | `string`                          | No       | File type filter (MIME types or extensions) |
| `maxFileSizeInMb` | `number`                          | No       | Maximum file size in megabytes              |
| `path`            | `string`                          | No       | Path prefix for uploaded files              |
| `onUploadError`   | `(error: Error) => void`          | No       | Error callback                              |
| `onUploadSuccess` | `(uploadedFiles: File[]) => void` | No       | Success callback                            |

## Data Flow

### Upload Workflow

```
File Selection (drag-and-drop or file picker)
  → handleFilesChange() updates files state, clears errors
  → User clicks "Upload Files"
  → uploadFiles()
    → Validates not already uploading
    → Processes path (ensures trailing "/")
    → Promise.allSettled() uploads all files concurrently
      → BucketService.uploadFile({ bucketId, folderId, path, content })
    → Per-file result handling:
      ├→ All success → clear files, show success message, onUploadSuccess callback
      ├→ Partial success → onUploadSuccess with successful files, retain failed files
      └→ All failed → onUploadError callback, retain all files for retry
  → Clear button → resets all state, increments fileUploadKey to force remount
```

### Error Handling

- Individual file errors tracked in `fileErrors` Map (filename → error message)
- Partial success supported: successful files passed to callback, failed ones retained for retry
- Unexpected exceptions mark all files as failed

## State Management

| State           | Type                     | Purpose                            |
| --------------- | ------------------------ | ---------------------------------- |
| `files`         | `File[]`                 | Currently selected files           |
| `uploadSuccess` | `boolean`                | Show success message               |
| `fileErrors`    | `Record<string, string>` | Per-file error messages            |
| `fileUploadKey` | `number`                 | Reset key for FileUpload component |
| `isUploading`   | `boolean`                | Upload in progress flag            |

## Services

- **BucketService** (`@uipath/uipath-typescript/buckets`) - Instantiated as `useRef`, reuses SDK instance. Method: `uploadFile({ bucketId, folderId, path, content })` returns `{ statusCode }`.

## UI Composition

- **FileUpload** (from `@uipath/apollo-wind`) - Drag-and-drop file selector with error display
- **Button** (from `@uipath/apollo-wind`) - "Upload Files" (primary) and "Clear" (outline)
- Success message shown conditionally after all files upload

## Telemetry

| Event                  | Trigger                      | Properties                                   |
| ---------------------- | ---------------------------- | -------------------------------------------- |
| `MFU.Error`            | Individual file upload error | error message                                |
| `MFU.Usage`            | Upload summary               | total, success/failure counts, feature flags |
| `MFU.Error` (uncaught) | Unexpected exception         | error type, file count                       |

## Key Design Decisions

- **No custom hooks** - All logic in main component for simplicity
- **Promise.allSettled()** - Enables partial success without short-circuit failures
- **fileUploadKey increment** - Forces FileUpload component remount for clean state reset
- **Per-file error tracking** - Granular feedback allows retry of only failed files

## Testing

Tests in `src/__tests__/MultiFileUpload.test.tsx` using Vitest with Testing Library:

- Rendering and prop validation (accept filter, maxFileSizeInMb conversion, path handling)
- Button states (disabled when no files, enabled when files selected, disabled during upload)
- Upload success (callback invocation, success message, file clearing)
- Upload errors (complete failure, partial success, per-file error display)
- User interactions (clear button, error clearing on new selection, preventing simultaneous uploads)

## Key Dependencies

- `@uipath/apollo-wind` - FileUpload and Button components
- `@uipath/uipath-typescript` - SDK for BucketService and telemetry
- React 19.2.0+
