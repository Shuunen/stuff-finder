import { dom, sleep, storage, tw } from 'shuutils'
import { delays, jsonHeaders } from '../constants'
import { logger } from './logger.utils'
import { urlToUuid } from './url.utils'

// eslint-disable-next-line etc/no-misused-generics
async function request<ResponseType = unknown> (method: 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { headers: jsonHeaders, method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => { logger.showError(error) })
  if (!response) throw new Error('no response')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (await response.json()) as ResponseType
}

export function button (content: string, classes = '', isSecondary = false) {
  const theme = isSecondary ? tw('opacity-80 hover:opacity-100') : tw('from-purple-500 to-purple-700 text-white hover:from-purple-700 hover:to-purple-900')
  const element = dom('button', tw(`h-10 max-w-xs rounded bg-gradient-to-tr px-12 text-lg shadow-md transition-all duration-200 ease-in-out hover:shadow-lg sm:px-6 md:text-base ${theme} ${classes}`), content)
  element.type = 'button'
  return element
}

// eslint-disable-next-line etc/no-misused-generics
export async function patch<ResponseType> (url: string, data: Record<string, unknown>) {
  return await request<ResponseType>('PATCH', url, data)
}

// eslint-disable-next-line etc/no-misused-generics
export async function post<ResponseType> (url: string, data: Record<string, unknown>) {
  return await request<ResponseType>('POST', url, data)
}

// eslint-disable-next-line etc/no-misused-generics
export async function get<ResponseType> (url: string, willCacheResponse = true) {
  const uuid = urlToUuid(url)
  if (willCacheResponse) {
    const cached = storage.get<ResponseType>(uuid)
    if (cached !== undefined) return cached
  }
  const response = await request<ResponseType>('GET', url)
  if (willCacheResponse) storage.set(uuid, response)
  return response
}

/* eslint-disable etc/no-misused-generics */
export const find = {
  all: <Type extends Element = Element> (selector: string, context: Document | Element = document) => {
    const elements = context.querySelectorAll<Type>(selector)
    if (elements.length === 0) throw new Error(`no elements found for selector "${selector}"`)
    return Array.from(elements)
  },
  allOrNone: <Type extends Element = Element> (selector: string, context: Document | Element = document): Type[] => Array.from(context.querySelectorAll<Type>(selector)),
  one: <Type extends Element = Element> (selector: string, context: Document | Element = document) => {
    const element = context.querySelector<Type>(selector)
    if (!element) throw new Error(`no element found for selector "${selector}"`)
    return element
  },
  oneOrNone: <Type extends Element = Element> (selector: string, context: Document | Element = document): Type | null => context.querySelector<Type>(selector),
}
/* eslint-enable etc/no-misused-generics */

export async function fadeIn (element: HTMLElement) {
  if (!element.classList.contains('app-hide')) { logger.error('please add "app-hide" class before mounting dom element and then call fade-in'); return }
  element.classList.remove('hidden')
  await sleep(10) // eslint-disable-line @typescript-eslint/no-magic-numbers
  element.style.opacity = '1' // eslint-disable-line no-param-reassign
}

export async function fadeOut (element: HTMLElement, willDestroyAfter = false) {
  element.classList.add('app-hide')
  element.style.opacity = '0' // eslint-disable-line no-param-reassign
  await sleep(delays.large)
  element.classList.add('hidden')
  if (!willDestroyAfter) return
  await sleep(delays.large)
  element.remove()
}

export function valuesToOptions (array: readonly string[], selected?: string) {
  return array.map(value => `<option value="${value}" ${selected === value ? 'selected' : ''}>${value}</option>`).join('')
}

export function isVisible (element: Element | HTMLElement | undefined) {
  if (!element) {
    logger.error('element is undefined, so it is not visible')
    return false
  }
  const { height, width } = element.getBoundingClientRect()
  return width > 0 || height > 0
}
