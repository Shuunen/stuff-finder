/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/max-params */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-classes-per-file */
import type { Models } from 'appwrite'
import { functionReturningVoid, nbDaysInWeek, sleep } from 'shuutils'
import { vi } from 'vitest'
import type { ItemModel } from '../types/item.types'
import { mockItemModel } from './mock.utils'

export function mockFile (data: Partial<Models.File> = {}) {
  return {
    '$createdAt': '2020-03-01T00:00:00.000Z',
    '$id': 'some-image-file-uuid-xyz',
    '$permissions': [],
    '$updatedAt': '2021-08-01T00:00:00.000Z',
    bucketId: 'bucketA',
    chunksTotal: 1,
    chunksUploaded: 1,
    mimeType: 'image/jpeg',
    name: 'fileName-a.jpg',
    signature: 'signature-a',
    sizeOriginal: 123_456,
    ...data,
  } satisfies Models.File as Models.File
}

const createFile = vi.fn(async (bucketId: string, fileId: string, _file: File) => {
  await sleep(nbDaysInWeek)
  return { $id: fileId, bucketId, isThisMockedDataFromMock: true }
})

const deleteFile = vi.fn(async (bucketId: string, fileId: string, _file: File) => {
  await sleep(nbDaysInWeek)
  return { $id: fileId, bucketId, isThisMockedDataFromMock: true }
})

const listFiles = vi.fn(async (_bucketId: string, _queries: [{ limit: number }, { offset: number }]) => {
  await sleep(nbDaysInWeek)
  return { files: [], total: 0 } satisfies Models.FileList as Models.FileList
})

const createDocument = vi.fn(async (databaseId: string, collectionId: string, documentId: string, data: object) => {
  await sleep(nbDaysInWeek)
  const item = mockItemModel({ $collectionId: collectionId, $databaseId: databaseId, $id: documentId, ...data })
  return item satisfies Models.Document as Models.Document
})

const deleteDocument = vi.fn(async (databaseId: string, collectionId: string, documentId: string) => {
  await sleep(nbDaysInWeek)
  return { $id: documentId, collectionId, databaseId, isThisMockedDataFromMock: true }
})

const listDocuments = vi.fn(async (_databaseId: string, _collectionId: string) => {
  await sleep(nbDaysInWeek)
  return { documents: [], total: 0 } satisfies Models.DocumentList<ItemModel> as Models.DocumentList<ItemModel>
})

const updateDocument = vi.fn(async (databaseId: string, collectionId: string, documentId: string, data: object) => {
  await sleep(nbDaysInWeek)
  const item = mockItemModel({ $collectionId: collectionId, $databaseId: databaseId, $id: documentId, ...data })
  return item satisfies Models.Document as Models.Document
})

class Databases {
  createDocument = createDocument
  deleteDocument = deleteDocument
  listDocuments = listDocuments
  updateDocument = updateDocument
  constructor (client?: Client) {
    if (client) functionReturningVoid()
  }
}

class Client {
  constructor () {
    functionReturningVoid()
  }
  setProject (project: string) {
    if (project) functionReturningVoid()
    return this
  }
}

class Storage {
  createFile = createFile
  deleteFile = deleteFile
  listFiles = listFiles
  constructor (client?: Client) {
    if (client) functionReturningVoid()
  }
}

const Query = {
  limit: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, limit: nb })),
  offset: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, offset: nb })),
}

function reset () {
  createDocument.mockClear()
  createFile.mockClear()
  listFiles.mockClear()
  deleteDocument.mockClear()
  deleteFile.mockClear()
  listDocuments.mockClear()
  updateDocument.mockClear()
  Query.limit.mockClear()
  Query.offset.mockClear()
}

export const databaseMock = {
  appwrite: { Client, Databases, Query, Storage },
  createDocument, createFile, deleteDocument, deleteFile, listDocuments, listFiles, Query, reset, updateDocument,
}
