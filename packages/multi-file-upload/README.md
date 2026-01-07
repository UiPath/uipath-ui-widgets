# @uipath/ui-widgets-multi-file-upload

A React multi-file upload component for uploading files to UiPath Data Fabric buckets.

## Installation

```bash
npm install @uipath/ui-widgets-multi-file-upload
```

## Features

- Upload multiple files simultaneously
- Drag and drop support
- File type validation via accept attribute
- File size validation
- Error handling
- Built on Apollo Wind FileUpload component

## Usage

```tsx
import { MultiFileUpload } from '@uipath/ui-widgets-multi-file-upload';
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    // SDK configuration
  });

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
  };

  return (
    <MultiFileUpload
      sdk={sdk}
      bucketId={123}
      folderId={456}
      path="uploads/"
      onUploadError={handleUploadError}
      maxFileSize={10485760} // 10MB
      accept=".pdf,.jpg,.png"
    />
  );
}
```

## Props

### MultiFileUpload

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sdk` | `UiPath` | Yes | UiPath SDK instance |
| `bucketId` | `number` | Yes | The ID of the bucket to upload files to |
| `folderId` | `number` | Yes | The ID of the folder within the bucket |
| `path` | `string` | No | Path prefix for uploaded files (e.g., "uploads/") |
| `onUploadError` | `(error: Error) => void` | No | Callback function called when upload fails |
| `maxFileSize` | `number` | No | Maximum file size in bytes |
| `accept` | `string` | No | Accepted file types (comma-separated MIME types or extensions) |

## Example with Options

```tsx
<MultiFileUpload
  sdk={sdk}
  bucketId={123}
  folderId={456}
  path="documents/"
  onUploadError={(error) => console.error('Upload failed:', error)}
  maxFileSize={5242880} // 5MB
  accept=".pdf,.docx,.xlsx"
/>
```

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-wind

## License

MIT
