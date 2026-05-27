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
    compression: '',
    encryption: false,
    mimeType: 'image/jpeg',
    name: 'fileName-a.jpg',
    signature: 'signature-a',
    sizeOriginal: 123_456,
    ...data,
  } satisfies Models.File as Models.File
}

const createFile = vi.fn(async ({ bucketId, fileId }: { bucketId: string; file: File; fileId: string }) => {
  await sleep(nbDaysInWeek)
  return { $id: fileId, bucketId, isThisMockedDataFromMock: true }
})

const deleteFile = vi.fn(async ({ bucketId, fileId }: { bucketId: string; fileId: string }) => {
  await sleep(nbDaysInWeek)
  return { $id: fileId, bucketId, isThisMockedDataFromMock: true }
})

const listFiles = vi.fn(async (_params: { bucketId: string; queries?: unknown[] }) => {
  await sleep(nbDaysInWeek)
  return { files: [], total: 0 } satisfies Models.FileList as Models.FileList
})

const createRow = vi.fn(async ({ data, databaseId, rowId, tableId }: { data: object; databaseId: string; rowId: string; tableId: string }) => {
  await sleep(nbDaysInWeek)
  const item = mockItemModel({ $databaseId: databaseId, $id: rowId, $tableId: tableId, ...data })
  return item satisfies Models.Row as Models.Row
})

const deleteRow = vi.fn(async ({ databaseId, rowId, tableId }: { databaseId: string; rowId: string; tableId: string }) => {
  await sleep(nbDaysInWeek)
  return { $id: rowId, databaseId, isThisMockedDataFromMock: true, tableId }
})

const listRows = vi.fn(async (_params: { databaseId: string; queries?: unknown[]; tableId: string }) => {
  await sleep(nbDaysInWeek)
  return { rows: [], total: 0 } satisfies Models.RowList<ItemModel> as Models.RowList<ItemModel>
})

const updateRow = vi.fn(async ({ data, databaseId, rowId, tableId }: { data: object; databaseId: string; rowId: string; tableId: string }) => {
  await sleep(nbDaysInWeek)
  const item = mockItemModel({ $databaseId: databaseId, $id: rowId, $tableId: tableId, ...data })
  return item satisfies Models.Row as Models.Row
})

class TablesDB {
  public createRow = createRow
  public deleteRow = deleteRow
  public listRows = listRows
  public updateRow = updateRow
  public constructor(client?: Client) {
    /* v8 ignore if */
    if (client) functionReturningVoid()
  }
}

// oxlint-disable-next-line max-classes-per-file
class Client {
  public constructor() {
    functionReturningVoid()
  }
  public setProject(project: string) {
    /* v8 ignore if */
    if (project) functionReturningVoid()
    return this
  }
}

class Storage {
  public createFile = createFile
  public deleteFile = deleteFile
  public listFiles = listFiles
  public constructor(client?: Client) {
    /* v8 ignore if */
    if (client) functionReturningVoid()
  }
}

const Query = {
  limit: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, limit: nb })),
  offset: vi.fn((nb: number) => ({ isThisMockedDataFromMock: true, offset: nb })),
}

function reset() {
  createFile.mockClear()
  createRow.mockClear()
  deleteFile.mockClear()
  deleteRow.mockClear()
  listFiles.mockClear()
  listRows.mockClear()
  updateRow.mockClear()
  Query.limit.mockClear()
  Query.offset.mockClear()
}

// oxlint-disable-next-line sort-keys
export const databaseMock = {
  appwrite: { Client, Query, Storage, TablesDB },
  createFile,
  createRow,
  deleteFile,
  deleteRow,
  listFiles,
  listRows,
  Query,
  reset,
  updateRow,
}
