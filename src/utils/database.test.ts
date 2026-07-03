import { nbPercentMax, Result } from 'shuutils'
import { databaseMock, mockFile } from './database.mock'
import {
  addItemRemotely,
  deleteImageRemotely,
  deleteItemRemotely,
  downloadImages,
  downloadItems,
  downloadObject,
  downloadUrl,
  fileTypeToExtension,
  getAppWriteIdFromUrl,
  getItemId,
  getItemsRemotely,
  itemIdToImageUrl,
  itemPhotoToImageUrl,
  itemToAppWriteModel,
  itemToImageUrl,
  listImages,
  updateItemRemotely,
  uploadImage,
  uploadPhotosIfNeeded,
} from './database.utils'
import { mockFetch } from './fetch.mock'
import { logger } from './logger.utils'
import { mockItem, mockItemModel } from './mock.utils'
import { state } from './state.utils'

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock('appwrite', () => databaseMock.appwrite)

globalThis.fetch = mockFetch

describe('database.utils', () => {
  beforeEach(() => {
    state.credentials = { bucketId: 'bucketA', collectionId: 'collectionA', databaseId: 'databaseA', wrap: 'wrapA' }
    state.items = []
    mockFetch.mockClear()
    databaseMock.reset()
    logger.disable()
  })

  it('getItemsRemotely A success empty', async () => {
    const items = await getItemsRemotely()
    expect(items).toMatchInlineSnapshot(`
      Ok {
        "ok": true,
        "value": [],
      }
    `)
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: 'databaseA',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: 'collectionA',
    })
    expect(databaseMock.Query.limit).toHaveBeenCalledOnce()
    expect(databaseMock.Query.offset).toHaveBeenCalledOnce()
  })

  it('getItemsRemotely B failure', async () => {
    databaseMock.listRows.mockRejectedValueOnce(new Error('some error'))
    const result = await getItemsRemotely()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('getItemsRemotely C success with 2 items', async () => {
    const items = [mockItemModel({ $id: 'some-item-uuid-a' }), mockItemModel({ $id: 'some-other-item-uuid-b' })]
    databaseMock.listRows.mockResolvedValueOnce({ rows: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(true)
    const remoteItems = Result.unwrap(result).value
    expect(remoteItems).toHaveLength(2)
    expect(remoteItems?.map(({ $id }) => $id).join(', ')).toMatchInlineSnapshot(`"some-item-uuid-a, some-other-item-uuid-b"`)
    expect(remoteItems).toMatchSnapshot()
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: 'databaseA',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: 'collectionA',
    })
    expect(databaseMock.Query.limit).toHaveBeenCalledTimes(2)
    expect(databaseMock.Query.offset).toHaveBeenCalledTimes(2)
  })

  it('getItemsRemotely D success but malformed item => still in good shape', async () => {
    const itemA = mockItemModel({ $id: 'some-item-uuid-a' })
    // @ts-expect-error we want to test a malformed item
    itemA.isPrinted = 'incorrect value will become false by default'
    const items = [itemA]
    databaseMock.listRows.mockResolvedValueOnce({ rows: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value?.[0]?.isPrinted).toBe(false)
  })

  it('getItemsRemotely E success but really malformed item => fail', async () => {
    const itemA = mockItemModel({ $id: 'some-item-uuid-a' })
    // @ts-expect-error we want to test a malformed item
    itemA.$id = undefined
    const items = [itemA]
    databaseMock.listRows.mockResolvedValueOnce({ rows: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"getItemsRemotely failed, see logs for details"`)
  })

  it('addItemRemotely A no photo', async () => {
    const item = mockItem({ photos: [] })
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toMatchSnapshot()
  })

  it('addItemRemotely B with external jpg photo', async () => {
    const photoUrl = 'https://example.com/photo.jpg'
    const item = mockItem({ photos: [photoUrl] })
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toBeDefined()
    // photo should not be a url anymore but a uuid after upload to bucket
    expect(photos?.[0]).not.toBe(photoUrl)
  })

  it('addItemRemotely C but impossible to generate an id', async () => {
    const item = mockItem({ name: '', reference: '' })
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(
      `"item id is empty in {"$createdAt":"2025-07-16T13:42:26.000Z","$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"","status":"bought"}"`,
    )
  })

  it('addItemRemotely D with external png photo', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/png' })))
    const photoUrl = 'https://example.com/photo.png'
    const item = mockItem({ photos: [photoUrl] })
    const itemModel = itemToAppWriteModel(item)
    expect(itemModel.ok).toBe(true)
    if (itemModel.ok) databaseMock.createRow.mockResolvedValueOnce(mockItemModel(itemModel.value))
    const result = await addItemRemotely(item)
    expect(mockFetch).toHaveBeenNthCalledWith(1, photoUrl)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(0)
    expect(databaseMock.createRow).toHaveBeenNthCalledWith(1, {
      data: expect.anything(),
      databaseId: 'databaseA',
      rowId: expect.anything(),
      tableId: 'collectionA',
    })
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatchInlineSnapshot(`"https://example.com/photo.png"`)
    // photo should be the same url because we do not accept png
    expect(photos?.[0]).toBe(photoUrl)
  })

  it('addItemRemotely E but create failed', async () => {
    databaseMock.createRow.mockRejectedValueOnce(new Error('some error'))
    const item = mockItem()
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('addItemRemotely F create succeed but parse failed', async () => {
    const malformedItemModel = mockItemModel({ name: 'add item remotely F' })
    // @ts-expect-error we want to test a malformed item
    malformedItemModel.$id = undefined
    databaseMock.createRow.mockResolvedValueOnce(malformedItemModel)
    const item = mockItem()
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid type: Expected string but received undefined"`)
  })

  it('addItemRemotely G payload fail', async () => {
    const item = mockItem({ reference: '' })
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid length: Expected !0 but received 0"`)
  })

  it('updateItemRemotely A success', async () => {
    const item = mockItem({ $id: 'some-item-uuid' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value?.$id).toMatchInlineSnapshot(`"some-item-uuid"`)
  })

  it('updateItemRemotely B but item has no id', async () => {
    const item = mockItem({ $id: '' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(
      `"item id is empty in {"$createdAt":"2025-07-16T13:42:26.000Z","$id":"","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"name B","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"reference B","status":"bought"}"`,
    )
  })

  it('updateItemRemotely C but item has no name or reference', async () => {
    const item = mockItem({ name: '', reference: '' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(
      `"item id is empty in {"$createdAt":"2025-07-16T13:42:26.000Z","$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"","status":"bought"}"`,
    )
  })

  it('updateItemRemotely D but update failed', async () => {
    databaseMock.updateRow.mockRejectedValueOnce(new Error('some error'))
    const item = mockItem()
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('updateItemRemotely E update succeed but parse failed', async () => {
    const malformedItemModel = mockItemModel({ name: 'update item remotely E' })
    // @ts-expect-error we want to test a malformed item
    malformedItemModel.$id = undefined
    databaseMock.updateRow.mockResolvedValueOnce(malformedItemModel)
    const item = mockItem()
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid type: Expected string but received undefined"`)
  })

  it('updateItemRemotely F payload fail', async () => {
    const item = mockItem({ reference: '' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid length: Expected !0 but received 0"`)
  })

  it('updateItemRemotely G photo changed, should delete old photo and upload with unique id', async () => {
    const originalItem = mockItem({ $id: 'item-uuid', photos: ['old-bucket-photo-id'] })
    state.items = [originalItem]
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const updatedItem = mockItem({ $id: 'item-uuid', photos: ['https://example.com/new-photo.jpg'] })
    const result = await updateItemRemotely(updatedItem)
    expect(result.ok).toBe(true)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      fileId: 'old-bucket-photo-id',
    })
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: expect.stringMatching(/^reference-b-photo-0-[a-z\d]+-jpg$/),
    })
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatch(/^reference-b-photo-0-[a-z\d]+-jpg$/)
    expect(photos?.[0]).not.toBe('reference-b-photo-0-jpg')
  })

  it('getAppWriteIdFromUrl A valid url', () => {
    const url = 'https://cloud.appwrite.io/v1/storage/buckets/bucket123/files/photo456/view?project=my-project-id'
    expect(getAppWriteIdFromUrl(url)).toMatchInlineSnapshot(`"photo456"`)
  })

  it('getAppWriteIdFromUrl B invalid url', () => {
    const url = 'https://cloud.something.else/v1/storage/buckets/bucket123/files/photo456/view'
    expect(getAppWriteIdFromUrl(url)).toMatchInlineSnapshot(`undefined`)
  })

  it('uploadPhotosIfNeeded A no photo, no update', async () => {
    const item = mockItem({ photos: [] })
    const result = await uploadPhotosIfNeeded(item)
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toStrictEqual(item)
    expect(mockFetch).toHaveBeenCalledTimes(0)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(0)
  })

  it('uploadPhotosIfNeeded B with some jpg external photos, should upload 2', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const photoUrlA = 'https://example.com/photo-a.jpg'
    const photoUrlB = 'a-bucket-photo-uuid'
    const photoUrlC = 'https://another-ex.fr/photo-b.jpeg'
    const item = mockItem({ photos: [photoUrlA, photoUrlB, photoUrlC] })
    const result = await uploadPhotosIfNeeded(item)
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos).toHaveLength(3)
    expect(photos?.[0]).toMatch(/^reference-b-photo-0-[a-z\d]+-jpg$/)
    expect(photos?.[1]).toBe('a-bucket-photo-uuid')
    expect(photos?.[2]).toMatch(/^reference-b-photo-2-[a-z\d]+-jpg$/)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(1, photoUrlA)
    expect(mockFetch).toHaveBeenNthCalledWith(2, photoUrlC)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(2)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: expect.stringMatching(/^reference-b-photo-0-[a-z\d]+-jpg$/),
    })
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(2, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: expect.stringMatching(/^reference-b-photo-2-[a-z\d]+-jpg$/),
    })
  })

  it('uploadPhotosIfNeeded C with bucket photos, should not upload', async () => {
    const item = mockItem({ photos: ['photo-a-uuid', 'photo-b-uuid'] })
    const result = await uploadPhotosIfNeeded(item)
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toStrictEqual(item)
    expect(mockFetch).toHaveBeenCalledTimes(0)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(0)
  })

  it('uploadPhotosIfNeeded D but impossible to generate an id', async () => {
    const item = mockItem({ name: '', photos: ['https://example.com/photo-a.jpg'], reference: '' })
    const result = await uploadPhotosIfNeeded(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(
      `"item id is empty in {"$createdAt":"2025-07-16T13:42:26.000Z","$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["https://example.com/photo-a.jpg"],"price":42,"reference":"","status":"bought"}"`,
    )
  })

  it('uploadPhotosIfNeeded E with external png photo, should not upload', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/png' })))
    const photoUrl = 'https://example.com/photo.png'
    const item = mockItem({ photos: [photoUrl] })
    const result = await uploadPhotosIfNeeded(item)
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatchInlineSnapshot(`"https://example.com/photo.png"`)
    expect(mockFetch).toHaveBeenNthCalledWith(1, photoUrl)
  })

  it('uploadPhotosIfNeeded F with old bucket photo, should delete old and upload with unique id', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const newPhotoUrl = 'https://example.com/new-photo.jpg'
    const oldPhotoId = 'old-photo-uuid'
    const item = mockItem({ photos: [newPhotoUrl] })
    const result = await uploadPhotosIfNeeded(item, [oldPhotoId])
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatch(/^reference-b-photo-0-[a-z\d]+-jpg$/)
    expect(photos?.[0]).not.toBe('reference-b-photo-0-jpg')
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, { bucketId: 'bucketA', fileId: 'old-photo-uuid' })
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: expect.stringMatching(/^reference-b-photo-0-[a-z\d]+-jpg$/),
    })
  })

  it('uploadPhotosIfNeeded G with old url photo, should not delete old', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const newPhotoUrl = 'https://example.com/new-photo.jpg'
    const oldPhotoUrl = 'https://example.com/old-photo.jpg'
    const item = mockItem({ photos: [newPhotoUrl] })
    const result = await uploadPhotosIfNeeded(item, [oldPhotoUrl])
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatch(/^reference-b-photo-0-[a-z\d]+-jpg$/)
    expect(databaseMock.deleteFile).toHaveBeenCalledTimes(0)
    expect(databaseMock.createFile).toHaveBeenCalledOnce()
  })

  it('itemIdToImageUrl A', () => {
    expect(itemIdToImageUrl('hehe')).toMatchInlineSnapshot(`"https://cloud.appwrite.io/v1/storage/buckets/bucketA/files/hehe/view?project=stuff-finder&mode=admin"`)
  })

  it('itemToImageUrl A empty photo', () => {
    expect(itemToImageUrl(mockItem({ photos: [''] }))).toMatchInlineSnapshot(`"/assets/no-visual.svg"`)
  })

  it('itemToImageUrl B with photo', () => {
    expect(itemToImageUrl(mockItem({ photos: ['photo-uuid'] }))).toMatchInlineSnapshot(`"https://cloud.appwrite.io/v1/storage/buckets/bucketA/files/photo-uuid/view?project=stuff-finder&mode=admin"`)
  })

  it('itemPhotoToImageUrl A not url', () => {
    const photo = itemPhotoToImageUrl('photo-uuid')
    expect(photo).toMatchInlineSnapshot(`"https://cloud.appwrite.io/v1/storage/buckets/bucketA/files/photo-uuid/view?project=stuff-finder&mode=admin"`)
  })

  it('itemPhotoToImageUrl B appwrite url', () => {
    const photo = itemPhotoToImageUrl('https://cloud.appwrite.io/v1/storage/buckets/bucketA/files/photo-uuid/view?project=stuff-finder')
    expect(photo).toMatchInlineSnapshot(`"https://cloud.appwrite.io/v1/storage/buckets/bucketA/files/photo-uuid/view?project=stuff-finder&mode=admin"`)
  })

  it('itemPhotoToImageUrl C external url', () => {
    const photo = itemPhotoToImageUrl('https://example.com/photo.jpg')
    expect(photo).toMatchInlineSnapshot(`"https://example.com/photo.jpg"`)
  })

  it('downloadObject A', () => {
    expect(() => {
      downloadObject({ wow: 14 }, 'file.txt')
    }).not.toThrow()
  })

  it('downloadUrl A', async () => {
    await expect(downloadUrl('http://files.com/42.txt', 'my-file.txt')).rejects.toThrowErrorMatchingInlineSnapshot(`[TypeError: The "obj" argument must be an instance of Blob. Received an instance of Object]`)
  })

  it('downloadImages A success empty', () => {
    expect(() => downloadImages()).not.toThrow()
  })

  it('downloadImages B failure', async () => {
    databaseMock.listFiles.mockRejectedValueOnce(new Error('some error'))
    const result = await downloadImages()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('downloadImages C failure with 2 images', async () => {
    const files = [mockFile({ $id: 'some-image-file-uuid-a' }), mockFile({ $id: 'some-other-image-file-uuid-b' })]
    databaseMock.listFiles.mockResolvedValueOnce({ files, total: 2 })
    await expect(downloadImages()).rejects.toThrowErrorMatchingInlineSnapshot(`[TypeError: The "obj" argument must be an instance of Blob. Received an instance of Object]`)
  })

  it('downloadItems A success', async () => {
    const result = await downloadItems()
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "ok": true,
        "value": "items downloaded successfully",
      }
    `)
  })

  it('Query.limit A', () => {
    expect(databaseMock.Query.limit(nbPercentMax)).toMatchInlineSnapshot(`
      {
        "isThisMockedDataFromMock": true,
        "limit": 100,
      }
    `)
  })

  it('listImages A success empty', async () => {
    const result = await listImages()
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toHaveLength(0)
    expect(databaseMock.listFiles).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
    })
  })

  it('listImages B failure', async () => {
    databaseMock.listFiles.mockRejectedValueOnce(new Error('some error'))
    const result = await listImages()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('listImages C success with 2 images', async () => {
    const files = [mockFile({ $id: 'some-image-file-uuid-a' }), mockFile({ $id: 'some-other-image-file-uuid-b' })]
    databaseMock.listFiles.mockResolvedValueOnce({ files, total: 2 })
    const result = await listImages()
    expect(result.ok).toBe(true)
    const images = Result.unwrap(result).value
    expect(images).toHaveLength(2)
    expect(images?.map(({ $id }) => $id).join(', ')).toMatchInlineSnapshot(`"some-image-file-uuid-a, some-other-image-file-uuid-b"`)
    expect(images).toMatchSnapshot()
    expect(databaseMock.listFiles).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
    })
  })

  it('getItemId A item with reference & name', () => {
    const result = getItemId(mockItem({ name: 'some name', reference: 'some reference' }))
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"some-reference"`)
  })

  it('getItemId B item with only name', () => {
    const result = getItemId(mockItem({ name: 'some name', reference: '' }))
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"some-name"`)
  })

  it('getItemId C item with only reference', () => {
    const result = getItemId(mockItem({ name: '', reference: 'some reference' }))
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"some-reference"`)
  })

  it('getItemId D item with no reference & no name', () => {
    const result = getItemId(mockItem({ name: '', reference: '' }))
    expect(result.ok).toBe(false)
  })

  it('getItemId E id is not longer than 36', () => {
    const result = getItemId(mockItem({ reference: 'lorem-ipsum-dolor-sit-amet-consectetur-adipiscing' }))
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"lorem-ipsum-dolor-sit-amet-consectet"`)
  })

  it('uploadImage A filename without extension, url point to a jpeg => upload', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const result = await uploadImage('file-name', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"file-name-jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: 'file-name-jpg',
    })
  })

  it('uploadImage B filename without extension, url point to a png => no upload', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/png' })))
    const result = await uploadImage('file-name_photo-450', 'https://example.com/photo.png')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"https://example.com/photo.png"`)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(0)
  })

  it('uploadImage C filename with extension, url point to a jpeg => upload', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    const result = await uploadImage('file-name.jpg', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"file-name-jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: 'file-name-jpg',
    })
  })

  it('uploadImage D create file fail => fallback to input url', async () => {
    logger.disable()
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    databaseMock.createFile.mockRejectedValueOnce(new Error('some error'))
    databaseMock.createFile.mockRejectedValueOnce(new Error('some error')) // need to mock the retry
    const result = await uploadImage('file-name.jpg', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"https://example.com/photo.jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: 'file-name-jpg',
    })
    logger.enable()
  })

  it('uploadImage E file id already exists in bucket => delete and retry', async () => {
    logger.disable()
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    databaseMock.createFile.mockRejectedValueOnce(new Error('requested ID already exists'))
    databaseMock.createFile.mockResolvedValueOnce({
      $id: 'file-name-jpg',
      bucketId: 'bucketA',
      isThisMockedDataFromMock: true,
    })
    const result = await uploadImage('file-name.jpg', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"file-name-jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, {
      bucketId: 'bucketA',
      file: expect.anything(),
      fileId: 'file-name-jpg',
    })
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, { bucketId: 'bucketA', fileId: 'file-name-jpg' })
    logger.enable()
  })

  it('fileTypeToExtension', () => {
    expect(Result.unwrap(fileTypeToExtension('image/jpeg')).value).toMatchInlineSnapshot(`"jpg"`)
    expect(Result.unwrap(fileTypeToExtension('image/svg+xml')).value).toMatchInlineSnapshot(`"svg"`)
    expect(Result.unwrap(fileTypeToExtension('image/avif')).value).toMatchInlineSnapshot(`"avif"`)
    expect(Result.unwrap(fileTypeToExtension('image/webp')).value).toMatchInlineSnapshot(`"webp"`)
    expect(fileTypeToExtension('image/png')).toMatchInlineSnapshot(`
      Err {
        "error": "un-wanted file type : image/png",
        "ok": false,
      }
    `)
  })

  it('deleteImageRemotely A success', async () => {
    logger.disable()
    databaseMock.deleteFile.mockResolvedValueOnce({
      $id: 'some-image-file-uuid',
      bucketId: 'bucketA',
      isThisMockedDataFromMock: true,
    })
    const result = await deleteImageRemotely('image-uuid')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`
      {
        "$id": "some-image-file-uuid",
        "bucketId": "bucketA",
        "isThisMockedDataFromMock": true,
      }
    `)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, { bucketId: 'bucketA', fileId: 'image-uuid' })
    logger.enable()
  })

  it('deleteImageRemotely B failure', async () => {
    logger.disable()
    databaseMock.deleteFile.mockRejectedValueOnce(new Error('some error'))
    const result = await deleteImageRemotely('image-uuid')
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, { bucketId: 'bucketA', fileId: 'image-uuid' })
    logger.enable()
  })

  it('deleteItemRemotely A success', async () => {
    logger.disable()
    databaseMock.deleteRow.mockResolvedValueOnce({
      $databaseId: 'databaseA',
      $id: 'some-item-uuid',
      $tableId: 'collectionA',
      isThisMockedDataFromMock: true,
    })
    const item = mockItem({
      $id: 'item-uuid',
      photos: ['photo-uuid-1', 'https://hehe.fr/photo-2.jpg', 'photo-uuid-3'],
    })
    const result = await deleteItemRemotely(item)
    expect(result.ok).toBe(true)
    expect(databaseMock.deleteRow).toHaveBeenNthCalledWith(1, {
      databaseId: 'databaseA',
      rowId: 'item-uuid',
      tableId: 'collectionA',
    })
    expect(databaseMock.deleteFile).toHaveBeenCalledTimes(2)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, { bucketId: 'bucketA', fileId: 'photo-uuid-1' })
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(2, { bucketId: 'bucketA', fileId: 'photo-uuid-3' })
    logger.enable()
  })

  it('itemToAppWriteModel A valid', () => {
    const item = mockItem({ $id: 'some-item-uuid' })
    const result = itemToAppWriteModel(item)
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`undefined`)
    expect(Result.unwrap(result).value).toMatchSnapshot()
  })

  it('itemToAppWriteModel B invalid', () => {
    const item = mockItem({ reference: '' })
    const result = itemToAppWriteModel(item)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid length: Expected !0 but received 0"`)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`undefined`)
  })

  it('itemToAppWriteModel C price -1 => null', () => {
    const item = mockItem({ price: -1 })
    const result = itemToAppWriteModel(item)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`undefined`)
    expect(Result.unwrap(result).value?.price).toMatchInlineSnapshot(`null`)
  })

  it('itemToAppWriteModel D drawer -1 => null', () => {
    const item = mockItem({ drawer: -1 })
    const result = itemToAppWriteModel(item)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`undefined`)
    expect(Result.unwrap(result).value?.drawer).toMatchInlineSnapshot(`null`)
  })
})
