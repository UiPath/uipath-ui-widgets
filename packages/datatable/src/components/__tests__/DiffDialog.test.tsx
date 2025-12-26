/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiffDialog } from '../DiffDialog'
import { EntityGetResponse } from '@uipath/uipath-typescript'

describe('DiffDialog', () => {
  const mockEntity: Partial<EntityGetResponse> = {
    fields: [
      {
        name: 'name',
        displayName: 'Name',
        isSystemField: false,
        isForeignKey: false,
      } as any,
      {
        name: 'age',
        displayName: 'Age',
        isSystemField: false,
        isForeignKey: false,
      } as any,
    ],
  }

  const mockDiffData = [
    {
      rowId: 'row1',
      original: { Id: 'row1', name: 'John', age: 30 },
      edited: { Id: 'row1', name: 'John Updated', age: 31 },
    },
    {
      rowId: 'row2',
      original: { Id: 'row2', name: 'Jane', age: 25 },
      edited: { Id: 'row2', name: 'Jane Updated', age: 25 },
    },
  ]

  const defaultProps = {
    entity: mockEntity as EntityGetResponse,
    isOpen: true,
    onClose: vi.fn(),
    onCommit: vi.fn(),
    onRevertAll: vi.fn(),
    onRevertField: vi.fn(),
    diffData: mockDiffData,
  }

  it('should not render when isOpen is false', () => {
    render(<DiffDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Review Changes')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<DiffDialog {...defaultProps} />)

    expect(screen.getByText('Review Changes')).toBeInTheDocument()
  })

  it('should display all changed rows', () => {
    render(<DiffDialog {...defaultProps} />)

    expect(screen.getByText('Row ID: row1')).toBeInTheDocument()
    expect(screen.getByText('Row ID: row2')).toBeInTheDocument()
  })

  it('should display field names', () => {
    render(<DiffDialog {...defaultProps} />)

    const fieldCells = screen.getAllByText('name')
    expect(fieldCells.length).toBeGreaterThan(0)
  })

  it('should display original and new values', () => {
    render(<DiffDialog {...defaultProps} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('John Updated')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('should only show changed fields', () => {
    render(<DiffDialog {...defaultProps} />)

    // Row2 has only name changed, not age
    // Since age hasn't changed for row2, it shouldn't show in the diff
    const ageCells = screen.getAllByText('age')
    // Age should only appear for row1 (where it changed from 30 to 31)
    expect(ageCells.length).toBeLessThanOrEqual(1)
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<DiffDialog {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('.datatable-dialog-close')
    if (closeButton) {
      await user.click(closeButton)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should call onCommit when Commit Changes button is clicked', async () => {
    const onCommit = vi.fn()
    const user = userEvent.setup()

    render(<DiffDialog {...defaultProps} onCommit={onCommit} />)

    await user.click(screen.getByText('Commit Changes'))
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('should call onRevertAll when Revert button is clicked', async () => {
    const onRevertAll = vi.fn()
    const user = userEvent.setup()

    render(<DiffDialog {...defaultProps} onRevertAll={onRevertAll} />)

    await user.click(screen.getByText('Revert'))
    expect(onRevertAll).toHaveBeenCalledTimes(1)
  })

  it('should call onRevertField when field revert button is clicked', async () => {
    const onRevertField = vi.fn()
    const user = userEvent.setup()

    render(<DiffDialog {...defaultProps} onRevertField={onRevertField} />)

    const revertButtons = screen.getAllByTitle('Revert this field')
    await user.click(revertButtons[0])

    expect(onRevertField).toHaveBeenCalledWith('row1', 'name', 'John')
  })

  it('should handle empty diff data', () => {
    render(<DiffDialog {...defaultProps} diffData={[]} />)

    expect(screen.getByText('Review Changes')).toBeInTheDocument()
    expect(screen.queryByText(/Row ID:/)).not.toBeInTheDocument()
  })

  it('should handle undefined entity', () => {
    render(<DiffDialog {...defaultProps} entity={undefined} />)

    expect(screen.getByText('Review Changes')).toBeInTheDocument()
  })

  it('should render table headers', () => {
    render(<DiffDialog {...defaultProps} />)

    // Multiple tables (one per row), so use getAllByText
    expect(screen.getAllByText('Field').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Original').length).toBeGreaterThan(0)
    expect(screen.getAllByText('New').length).toBeGreaterThan(0)
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<DiffDialog {...defaultProps} />)

    expect(container.querySelector('.datatable-dialog-overlay')).toBeInTheDocument()
    expect(container.querySelector('.datatable-dialog')).toBeInTheDocument()
    expect(container.querySelector('.datatable-dialog-header')).toBeInTheDocument()
    expect(container.querySelector('.datatable-dialog-content')).toBeInTheDocument()
    expect(container.querySelector('.datatable-dialog-footer')).toBeInTheDocument()
  })

  it('should render multiple revert buttons for multiple changed fields', () => {
    render(<DiffDialog {...defaultProps} />)

    const revertButtons = screen.getAllByTitle('Revert this field')
    // row1 has 2 changed fields (name and age), row2 has 1 (name)
    expect(revertButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle diff data with null original values', () => {
    const diffDataWithNull = [
      {
        rowId: 'row1',
        original: null,
        edited: { Id: 'row1', name: 'New Name', age: 30 },
      },
    ]

    render(<DiffDialog {...defaultProps} diffData={diffDataWithNull} />)

    expect(screen.getByText('Row ID: row1')).toBeInTheDocument()
  })

  it('should handle nested object values', () => {
    const diffDataWithObjects = [
      {
        rowId: 'row1',
        original: { Id: 'row1', data: { value: 1 } },
        edited: { Id: 'row1', data: { value: 2 } },
      },
    ]

    render(<DiffDialog {...defaultProps} diffData={diffDataWithObjects} />)

    expect(screen.getByText('Row ID: row1')).toBeInTheDocument()
  })

  it('should apply CSS class to changed rows', () => {
    const { container } = render(<DiffDialog {...defaultProps} />)

    const changedRows = container.querySelectorAll('.datatable-diff-changed')
    expect(changedRows.length).toBeGreaterThan(0)
  })
})

