// oxlint-disable max-params
import type { Models } from 'appwrite'
import { functionReturningVoid, nbDaysInWeek, sleep } from 'shuutils'
import type { ItemModel } from '../types/item.types'
import { mockItemModel } from './mock.utils'

export function mockFile(data: Partial<Models.File> = {}) {
  return {
    $createdAt: '2020-03-01T00:00:00.000Z',
    $id: 'some-image-file-uuid-xyz',
    $permissions: [],
    $updatedAt: '2021-08-01T00:00:00.000Z',
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
  public createDocument = createDocument
  public deleteDocument = deleteDocument
  public listDocuments = listDocuments
  public updateDocument = updateDocument
  public constructor(client?: Client) {
    if (client) functionReturningVoid()
  }
}

// oxlint-disable-next-line max-classes-per-file
class Client {
  public constructor() {
    functionReturningVoid()
  }
  public setProject(project: string) {
    if (project) functionReturningVoid()
    return this
  }
}

class Storage {
  public createFile = createFile
  public deleteFile = deleteFile
  public listFiles = listFiles
  public constructor(client?: Client) {
    if (client) functionReturningVoid()
  }
}

const Query = {
  limit: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, limit: nb })),
  offset: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, offset: nb })),
}

function reset() {
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
  Query,
  appwrite: { Client, Databases, Query, Storage },
  createDocument,
  createFile,
  deleteDocument,
  deleteFile,
  listDocuments,
  listFiles,
  reset,
  updateDocument,
}
