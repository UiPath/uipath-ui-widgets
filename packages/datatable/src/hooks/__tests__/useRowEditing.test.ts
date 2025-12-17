/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRowEditing } from '../useRowEditing'
import { GridRow } from '@uipath/datatable/types'
import { CellValueChangedEvent } from 'ag-grid-community'

describe('useRowEditing', () => {
  let originalData: GridRow[]
  let setRowData: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalData = [
      { Id: 'row1', name: 'John', age: 30 },
      { Id: 'row2', name: 'Jane', age: 25 },
    ]
    setRowData = vi.fn()
  })

  it('should initialize with empty edited rows', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    expect(result.current.editedRows.size).toBe(0)
  })

  it('should track edited rows on cell value change', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    const event = {
      data: { Id: 'row1', name: 'John Updated', age: 30 },
    } as CellValueChangedEvent

    act(() => {
      result.current.handleCellValueChanged(event)
    })

    expect(result.current.editedRows.size).toBe(1)
    expect(result.current.editedRows.get('row1')).toEqual(event.data)
  })

  it('should update existing edited row on subsequent changes', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    // First change
    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    // Second change to same row
    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated Again', age: 31 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(1)
    expect(result.current.editedRows.get('row1')).toEqual({
      Id: 'row1',
      name: 'John Updated Again',
      age: 31,
    })
  })

  it('should track multiple edited rows', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)

      result.current.handleCellValueChanged({
        data: { Id: 'row2', name: 'Jane Updated', age: 25 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(2)
  })

  it('should ignore events without row ID', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { name: 'No ID' },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(0)
  })

  it('should commit updates and clear edited rows', async () => {
    const mockEntity = {
      update: vi.fn().mockResolvedValue(undefined),
    } as any

    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(1)

    await act(async () => {
      await result.current.commitUpdates(mockEntity)
    })

    expect(mockEntity.update).toHaveBeenCalledWith([
      { Id: 'row1', name: 'John Updated', age: 30 },
    ])
    expect(result.current.editedRows.size).toBe(0)
  })

  it('should handle commit errors', async () => {
    const mockEntity = {
      update: vi.fn().mockRejectedValue(new Error('Update failed')),
    } as any

    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    await expect(
      act(async () => {
        await result.current.commitUpdates(mockEntity)
      })
    ).rejects.toThrow('Update failed')
  })

  it('should revert all updates', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(1)

    act(() => {
      result.current.revertAllUpdates()
    })

    expect(result.current.editedRows.size).toBe(0)
    expect(setRowData).toHaveBeenCalledWith(originalData)
  })

  it('should revert single cell update', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    // Edit two fields in row1
    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 31 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(1)

    // Revert the name field only
    act(() => {
      result.current.revertSingleCellUpdate('row1', 'name', 'John')
    })

    expect(setRowData).toHaveBeenCalled()
    // Row should still be in edited rows because age is still changed
    expect(result.current.editedRows.has('row1')).toBe(true)
  })

  it('should remove row from edited rows when all changes are reverted', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    // Edit only name field
    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    expect(result.current.editedRows.size).toBe(1)

    // Revert the name field back to original
    act(() => {
      result.current.revertSingleCellUpdate('row1', 'name', 'John')
    })

    // Row should be removed from edited rows
    expect(result.current.editedRows.has('row1')).toBe(false)
  })

  it('should handle revert when row is not in edited rows', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.revertSingleCellUpdate('row99', 'name', 'Original')
    })

    expect(setRowData).toHaveBeenCalled()
    expect(result.current.editedRows.size).toBe(0)
  })

  it('should update row data when reverting single cell', () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 31 },
      } as CellValueChangedEvent)
    })

    act(() => {
      result.current.revertSingleCellUpdate('row1', 'name', 'John')
    })

    // Verify setRowData was called with a function
    expect(setRowData).toHaveBeenCalled()
    const updateFn = setRowData.mock.calls[0][0]

    // Test the update function
    const updatedData = updateFn([
      { Id: 'row1', name: 'John Updated', age: 31 },
      { Id: 'row2', name: 'Jane', age: 25 },
    ])

    expect(updatedData[0]).toEqual({ Id: 'row1', name: 'John', age: 31 })
    expect(updatedData[1]).toEqual({ Id: 'row2', name: 'Jane', age: 25 })
  })

  it('should handle undefined entity in commitUpdates', async () => {
    const { result } = renderHook(() => useRowEditing(originalData, setRowData))

    act(() => {
      result.current.handleCellValueChanged({
        data: { Id: 'row1', name: 'John Updated', age: 30 },
      } as CellValueChangedEvent)
    })

    // Should not throw when entity is undefined
    await act(async () => {
      await result.current.commitUpdates(undefined)
    })

    // Edited rows should still be cleared
    expect(result.current.editedRows.size).toBe(0)
  })
})

