/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import {
  getFieldValue,
  createValueSetter,
  createCellEditorSelector,
  isFieldTypeDate,
} from '../fieldUtils'
import { EntityFieldDataType, FieldMetaData } from '@uipath/uipath-typescript'
import { GridRow } from '@uipath/datatable/types'

describe('fieldUtils', () => {
  describe('getFieldValue', () => {
    it('should return value for non-foreign key field', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        name: 'name',
      }
      const value = 'John Doe'

      const result = getFieldValue(value, field as FieldMetaData)

      expect(result).toBe('John Doe')
    })

    it('should return reference field value for foreign key', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        referenceField: {
          definition: { name: 'displayName' },
        } as any,
      }
      const value = { Id: '123', displayName: 'Reference Value' }

      const result = getFieldValue(value, field as FieldMetaData)

      expect(result).toBe('Reference Value')
    })

    it('should return value directly if reference field name is not found', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        referenceField: undefined,
      }
      const value = { Id: '123', name: 'Value' }

      const result = getFieldValue(value, field as FieldMetaData)

      expect(result).toEqual({ Id: '123', name: 'Value' })
    })

    it('should format Date objects for date fields', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      }
      const value = new Date('2023-12-17')

      const result = getFieldValue(value, field as FieldMetaData)

      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Date format varies by locale
    })

    it('should return value as-is for date field with non-Date value', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      }
      const value = '2023-12-17'

      const result = getFieldValue(value, field as FieldMetaData)

      expect(result).toBe('2023-12-17')
    })

    it('should handle undefined field', () => {
      const value = 'test'

      const result = getFieldValue(value, undefined)

      expect(result).toBe('test')
    })

    it('should handle null value', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
      }

      const result = getFieldValue(null, field as FieldMetaData)

      expect(result).toBe(null)
    })
  })

  describe('createValueSetter', () => {
    it('should create a value setter that updates field value', () => {
      const fieldName = 'name'
      const valueSetter = createValueSetter(fieldName)
      const data: GridRow = { Id: 'row1', name: 'Old Name' }
      const params = {
        data,
        newValue: 'New Name',
      } as any

      const result = valueSetter(params)

      expect(result).toBe(true)
      expect(data.name).toBe('New Name')
    })

    it('should return false when data is undefined', () => {
      const fieldName = 'name'
      const valueSetter = createValueSetter(fieldName)
      const params = {
        data: undefined,
        newValue: 'New Name',
      } as any

      const result = valueSetter(params)

      expect(result).toBe(false)
    })

    it('should handle setting nested field values', () => {
      const fieldName = 'user.name'
      const valueSetter = createValueSetter(fieldName)
      const data: any = { Id: 'row1', user: { name: 'Old Name' } }
      const params = {
        data,
        newValue: 'New Name',
      } as any

      const result = valueSetter(params)

      expect(result).toBe(true)
      expect(data['user.name']).toBe('New Name')
    })
  })

  describe('createCellEditorSelector', () => {
    it('should return RefFieldCellEditor for foreign key fields', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: true,
        name: 'category',
      }
      const sdk = {} as any
      const cellEditorSelector = createCellEditorSelector(field as FieldMetaData, sdk)
      const params = {
        data: { Id: 'row1' },
      } as any

      const result = cellEditorSelector(params)

      expect(result).toBeDefined()
      expect(result?.component).toBeDefined()
      expect(result?.params).toEqual({
        sdk,
        field,
        entityRecord: params.data,
      })
    })

    it('should return agDateStringCellEditor for date fields', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      }
      const sdk = {} as any
      const cellEditorSelector = createCellEditorSelector(field as FieldMetaData, sdk)
      const params = { data: { Id: 'row1' } } as any

      const result = cellEditorSelector(params)

      expect(result).toEqual({
        component: 'agDateStringCellEditor',
      })
    })

    it('should return undefined for regular fields', () => {
      const field: Partial<FieldMetaData> = {
        isForeignKey: false,
        fieldDataType: { name: EntityFieldDataType.STRING } as any,
      }
      const sdk = {} as any
      const cellEditorSelector = createCellEditorSelector(field as FieldMetaData, sdk)
      const params = { data: { Id: 'row1' } } as any

      const result = cellEditorSelector(params)

      expect(result).toBeUndefined()
    })
  })

  describe('isFieldTypeDate', () => {
    it('should return true for DATE field type', () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.DATE } as any,
      }

      const result = isFieldTypeDate(field as FieldMetaData)

      expect(result).toBe(true)
    })

    it('should return false for non-DATE field types', () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.STRING } as any,
      }

      const result = isFieldTypeDate(field as FieldMetaData)

      expect(result).toBe(false)
    })

    it('should return false for NUMBER field type', () => {
      const field: Partial<FieldMetaData> = {
        fieldDataType: { name: EntityFieldDataType.NUMBER } as any,
      }

      const result = isFieldTypeDate(field as FieldMetaData)

      expect(result).toBe(false)
    })
  })
})

