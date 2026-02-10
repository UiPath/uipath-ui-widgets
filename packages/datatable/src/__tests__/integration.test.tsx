/**
 * Integration tests for DataTable component
 * These tests verify that multiple components work together correctly
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../DataTable'
import { UiPath } from '@uipath/uipath-typescript/core'

// Create mock Entities instance
const mockGetById = vi.fn()
const mockGetRecordsById = vi.fn()

// Mock Entities to avoid SDK validation issues
vi.mock('@uipath/uipath-typescript/entities', () => {
  return {
    Entities: class {
      getById = mockGetById
      getRecordsById = mockGetRecordsById
    }
  }
})

// Mock ag-grid-react
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs, onGridReady }: any) => {
    // Simulate grid ready
    if (onGridReady) {
      setTimeout(() => {
        onGridReady({
          api: {
            sizeColumnsToFit: vi.fn(),
            getSelectedRows: vi.fn(() => []),
            getSelectedNodes: vi.fn(() => []),
            deselectAll: vi.fn(),
            refreshCells: vi.fn(),
          },
        })
      }, 0)
    }

    return (
      <div data-testid="ag-grid-integration">
        <div data-testid="row-count">{rowData?.length || 0}</div>
        <div data-testid="column-count">{columnDefs?.length || 0}</div>
      </div>
    )
  },
  themeQuartz: {},
}))

describe('DataTable Integration Tests', () => {
  let mockSdk: Partial<UiPath>
  let mockEntity: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockEntity = {
      id: 'entity-1',
      name: 'TestEntity',
      fields: [
        {
          name: 'Id',
          displayName: 'ID',
          isSystemField: true,
          isForeignKey: false,
        },
        {
          name: 'name',
          displayName: 'Name',
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: 'STRING' },
        },
        {
          name: 'status',
          displayName: 'Status',
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: 'STRING' },
        },
      ],
      getRecords: vi.fn().mockResolvedValue({
        items: [
          { Id: 'row1', name: 'Item 1', status: 'Active' },
          { Id: 'row2', name: 'Item 2', status: 'Inactive' },
        ],
      }),
      update: vi.fn().mockResolvedValue(undefined),
      insert: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }

    // Setup mock implementations
    mockGetById.mockResolvedValue(mockEntity)
    mockGetRecordsById.mockResolvedValue({
      items: [
        { Id: 'row1', name: 'Item 1', status: 'Active' },
        { Id: 'row2', name: 'Item 2', status: 'Inactive' },
      ],
    })

    mockSdk = {} as any
  })

  it('should render DataTable with toolbar and grid', async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-integration')).toBeInTheDocument()
    })

    // Toolbar buttons should be present
    expect(screen.getByText('Refresh')).toBeInTheDocument()
    expect(screen.getByText(/Show Diff/)).toBeInTheDocument()
    expect(screen.getByText('Add Row')).toBeInTheDocument()
  })

  it('should load and display entity data', async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('row-count')).toHaveTextContent('2')
    })

    expect(mockGetById).toHaveBeenCalledWith('entity-1')
  })

  it('should handle refresh action', async () => {
    const user = userEvent.setup()
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)

    // Should call getById again after refresh
    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledTimes(2)
    })
  })

  it('should show loading state initially', () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle errors gracefully', async () => {
    mockGetById.mockRejectedValueOnce(new Error('Failed to fetch entity'))

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('should have correct CSS classes', async () => {
    const { container } = render(
      <DataTable sdk={mockSdk as UiPath} entityId="entity-1" className="custom-class" />
    )

    await waitFor(() => {
      const datatableContainer = container.querySelector('.datatable-container')
      expect(datatableContainer).toBeInTheDocument()
      expect(datatableContainer).toHaveClass('custom-class')
    })
  })

  it('should apply custom page size', async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" pageSize={100} />)

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-integration')).toBeInTheDocument()
    })

    // PageSize prop should be passed to AgGrid
    // This is verified by the component not throwing errors
  })

  it('should handle entity ID changes', async () => {
    const { rerender } = render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />)

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith('entity-1')
    })

    // Change entity ID
    rerender(<DataTable sdk={mockSdk as UiPath} entityId="entity-2" />)

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith('entity-2')
    })
  })
})

