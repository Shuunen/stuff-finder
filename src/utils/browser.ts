import { dom, emit, sleep, storage, tw } from 'shuutils'
import { JSON_HEADERS } from '../constants'
import { urlToUuid } from './url'

export const button = (content: string, classes = '', secondary = false): HTMLButtonElement => {
  const theme = secondary ? tw('opacity-80 hover:opacity-100') : tw('from-purple-500 to-purple-700 text-white hover:from-purple-700 hover:to-purple-900')
  const button_ = dom('button', tw(`h-10 max-w-xs rounded bg-gradient-to-tr px-12 text-lg shadow-md transition-all duration-200 ease-in-out hover:shadow-lg sm:px-6 md:text-base ${theme} ${classes}`), content)
  button_.type = 'button'
  return button_
}

const request = async <T> (method: 'patch' | 'post' | 'get', url: string, data?: Record<string, unknown>): Promise<T> => {
  const options: RequestInit = { headers: JSON_HEADERS, method }
  if (data) options.body = JSON.stringify(data)
  return fetch(url, options).then(response => response.json()).catch(error => showError(error.message))
}

export const patch = async (url: string, data: Record<string, unknown>): Promise<AirtableRecord> => request('patch', url, data)

export const post = async (url: string, data: Record<string, unknown>): Promise<AirtableRecord> => request('post', url, data)

export const get = async <T> (url: string): Promise<T> => {
  const uuid = urlToUuid(url)
  const cached = await storage.get<T>(uuid, sessionStorage)
  if (cached) return cached
  const response = await request<T>('get', url)
  storage.set(uuid, response, sessionStorage)
  return response
}

export const showError = (message: string): void => {
  console.error(message)
  emit<AppToasterShowEvent>('app-toaster--show', { type: 'error', message })
}

export const showLog = (message: string, data = ''): void => {
  console.log(message, data)
  emit<AppToasterShowEvent>('app-toaster--show', { type: 'info', message })
}

export const fadeIn = async (element: HTMLElement): Promise<void> => {
  if (!element.classList.contains('app-hide')) return console.warn('please add "app-hide" class before mounting dom element and then call fade-in')
  element.classList.remove('hidden')
  await sleep(10)
  element.style.opacity = '1'
}

export const fadeOut = async (element: HTMLElement, destroy = false): Promise<void> => {
  element.classList.add('app-hide')
  element.style.opacity = '0'
  await sleep(350)
  element.classList.add('hidden')
  if (!destroy) return
  await sleep(350)
  element.remove()
}

export const valuesToOptions = (array: string[]): string => {
  return array.map(value => `<option value="${value}">${value}</option>`).join('')
}