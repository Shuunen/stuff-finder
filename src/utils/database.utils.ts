/* eslint-disable no-await-in-loop */
import { Client, Databases, type Models, Query, Storage } from 'appwrite'
import { Result, dateIso10, storage as lsStorage, nbHueMax, nbPercentMax, nbSpacesIndent, sleep, slugify, toastSuccess } from 'shuutils'
import { safeParse } from 'valibot'
import { defaultImage, uuidMaxLength } from '../constants'
import type { Item, ItemModel } from '../types/item.types'
import { logger } from './logger.utils'
/* eslint-disable jsdoc/require-jsdoc */
import { itemModelSchema, itemSchema, itemsSchema } from './parsers.utils'
import { state } from './state.utils'
import { normalizePhotoUrl } from './url.utils'

const client = new Client()
const database = new Databases(client)
const storage = new Storage(client)
const projectId = 'stuff-finder'
client.setProject(projectId)

export function itemIdToImageUrl (id: Item['$id']) {
  return `https://cloud.appwrite.io/v1/storage/buckets/${state.credentials.bucketId}/files/${id}/view?project=${projectId}&mode=admin`
}

const appWritePhotoIdRegex = /cloud\.appwrite\.io\/v1\/storage\/buckets\/\w+\/files\/(?<id>[^/]+)\/view/u

export function getAppWriteIdFromUrl (url: string) {
  const { id } = (appWritePhotoIdRegex.exec(url))?.groups ?? {}
  return id
}

const urlRegex = /https?:\/\/\S+/u

function isUrl (text: string) {
  return urlRegex.test(text)
}

export function itemPhotoToImageUrl (photo?: string) {
  logger.debug('itemPhotoToImageUrl', { photo })
  if (photo === undefined || photo === '') return defaultImage
  if (!isUrl(photo)) return itemIdToImageUrl(photo)
  const id = getAppWriteIdFromUrl(photo)
  if (id === undefined) return normalizePhotoUrl(photo) // external url
  return itemIdToImageUrl(id) // bucket url
}

export function itemToImageUrl (item?: Item) {
  const photo = item?.photos[0]
  return itemPhotoToImageUrl(photo)
}

export function fileTypeToExtension (type: string) {
  if (type === 'image/jpeg') return Result.ok('jpg')
  if (type === 'image/svg+xml') return Result.ok('svg')
  if (type === 'image/avif') return Result.ok('avif')
  if (type === 'image/webp') return Result.ok('webp')
  return Result.error(`un-wanted file type : ${type}`)
}

export async function deleteImageRemotely (id: string) {
  const result = await Result.trySafe(storage.deleteFile(state.credentials.bucketId, id))
  if (result.ok) logger.success(`image "${id}" deleted successfully`)
  else logger.error(`image "${id}" deletion failed`, result.error)
  return result
}

// eslint-disable-next-line max-statements
export async function uploadImage (fileName: string, url: string) {
  const blob = await fetch(url).then(async response => response.blob())
  const extension = fileTypeToExtension(blob.type)
  if (!extension.ok) return Result.ok(url)
  const hasExtension = fileName.includes('.')
  const finalFileName = hasExtension ? fileName : `${fileName}.${extension.value}`
  const file = new File([blob], finalFileName, { type: blob.type })
  const id = slugify(finalFileName.replace(/[_.]/gu, '-')).slice(0, uuidMaxLength)
  let upload = await Result.trySafe(storage.createFile(state.credentials.bucketId, id, file))
  if (!upload.ok) {
    logger.error('uploadImage failed', upload.error)
    if (String(upload.error).includes('requested ID already exists')) await deleteImageRemotely(id)
    upload = await Result.trySafe(storage.createFile(state.credentials.bucketId, id, file)) // retry
  }
  if (!upload.ok) return Result.ok(url)
  return Result.ok(upload.value.$id)
}

export function downloadBlob (blob: Blob, fileName: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
  toastSuccess('Download started')
}

export function downloadObject (data: Record<string, unknown> | unknown[], fileName: string) {
  const json = JSON.stringify(data, undefined, nbSpacesIndent)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, fileName)
}

export async function downloadUrl (url: string, fileName: string) {
  const result = await fetch(url)
  const blob = await result.blob()
  downloadBlob(blob, fileName)
}

export async function listImages (bucketId = state.credentials.bucketId) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const images = [] as Models.File[]
  let offset = 0
  let shouldCheckNextPage = true
  while (shouldCheckNextPage) {
    const result = await Result.trySafe(storage.listFiles(bucketId, [Query.limit(nbPercentMax), Query.offset(offset)]))
    if (!result.ok) return result
    if (result.value.files.length === 0) shouldCheckNextPage = false
    else {
      images.push(...result.value.files)
      offset += nbPercentMax
    }
  }
  return Result.ok(images)
}

