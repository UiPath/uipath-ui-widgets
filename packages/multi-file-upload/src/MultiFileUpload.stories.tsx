import type { Meta, StoryObj } from '@storybook/react';
import "./MultiFileUpload.css";
import { MultiFileUpload } from './MultiFileUpload';

// Mock SDK for Storybook
const mockSdk = {
  buckets: {
    uploadFile: async ({ path, content }: { bucketId: number; folderId: number; path: string; content: File }) => {
      console.log(`Mock upload: ${path}`, content);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate success
      return { statusCode: 201, data: { path } };
    }
  }
} as any;

const meta = {
  title: 'Components/MultiFileUpload',
  component: MultiFileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A multi-file upload component that allows users to select and upload multiple files to a UiPath bucket.'
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
      description: 'ID of the bucket to upload files to',
      control: 'number'
    },
    folderId: {
      description: 'ID of the folder within the bucket',
      control: 'number'
    },
    accept: {
      description: 'Accepted file types (e.g., "image/*", ".pdf,.doc")',
      control: 'text'
    },
    maxFileSize: {
      description: 'Maximum file size in bytes',
      control: 'number'
    },
    path: {
      description: 'Path prefix for uploaded files',
      control: 'text'
    },
    onUploadError: {
      description: 'Callback when upload fails',
      action: 'uploadError'
    },
    onUploadSuccess: {
      description: 'Callback when upload succeeds',
      action: 'uploadSuccess'
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
    sdk: {
      buckets: {
        uploadFile: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error('Simulated upload failure');
        }
      }
    } as any,
    bucketId: 1,
    folderId: 1,
    onUploadError: (error) => {
      console.error('Expected error:', error);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates an upload error to demonstrate error handling.'
      }
    }
  }
};
