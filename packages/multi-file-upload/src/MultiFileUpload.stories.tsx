import type { Meta, StoryObj } from '@storybook/react-vite';
import { UiPath } from '@uipath/uipath-typescript/core';
import "./MultiFileUpload.css";
import { MultiFileUpload } from './MultiFileUpload';

const mockSdk = new UiPath({
  baseUrl: 'https://mock.uipath.com',
  orgName: 'storybook-org',
  tenantName: 'storybook-tenant',
  secret: 'dummy-secret'
});

const meta = {
  title: 'Components/MultiFileUpload',
  component: MultiFileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A React multi-file-upload widget for uploading multiple files simultaneously to UiPath Orchestrator's Storage bucket.

## Features

- Upload multiple files simultaneously
- Drag and drop support
- File type validation via accept attribute
- File size validation
- Error handling
- Built on Apollo Wind FileUpload component

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-multi-file-upload
\`\`\`

## Usage

\`\`\`tsx
import { MultiFileUpload } from '@uipath/ui-widgets-multi-file-upload';
import "@uipath/ui-widgets-multi-file-upload/MultiFileUpload.css";
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    // SDK configuration
  });

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
  };

  const handleUploadSuccess = (uploadedFiles: File[]) => {
    console.log('Successfully uploaded:', uploadedFiles.map(f => f.name));
  };

  return (
    <MultiFileUpload
      sdk={sdk}
      bucketId={123}
      folderId={456}
      path="uploads/"
      onUploadError={handleUploadError}
      onUploadSuccess={handleUploadSuccess}
      maxFileSize={10485760} // 10MB
      accept=".pdf,.jpg,.png"
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+
- @uipath/uipath-typescript
- @uipath/apollo-wind`
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    sdk: {
      description: 'UiPath SDK instance',
      control: false
    },
    bucketId: {
      description: 'The ID of the Orchestrator Storage Bucket to upload files to',
      control: 'number'
    },
    folderId: {
      description: 'The ID of the folder containing the Storage Bucket',
      control: 'number'
    },
    path: {
      description: 'Path prefix for uploaded files (e.g., "uploads/")',
      control: 'text'
    },
    onUploadError: {
      description: 'Callback function called when upload fails',
      action: 'uploadError'
    },
    onUploadSuccess: {
      description: 'Callback function called when files are successfully uploaded',
      action: 'uploadSuccess'
    },
    maxFileSize: {
      description: 'Maximum file size in bytes',
      control: 'number'
    },
    accept: {
      description: 'Accepted file types (comma-separated MIME types or extensions). See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) for details',
      control: 'text'
    }
  }
} satisfies Meta<typeof MultiFileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1
  }
};

export const WithAcceptFilter: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    accept: 'image/*'
  },
  parameters: {
    docs: {
      description: {
        story: 'Only accepts image files.'
      }
    }
  }
};

export const WithMaxFileSize: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  parameters: {
    docs: {
      description: {
        story: 'Limits file size to 5MB.'
      }
    }
  }
};

export const WithPath: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    path: 'uploads/documents'
  },
  parameters: {
    docs: {
      description: {
        story: 'Uploads files to a specific path within the bucket.'
      }
    }
  }
};

export const WithCallbacks: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    onUploadError: (error) => {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    },
    onUploadSuccess: (files) => {
      console.log('Upload successful:', files);
      alert(`Successfully uploaded ${files.length} file(s)`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error and success callbacks with alerts.'
      }
    }
  }
};

export const SimulatedError: Story = {
  args: {
    sdk: mockSdk,
    bucketId: 1,
    folderId: 1,
    onUploadError: (error) => {
      console.error('Expected error:', error);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when upload fails (will fail with network error in Storybook since the mock server does not exist).'
      }
    }
  }
};