// eslint-disable-next-line max-statements
export async function downloadImages (bucketId = state.credentials.bucketId) {
  const result = await listImages(bucketId)
  if (!result.ok) return result
  const downloadedImages = lsStorage.get<string[]>('downloadedImages', [])
  /* c8 ignore next 8 */
  for (const file of result.value) {
    if (downloadedImages.includes(file.$id)) continue
    downloadedImages.push(file.$id)
    const url = itemIdToImageUrl(file.$id)
    await downloadUrl(url, file.name)
    await sleep(nbHueMax)
    lsStorage.set('downloadedImages', downloadedImages)
  }
  return Result.ok('images downloaded successfully')
}

// eslint-disable-next-line max-statements
export async function getItemsRemotely () {
  const items: ItemModel[] = []
  let offset = 0
  let shouldCheckNextPage = true
  while (shouldCheckNextPage) {
    const result = await Result.trySafe(database.listDocuments<ItemModel>(state.credentials.databaseId, state.credentials.collectionId, [Query.limit(nbPercentMax), Query.offset(offset)]))
    if (!result.ok) return result
    if (result.value.documents.length === 0) shouldCheckNextPage = false
    else {
      items.push(...result.value.documents)
      offset += nbPercentMax
    }
  }
  state.itemsTimestamp = Date.now()
  const result = safeParse(itemsSchema, items)
  if (!result.success) return Result.error(result.issues.map(issue => issue.message).join(', '))
  return Result.ok(result.output)
}

export async function downloadItems () {
  const result = await getItemsRemotely()
  /* c8 ignore next */
  if (!result.ok) return result
  downloadObject(result.value, `${dateIso10()}_${projectId}_items.json`)
  return Result.ok('items downloaded successfully')
}

export function getItemId (item: Item) {
  const id = slugify(item.reference || item.name).slice(0, uuidMaxLength)
  if (id.length === 0) return Result.error(`item id is empty in ${JSON.stringify(item)}`)
  return Result.ok(id)
}

export function removeAppWriteFields (item: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $id, ...rest } = structuredClone(item)
  return rest
}

// eslint-disable-next-line max-statements
export async function uploadPhotosIfNeeded (item: Item) {
  const data = structuredClone(item)
  const id = getItemId(data)
  if (!id.ok) return Result.error(id.error)

  for (const [index, photo] of data.photos.entries()) {
    if (!isUrl(photo)) continue
    let uuid = getAppWriteIdFromUrl(photo)
    if (uuid === undefined) {
      const result = await uploadImage(`${id.value}_photo-${index}`, photo)
      uuid = result.value
    }
    data.photos[index] = uuid
  }
  return Result.ok(data)
}

export function itemToAppWriteModel (item: Item) {
  const data = removeAppWriteFields(item)
  const result = safeParse(itemModelSchema, data)
  if (!result.success) return Result.error(result.issues.map(issue => issue.message).join(', '))
  return Result.ok(result.output)
}

// eslint-disable-next-line max-statements
export async function addItemRemotely (item: Item, currentState = state) {
  const data = await uploadPhotosIfNeeded(item)
  if (!data.ok) return Result.error(data.error)
  const id = getItemId(data.value)
  /* c8 ignore next */
  if (!id.ok) return Result.error(id.error)
  const { collectionId, databaseId } = currentState.credentials
  const payload = itemToAppWriteModel(data.value)
  if (!payload.ok) return payload
  const post = await Result.trySafe(database.createDocument<ItemModel>(databaseId, collectionId, id.value, payload.value))
  if (!post.ok) return post
  const parse = safeParse(itemSchema, post.value)
  if (!parse.success) return Result.error(parse.issues.map(issue => issue.message).join(', '))
  return Result.ok(parse.output)
}

export async function deleteItemRemotely (item: Item, currentState = state) {
  const { collectionId, databaseId } = currentState.credentials
  const result = await Result.trySafe(database.deleteDocument(databaseId, collectionId, item.$id))
  if (result.ok) for (const photo of item.photos) {
    if (isUrl(photo)) continue
    await deleteImageRemotely(photo)
  }
  return result
}

// eslint-disable-next-line max-statements
export async function updateItemRemotely (item: Item, currentState = state) {
  const data = await uploadPhotosIfNeeded(item)
  if (!data.ok) return Result.error(data.error)
  const { collectionId, databaseId } = currentState.credentials
  if (data.value.$id.length === 0) return Result.error(`item id is empty in ${JSON.stringify(data.value)}`)
  const payload = itemToAppWriteModel(data.value)
  if (!payload.ok) return payload
  const post = await Result.trySafe(database.updateDocument<ItemModel>(databaseId, collectionId, data.value.$id, payload.value))
  if (!post.ok) return post
  const parse = safeParse(itemSchema, post.value)
  if (!parse.success) return Result.error(parse.issues.map(issue => issue.message).join(', '))
  return Result.ok(parse.output)
}
