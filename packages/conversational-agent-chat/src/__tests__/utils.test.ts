/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { createFileKey, normalizeInput, convertAttachmentToFile } from '../utils'
import { AutopilotChatFileInfo } from '@uipath/apollo-react/ap-chat'

describe('utils', () => {
  describe('createFileKey', () => {
    it('should create a key from binary content', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          binary: new Uint8Array([1, 2, 3, 4, 5]),
        },
      } as any

      const key = createFileKey(attachment)
      expect(key).toBe('test.txt-5-text/plain')
    })

    it('should create a key from text content', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          text: 'hello world',
        },
      } as any

      const key = createFileKey(attachment)
      expect(key).toBe('test.txt-11-text/plain')
    })

    it('should create a key with 0 size when no content', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {},
      } as any

      const key = createFileKey(attachment)
      expect(key).toBe('test.txt-0-text/plain')
    })

    it('should create unique keys for different files', () => {
      const attachment1: AutopilotChatFileInfo = {
        name: 'file1.txt',
        type: 'text/plain',
        content: { text: 'content1' },
      } as any

      const attachment2: AutopilotChatFileInfo = {
        name: 'file2.txt',
        type: 'text/plain',
        content: { text: 'content2' },
      } as any

      const key1 = createFileKey(attachment1)
      const key2 = createFileKey(attachment2)

      expect(key1).not.toBe(key2)
    })
  })

  describe('normalizeInput', () => {
    it('should return null/undefined as is', () => {
      expect(normalizeInput(null)).toBe(null)
      expect(normalizeInput(undefined)).toBe(undefined)
    })

    it('should return primitives as is', () => {
      expect(normalizeInput('string')).toBe('string')
      expect(normalizeInput(123)).toBe(123)
      expect(normalizeInput(true)).toBe(true)
    })

    it('should convert Date to ISO string', () => {
      const date = new Date('2024-01-01T12:00:00.000Z')
      expect(normalizeInput(date)).toBe('2024-01-01T12:00:00.000Z')
    })

    it('should normalize nested objects', () => {
      const input = {
        name: 'test',
        date: new Date('2024-01-01T12:00:00.000Z'),
        nested: {
          value: 123,
          date: new Date('2024-01-02T12:00:00.000Z'),
        },
      }

      const result = normalizeInput(input)
      expect(result).toEqual({
        name: 'test',
        date: '2024-01-01T12:00:00.000Z',
        nested: {
          value: 123,
          date: '2024-01-02T12:00:00.000Z',
        },
      })
    })

    it('should normalize arrays', () => {
      const input = [
        'string',
        123,
        new Date('2024-01-01T12:00:00.000Z'),
        { date: new Date('2024-01-02T12:00:00.000Z') },
      ]

      const result = normalizeInput(input)
      expect(result).toEqual([
        'string',
        123,
        '2024-01-01T12:00:00.000Z',
        { date: '2024-01-02T12:00:00.000Z' },
      ])
    })

    it('should handle complex nested structures', () => {
      const input = {
        array: [
          { date: new Date('2024-01-01T12:00:00.000Z') },
          { nested: { date: new Date('2024-01-02T12:00:00.000Z') } },
        ],
        object: {
          dates: [
            new Date('2024-01-03T12:00:00.000Z'),
            new Date('2024-01-04T12:00:00.000Z'),
          ],
        },
      }

      const result = normalizeInput(input)
      expect(result).toEqual({
        array: [
          { date: '2024-01-01T12:00:00.000Z' },
          { nested: { date: '2024-01-02T12:00:00.000Z' } },
        ],
        object: {
          dates: [
            '2024-01-03T12:00:00.000Z',
            '2024-01-04T12:00:00.000Z',
          ],
        },
      })
    })
  })

  describe('convertAttachmentToFile', () => {
    it('should convert binary content to File', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          binary: new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
        },
      } as any

      const file = convertAttachmentToFile(attachment)

      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.txt')
      expect(file.type).toBe('text/plain')
    })

    it('should convert base64 content to File', () => {
      const base64Content = btoa('Hello World')
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          base64: base64Content,
        },
      } as any

      const file = convertAttachmentToFile(attachment)

      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.txt')
      expect(file.type).toBe('text/plain')
      expect(file.size).toBeGreaterThan(0)
    })

    it('should handle base64 with data URL prefix', () => {
      const base64Content = 'data:text/plain;base64,' + btoa('Hello World')
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          base64: base64Content,
        },
      } as any

      const file = convertAttachmentToFile(attachment)

      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.txt')
      expect(file.size).toBeGreaterThan(0)
    })

    it('should handle base64 with whitespace', () => {
      const base64Content = btoa('Hello World').match(/.{1,4}/g)!.join('\n')
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {
          base64: base64Content,
        },
      } as any

      const file = convertAttachmentToFile(attachment)

      expect(file).toBeInstanceOf(File)
      expect(file.size).toBeGreaterThan(0)
    })

    it('should handle image base64', () => {
      // Simple 1x1 red pixel PNG
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
      const attachment: AutopilotChatFileInfo = {
        name: 'test.png',
        type: 'image/png',
        content: {
          base64: base64Image,
        },
      } as any

      const file = convertAttachmentToFile(attachment)

      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.png')
      expect(file.type).toBe('image/png')
    })

    it('should throw error when no content', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test.txt',
        type: 'text/plain',
        content: {},
      } as any

      expect(() => convertAttachmentToFile(attachment)).toThrow('No content found for attachment: test.txt')
    })

    it('should preserve file name with special characters', () => {
      const attachment: AutopilotChatFileInfo = {
        name: 'test file (1).txt',
        type: 'text/plain',
        content: {
          binary: new Uint8Array([72, 101, 108, 108, 111]),
        },
      } as any

      const file = convertAttachmentToFile(attachment)
      expect(file.name).toBe('test file (1).txt')
    })

    it('should handle different file types', () => {
      const types = [
        'application/pdf',
        'image/jpeg',
        'application/json',
        'video/mp4',
      ]

      types.forEach((type) => {
        const attachment: AutopilotChatFileInfo = {
          name: `test.${type.split('/')[1]}`,
          type,
          content: {
            binary: new Uint8Array([1, 2, 3]),
          },
        } as any

        const file = convertAttachmentToFile(attachment)
        expect(file.type).toBe(type)
      })
    })
  })
})
