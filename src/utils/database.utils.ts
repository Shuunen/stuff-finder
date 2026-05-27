import { Client, type Models, Query, Storage, TablesDB } from 'appwrite'
import { dateIso10, storage as lsStorage, nbDaysInMonth, nbHueMax, nbPercentMax, nbSpacesIndent, Result, sleep, slugify, toastSuccess } from 'shuutils'
import { safeParse } from 'valibot'
import { defaultImage, uuidMaxLength } from '../constants'
import type { Item, ItemModel } from '../types/item.types'
import { logger } from './logger.utils'
import { itemModelSchema, itemSchema, itemsSchema } from './parsers.utils'
import { state } from './state.utils'
import { normalizePhotoUrl } from './url.utils'

const client = new Client()
const tablesDb = new TablesDB(client)
const storage = new Storage(client)
const projectId = 'stuff-finder'
client.setProject(projectId)

export function itemIdToImageUrl(id: Item['$id']) {
  return `https://cloud.appwrite.io/v1/storage/buckets/${state.credentials.bucketId}/files/${id}/view?project=${projectId}&mode=admin`
}

const appWritePhotoIdRegex = /cloud\.appwrite\.io\/v1\/storage\/buckets\/\w+\/files\/(?<id>[^/]+)\/view/u

export function getAppWriteIdFromUrl(url: string) {
  const { id } = appWritePhotoIdRegex.exec(url)?.groups ?? {}
  return id
}

const urlRegex = /https?:\/\/\S+/u

function isUrl(text: string) {
  return urlRegex.test(text)
}

export function itemPhotoToImageUrl(photo?: string) {
  logger.debug('itemPhotoToImageUrl', { photo })
  if (photo === undefined || photo === '') return defaultImage
  if (!isUrl(photo)) return itemIdToImageUrl(photo)
  const id = getAppWriteIdFromUrl(photo)
  if (id === undefined) return normalizePhotoUrl(photo) // external url
  return itemIdToImageUrl(id) // bucket url
}

export function itemToImageUrl(item?: Item) {
  const photo = item?.photos[0]
  return itemPhotoToImageUrl(photo)
}

export function fileTypeToExtension(type: string) {
  if (type === 'image/jpeg') return Result.ok('jpg')
  if (type === 'image/svg+xml') return Result.ok('svg')
  if (type === 'image/avif') return Result.ok('avif')
  if (type === 'image/webp') return Result.ok('webp')
  return Result.error(`un-wanted file type : ${type}`)
}

export async function deleteImageRemotely(id: string) {
  const result = await Result.trySafe(storage.deleteFile({ bucketId: state.credentials.bucketId, fileId: id }))
  if (result.ok) logger.success(`image "${id}" deleted successfully`)
  else logger.error(`image "${id}" deletion failed`, result.error)
  return result
}
export async function uploadImage(fileName: string, url: string) {
  const blob = await fetch(url).then(response => response.blob())
  const extension = fileTypeToExtension(blob.type)
  if (!extension.ok) return Result.ok(url)
  const hasExtension = fileName.includes('.')
  const finalFileName = hasExtension ? fileName : `${fileName}.${extension.value}`
  const file = new File([blob], finalFileName, { type: blob.type })
  const id = slugify(finalFileName.replaceAll(/[_.]/gu, '-')).slice(0, uuidMaxLength)
  let upload = await Result.trySafe(storage.createFile({ bucketId: state.credentials.bucketId, file, fileId: id }))
  if (!upload.ok) {
    logger.error('uploadImage failed', upload.error)
    if (String(upload.error).includes('requested ID already exists')) await deleteImageRemotely(id)
    upload = await Result.trySafe(storage.createFile({ bucketId: state.credentials.bucketId, file, fileId: id })) // retry
  }
  if (!upload.ok) return Result.ok(url)
  return Result.ok(upload.value.$id)
}

function downloadFile(file: Blob | MediaSource, fileName?: string) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  /* v8 ignore next */
  const resolvedFileName = fileName ?? (file instanceof File ? file.name : 'download')
  link.href = url
  link.download = resolvedFileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadObject(data: Record<string, unknown> | unknown[], fileName: string) {
  const json = JSON.stringify(data, undefined, nbSpacesIndent)
  const blob = new Blob([json], { type: 'application/json' })
  downloadFile(blob, fileName)
  toastSuccess('Download started')
}

export async function downloadUrl(url: string, fileName: string) {
  const result = await fetch(url)
  const blob = await result.blob()
  downloadFile(blob, fileName)
  toastSuccess('Download started')
}

export async function listImages(bucketId = state.credentials.bucketId) {
  const images = [] as Models.File[]
  let offset = 0
  let shouldCheckNextPage = true
  while (shouldCheckNextPage) {
    // oxlint-disable-next-line no-await-in-loop
    const result = await Result.trySafe(storage.listFiles({ bucketId, queries: [Query.limit(nbPercentMax), Query.offset(offset)] }))
    if (!result.ok) return result
    if (result.value.files.length === 0) shouldCheckNextPage = false
    else {
      images.push(...result.value.files)
      offset += nbPercentMax
    }
  }
  return Result.ok(images)
}

export async function downloadImages(bucketId = state.credentials.bucketId) {
  const result = await listImages(bucketId)
  if (!result.ok) return result
  const downloadedImages = lsStorage.get<string[]>('downloadedImages', [])
  /* v8 ignore next -- @preserve */
  for (const file of result.value) {
    if (downloadedImages.includes(file.$id)) continue
    downloadedImages.push(file.$id)
    const url = itemIdToImageUrl(file.$id)
    // oxlint-disable-next-line no-await-in-loop
    await downloadUrl(url, file.name)
    // oxlint-disable-next-line no-await-in-loop
    await sleep(nbHueMax)
    lsStorage.set('downloadedImages', downloadedImages)
  }
  return Result.ok('images downloaded successfully')
}

