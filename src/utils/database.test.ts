/* eslint-disable max-lines */
import { Result, nbPercentMax } from 'shuutils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { databaseMock, mockFile } from './database.mock'
import { addItemRemotely, deleteImageRemotely, deleteItemRemotely, downloadBlob, downloadImages, downloadItems, downloadObject, downloadUrl, fileTypeToExtension, getAppWriteIdFromUrl, getItemId, getItemsRemotely, itemIdToImageUrl, itemPhotoToImageUrl, itemToAppWriteModel, itemToImageUrl, listImages, updateItemRemotely, uploadImage, uploadPhotosIfNeeded } from './database.utils'
import { logger } from './logger.utils'
import { mockFetch, mockItem, mockItemModel } from './mock.utils'
import { state } from './state.utils'

vi.mock('appwrite', () => databaseMock.appwrite)

globalThis.fetch = mockFetch

describe('database.utils', () => {

  beforeEach(() => {
    state.credentials = { bucketId: 'bucketA', collectionId: 'collectionA', databaseId: 'databaseA', wrap: 'wrapA' }
    mockFetch.mockClear()
    databaseMock.reset()
  })

  it('getItemsRemotely A success empty', async () => {
    const items = await getItemsRemotely()
    expect(items).toMatchInlineSnapshot(`
      Ok {
        "ok": true,
        "value": [],
      }
    `)
    expect(databaseMock.listDocuments).toHaveBeenNthCalledWith(1, 'databaseA', 'collectionA', [{ isThisMockedDataFromMock: true, limit: 100 }, { isThisMockedDataFromMock: true, offset: 0 }])
    expect(databaseMock.Query.limit).toHaveBeenCalledTimes(1)
    expect(databaseMock.Query.offset).toHaveBeenCalledTimes(1)
  })

  it('getItemsRemotely B failure', async () => {
    databaseMock.listDocuments.mockRejectedValueOnce(new Error('some error'))
    const result = await getItemsRemotely()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('getItemsRemotely C success with 2 items', async () => {
    const items = [mockItemModel({ $id: 'some-item-uuid-a' }), mockItemModel({ $id: 'some-other-item-uuid-b' })]
    databaseMock.listDocuments.mockResolvedValueOnce({ documents: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(true)
    const remoteItems = Result.unwrap(result).value
    expect(remoteItems).toHaveLength(2)
    expect(remoteItems?.map(({ $id }) => $id).join(', ')).toMatchInlineSnapshot(`"some-item-uuid-a, some-other-item-uuid-b"`)
    expect(remoteItems).toMatchSnapshot()
    expect(databaseMock.listDocuments).toHaveBeenNthCalledWith(1, 'databaseA', 'collectionA', [{ isThisMockedDataFromMock: true, limit: 100 }, { isThisMockedDataFromMock: true, offset: 0 }])
    expect(databaseMock.Query.limit).toHaveBeenCalledTimes(2)
    expect(databaseMock.Query.offset).toHaveBeenCalledTimes(2)
  })

  it('getItemsRemotely D success but malformed item => still in good shape', async () => {
    const itemA = mockItemModel({ $id: 'some-item-uuid-a' })
    // @ts-expect-error we want to test a malformed item
    itemA.isPrinted = 'incorrect value will become false by default'
    const items = [itemA]
    databaseMock.listDocuments.mockResolvedValueOnce({ documents: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value?.[0]?.isPrinted).toBe(false)
  })

  it('getItemsRemotely E success but really malformed item => fail', async () => {
    const itemA = mockItemModel({ $id: 'some-item-uuid-a' })
    // @ts-expect-error we want to test a malformed item
    // eslint-disable-next-line unicorn/no-null
    itemA.$id = null
    const items = [itemA]
    databaseMock.listDocuments.mockResolvedValueOnce({ documents: items, total: 2 })
    const result = await getItemsRemotely()
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid type: Expected string but received null"`)
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
    expect(photos?.[0] !== undefined).toBe(true)
    expect(photos?.[0] !== photoUrl, 'photo should not be a url anymore but a uuid after upload to bucket').toBe(true)
  })

  it('addItemRemotely C but impossible to generate an id', async () => {
    const item = mockItem({ name: '', reference: '' })
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"item id is empty in {"$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"","status":"bought"}"`)
  })

  it('addItemRemotely D with external png photo', async () => {
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/png' })))
    const photoUrl = 'https://example.com/photo.png'
    const item = mockItem({ photos: [photoUrl] })
    const itemModel = itemToAppWriteModel(item)
    expect(itemModel.ok).toBe(true)
    if (itemModel.ok) databaseMock.createDocument.mockResolvedValueOnce(mockItemModel(itemModel.value))
    const result = await addItemRemotely(item)
    expect(mockFetch).toHaveBeenNthCalledWith(1, photoUrl)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(0)
    expect(databaseMock.createDocument).toHaveBeenNthCalledWith(1, 'databaseA', 'collectionA', expect.anything(), expect.anything())
    expect(result.ok).toBe(true)
    const photos = Result.unwrap(result).value?.photos
    expect(photos?.[0]).toMatchInlineSnapshot(`"https://example.com/photo.png"`)
    expect(photos?.[0] === photoUrl, 'photo should be the same url because we do not accept png').toBe(true)
  })

  it('addItemRemotely E but create failed', async () => {
    databaseMock.createDocument.mockRejectedValueOnce(new Error('some error'))
    const item = mockItem()
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('addItemRemotely F create succeed but parse failed', async () => {
    const malformedItemModel = mockItemModel({ name: 'add item remotely F' })
    // @ts-expect-error we want to test a malformed item
    // eslint-disable-next-line unicorn/no-null
    malformedItemModel.$id = null
    databaseMock.createDocument.mockResolvedValueOnce(malformedItemModel)
    const item = mockItem()
    const result = await addItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid type: Expected string but received null"`)
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
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"item id is empty in {"$id":"","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"name B","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"reference B","status":"bought"}"`)
  })

  it('updateItemRemotely C but item has no name or reference', async () => {
    const item = mockItem({ name: '', reference: '' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"item id is empty in {"$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["some-uuid","https://some.url/to/image.jpg"],"price":42,"reference":"","status":"bought"}"`)
  })

  it('updateItemRemotely D but update failed', async () => {
    databaseMock.updateDocument.mockRejectedValueOnce(new Error('some error'))
    const item = mockItem()
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
  })

  it('updateItemRemotely E update succeed but parse failed', async () => {
    const malformedItemModel = mockItemModel({ name: 'update item remotely E' })
    // @ts-expect-error we want to test a malformed item
    // eslint-disable-next-line unicorn/no-null
    malformedItemModel.$id = null
    databaseMock.updateDocument.mockResolvedValueOnce(malformedItemModel)
    const item = mockItem()
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid type: Expected string but received null"`)
  })

  it('updateItemRemotely F payload fail', async () => {
    const item = mockItem({ reference: '' })
    const result = await updateItemRemotely(item)
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"Invalid length: Expected !0 but received 0"`)
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
    expect(photos?.join(', ')).toMatchInlineSnapshot(`"reference-b-photo-0-jpg, a-bucket-photo-uuid, reference-b-photo-2-jpg"`)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(1, photoUrlA)
    expect(mockFetch).toHaveBeenNthCalledWith(2, photoUrlC)
    expect(databaseMock.createFile).toHaveBeenCalledTimes(2)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, 'bucketA', "reference-b-photo-0-jpg", expect.anything())
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(2, 'bucketA', "reference-b-photo-2-jpg", expect.anything())
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
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`"item id is empty in {"$id":"rec234","barcode":"barcode B","box":"B (usb & audio)","brand":"brand B","details":"details B","drawer":2,"isPrinted":false,"name":"","photos":["https://example.com/photo-a.jpg"],"price":42,"reference":"","status":"bought"}"`)
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

  it('downloadBlob A', () => {
    expect(() => { downloadBlob(new Blob(), 'file.txt') }).toThrowErrorMatchingInlineSnapshot(`[ReferenceError: document is not defined]`)
  })

  it('downloadObject A', () => {
    expect(() => { downloadObject({ wow: 14 }, 'file.txt') }).toThrowErrorMatchingInlineSnapshot(`[ReferenceError: document is not defined]`)
  })

  it('downloadUrl A', async () => {
    await expect(downloadUrl('http://files.com/42.txt', 'my-file.txt')).rejects.toThrowErrorMatchingInlineSnapshot(`[ReferenceError: document is not defined]`)
  })

  it('downloadImages A success empty', () => {
    expect(async () => downloadImages()).not.toThrow()
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
    await expect(downloadImages()).rejects.toThrowErrorMatchingInlineSnapshot(`[ReferenceError: document is not defined]`)
  })

  it('downloadItems A failing', async () => {
    await expect(downloadItems()).rejects.toThrowErrorMatchingInlineSnapshot(`[ReferenceError: document is not defined]`)
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
    expect(databaseMock.listFiles).toHaveBeenNthCalledWith(1, 'bucketA', [{ isThisMockedDataFromMock: true, limit: 100 }, { isThisMockedDataFromMock: true, offset: 0 }])
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
    expect(databaseMock.listFiles).toHaveBeenNthCalledWith(1, 'bucketA', [{ isThisMockedDataFromMock: true, limit: 100 }, { isThisMockedDataFromMock: true, offset: 0 }])
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
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, 'bucketA', "file-name-jpg", expect.anything())
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
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, 'bucketA', "file-name-jpg", expect.anything())
  })

  it('uploadImage D create file fail => fallback to input url', async () => {
    logger.disable()
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    databaseMock.createFile.mockRejectedValueOnce(new Error('some error'))
    databaseMock.createFile.mockRejectedValueOnce(new Error('some error')) // need to mock the retry
    const result = await uploadImage('file-name.jpg', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"https://example.com/photo.jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, 'bucketA', "file-name-jpg", expect.anything())
    logger.enable()
  })

  it('uploadImage E file id already exists in bucket => delete and retry', async () => {
    logger.disable()
    mockFetch.mockResolvedValueOnce(new Response(new Blob([], { type: 'image/jpeg' })))
    databaseMock.createFile.mockRejectedValueOnce(new Error('requested ID already exists'))
    databaseMock.createFile.mockResolvedValueOnce({ $id: 'file-name-jpg', bucketId: 'bucketA', isThisMockedDataFromMock: true })
    const result = await uploadImage('file-name.jpg', 'https://example.com/photo.jpg')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`"file-name-jpg"`)
    expect(databaseMock.createFile).toHaveBeenNthCalledWith(1, 'bucketA', "file-name-jpg", expect.anything())
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, 'bucketA', 'file-name-jpg')
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
    databaseMock.deleteFile.mockResolvedValueOnce({ $id: 'some-image-file-uuid', bucketId: 'bucketA', isThisMockedDataFromMock: true })
    const result = await deleteImageRemotely('image-uuid')
    expect(result.ok).toBe(true)
    expect(Result.unwrap(result).value).toMatchInlineSnapshot(`
      {
        "$id": "some-image-file-uuid",
        "bucketId": "bucketA",
        "isThisMockedDataFromMock": true,
      }
    `)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, 'bucketA', 'image-uuid')
    logger.enable()
  })

  it('deleteImageRemotely B failure', async () => {
    logger.disable()
    databaseMock.deleteFile.mockRejectedValueOnce(new Error('some error'))
    const result = await deleteImageRemotely('image-uuid')
    expect(result.ok).toBe(false)
    expect(Result.unwrap(result).error).toMatchInlineSnapshot(`[Error: some error]`)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, 'bucketA', 'image-uuid')
    logger.enable()
  })

  it('deleteItemRemotely A success', async () => {
    logger.disable()
    databaseMock.deleteDocument.mockResolvedValueOnce({ $id: 'some-item-uuid', collectionId: 'collectionA', databaseId: 'databaseA', isThisMockedDataFromMock: true })
    const item = mockItem({ $id: 'item-uuid', photos: ['photo-uuid-1', 'https://hehe.fr/photo-2.jpg', 'photo-uuid-3'] })
    const result = await deleteItemRemotely(item)
    expect(result.ok).toBe(true)
    expect(databaseMock.deleteDocument).toHaveBeenNthCalledWith(1, 'databaseA', 'collectionA', 'item-uuid')
    expect(databaseMock.deleteFile).toHaveBeenCalledTimes(2)
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(1, 'bucketA', 'photo-uuid-1')
    expect(databaseMock.deleteFile).toHaveBeenNthCalledWith(2, 'bucketA', 'photo-uuid-3')
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
