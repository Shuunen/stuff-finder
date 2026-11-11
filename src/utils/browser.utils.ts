/* v8 ignore file */
import { Result } from 'shuutils'
import { logger } from './logger.utils'

async function request(method: 'DELETE' | 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => {
    logger.showError(error)
  })
  if (!response) throw new Error('no response')
  return (await response.json()) as unknown
}

export function get(url: string) {
  return request('GET', url)
}

export function setPageTitle(title: string) {
  document.title = `${title} - Stuff Finder`
}

export function clearElementsForPrint() {
  logger.info('clearing elements for print')
  const selector = ['#synology-download-notification-stack', 'synology-download-content', '[at-magnifier-wrapper]', '.shu-toast']
  const elements = Array.from(document.querySelectorAll(selector.join(',')))
  for (const element of elements) element.remove()
}

const maxPastedImageSide = 800
const webpQuality = 0.85

/**
 * Get the first image file of a paste event
 * @param event the paste event
 * @returns the image file or undefined
 */
export function getImageFromPaste(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items ?? [])
  const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'))
  return imageItem?.getAsFile() ?? undefined
}

/**
 * Convert an image blob to a resized webp data url, no network involved so no CORS issue
 * @param blob the image blob
 * @returns a Result with the data url
 */
export async function imageToWebpDataUrl(blob: Blob) {
  try {
    const bitmap = await globalThis.createImageBitmap(blob)
    const ratio = Math.min(1, maxPastedImageSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * ratio)
    canvas.height = Math.round(bitmap.height * ratio)
    const context = canvas.getContext('2d')
    if (context === null) return Result.error('no canvas 2d context')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const dataUrl = canvas.toDataURL('image/webp', webpQuality)
    if (!dataUrl.startsWith('data:image/webp')) return Result.error('webp not supported by this browser')
    return Result.ok(dataUrl)
  } catch (error) {
    logger.error('imageToWebpDataUrl failed', error)
    return Result.error(String(error))
  }
}

/**
 * Check if an image url can be fetched from the browser (cors), same condition as the upload
 * @param url the image url
 * @param signal to cancel the check
 * @returns true when fetchable
 */
export async function isImageFetchable(url: string, signal: AbortSignal) {
  try {
    const response = await fetch(url, { signal })
    return response.ok
  } catch (error) {
    if (signal.aborted) return true // cancelled, not a real failure
    logger.warn('image not fetchable', url, error)
    return false
  }
}

/**
 * Convert an image blob (png, gif, bmp...) to a resized webp blob
 * @param blob the image blob
 * @returns a Result with the webp blob
 */
export async function imageToWebpBlob(blob: Blob) {
  const dataUrl = await imageToWebpDataUrl(blob)
  if (!dataUrl.ok) return dataUrl
  try {
    const response = await fetch(dataUrl.value)
    return Result.ok(await response.blob())
  } catch (error) {
    logger.error('imageToWebpBlob failed', error)
    return Result.error(String(error))
  }
}

/**
 * Download an image, other image types than the supported ones (png, gif...) are converted to webp
 * @param url the image url
 * @param isSupportedType tells if a mime type can be used as is
 * @returns a Result with the blob, or an error when the download fails (cors, network...)
 */
export async function fetchImageBlob(url: string, isSupportedType: (type: string) => boolean) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    if (isSupportedType(blob.type) || !blob.type.startsWith('image/')) return Result.ok(blob)
    const converted = await imageToWebpBlob(blob)
    return Result.ok(converted.ok ? converted.value : blob)
  } catch (error) {
    logger.error('fetchImageBlob failed', url, error)
    return Result.error(String(error))
  }
}
