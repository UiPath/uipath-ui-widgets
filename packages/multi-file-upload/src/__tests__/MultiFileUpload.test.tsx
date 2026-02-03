/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiFileUpload } from '../MultiFileUpload'
import { UiPath } from '@uipath/uipath-typescript'

// Create mock uploadFile function
const mockUploadFile = vi.fn()

// Mock BucketService to avoid SDK validation issues
vi.mock('@uipath/uipath-typescript/buckets', () => ({
  BucketService: vi.fn().mockImplementation(() => ({
    uploadFile: mockUploadFile,
  })),
}))

// Mock @uipath/apollo-wind components
vi.mock('@uipath/apollo-wind', () => ({
  Button: ({ onClick, children, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
  FileUpload: ({ onFilesChange, multiple, maxSize, accept }: any) => (
    <div data-testid="file-upload">
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        data-testid="file-input"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          onFilesChange(files)
        }}
      />
      <div data-testid="max-size">{maxSize}</div>
    </div>
  ),
}))

describe('MultiFileUpload', () => {
  let mockSdk: UiPath

  beforeEach(() => {
    vi.clearAllMocks()
    mockSdk = {} as UiPath
  })

  const getDefaultProps = () => ({
    sdk: mockSdk,
    bucketId: 1,
    folderId: 100,
  })

  it('should render the component', () => {
    render(<MultiFileUpload {...getDefaultProps()} />)

    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
    expect(screen.getAllByTestId('button')).toHaveLength(2)
  })

  it('should render with custom accept prop', () => {
    render(<MultiFileUpload {...getDefaultProps()} accept=".pdf,.doc" />)

    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toHaveAttribute('accept', '.pdf,.doc')
  })

  it('should render with custom maxFileSize prop', () => {
    render(<MultiFileUpload {...getDefaultProps()} maxFileSize={5000000} />)

    expect(screen.getByTestId('max-size')).toHaveTextContent('5000000')
  })

  it('should have upload and clear buttons disabled when no files selected', () => {
    render(<MultiFileUpload {...getDefaultProps()} />)

    const buttons = screen.getAllByTestId('button')
    const uploadButton = buttons[0]
    const clearButton = buttons[1]

    expect(uploadButton).toBeDisabled()
    expect(clearButton).toBeDisabled()
  })

  it('should enable buttons when files are selected', async () => {
    const user = userEvent.setup()
    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      expect(buttons[0]).not.toBeDisabled()
      expect(buttons[1]).not.toBeDisabled()
    })
  })

  it('should upload files successfully', async () => {
    const user = userEvent.setup()
    const onUploadSuccess = vi.fn()
    mockUploadFile.mockResolvedValue({ statusCode: 201 })

    render(
      <MultiFileUpload
        {...getDefaultProps()}
        onUploadSuccess={onUploadSuccess}
      />
    )

    const fileInput = screen.getByTestId('file-input')
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })

    await user.upload(fileInput, [file1, file2])

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledTimes(2)
      expect(onUploadSuccess).toHaveBeenCalledWith([file1, file2])
      expect(screen.getByText('Files uploaded successfully!')).toBeInTheDocument()
    })
  })

  it('should upload files with custom path', async () => {
    const user = userEvent.setup()
    mockUploadFile.mockResolvedValue({ statusCode: 201 })

    render(
      <MultiFileUpload
        {...getDefaultProps()}
        path="custom/folder"
      />
    )

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith({
        bucketId: 1,
        folderId: 100,
        path: 'custom/folder/test.txt',
        content: file,
      })
    })
  })

  it('should ensure path ends with slash', async () => {
    const user = userEvent.setup()
    mockUploadFile.mockResolvedValue({ statusCode: 201 })

    render(
      <MultiFileUpload
        {...getDefaultProps()}
        path="custom/folder/"
      />
    )

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledWith({
        bucketId: 1,
        folderId: 100,
        path: 'custom/folder/test.txt',
        content: file,
      })
    })
  })

  it('should handle upload errors for all files', async () => {
    const user = userEvent.setup()
    const onUploadError = vi.fn()
    mockUploadFile.mockRejectedValue(new Error('Upload failed'))

    render(
      <MultiFileUpload
        {...getDefaultProps()}
        onUploadError={onUploadError}
      />
    )

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled()
      expect(screen.getByText(/Failed to upload all files/)).toBeInTheDocument()
    })
  })

  it('should handle partial upload success', async () => {
    const user = userEvent.setup()
    const onUploadSuccess = vi.fn()
    const onUploadError = vi.fn()

    // First file succeeds, second fails
    mockUploadFile
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce(new Error('Upload failed'))

    render(
      <MultiFileUpload
        {...getDefaultProps()}
        onUploadSuccess={onUploadSuccess}
        onUploadError={onUploadError}
      />
    )

    const fileInput = screen.getByTestId('file-input')
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })

    await user.upload(fileInput, [file1, file2])

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(onUploadSuccess).toHaveBeenCalledWith([file1])
      expect(onUploadError).toHaveBeenCalled()
      expect(screen.getByText(/1 file\(s\) uploaded successfully. 1 failed/)).toBeInTheDocument()
    })
  })

  it('should clear files when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      expect(buttons[0]).not.toBeDisabled()
    })

    const clearButton = screen.getAllByTestId('button')[1]
    await user.click(clearButton)

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      expect(buttons[0]).toBeDisabled()
      expect(buttons[1]).toBeDisabled()
    })
  })

  it('should clear status message when new files are selected', async () => {
    const user = userEvent.setup()
    mockUploadFile.mockRejectedValue(new Error('Upload failed'))

    render(<MultiFileUpload {...getDefaultProps()} />)

    // Upload first file with error
    const fileInput = screen.getByTestId('file-input')
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    await user.upload(fileInput, file1)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to upload all files/)).toBeInTheDocument()
    })

    // Select new file - status message should clear
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })
    await user.upload(fileInput, file2)

    await waitFor(() => {
      expect(screen.queryByText(/Failed to upload all files/)).not.toBeInTheDocument()
    })
  })

  it('should disable buttons while uploading', async () => {
    const user = userEvent.setup()
    let resolveUpload: any
    mockUploadFile.mockImplementation(() => new Promise((resolve) => {
      resolveUpload = () => resolve({ statusCode: 201 })
    }))

    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    // Buttons should be disabled during upload
    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      expect(buttons[0]).toBeDisabled()
      expect(buttons[1]).toBeDisabled()
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    })

    // Resolve upload
    resolveUpload()

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      expect(buttons[0]).toBeDisabled()
      expect(buttons[1]).toBeDisabled()
    })
  })

  it('should prevent multiple simultaneous uploads', async () => {
    const user = userEvent.setup()
    let resolveUpload: any
    mockUploadFile.mockImplementation(() => new Promise((resolve) => {
      resolveUpload = () => resolve({ statusCode: 201 })
    }))

    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]

    // Click upload button twice
    await user.click(uploadButton)
    await user.click(uploadButton)

    // Should only upload once
    expect(mockUploadFile).toHaveBeenCalledTimes(1)

    resolveUpload()
  })

  it('should display correct color for success message', async () => {
    const user = userEvent.setup()
    mockUploadFile.mockResolvedValue({ statusCode: 201 })

    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      const message = screen.getByText('Files uploaded successfully!')
      expect(message).toHaveClass('text-green-600')
    })
  })

  it('should display correct color for error message', async () => {
    const user = userEvent.setup()
    mockUploadFile.mockRejectedValue(new Error('Upload failed'))

    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    await user.upload(fileInput, file)

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      const message = screen.getByText(/Failed to upload all files/)
      expect(message).toHaveClass('text-red-600')
    })
  })

  it('should display correct color for partial success message', async () => {
    const user = userEvent.setup()
    mockUploadFile
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce(new Error('Upload failed'))

    render(<MultiFileUpload {...getDefaultProps()} />)

    const fileInput = screen.getByTestId('file-input')
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })
    await user.upload(fileInput, [file1, file2])

    const uploadButton = screen.getAllByTestId('button')[0]
    await user.click(uploadButton)

    await waitFor(() => {
      const message = screen.getByText(/1 file\(s\) uploaded successfully/)
      expect(message).toHaveClass('text-yellow-600')
    })
  })
})