export async function getItemsRemotely() {
  const items: ItemModel[] = []
  let offset = 0
  let shouldCheckNextPage = true
  while (shouldCheckNextPage) {
    // oxlint-disable-next-line no-await-in-loop
    const result = await Result.trySafe(
      tablesDb.listRows<ItemModel>({
        databaseId: state.credentials.databaseId,
        queries: [Query.limit(nbPercentMax), Query.offset(offset)],
        tableId: state.credentials.collectionId,
      }),
    )
    if (!result.ok) return result
    if (result.value.rows.length === 0) shouldCheckNextPage = false
    else {
      items.push(...result.value.rows)
      offset += nbPercentMax
    }
  }
  state.itemsTimestamp = Date.now()
  const result = safeParse(itemsSchema, items)
  if (!result.success) {
    logger.error('getItemsRemotely failed', result.issues)
    return Result.error('getItemsRemotely failed, see logs for details')
  }
  return Result.ok(result.output)
}

export async function downloadItems() {
  const result = await getItemsRemotely()
  logger.info('downloadItems', { result })
  /* v8 ignore next -- @preserve */
  if (!result.ok) return result
  downloadObject(result.value, `${dateIso10()}_${projectId}_items.json`)
  return Result.ok('items downloaded successfully')
}

export function getItemId(item: Item) {
  const id = slugify(item.reference || item.name).slice(0, uuidMaxLength)
  if (id.length === 0) return Result.error(`item id is empty in ${JSON.stringify(item)}`)
  return Result.ok(id)
}

export function removeAppWriteFields(item: Record<string, unknown>) {
  const clone = structuredClone(item)
  delete clone.$id
  delete clone.$createdAt
  return clone
}

export async function uploadPhotosIfNeeded(item: Item, oldPhotos: string[] = []) {
  const data = structuredClone(item)
  const id = getItemId(data)
  if (!id.ok) return Result.error(id.error)
  for (const [index, photo] of data.photos.entries()) {
    if (!isUrl(photo)) continue
    let uuid = getAppWriteIdFromUrl(photo)
    /* v8 ignore if -- @preserve */
    if (uuid === undefined) {
      const oldPhoto = oldPhotos[index]
      const hasOldBucketPhoto = oldPhoto !== undefined && !isUrl(oldPhoto)
      // generate a text id based on timestamp
      const suffix = Date.now().toString(nbDaysInMonth)
      // oxlint-disable-next-line no-await-in-loop
      const result = await uploadImage(`${id.value}_photo-${index}-${suffix}`, photo)
      if (!result.ok) return Result.error(`failed to upload photo at index ${index} for item ${item.$id}`)
      // delete old bucket photo only after successful upload to prevent data loss
      // oxlint-disable-next-line no-await-in-loop
      if (hasOldBucketPhoto) await deleteImageRemotely(oldPhoto)
      // if upload failed, uuid will be the original url, it can be a external url or a bucket url that we failed to upload but still exists
      uuid = result.value
    }
    data.photos[index] = uuid
  }
  return Result.ok(data)
}

export function itemToAppWriteModel(item: Item) {
  const data = removeAppWriteFields(item)
  const result = safeParse(itemModelSchema, data)
  if (!result.success) return Result.error(result.issues.map(issue => issue.message).join(', '))
  return Result.ok(result.output)
}

export async function addItemRemotely(item: Item, currentState = state) {
  const data = await uploadPhotosIfNeeded(item)
  if (!data.ok) return Result.error(data.error)
  const id = getItemId(data.value)
  /* v8 ignore next -- @preserve */
  if (!id.ok) return Result.error(id.error)
  const { collectionId, databaseId } = currentState.credentials
  const payload = itemToAppWriteModel(data.value)
  if (!payload.ok) return payload
  const post = await Result.trySafe(tablesDb.createRow<ItemModel>({ data: payload.value, databaseId, rowId: id.value, tableId: collectionId }))
  if (!post.ok) return post
  const parse = safeParse(itemSchema, post.value)
  if (!parse.success) return Result.error(parse.issues.map(issue => issue.message).join(', '))
  return Result.ok(parse.output)
}

export async function deleteItemRemotely(item: Item, currentState = state) {
  const { collectionId, databaseId } = currentState.credentials
  const result = await Result.trySafe(tablesDb.deleteRow({ databaseId, rowId: item.$id, tableId: collectionId }))
  /* v8 ignore if -- @preserve */
  if (result.ok)
    for (const photo of item.photos) {
      if (isUrl(photo)) continue
      // oxlint-disable-next-line no-await-in-loop
      await deleteImageRemotely(photo)
    }
  return result
}

export async function updateItemRemotely(item: Item, currentState = state) {
  const originalItem = currentState.items.find(one => one.$id === item.$id)
  const oldPhotos = originalItem?.photos ?? []
  const data = await uploadPhotosIfNeeded(item, oldPhotos)
  if (!data.ok) return Result.error(data.error)
  const { collectionId, databaseId } = currentState.credentials
  if (data.value.$id.length === 0) return Result.error(`item id is empty in ${JSON.stringify(data.value)}`)
  const payload = itemToAppWriteModel(data.value)
  if (!payload.ok) return payload
  const post = await Result.trySafe(tablesDb.updateRow<ItemModel>({ data: payload.value, databaseId, rowId: data.value.$id, tableId: collectionId }))
  if (!post.ok) return post
  const parse = safeParse(itemSchema, post.value)
  if (!parse.success) return Result.error(parse.issues.map(issue => issue.message).join(', '))
  return Result.ok(parse.output)
}
