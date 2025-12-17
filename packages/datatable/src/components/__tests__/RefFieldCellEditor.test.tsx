/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefFieldCellEditor, RefFieldCellEditorProps } from '../RefFieldCellEditor'
import { UiPath } from '@uipath/uipath-typescript'

// Mock useEntityRecordsCache
vi.mock('@uipath/datatable/hooks/useEntityRecordsCache', () => ({
  useEntityRecordsCache: () => ({
    getRecords: vi.fn().mockResolvedValue([
      { Id: 'ref1', name: 'Reference 1' },
      { Id: 'ref2', name: 'Reference 2' },
      { Id: 'ref3', name: 'Reference 3' },
    ]),
    clearCache: vi.fn(),
  }),
}))

describe('RefFieldCellEditor', () => {
  const mockField = {
    name: 'category',
    referenceEntity: { id: 'entity-1' },
    referenceField: { definition: { name: 'name' } },
  } as any

  const mockEntityRecord = {
    Id: 'row1',
    category: { Id: 'ref1', name: 'Reference 1' },
  }

  const defaultProps: RefFieldCellEditorProps = {
    sdk: {} as UiPath,
    field: mockField,
    entityRecord: mockEntityRecord,
    onValueChange: vi.fn(),
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render select element', () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should load and display reference options', async () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Reference 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Reference 2')).toBeInTheDocument()
    expect(screen.getByText('Reference 3')).toBeInTheDocument()
  })

  it('should show "None" option when options are loaded', async () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('None')).toBeInTheDocument()
    })
  })

  it('should set initial selected value from entity record', async () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('ref1')
    })
  })

  it('should call onValueChange when selection changes', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()

    render(<RefFieldCellEditor {...defaultProps} onValueChange={onValueChange} />)

    await waitFor(() => {
      expect(screen.getByText('Reference 2')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'ref2')

    expect(onValueChange).toHaveBeenCalledWith({
      Id: 'ref2',
      name: 'Reference 2',
    })
  })

  it('should call onValueChange with null when "None" is selected', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()

    render(<RefFieldCellEditor {...defaultProps} onValueChange={onValueChange} />)

    await waitFor(() => {
      expect(screen.getByText('None')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '')

    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('should disable select while loading', () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('should enable select after options are loaded', async () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).not.toBeDisabled()
    })
  })

  it('should handle entity record without initial value', async () => {
    const propsWithoutValue = {
      ...defaultProps,
      entityRecord: { Id: 'row1', category: null },
    }

    render(<RefFieldCellEditor {...propsWithoutValue} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('')
    })
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<RefFieldCellEditor {...defaultProps} />)

    expect(container.querySelector('.relationship-field-editor')).toBeInTheDocument()
    expect(container.querySelector('.relationship-field-editor__select')).toBeInTheDocument()
  })

  it('should render correct number of options', async () => {
    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      const options = select.querySelectorAll('option')
      // 1 "None" option + 3 reference options
      expect(options).toHaveLength(4)
    })
  })

  it('should update selected value state on change', async () => {
    const user = userEvent.setup()

    render(<RefFieldCellEditor {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Reference 3')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox') as HTMLSelectElement
    await user.selectOptions(select, 'ref3')

    expect(select.value).toBe('ref3')
  })

  it('should handle missing reference entity id', async () => {
    const fieldWithoutRefEntity = {
      ...mockField,
      referenceEntity: undefined,
    }

    render(<RefFieldCellEditor {...defaultProps} field={fieldWithoutRefEntity} />)

    // Should still render without crashing
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should handle missing reference field name', async () => {
    const fieldWithoutRefField = {
      ...mockField,
      referenceField: undefined,
    }

    render(<RefFieldCellEditor {...defaultProps} field={fieldWithoutRefField} />)

    // Should still render without crashing
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})

